'use strict';

const Cart = require('./cart.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

exports.get = (userId) => Cart.findOne({ user: userId });

exports.save = async (userId, products = []) => {
  const lines = await Promise.all(products.map(async (p) => {
    const product = await Product.findById(p.product);
    if (!product) throw ApiError.badRequest(`Product ${p.product} not found`);

    // FIX: use style index directly — don't rely on Mongoose .id() for subProducts
    const sub = product.subProducts[p.style ?? 0] || product.subProducts[0];
    if (!sub) throw ApiError.badRequest(`Variant not found for ${product.name}`);

    const sizeRow = sub.sizes.find((s) => s.size === p.size) || sub.sizes[0];
    if (!sizeRow) throw ApiError.badRequest(`Size unavailable for ${product.name}`);
    if (sizeRow.qty < p.qty) throw ApiError.badRequest(`Only ${sizeRow.qty} left for ${product.name} (${p.size})`);

    const discount = sub.discount || 0;
    const priceBefore = sizeRow.price;
    const price = Number((priceBefore - (priceBefore * discount) / 100).toFixed(2));

    return {
      product:     product._id,
      name:        product.name,
      image:       sub.images?.[0]?.url || '',   // FIX: empty string instead of failing
      size:        sizeRow.size,
      qty:         p.qty,
      color:       sub.color,
      price,
      priceBefore,
      discount,
      productSubId: sub._id?.toString() || '',
      style:        p.style ?? 0,
    };
  }));

  const cartTotal = Number(lines.reduce((s, p) => s + p.price * p.qty, 0).toFixed(2));

  return Cart.findOneAndUpdate(
    { user: userId },
    { user: userId, products: lines, cartTotal, totalAfterDiscount: 0, couponCode: '' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

exports.clear = (userId) => Cart.findOneAndDelete({ user: userId });