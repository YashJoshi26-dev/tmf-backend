require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const { generateSlug } = require('./src/modules/inventory/helpers/generateSlug');
  const all = await Product.find({}, 'name slug subProducts.sku isActive');
  let genuine = [];
  let suffixedOk = [];
  all.forEach(p => {
    const expected = generateSlug(p.name);
    if (expected === p.slug) return;
    if (p.slug.startsWith(expected + '-')) {
      suffixedOk.push({ name: p.name, slug: p.slug });
    } else {
      genuine.push({ name: p.name, currentSlug: p.slug, expectedSlug: expected, isActive: p.isActive, skus: p.subProducts.map(s => s.sku) });
    }
  });
  console.log('Total products:', all.length);
  console.log('Correctly suffixed (fine, no action):', suffixedOk.length);
  console.log('GENUINE mismatches:', genuine.length);
  console.log(JSON.stringify(genuine, null, 2));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
