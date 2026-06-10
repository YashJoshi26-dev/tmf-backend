'use strict';

const crypto = require('crypto');
const client = require('../../config/razorpay');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const requireClient = () => {
  if (!client) throw ApiError.internal('Razorpay is not configured');
};

/** Create an order on Razorpay's side (returns the rzp order id you pass to the checkout SDK). */
exports.createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  requireClient();
  const order = await client.orders.create({
    amount: Math.round(amount * 100), // rupees → paise
    currency, receipt, notes,
  });
  return { id: order.id, amount: order.amount, currency: order.currency, status: order.status };
};

/** Verify the signature returned by the client-side Razorpay checkout. */
exports.verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!env.razorpay.keySecret) throw ApiError.internal('Razorpay secret missing');
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
};

/** Verify the HMAC on a webhook body using the webhook secret (different from key secret). */
exports.verifyWebhook = (rawBody, signature) => {
  if (!env.razorpay.webhookSecret) throw ApiError.internal('Razorpay webhook secret missing');
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  if (expected !== signature) {
    logger.warn('Razorpay webhook signature mismatch');
    throw ApiError.badRequest('Invalid webhook signature');
  }
  return JSON.parse(rawBody.toString());
};
