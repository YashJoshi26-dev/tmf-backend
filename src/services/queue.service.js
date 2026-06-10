'use strict';

/**
 * Pragmatic queue stub.
 *
 * Replaces BullMQ for the no-Redis dev experience. Jobs run inline (immediately,
 * in-process) so the rest of the codebase can `await queue.add('name', payload)`
 * without changing.
 *
 * When you switch to real BullMQ, only this file changes.
 */

const logger = require('../utils/logger');

const handlers = new Map();

const register = (name, handler) => {
  handlers.set(name, handler);
  logger.debug(`Queue handler registered: ${name}`);
};

const add = async (name, payload) => {
  const h = handlers.get(name);
  if (!h) {
    logger.warn(`Queue.add called for unknown handler "${name}"`);
    return null;
  }
  try {
    // Run async but don't block the caller (fire-and-forget).
    setImmediate(() => {
      Promise.resolve(h(payload)).catch((err) =>
        logger.error(`Queue job "${name}" failed`, { error: err.message, stack: err.stack })
      );
    });
    return { queued: true, name };
  } catch (err) {
    logger.error(`Queue.add error`, { name, error: err.message });
    throw err;
  }
};

module.exports = { register, add };
