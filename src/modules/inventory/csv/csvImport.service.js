'use strict';

const Papa = require('papaparse');
const Product = require('../../products/product.model');
const ImportLog = require('../models/importLogs.model');
const { validateRow } = require('./csvValidation.service');
const { buildProductOpFromRow } = require('./chunkProcessor.service');
const { runBulkChunks } = require('../helpers/bulkWrite.helpers');
const logger = require('../../../utils/logger');

/**
 * FIXES:
 * 1. Removed dual-op strategy that caused E11000 duplicate slug errors.
 * 2. New strategy: check existing product by SKU first, then by slug.
 *    - If SKU exists → update that product's subProduct in place.
 *    - If slug exists but SKU is new → push new subProduct to existing product.
 *    - If neither exists → insert new product.
 * 3. Uses single updateOne per row — no conflicts possible.
 */
const importCsv = async ({ buffer, filename, triggeredBy = null, source = 'csv_upload' }) => {
  const log = await ImportLog.create({ source, filename, triggeredBy });
  const text = buffer.toString('utf8');
  const { data: rows } = Papa.parse(text, {
    header: true, skipEmptyLines: true, dynamicTyping: false,
  });

  log.totalRows = rows.length;
  await log.save();

  const failures = [];
  const validatedRows = [];

  rows.forEach((raw, i) => {
    const v = validateRow(raw);
    if (!v.ok) {
      failures.push({ rowIndex: i + 2, raw, errors: v.errors });
    } else {
      validatedRows.push({ rowIndex: i + 2, raw, value: v.value });
    }
  });

  const categoryCache = new Map();
  const ops = [];

  for (const item of validatedRows) {
    try {
      const built = await buildProductOpFromRow(item.value, { categoryCache });

      // Check if product with this SKU already exists
      const existingBySku = await Product.findOne({ 'subProducts.sku': built.sku });

      if (existingBySku) {
        // UPDATE: SKU exists — update top-level fields + replace the matched subProduct
        ops.push({
          updateOne: {
            filter: { 'subProducts.sku': built.sku },
            update: {
              $set: {
                ...built.updateOp.$set,
                'subProducts.$': built.subProduct,
              slug: built.slug,
              },
            },
            upsert: false,
          },
        });
      } else {
        // Check if product with same slug exists (different SKU = new color variant)
        const existingBySlug = await Product.findOne({ slug: built.slug });

        if (existingBySlug) {
          // ADD VARIANT: product exists, push new subProduct
          ops.push({
            updateOne: {
              filter: { slug: built.slug },
              update: {
                $set: built.updateOp.$set,
                $addToSet: { subProducts: built.subProduct },
              },
              upsert: false,
            },
          });
        } else {
          // INSERT: brand new product
          ops.push({
            updateOne: {
              filter: { slug: built.slug },
              update: {
                $set: {
                  ...built.updateOp.$set,
                  slug: built.slug,
                },
                $setOnInsert: {
                  subProducts: [built.subProduct],
                },
              },
              upsert: true,
            },
          });
        }
      }
    } catch (err) {
      failures.push({ rowIndex: item.rowIndex, raw: item.raw, errors: [err.message] });
    }
  }

  let totals = { matched: 0, modified: 0, inserted: 0, upserted: 0 };
  if (ops.length) totals = await runBulkChunks(Product, ops, 500);

  log.errorList = failures.slice(0, 200).map((f) => ({
    row: f.rowIndex, sku: f.raw?.sku, message: (f.errors || []).join(' | '),
  }));
  log.inserted   = totals.upserted;
  log.updated    = totals.modified;
  log.skipped    = failures.length;
  log.finishedAt = new Date();
  log.status     = failures.length === 0 ? 'success' : (validatedRows.length > 0 ? 'partial' : 'failed');
  await log.save();

  logger.info('CSV import finished', {
    rows: rows.length,
    inserted: log.inserted,
    updated: log.updated,
    failed: failures.length,
    status: log.status,
  });

  return { log, failures };
};

module.exports = { importCsv };