'use strict';

/**
 * Facade for product search. Currently uses Mongo $text indexes.
 * Future: swap to Meilisearch/Algolia without touching callers.
 */

const Product = require('../modules/products/product.model');

const searchProducts = async (q, { limit = 20 } = {}) => {
  if (!q || !q.trim()) return [];
  return Product.find(
    { $text: { $search: q }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
};

const suggest = async (q, limit = 8) => {
  if (!q || q.length < 2) return [];
  // Prefix match on name. Cheap and good enough for autocomplete.
  return Product.find(
    { name: { $regex: `^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' }, isActive: true },
    { name: 1, slug: 1, _id: 1 }
  ).limit(limit).lean();
};

module.exports = { searchProducts, suggest };
