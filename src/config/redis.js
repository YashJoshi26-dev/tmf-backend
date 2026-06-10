'use strict';

/**
 * Redis is intentionally stubbed for the pragmatic build.
 * The in-memory Map below honours the same get/set/del/expire API we'd use with ioredis,
 * so swapping to real Redis later is a 5-line change.
 *
 * For real Redis:
 *   npm i ioredis
 *   const Redis = require('ioredis');
 *   module.exports = new Redis(process.env.REDIS_URL);
 */

const store = new Map();
const timers = new Map();

const redis = {
  async get(key) {
    const v = store.get(key);
    return v === undefined ? null : v;
  },
  async set(key, value, opts = {}) {
    store.set(key, value);
    if (timers.has(key)) clearTimeout(timers.get(key));
    if (opts.EX) {
      timers.set(key, setTimeout(() => {
        store.delete(key);
        timers.delete(key);
      }, opts.EX * 1000));
    }
    return 'OK';
  },
  async del(key) {
    if (timers.has(key)) { clearTimeout(timers.get(key)); timers.delete(key); }
    return store.delete(key) ? 1 : 0;
  },
  async expire(key, seconds) {
    if (!store.has(key)) return 0;
    if (timers.has(key)) clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => store.delete(key), seconds * 1000));
    return 1;
  },
  async flushAll() { store.clear(); timers.forEach(clearTimeout); timers.clear(); return 'OK'; },
  isStub: true,
};

module.exports = redis;
