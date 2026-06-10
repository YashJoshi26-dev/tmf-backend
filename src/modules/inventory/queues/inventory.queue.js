'use strict';

const queue = require('../../../services/queue.service');
const { syncFromSheet } = require('../sync/googleSheetSync.service');
const { invalidateAfterImport } = require('../sync/cacheInvalidation.service');
const logger = require('../../../utils/logger');

const JOB = 'inventory-sheet-sync';

queue.register(JOB, async (payload = {}) => {
  await syncFromSheet({ triggeredBy: payload.triggeredBy || null });
  await invalidateAfterImport();
  logger.info('inventory sync job complete');
});

module.exports = {
  enqueueSheetSync: (payload) => queue.add(JOB, payload),
  JOB,
};
