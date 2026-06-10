'use strict';

const repo = require('./category.repository');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

exports.listAll = () => repo.list({ isActive: true });

/** Tree view: roots with their children inlined. Convenient for the storefront nav. */
exports.tree = async () => {
  const all = await repo.list({ isActive: true }).lean();
  const map = new Map();
  all.forEach((c) => map.set(c._id.toString(), { ...c, children: [] }));
  const roots = [];
  all.forEach((c) => {
    const node = map.get(c._id.toString());
    if (c.parent) map.get(c.parent.toString())?.children.push(node);
    else roots.push(node);
  });
  return roots;
};

exports.create = async (data) => {
  if (data.parent) {
    const p = await repo.byId(data.parent);
    if (!p) throw ApiError.badRequest('Parent category does not exist');
  }
  return repo.create(data);
};

exports.update = async (id, data) => {
  const c = await repo.update(id, data);
  if (!c) throw ApiError.notFound('Category not found');
  return c;
};

exports.remove = async (id) => {
  const used = await Product.exists({ category: id });
  if (used) throw ApiError.conflict('Cannot delete: products exist under this category');
  // Cascade delete children
  await repo.remove(id);
  // Find and remove children (one level — keep it simple)
  const children = await repo.list({ parent: id });
  for (const child of children) await repo.remove(child._id);
};
