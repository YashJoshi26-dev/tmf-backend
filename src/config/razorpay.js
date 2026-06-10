'use strict';

const Razorpay = require('razorpay');
const env = require('./env');

let client = null;
if (env.razorpay.keyId && env.razorpay.keySecret) {
  client = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

module.exports = client;
