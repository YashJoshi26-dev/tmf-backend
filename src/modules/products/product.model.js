'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');

const sizeSchema = new mongoose.Schema({
  size:  { type: String, required: true },
  qty:   { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const subProductSchema = new mongoose.Schema({
  sku:   { type: String, required: true, unique: true, sparse: true, index: true },
  images:[{ public_id: String, url: { type: String, required: true } }],
  description_images: [{ public_id: String, url: String }],
  color: { color: { type: String, required: true }, image: { type: String } },
  sizes: [sizeSchema],
  discount: { type: Number, default: 0, min: 0, max: 100 },
  sold: { type: Number, default: 0 },
}, { _id: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  brand:       { type: String, trim: true, index: true },
  slug:        { type: String, unique: true, index: true },

  category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  // Saree-specific taxonomy
  fabric:    { type: String, index: true },
  occasions: [{ type: String, index: true }],
  workType:  { type: String, index: true },
  gender:    { type: String, enum: ['women', 'men', 'unisex', 'kids'], default: 'women' },

  details:     [{ name: String, value: String }],
  benefits:    [{ name: String }],
  ingredients: [{ name: String }],

  rating:     { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  shipping:    { type: Number, default: 0 },
  refundPolicy:{ type: String, default: '7 day return policy' },

  subProducts: [subProductSchema],

  // Curation flags (set from CSV / sheet)
  isBridal:       { type: Boolean, default: false },
  isTrending:     { type: Boolean, default: false },
  isNewArrival:   { type: Boolean, default: false },
  isBestseller:   { type: Boolean, default: false },

  isActive: { type: Boolean, default: true },

  // Sync metadata
  source:       { type: String, enum: ['manual', 'csv', 'google_sheet'], default: 'manual' },
  lastSyncedAt: Date,
}, { timestamps: true });

// Compound indexes for typical PLP queries
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, isActive: 1, createdAt: -1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ fabric: 1, isActive: 1 });
productSchema.index({ 'subProducts.color.color': 1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(this.name, { lower: true, strict: true });
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
