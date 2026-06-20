require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Papa = require('papaparse');
const fs = require('fs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const { buildProductOpFromRow } = require('./src/modules/inventory/csv/chunkProcessor.service');
  const { generateSlug } = require('./src/modules/inventory/helpers/generateSlug');

  const res = await axios.get(process.env.GOOGLE_SHEET_CSV_URL, { responseType: 'text' });
  const { data: rows } = Papa.parse(res.data, { header: true, skipEmptyLines: true });
  const rowBySku = new Map();
  rows.forEach(r => { if (r.sku) rowBySku.set(r.sku.trim(), r); });

  const categoryCache = new Map();

  // Recover TMF-001 from backup (was removed from d8d, legacy doc creation failed earlier)
  const backup = JSON.parse(fs.readFileSync('/root/products-backup-1781941182846.json', 'utf8'));
  const oldDoc = backup.find(p => p._id === '6a294285f2dc19cab4687d8d');
  if (oldDoc) {
    const orphanSub = oldDoc.subProducts.find(s => s.sku === 'TMF-001');
    if (orphanSub) {
      const alreadyExists = await Product.findOne({ 'subProducts.sku': 'TMF-001' });
      if (!alreadyExists) {
        delete orphanSub._id;
        const legacyName = 'Maroon Banarasi Silk Saree with Kalamkari Pallu (Legacy - TMF-001)';
        let legacySlug = generateSlug(legacyName);
        if (await Product.findOne({ slug: legacySlug })) legacySlug = generateSlug(legacyName, 'TMF001');
        await Product.create({
          name: legacyName,
          description: 'Discontinued product, kept for historical records.',
          slug: legacySlug,
          category: oldDoc.category,
          fabric: '',
          gender: 'women',
          isActive: false,
          source: 'manual',
          subProducts: [orphanSub],
        });
        console.log('Recovered legacy doc for TMF-001 ->', legacySlug);
      } else {
        console.log('TMF-001 already exists somewhere, skipping recovery');
      }
    } else {
      console.log('WARNING: TMF-001 not found in backup, manual check needed');
    }
  }

  // Process remaining 2 docs
  const ids = ['6a294285f2dc19cab4687d8e', '6a294285f2dc19cab4687d8f'];
  for (const id of ids) {
    try {
      const doc = await Product.findById(id);
      const csvSubs = doc.subProducts.filter(sp => rowBySku.has(sp.sku));
      const orphanSubs = doc.subProducts.filter(sp => !rowBySku.has(sp.sku));
      if (csvSubs.length !== 1 || orphanSubs.length !== 1) { console.log('SKIP unexpected shape:', id); continue; }

      const row = rowBySku.get(csvSubs[0].sku);
      const correctSlug = generateSlug(row.name);
      const built = await buildProductOpFromRow(row, { categoryCache });
      const origName = doc.name;

      doc.set({ ...built.updateOp.$set, slug: correctSlug, subProducts: csvSubs });
      await doc.save();
      console.log('Fixed original doc', id, '->', correctSlug);

      const legacyName = `${origName} (Legacy - ${orphanSubs[0].sku})`;
      let legacySlug = generateSlug(legacyName);
      if (await Product.findOne({ slug: legacySlug })) legacySlug = generateSlug(legacyName, orphanSubs[0].sku);

      await Product.create({
        name: legacyName,
        description: 'Discontinued product, kept for historical records.',
        slug: legacySlug,
        category: doc.category,
        fabric: '',
        gender: 'women',
        isActive: false,
        source: 'manual',
        subProducts: orphanSubs,
      });
      console.log('Created legacy doc for', orphanSubs[0].sku, '->', legacySlug);
    } catch (e) {
      console.error('ERROR on', id, e.message);
    }
  }

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
