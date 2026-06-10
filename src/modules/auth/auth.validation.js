'use strict';

const Joi = require('joi');
const { password, email, phoneIN } = require('../../utils/validators');

exports.register = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: email.required(),
  password: password.required(),
});

exports.login = Joi.object({
  email: email.required(),
  password: Joi.string().required(),
});

exports.otpSend   = Joi.object({ phone: phoneIN.required() });
exports.otpVerify = Joi.object({
  phone: phoneIN.required(),
  code: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  name: Joi.string().min(2).max(80).optional(), // optional name on first-time signup
});

exports.refresh = Joi.object({ refreshToken: Joi.string().optional() });

exports.forgotPassword = Joi.object({ email: email.required() });
exports.resetPassword  = Joi.object({ token: Joi.string().required(), newPassword: password.required() });
exports.changePassword = Joi.object({ oldPassword: Joi.string().required(), newPassword: password.required() });
