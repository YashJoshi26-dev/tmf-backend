'use strict';

const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/** Generic SMS send. Provider chosen by OTP_PROVIDER setting. */
exports.send = async (phone, message) => {
  if (env.otp.provider === 'msg91' && env.otp.msg91.authKey) {
    try {
      await axios.post('https://control.msg91.com/api/v5/flow/', {
        sender: env.otp.msg91.senderId,
        mobiles: `91${phone}`,
        message,
      }, { headers: { authkey: env.otp.msg91.authKey } });
      return { ok: true };
    } catch (err) {
      logger.warn('SMS send failed', { error: err.message });
      return { ok: false, error: err.message };
    }
  }

  // Dev / fallback: log to console
  logger.info(`[SMS to +91${phone}] ${message}`);
  return { ok: true, stub: true };
};
