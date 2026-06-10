'use strict';

const router = require('express').Router();
const ctrl = require('./payment.controller');
const v = require('./payment.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');

router.post('/razorpay/verify', requireAuth, validate(v.verifyRazorpay), ctrl.verifyRazorpay);

module.exports = router;
