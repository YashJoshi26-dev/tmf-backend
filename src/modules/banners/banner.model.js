'use strict';

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  position: { type: String, enum: ['hero', 'mid', 'category', 'footer'], default: 'hero', index: true },
  title:    { type: String, trim: true },
  subtitle: { type: String, trim: true },
  eyebrow:  { type: String, trim: true },
  cta:      { type: String, trim: true },
  link:     { type: String, trim: true },
  image:        { type: String, required: true },
  mobileImage:  { type: String },
  order: { type: Number, default: 0 },
  startsAt: Date,
  endsAt:   Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
