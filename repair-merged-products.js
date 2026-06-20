require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Papa = require('papaparse');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const { buildProductOpFromRow } = require('./src/modules/inventory/csv/chunkProcessor.service');
  const { generateSlug } = require('./src/modules/inventory/helpers/generateSlug');

  // Fetch fresh CSV
  const res = await axios.get(process.env.GOOGLE_SHEET_CSV_URL || process.env.SYNC_CSV_URL, { responseType: 'text' });
  const { data: rows } = Papa.parse(res.data, { header: true, skipEmptyLines: true });
  const rowBySku = new Map();
  rows.forEach(r => { if (r.sku) rowBySku.set(r.sku.trim(), r); });

  const categoryCache = new Map();
  const all = await Product.find({});
  let splitCount = 0, skippedNoRow = 0;

  for (const doc of all) {
    if (doc.subProducts.length <= 1) continue;

    // Compute correct slug for each subProduct based on its CSV row
    const groups = new Map(); // slug -> { row, subProducts: [] }
    for (const sp of doc.subProducts) {
      const row = rowBySku.get(sp.sku);
      if (!row) { skippedNoRow++; continue; }
      const slug = generateSlug(row.name);
      if (!groups.has(slug)) groups.set(slug, { row, subProducts: [] });
      groups.get(slug).subProducts.push(sp);
    }

    if (groups.size <= 1) continue; // not actually mixed, skip

    splitCount++;
    const slugEntries = [...groups.entries()];
    console.log(`Splitting doc ${doc._id} (current slug: ${doc.slug}) into ${slugEntries.length} products:`, slugEntries.map(([s]) => s));

    // Keep first group in the original doc, update its fields+slug
    const [firstSlug, firstGroup] = slugEntries[0];
    const firstBuilt = await buildProductOpFromRow(firstGroup.row, { categoryCache });
    doc.set({ ...firstBuilt.updateOp.$set, slug: firstSlug, subProducts: firstGroup.subProducts });
    await doc.save();

    // Create new docs for remaining groups
    for (let i = 1; i < slugEntries.length; i++) {
      const [slug, group] = slugEntries[i];
      const built = await buildProductOpFromRow(group.row, { categoryCache });
      let finalSlug = slug;
      const exists = await Product.findOne({ slug: finalSlug });
      if (exists) finalSlug = generateSlug(group.row.name, group.subProducts[0].sku);
      await Product.create({ ...built.updateOp.$set, slug: finalSlug, subProducts: group.subProducts });
    }
  }

  console.log('Done. Docs split:', splitCount, 'SKUs with no matching CSV row:', skippedNoRow);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
