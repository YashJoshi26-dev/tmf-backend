'use strict';

const express = require('express');
const router = express.Router();
const paymentCtrl = require('../modules/payments/payment.controller');

// Razorpay webhook needs the raw body for HMAC verification.
// This router is mounted BEFORE express.json() in app.js.
router.post('/razorpay', express.raw({ type: 'application/json' }), paymentCtrl.razorpayWebhook);

module.exports = router;
