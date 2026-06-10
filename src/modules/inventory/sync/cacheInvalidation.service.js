'use strict';

const cache = require('../../../services/cache.service');

/**
 * Invalidate hot product caches after an import. Cheap to call defensively.
 */
const invalidateAfterImport = async () => {
  await cache.invalidatePrefix('product:');
  await cache.invalidatePrefix('products:list:');
};

module.exports = { invalidateAfterImport };
