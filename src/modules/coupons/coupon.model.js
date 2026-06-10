'use strict';

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  coupon: {
    type: String, required: true, unique: true, uppercase: true, trim: true,
    minlength: 4, maxlength: 20, index: true,
  },
  discount: { type: Number, required: true, min: 1, max: 100 }, // percent
  startDate:{ type: Date, required: true },
  endDate:  { type: Date, required: true },
  usageLimit: { type: Number, default: null },                  // null = unlimited
  usedCount:  { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  minOrderValue: { type: Number, default: 0 },
}, { timestamps: true });

couponSchema.methods.isValid = function () {
  const now = Date.now();
  if (!this.isActive)                          return { ok: false, reason: 'Coupon is inactive' };
  if (this.startDate.getTime() > now)          return { ok: false, reason: 'Coupon not yet active' };
  if (this.endDate.getTime()   < now)          return { ok: false, reason: 'Coupon expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { ok: false, reason: 'Usage limit reached' };
  }
  return { ok: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
