require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');

  console.log('--- Where is TMF-001? ---');
  const withTmf001 = await Product.find({ 'subProducts.sku': 'TMF-001' }, 'name slug subProducts.sku isActive');
  withTmf001.forEach(d => console.log(d._id.toString(), '|', d.name, '|', d.slug, '|', d.isActive, '| SKUs:', d.subProducts.map(s => s.sku).join(', ')));

  console.log('--- d8e and d8f current state ---');
  const ids = ['6a294285f2dc19cab4687d8e', '6a294285f2dc19cab4687d8f'];
  for (const id of ids) {
    const d = await Product.findById(id, 'name slug subProducts.sku');
    console.log(id, '|', d.name, '|', d.slug, '| SKUs:', d.subProducts.map(s => s.sku).join(', '));
  }

  console.log('--- d8d (should be Pink Shimmer, fixed earlier) ---');
  const d8d = await Product.findById('6a294285f2dc19cab4687d8d', 'name slug subProducts.sku');
  console.log(d8d._id.toString(), '|', d8d.name, '|', d8d.slug, '| SKUs:', d8d.subProducts.map(s => s.sku).join(', '));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
