'use strict';

const Product = require('../../products/product.model');
const logger = require('../../../utils/logger');

/**
 * Currently a no-op: Mongo text index auto-maintains on writes.
 * Hook for Algolia/Meilisearch later.
 */
const reindexAll = async () => {
  const total = await Product.estimatedDocumentCount();
  logger.info('searchIndex.reindexAll — Mongo text index is auto-maintained', { total });
  return { total, reindexed: 0 };
};

module.exports = { reindexAll };
