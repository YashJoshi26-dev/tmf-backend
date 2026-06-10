'use strict';

/**
 * Thin facade on top of config/redis (stubbed in-memory by default).
 * Provides ergonomic getOrSet + namespaced invalidate.
 */

const redis = require('../config/redis');
const logger = require('../utils/logger');

const get = (k) => redis.get(k);
const set = (k, v, ttl) => redis.set(k, v, ttl ? { EX: ttl } : undefined);
const del = (k) => redis.del(k);

/**
 * Cache-aside: try cache, else compute + store.
 */
const getOrSet = async (key, ttl, computeFn) => {
  const cached = await redis.get(key);
  if (cached !== null) return cached;
  const fresh = await computeFn();
  await redis.set(key, fresh, ttl ? { EX: ttl } : undefined);
  return fresh;
};

/**
 * Best-effort "delete by prefix". Real Redis would use SCAN+DEL;
 * for the in-memory stub we expose a no-op fallback. Modules can
 * call this freely without breaking when there's no Redis yet.
 */
const invalidatePrefix = async (prefix) => {
  if (redis.isStub) {
    // The stub doesn't expose iteration. We just log and move on.
    logger.debug('cache.invalidatePrefix (stub no-op)', { prefix });
    return;
  }
  // Placeholder for ioredis SCAN — wire when Redis is added.
};

module.exports = { get, set, del, getOrSet, invalidatePrefix };
