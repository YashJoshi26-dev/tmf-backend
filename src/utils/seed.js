'use strict';

/**
 * Idempotent seeder.
 * Run:  npm run seed
 *
 * Creates:
 *   - admin@example.com / Admin@1234
 *   - 4 root categories (Sarees, Lehengas, Bridal, Designer)
 *   - 3 demo banners
 *   - 2 coupons (WELCOME10, FESTIVE25)
 *   - 2 demo products
 */

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('./logger');

const User     = require('../modules/users/user.model');
const Category = require('../modules/categories/category.model');
const Product  = require('../modules/products/product.model');
const Coupon   = require('../modules/coupons/coupon.model');
const Banner   = require('../modules/banners/banner.model');

const seed = async () => {
  await connectDB();
  logger.info('Seeding…');

  // Admin
  let admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin', email: 'admin@example.com',
      password: 'Admin@1234', role: 'admin', emailVerified: true,
    });
    logger.info('Created admin: admin@example.com / Admin@1234');
  }

  // Categories
  const rootDefs = ['Sarees', 'Lehengas', 'Bridal', 'Designer'];
  const cats = {};
  for (const name of rootDefs) {
    let c = await Category.findOne({ name, parent: null });
    if (!c) c = await Category.create({ name });
    cats[name] = c;
  }

  // Sub-categories for Sarees
  const subDefs = ['Banarasi', 'Kanjivaram', 'Silk', 'Cotton', 'Designer'];
  for (const name of subDefs) {
    const exists = await Category.findOne({ name, parent: cats.Sarees._id });
    if (!exists) await Category.create({ name, parent: cats.Sarees._id });
  }

  // Banners
  const bannerDefs = [
    { position: 'hero', title: 'The Wedding Edit', subtitle: 'Heirlooms, reimagined', cta: 'Shop Bridal',
      link: '/bridal', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920', order: 1 },
    { position: 'hero', title: 'Festival of Fine Weaves', subtitle: 'Discover the season\'s most coveted sarees', cta: 'Shop New',
      link: '/collections', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1920', order: 2 },
    { position: 'mid', title: 'Banarasi Collection', cta: 'Explore',
      link: '/category/sarees/banarasi', image: 'https://images.unsplash.com/photo-1594736797933-d0d3085cf6e9?w=1920', order: 1 },
  ];
  for (const b of bannerDefs) {
    const exists = await Banner.findOne({ position: b.position, title: b.title });
    if (!exists) await Banner.create(b);
  }

  // Coupons (valid 90 days)
  const now = new Date();
  const end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const couponDefs = [
    { coupon: 'WELCOME10', discount: 10, startDate: now, endDate: end, minOrderValue: 1500 },
    { coupon: 'FESTIVE25', discount: 25, startDate: now, endDate: end, minOrderValue: 5000 },
  ];
  for (const c of couponDefs) {
    const exists = await Coupon.findOne({ coupon: c.coupon });
    if (!exists) await Coupon.create(c);
  }

  // Demo products
  const sampleProducts = [
    {
      name: 'Red Banarasi Silk Saree with Gold Zari',
      description: 'Pure Banarasi silk saree in deep maroon with intricate gold zari border. Comes with unstitched blouse piece.',
      brand: 'Heritage',
      category: cats.Sarees._id,
      fabric: 'Banarasi Silk',
      occasions: ['Bridal', 'Festive'],
      workType: 'Zari',
      isBridal: true,
      isTrending: true,
      isNewArrival: true,
      subProducts: [{
        sku: 'HRT-BNRS-RED-001',
        color: { color: 'Red' },
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800' }],
        sizes: [{ size: 'Free Size', qty: 12, price: 12000 }],
        discount: 29,
      }],
    },
    {
      name: 'Pastel Pink Designer Lehenga',
      description: 'Pastel pink georgette lehenga with sequin and zari work — perfect for sangeets and receptions.',
      brand: 'Atelier',
      category: cats.Lehengas._id,
      fabric: 'Georgette',
      occasions: ['Sangeet', 'Reception'],
      workType: 'Sequin',
      isNewArrival: true,
      subProducts: [{
        sku: 'ATL-LHN-PNK-001',
        color: { color: 'Pink' },
        images: [{ url: 'https://images.unsplash.com/photo-1594736797933-d0d3085cf6e9?w=800' }],
        sizes: [
          { size: 'S', qty: 5, price: 25000 },
          { size: 'M', qty: 8, price: 25000 },
          { size: 'L', qty: 6, price: 25000 },
        ],
        discount: 15,
      }],
    },
  ];

  for (const p of sampleProducts) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) await Product.create(p);
  }

  await disconnectDB();
  logger.info('Seeding complete ✔');
};

seed().catch(async (err) => {
  logger.error('Seed failed', { error: err.message, stack: err.stack });
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
