'use strict';

const Product = require('./product.model');

exports.create  = (data)      => Product.create(data);
exports.byId    = (id)        => Product.findById(id);
exports.bySlug  = (slug)      => Product.findOne({ slug, isActive: true });
exports.bySku   = (sku)       => Product.findOne({ 'subProducts.sku': sku });

exports.update  = (id, p)     => Product.findByIdAndUpdate(id, p, { new: true, runValidators: true });
exports.upsertBySku = (sku, payload) =>
  Product.findOneAndUpdate({ 'subProducts.sku': sku }, { $set: payload, $setOnInsert: { createdAt: new Date() } }, { new: true, upsert: true });

exports.remove  = (id)        => Product.findByIdAndDelete(id);

exports.search  = (filter, opts) =>
  Product.find(filter).sort(opts.sort).skip(opts.skip).limit(opts.limit)
    .populate('category', 'name slug').lean();
exports.count   = (filter)    => Product.countDocuments(filter);

exports.populateDetail = (id) =>
  Product.findById(id).populate('category', 'name slug').populate('subCategories', 'name slug');
