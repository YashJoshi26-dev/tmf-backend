'use strict';

const Coupon = require('./coupon.model');
const Cart = require('../cart/cart.model');
const ApiError = require('../../utils/ApiError');

exports.list = () => Coupon.find().sort({ createdAt: -1 });

exports.create = async (data) => {
  const exists = await Coupon.findOne({ coupon: data.coupon.toUpperCase() });
  if (exists) throw ApiError.conflict('Coupon code already exists');
  return Coupon.create({ ...data, coupon: data.coupon.toUpperCase() });
};

exports.update = async (id, data) => {
  if (data.coupon) data.coupon = data.coupon.toUpperCase();
  const c = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!c) throw ApiError.notFound('Coupon not found');
  return c;
};

exports.remove = async (id) => {
  const c = await Coupon.findByIdAndDelete(id);
  if (!c) throw ApiError.notFound('Coupon not found');
};

/**
 * Apply a coupon to a user's cart, return new totals.
 * Does NOT mark the coupon as used — that happens at order placement (atomically with stock).
 */
exports.apply = async (userId, code) => {
  const coupon = await Coupon.findOne({ coupon: code.toUpperCase() });
  if (!coupon) throw ApiError.notFound('Coupon does not exist');

  const validity = coupon.isValid();
  if (!validity.ok) throw ApiError.badRequest(validity.reason);

  if (coupon.usedBy.some((u) => u.toString() === userId.toString())) {
    throw ApiError.badRequest('You have already used this coupon');
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart || !cart.products.length) throw ApiError.badRequest('Cart is empty');

  if (cart.cartTotal < (coupon.minOrderValue || 0)) {
    throw ApiError.badRequest(`Minimum order value is ₹${coupon.minOrderValue}`);
  }

  const discount = Number(((cart.cartTotal * coupon.discount) / 100).toFixed(2));
  const totalAfterDiscount = Number((cart.cartTotal - discount).toFixed(2));

  cart.totalAfterDiscount = totalAfterDiscount;
  cart.couponCode = coupon.coupon;
  await cart.save();

  return { totalAfterDiscount, discount, percent: coupon.discount };
};
