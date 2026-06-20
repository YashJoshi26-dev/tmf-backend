require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const { generateSlug } = require('./src/modules/inventory/helpers/generateSlug');
  const all = await Product.find({}, 'name slug subProducts.sku');
  let mismatched = [];
  all.forEach(p => {
    const expected = generateSlug(p.name);
    if (expected !== p.slug) {
      mismatched.push({ name: p.name, currentSlug: p.slug, expectedSlug: expected, skus: p.subProducts.map(s => s.sku) });
    }
  });
  console.log('Total products:', all.length);
  console.log('Mismatched:', mismatched.length);
  console.log(JSON.stringify(mismatched.slice(0, 10), null, 2));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
