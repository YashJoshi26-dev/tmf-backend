'use strict';

const router = require('express').Router();
const ctrl = require('./auth.controller');
const v = require('./auth.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const { authLimiter, otpLimiter, emailLimiter } = require('../../middleware/rateLimit.middleware');

// Email/password
router.post('/register',        authLimiter, validate(v.register), ctrl.register);
router.post('/login',           authLimiter, validate(v.login),    ctrl.login);

// OTP
router.post('/otp/send',        otpLimiter, validate(v.otpSend),   ctrl.otpSend);
router.post('/otp/verify',      otpLimiter, validate(v.otpVerify), ctrl.otpVerify);

// Sessions
router.post('/refresh',         validate(v.refresh),               ctrl.refresh);
router.post('/logout',          requireAuth,                       ctrl.logout);
router.post('/logout-all',      requireAuth,                       ctrl.logoutAll);

// Password & verification
router.post('/forgot-password', emailLimiter, validate(v.forgotPassword), ctrl.forgotPassword);
router.post('/reset-password',  validate(v.resetPassword),                ctrl.resetPassword);
router.get ('/verify-email',                                              ctrl.verifyEmail);
router.post('/change-password', requireAuth, validate(v.changePassword),  ctrl.changePassword);

module.exports = router;
