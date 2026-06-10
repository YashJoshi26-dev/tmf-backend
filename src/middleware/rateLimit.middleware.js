'use strict';

const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const make = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs, max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => next(ApiError.tooMany(message)),
  });

const apiLimiter = make({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: 'Too many requests, please try again later',
});

const authLimiter = make({
  windowMs: 15 * 60 * 1000, max: 10,
  message: 'Too many auth attempts, please try again in 15 minutes',
});

const otpLimiter = make({
  windowMs: 60 * 60 * 1000, max: 8,
  message: 'Too many OTP requests, please try later',
});

const emailLimiter = make({
  windowMs: 60 * 60 * 1000, max: 5,
  message: 'Too many email requests',
});

module.exports = { apiLimiter, authLimiter, otpLimiter, emailLimiter };
