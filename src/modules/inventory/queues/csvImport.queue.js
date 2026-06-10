'use strict';

// Thin wrapper so callers can `require('./queues/csvImport.queue').enqueue(...)`
// without knowing whether the implementation is BullMQ or the in-process stub.
module.exports = require('../jobs/csvImport.job');
