'use strict';

const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  API_PREFIX: Joi.string().default('/api/v1'),
  CLIENT_URL: Joi.string().required(),

  MONGO_URI: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  JWT_RESET_SECRET: Joi.string().min(16).required(),
  JWT_RESET_EXPIRES_IN: Joi.string().default('15m'),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_FOLDER: Joi.string().default('saree_showroom'),

  RAZORPAY_KEY_ID: Joi.string().allow('').optional(),
  RAZORPAY_KEY_SECRET: Joi.string().allow('').optional(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().allow('').optional(),

  OTP_PROVIDER: Joi.string().valid('console', 'msg91', 'twilio').default('console'),
  MSG91_AUTH_KEY: Joi.string().allow('').optional(),
  MSG91_SENDER_ID: Joi.string().allow('').optional(),
  MSG91_TEMPLATE_ID: Joi.string().allow('').optional(),
  TWILIO_ACCOUNT_SID: Joi.string().allow('').optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').optional(),
  TWILIO_FROM: Joi.string().allow('').optional(),

  GOOGLE_SHEET_CSV_URL: Joi.string().allow('').optional(),
  SYNC_CRON: Joi.string().default('*/5 * * * *'),
  SYNC_ENABLED: Joi.boolean().default(false),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().default(100),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
}).unknown(true);

const { value: e, error } = schema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

module.exports = {
  env: e.NODE_ENV,
  isProd: e.NODE_ENV === 'production',
  isDev: e.NODE_ENV === 'development',
  isTest: e.NODE_ENV === 'test',
  port: e.PORT,
  apiPrefix: e.API_PREFIX,
  clientUrl: e.CLIENT_URL,

  mongo: { uri: e.MONGO_URI },

  jwt: {
    access:  { secret: e.JWT_ACCESS_SECRET,  expiresIn: e.JWT_ACCESS_EXPIRES_IN },
    refresh: { secret: e.JWT_REFRESH_SECRET, expiresIn: e.JWT_REFRESH_EXPIRES_IN },
    reset:   { secret: e.JWT_RESET_SECRET,   expiresIn: e.JWT_RESET_EXPIRES_IN },
  },

  email: {
    host: e.SMTP_HOST, port: e.SMTP_PORT, secure: e.SMTP_SECURE,
    user: e.SMTP_USER, pass: e.SMTP_PASS, from: e.EMAIL_FROM,
  },

  cloudinary: {
    cloudName: e.CLOUDINARY_CLOUD_NAME,
    apiKey:    e.CLOUDINARY_API_KEY,
    apiSecret: e.CLOUDINARY_API_SECRET,
    folder:    e.CLOUDINARY_FOLDER,
  },

  razorpay: {
    keyId: e.RAZORPAY_KEY_ID,
    keySecret: e.RAZORPAY_KEY_SECRET,
    webhookSecret: e.RAZORPAY_WEBHOOK_SECRET,
  },

  otp: {
    provider: e.OTP_PROVIDER,
    msg91: { authKey: e.MSG91_AUTH_KEY, senderId: e.MSG91_SENDER_ID, templateId: e.MSG91_TEMPLATE_ID },
    twilio:{ sid: e.TWILIO_ACCOUNT_SID, token: e.TWILIO_AUTH_TOKEN, from: e.TWILIO_FROM },
  },

  sync: {
    csvUrl: e.GOOGLE_SHEET_CSV_URL,
    cron: e.SYNC_CRON,
    enabled: e.SYNC_ENABLED,
  },

  rateLimit: { windowMs: e.RATE_LIMIT_WINDOW_MS, max: e.RATE_LIMIT_MAX },
  log: { level: e.LOG_LEVEL },
};
