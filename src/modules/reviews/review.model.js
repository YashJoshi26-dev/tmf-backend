'use strict';

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true, maxlength: 120 },
  text:    { type: String, required: true, trim: true, maxlength: 2000 },
  images:  [{ public_id: String, url: String }],
  verifiedPurchase: { type: Boolean, default: false },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: true }, // optional moderation flag
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });   // one review per user per product
reviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
