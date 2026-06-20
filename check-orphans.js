require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const ids = ['6a294285f2dc19cab4687d8d','6a294285f2dc19cab4687d8e','6a294285f2dc19cab4687d8f','6a294285f2dc19cab4687d95','6a294285f2dc19cab4687d96','6a32471fa6a69e2c03a4b75a','6a32471fa6a69e2c03a4b75b','6a32471fa6a69e2c03a4b75c','6a32471fa6a69e2c03a4b75e','6a32471fa6a69e2c03a4b75d','6a32471fa6a69e2c03a4b75f','6a32471fa6a69e2c03a4b760'];
  const docs = await Product.find({ _id: { $in: ids } }, 'name slug subProducts.sku subProducts.color isActive');
  docs.forEach(d => {
    console.log(d._id.toString(), '|', d.name, '|', d.slug, '|', d.isActive, '| SKUs:', d.subProducts.map(s => `${s.sku}(${s.color?.color})`).join(', '));
  });
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
