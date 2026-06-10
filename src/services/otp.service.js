'use strict';

const crypto = require('crypto');
const axios = require('axios');
const env = require('../config/env');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const OTP_TTL = 5 * 60;          // 5 minutes
const RESEND_COOLDOWN = 60;       // 60 seconds
const MAX_ATTEMPTS = 5;

const key = (phone) => `otp:${phone}`;
const cooldownKey = (phone) => `otp:cool:${phone}`;

const generate = () => crypto.randomInt(100000, 1000000).toString();

const sendViaConsole = (phone, code) => {
  logger.info(`[OTP] ${phone} → ${code}  (dev console provider)`);
};

const sendViaMsg91 = async (phone, code) => {
  if (!env.otp.msg91.authKey) throw ApiError.internal('MSG91 not configured');
  await axios.post('https://control.msg91.com/api/v5/flow/', {
    flow_id: env.otp.msg91.templateId,
    sender:  env.otp.msg91.senderId,
    mobiles: `91${phone}`,
    otp: code,
  }, { headers: { authkey: env.otp.msg91.authKey } });
};

const sendViaTwilio = async (phone, code) => {
  if (!env.otp.twilio.sid) throw ApiError.internal('Twilio not configured');
  const auth = Buffer.from(`${env.otp.twilio.sid}:${env.otp.twilio.token}`).toString('base64');
  const body = new URLSearchParams({
    To: `+91${phone}`,
    From: env.otp.twilio.from,
    Body: `Your Saree Showroom OTP is ${code}. Valid 5 minutes.`,
  });
  await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${env.otp.twilio.sid}/Messages.json`,
    body, { headers: { Authorization: `Basic ${auth}` } });
};

const dispatch = async (phone, code) => {
  if (env.otp.provider === 'msg91')  return sendViaMsg91(phone, code);
  if (env.otp.provider === 'twilio') return sendViaTwilio(phone, code);
  return sendViaConsole(phone, code);
};

/**
 * Generate + store OTP, dispatch via configured provider.
 * Enforces a 60s resend cooldown.
 */
exports.send = async (phone) => {
  const onCooldown = await redis.get(cooldownKey(phone));
  if (onCooldown) throw ApiError.tooMany('Please wait before requesting another OTP');

  const code = generate();
  await redis.set(key(phone), { code, attempts: 0 }, { EX: OTP_TTL });
  await redis.set(cooldownKey(phone), '1', { EX: RESEND_COOLDOWN });
  await dispatch(phone, code);
  return { expiresIn: OTP_TTL };
};

/**
 * Validate OTP. Tracks attempts; locks after MAX_ATTEMPTS.
 */
exports.verify = async (phone, code) => {
  const stored = await redis.get(key(phone));
  if (!stored) throw ApiError.badRequest('OTP expired or not sent');

  if (stored.attempts >= MAX_ATTEMPTS) {
    await redis.del(key(phone));
    throw ApiError.tooMany('Too many attempts. Request a new OTP.');
  }

  if (stored.code !== code) {
    stored.attempts += 1;
    await redis.set(key(phone), stored, { EX: OTP_TTL });
    throw ApiError.badRequest('Incorrect OTP');
  }

  await redis.del(key(phone));
  return true;
};
