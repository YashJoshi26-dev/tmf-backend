'use strict';

const logger = require('../../utils/logger');

/**
 * Stub for WhatsApp Business API.
 * Future integration: WhatsApp Cloud API (Meta) or Gupshup/Twilio for India.
 */
exports.send = async (phone, message) => {
  logger.info(`[WhatsApp stub → +91${phone}] ${message}`);
  return { ok: true, stub: true };
};
