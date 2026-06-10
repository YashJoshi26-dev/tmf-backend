'use strict';

const Review = require('./review.model');
const Product = require('../products/product.model');
const Order = require('../orders/order.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildMeta } = require('../../utils/pagination');

/** Recompute and persist a product's average rating + count. */
const recomputeRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new (require('mongoose').Types.ObjectId)(productId.toString()), isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    rating: Number(avg.toFixed(2)),
    numReviews: count,
  });
};

exports.list = async (productId, query) => {
  const { page, limit, skip, sort } = parsePagination(query, { defaultLimit: 10 });
  const filter = { product: productId, isApproved: true };
  const [items, total] = await Promise.all([
    Review.find(filter).sort(sort).skip(skip).limit(limit).populate('user', 'name image').lean(),
    Review.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ total, page, limit }) };
};

exports.create = async (user, productId, payload) => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const exists = await Review.findOne({ product: productId, user: user._id });
  if (exists) throw ApiError.conflict('You have already reviewed this product');

  // Verified purchase = user has a completed order containing this product
  const orderCount = await Order.countDocuments({
    user: user._id,
    'products.product': productId,
    isPaid: true,
  });

  const review = await Review.create({
    ...payload,
    product: productId,
    user: user._id,
    verifiedPurchase: orderCount > 0,
  });

  await recomputeRating(productId);
  return review;
};

exports.update = async (user, reviewId, payload) => {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound('Review not found');
  if (review.user.toString() !== user._id.toString()) throw ApiError.forbidden('Not your review');

  Object.assign(review, payload);
  await review.save();
  await recomputeRating(review.product);
  return review;
};

exports.remove = async (user, reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound('Review not found');
  if (user.role !== 'admin' && review.user.toString() !== user._id.toString()) {
    throw ApiError.forbidden('Not allowed');
  }
  const productId = review.product;
  await review.deleteOne();
  await recomputeRating(productId);
};

exports.toggleLike = async (user, reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound('Review not found');
  const i = review.likes.findIndex((u) => u.toString() === user._id.toString());
  if (i >= 0) review.likes.splice(i, 1); else review.likes.push(user._id);
  await review.save();
  return review.likes.length;
};
