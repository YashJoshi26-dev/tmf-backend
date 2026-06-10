'use strict';

const axios = require('axios');
const env = require('../../../config/env');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../utils/logger');
const { importCsv } = require('../csv/csvImport.service');

/**
 * Fetch the master Google Sheet (published as CSV) and run it through the same
 * import pipeline as a manual CSV upload. Source: 'google_sheet'.
 */
const syncFromSheet = async ({ triggeredBy = null } = {}) => {
  if (!env.sync.csvUrl) throw ApiError.badRequest('GOOGLE_SHEET_CSV_URL not configured');

  let response;
  try {
    response = await axios.get(env.sync.csvUrl, { timeout: 30000, responseType: 'arraybuffer' });
  } catch (err) {
    logger.error('Failed to fetch Google Sheet', { error: err.message });
    throw ApiError.internal('Could not fetch the Google Sheet — check that it is published to web as CSV');
  }

  const buffer = Buffer.from(response.data);
  return importCsv({
    buffer,
    filename: 'google_sheet.csv',
    triggeredBy,
    source: 'google_sheet',
  });
};

module.exports = { syncFromSheet };
