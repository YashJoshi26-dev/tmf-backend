require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./src/modules/products/product.model');
  const all = await Product.find({}).lean();
  const filename = `/root/products-backup-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(all, null, 2));
  console.log('Backed up', all.length, 'products to', filename);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
