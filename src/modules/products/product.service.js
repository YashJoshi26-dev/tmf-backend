'use strict';

const repo = require('./product.repository');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const cache = require('../../services/cache.service');
const upload = require('../../services/upload.service');
const { CACHE_TTL } = require('./product.constants');

exports.list = async (query) => {
  const { page, limit, skip, sort } = parsePagination(query, { defaultLimit: 24, maxLimit: 60 });
  const filter = { isActive: true };

 if (query.category) {
  // Accept both ObjectId and category name
  const Category = require('../categories/category.model');
  const cat = await Category.findOne({ 
    name: new RegExp(`^${query.category}$`, 'i') 
  });
  if (!cat) throw require('../../utils/ApiError').badRequest(`Invalid category: ${query.category}`);
  filter.category = cat._id;
}
if (query.subCategory) {
  const Category = require('../categories/category.model');
  const sub = await Category.findOne({ 
    name: new RegExp(`^${query.subCategory}$`, 'i') 
  });
  if (sub) filter.subCategories = sub._id;
}
  if (query.brand)        filter.brand = { $in: query.brand.split(',') };
  if (query.fabric)       filter.fabric = { $in: query.fabric.split(',') };
  if (query.occasion)     filter.occasions = { $in: query.occasion.split(',') };
  if (query.workType)     filter.workType = { $in: query.workType.split(',') };
  if (query.color)        filter['subProducts.color.color'] = { $in: query.color.split(',') };
  if (query.size)         filter['subProducts.sizes.size']  = { $in: query.size.split(',') };
  if (query.minPrice || query.maxPrice) {
    filter['subProducts.sizes.price'] = {};
    if (query.minPrice) filter['subProducts.sizes.price'].$gte = Number(query.minPrice);
    if (query.maxPrice) filter['subProducts.sizes.price'].$lte = Number(query.maxPrice);
  }
  if (query.rating)       filter.rating = { $gte: Number(query.rating) };
  if (query.bridal)       filter.isBridal = true;
  if (query.trending)     filter.isTrending = true;
  if (query.new)          filter.isNewArrival = true;
  if (query.bestseller)   filter.isBestseller = true;
  if (query.search)       filter.$text = { $search: query.search };

  let actualSort = sort;
  if (query.sortBy === 'price-asc')  actualSort = { 'subProducts.sizes.price': 1 };
  if (query.sortBy === 'price-desc') actualSort = { 'subProducts.sizes.price': -1 };
  if (query.sortBy === 'rating')     actualSort = { rating: -1 };
  if (query.sortBy === 'newest')     actualSort = { createdAt: -1 };
  if (query.sortBy === 'popular')    actualSort = { 'subProducts.sold': -1 };

  const [items, total] = await Promise.all([
    repo.search(filter, { sort: actualSort, skip, limit }),
    repo.count(filter),
  ]);
  return { items, meta: buildMeta({ total, page, limit }) };
};

exports.findById = async (id) => {
  return cache.getOrSet(`product:${id}`, CACHE_TTL.PRODUCT_DETAIL, async () => {
    const p = await repo.populateDetail(id);
    if (!p) throw ApiError.notFound('Product not found');
    return p;
  });
};

exports.findBySlug = async (slug) => {
  return cache.getOrSet(`product:slug:${slug}`, CACHE_TTL.PRODUCT_DETAIL, async () => {
    const p = await repo.bySlug(slug);
    if (!p) throw ApiError.notFound('Product not found');
    return p;
  });
};

exports.create = (payload) => repo.create({ ...payload, source: 'manual' });

exports.update = async (id, payload) => {
  const p = await repo.update(id, payload);
  if (!p) throw ApiError.notFound('Product not found');
  // Best-effort cache invalidation for hot keys
  await cache.del(`product:${id}`);
  if (p.slug) await cache.del(`product:slug:${p.slug}`);
  return p;
};

exports.remove = async (id) => {
  const p = await repo.byId(id);
  if (!p) throw ApiError.notFound('Product not found');
  const publicIds = p.subProducts.flatMap((sp) => sp.images.map((i) => i.public_id)).filter(Boolean);
  upload.destroyMany(publicIds).catch(() => {});
  await p.deleteOne();
  await cache.del(`product:${id}`);
  if (p.slug) await cache.del(`product:slug:${p.slug}`);
};
