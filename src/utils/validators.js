'use strict';

const Joi = require('joi');

exports.objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid id');

exports.phoneIN = Joi.string()
  .pattern(/^[6-9]\d{9}$/)   // Indian 10-digit mobile, starts 6-9
  .message('Invalid Indian phone number');

exports.password = Joi.string()
  .min(8).max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
  .message('Password must include uppercase, lowercase and number');

exports.email = Joi.string().email().lowercase().trim();
