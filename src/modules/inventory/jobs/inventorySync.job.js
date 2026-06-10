'use strict';

const cron = require('node-cron');
const env = require('../../../config/env');
const logger = require('../../../utils/logger');
const { syncFromSheet } = require('../sync/googleSheetSync.service');
const { invalidateAfterImport } = require('../sync/cacheInvalidation.service');

let task = null;
let running = false;

const runOnce = async () => {
  if (running) {
    logger.warn('Skipping sync — previous run still in progress');
    return;
  }
  if (!env.sync.csvUrl) {
    logger.debug('Sync skipped: no GOOGLE_SHEET_CSV_URL configured');
    return;
  }
  running = true;
  try {
    const { log } = await syncFromSheet({});
    await invalidateAfterImport();
    logger.info('Scheduled sync done', { status: log.status, inserted: log.inserted, updated: log.updated, errors: log.errorList.length });
  } catch (err) {
    logger.error('Scheduled sync failed', { error: err.message });
  } finally {
    running = false;
  }
};

const start = () => {
  if (task) return;
  if (!env.sync.enabled) {
    logger.info('SYNC_ENABLED is false — cron NOT started');
    return;
  }
  task = cron.schedule(env.sync.cron, runOnce, { timezone: 'Asia/Kolkata' });
  logger.info(`Inventory sync cron started (${env.sync.cron} IST)`);
};

const stop = () => {
  if (task) { task.stop(); task = null; }
};

module.exports = { start, stop, runOnce };
