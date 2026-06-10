'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true, maxlength: 60 },
  slug:   { type: String, unique: true, index: true },
  image:  { type: String, default: '' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Name unique within the same parent (allows "Silk" under Sarees AND under Lehengas)
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
