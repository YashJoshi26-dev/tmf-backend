'use strict';

const Category = require('./category.model');

exports.list  = (filter = {}) => Category.find(filter).sort({ order: 1, name: 1 });
exports.byId  = (id)   => Category.findById(id);
exports.bySlug= (slug) => Category.findOne({ slug });
exports.create= (data) => Category.create(data);
exports.update= (id, p)=> Category.findByIdAndUpdate(id, p, { new: true, runValidators: true });
exports.remove= (id)   => Category.findByIdAndDelete(id);
