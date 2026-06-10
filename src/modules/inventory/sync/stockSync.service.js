'use strict';

const Product = require('../../products/product.model');
const ProductHistory = require('../models/productHistory.model');

/**
 * Lightweight stock-only sync: given a [{sku, qty}] list (e.g. a faster Sheet poll
 * just for inventory levels), update sizes in place. Cheap when only stock changes.
 */
const applyStockUpdates = async (updates = []) => {
  let updated = 0;
  for (const { sku, qty } of updates) {
    if (!sku || qty == null) continue;
    const product = await Product.findOne({ 'subProducts.sku': sku });
    if (!product) continue;
    const sub = product.subProducts.find((sp) => sp.sku === sku);
    if (!sub?.sizes?.length) continue;

    const before = sub.sizes[0].qty;
    if (before === qty) continue;

    sub.sizes[0].qty = qty;
    await product.save();
    updated += 1;

    // Audit
    ProductHistory.create({
      product: product._id, sku, action: 'stock_changed',
      before: { qty: before }, after: { qty }, source: 'google_sheet',
    }).catch(() => {});
  }
  return { updated };
};

module.exports = { applyStockUpdates };
