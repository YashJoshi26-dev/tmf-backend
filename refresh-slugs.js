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
  const all = await Product.find({});
  let fixed = 0, errors = [], stillMerged = [], orphan = [];

  for (const doc of all) {
    try {
      const csvSkus = doc.subProducts.filter(sp => rowBySku.has(sp.sku));
      const orphanSkus = doc.subProducts.filter(sp => !rowBySku.has(sp.sku));

      if (orphanSkus.length) orphan.push({ id: doc._id, slug: doc.slug, orphanSkus: orphanSkus.map(s => s.sku) });
      if (csvSkus.length === 0) continue;

      const slugs = new Set(csvSkus.map(sp => generateSlug(rowBySku.get(sp.sku).name)));
      if (slugs.size > 1) { stillMerged.push({ id: doc._id, slug: doc.slug }); continue; }
      if (orphanSkus.length) continue;

      let correctSlug = [...slugs][0];
      if (correctSlug === doc.slug) continue;

      const clash = await Product.findOne({ slug: correctSlug, _id: { $ne: doc._id } });
      if (clash) correctSlug = generateSlug(rowBySku.get(csvSkus[0].sku).name, csvSkus[0].sku);

      const built = await buildProductOpFromRow(rowBySku.get(csvSkus[0].sku), { categoryCache });
      doc.set({ ...built.updateOp.$set, slug: correctSlug });
      await doc.save();
      fixed++;
    } catch (e) {
      errors.push({ id: doc._id, error: e.message });
    }
  }

  console.log('Slug fixed:', fixed);
  console.log('Errors:', errors.length, JSON.stringify(errors));
  console.log('Still merged (need split):', stillMerged.length, JSON.stringify(stillMerged));
  console.log('Docs with orphan/legacy SKUs:', orphan.length, JSON.stringify(orphan));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
