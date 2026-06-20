require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Papa = require('papaparse');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const { buildProductOpFromRow } = require('./src/modules/inventory/csv/chunkProcessor.service');
  const { generateSlug } = require('./src/modules/inventory/helpers/generateSlug');

  const res = await axios.get(process.env.GOOGLE_SHEET_CSV_URL, { responseType: 'text' });
  const { data: rows } = Papa.parse(res.data, { header: true, skipEmptyLines: true });
  const rowBySku = new Map();
  rows.forEach(r => { if (r.sku) rowBySku.set(r.sku.trim(), r); });

  const categoryCache = new Map();
  const ids = ['6a294285f2dc19cab4687d8d', '6a294285f2dc19cab4687d8e', '6a294285f2dc19cab4687d8f'];

  for (const id of ids) {
    const doc = await Product.findById(id);
    const csvSubs = doc.subProducts.filter(sp => rowBySku.has(sp.sku));
    const orphanSubs = doc.subProducts.filter(sp => !rowBySku.has(sp.sku));

    if (csvSubs.length !== 1 || orphanSubs.length !== 1) {
      console.log('SKIP (unexpected shape):', id);
      continue;
    }

    const row = rowBySku.get(csvSubs[0].sku);
    const correctSlug = generateSlug(row.name);
    const built = await buildProductOpFromRow(row, { categoryCache });

    // Update original doc: keep current CSV-matched product
    doc.set({ ...built.updateOp.$set, slug: correctSlug, subProducts: csvSubs });
    await doc.save();
    console.log('Fixed original doc', id, '->', correctSlug);

    // Create new inactive doc for the orphan legacy SKU
    const legacyName = `${doc.name} (Legacy - ${orphanSubs[0].sku})`;
    let legacySlug = generateSlug(legacyName);
    const exists = await Product.findOne({ slug: legacySlug });
    if (exists) legacySlug = generateSlug(legacyName, orphanSubs[0].sku);

    await Product.create({
      name: legacyName,
      description: 'Discontinued product, kept for historical records.',
      slug: legacySlug,
      category: doc.category,
      fabric: '',
      gender: 'women',
      isActive: false,
      source: 'manual-split',
      subProducts: orphanSubs,
    });
    console.log('Created legacy doc for', orphanSubs[0].sku, '->', legacySlug);
  }

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
