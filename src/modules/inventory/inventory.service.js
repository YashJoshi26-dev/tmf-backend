'use strict';

const repo = require('./inventory.repository');
const { importCsv } = require('./csv/csvImport.service');
const { preview }   = require('./csv/csvPreview.service');
const { buildTemplate } = require('./csv/csvTemplate.service');
const { buildFailedRowsCsv } = require('./csv/failedRows.service');
const { syncFromSheet } = require('./sync/googleSheetSync.service');
const { invalidateAfterImport } = require('./sync/cacheInvalidation.service');
const { applyStockUpdates } = require('./sync/stockSync.service');
const { enqueue: enqueueCsv } = require('./queues/csvImport.queue');
const { enqueueSheetSync } = require('./queues/inventory.queue');
const ApiError = require('../../utils/ApiError');

exports.previewCsv = (buffer) => preview(buffer);
exports.template = () => buildTemplate();

exports.uploadCsv = async ({ buffer, filename, triggeredBy, sync = false }) => {
  if (!buffer || !buffer.length) throw ApiError.badRequest('CSV file is empty');

  if (sync) {
    // Run inline — useful for small files and to give the admin the result immediately
    const { log, failures } = await importCsv({ buffer, filename, triggeredBy, source: 'csv_upload' });
    await invalidateAfterImport();
    return { log, failures, failedCsv: failures.length ? buildFailedRowsCsv(failures) : null };
  }

  // Async path — fire-and-forget via the queue
  await enqueueCsv({ buffer, filename, triggeredBy });
  return { queued: true };
};

exports.syncSheetNow = async (triggeredBy) => {
  // We run synchronously here so the admin gets the result. For very large catalogs,
  // call enqueueSheetSync() instead.
  const { log, failures } = await syncFromSheet({ triggeredBy });
  await invalidateAfterImport();
  return { log, failures: failures.length };
};

exports.syncSheetAsync = (triggeredBy) => enqueueSheetSync({ triggeredBy });

exports.listLogs  = (limit) => repo.listLogs(limit);
exports.getLog    = (id)    => repo.getLog(id);
exports.history   = (productId, limit) => repo.productHistory(productId, limit);

exports.bulkStock = (updates) => applyStockUpdates(updates);
