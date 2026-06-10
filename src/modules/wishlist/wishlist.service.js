'use strict';

const Wishlist = require('./wishlist.model');

const ensure = async (userId) => {
  let wl = await Wishlist.findOne({ user: userId });
  if (!wl) wl = await Wishlist.create({ user: userId, products: [] });
  return wl;
};

exports.get = async (userId) => {
  const wl = await ensure(userId);
  return wl.populate('products.product');
};

exports.toggle = async (userId, productId, style = 0) => {
  const wl = await ensure(userId);
  const idx = wl.products.findIndex((p) => p.product?.toString() === productId);
  if (idx >= 0) wl.products.splice(idx, 1);
  else wl.products.push({ product: productId, style });
  await wl.save();
  return wl.products;
};

exports.clear = async (userId) => {
  await Wishlist.findOneAndUpdate({ user: userId }, { products: [] });
};
