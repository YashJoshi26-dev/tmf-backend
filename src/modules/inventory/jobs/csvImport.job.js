'use strict';

const queue = require('../../../services/queue.service');
const { importCsv } = require('../csv/csvImport.service');
const { invalidateAfterImport } = require('../sync/cacheInvalidation.service');
const logger = require('../../../utils/logger');

const JOB_NAME = 'csv-import';

queue.register(JOB_NAME, async (payload) => {
  const { buffer, filename, triggeredBy } = payload;
  const buf = Buffer.from(buffer.data || buffer); // tolerate JSON-serialised buffers
  await importCsv({ buffer: buf, filename, triggeredBy });
  await invalidateAfterImport();
  logger.info('CSV import job done', { filename });
});

const enqueue = (payload) => queue.add(JOB_NAME, payload);

module.exports = { enqueue, JOB_NAME };
