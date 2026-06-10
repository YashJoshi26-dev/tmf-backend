'use strict';

const { emitToAdmin } = require('./index');

exports.onSyncStarted  = (log) => emitToAdmin('sync:started',  { id: log._id, source: log.source });
exports.onSyncFinished = (log) => emitToAdmin('sync:finished', {
  id: log._id, status: log.status, inserted: log.inserted, updated: log.updated, errors: log.errorList.length,
});
exports.onLowStock = (product, sku, qty) => emitToAdmin('stock:low', { product: product._id, sku, qty });
