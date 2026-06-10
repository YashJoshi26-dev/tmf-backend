'use strict';

const Payment = require('./payment.model');
const razorpaySvc = require('./razorpay.service');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

/* ------------------------------ Razorpay -------------------------------- */

exports.createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const rzp = await razorpaySvc.createOrder({ amount, receipt, notes });
  // We only record the Payment row at verify-time to avoid orphans; this just returns SDK info.
  return rzp;
};

/**
 * Verify a Razorpay checkout response. On success, returns the payment record.
 * Caller is responsible for marking the related Order paid.
 */
exports.verifyRazorpay = async ({ orderId, user, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount }) => {
  const ok = razorpaySvc.verifyPaymentSignature({
    orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature,
  });
  if (!ok) throw ApiError.badRequest('Invalid Razorpay signature');

  const payment = await Payment.create({
    order: orderId,
    user:  user._id,
    provider: 'razorpay',
    providerOrderId: razorpay_order_id,
    providerPaymentId: razorpay_payment_id,
    providerSignature: razorpay_signature,
    amount,
    status: 'captured',
    capturedAt: new Date(),
  });

  return payment;
};

/* ------------------------------- Stripe -------------------------------- */
// Stripe is not wired in for this build. The interface is here for future expansion.
exports.createStripeIntent = async () => {
  throw ApiError.badRequest('Stripe is not configured in this build');
};

/* ------------------------------ Webhooks ------------------------------- */

exports.handleRazorpayWebhook = async (rawBody, signature) => {
  const event = razorpaySvc.verifyWebhook(rawBody, signature);

  if (event.event === 'payment.captured') {
    const p = event.payload.payment.entity;
    const orderId = p.notes?.orderId;
    if (!orderId) {
      logger.warn('Razorpay payment.captured without orderId in notes', { paymentId: p.id });
      return null;
    }

    // Idempotency: only create one Payment per provider payment id
    const existing = await Payment.findOne({ providerPaymentId: p.id });
    if (existing) return existing;

    return Payment.create({
      order: orderId,
      user: p.notes?.userId,
      provider: 'razorpay',
      providerOrderId: p.order_id,
      providerPaymentId: p.id,
      amount: p.amount / 100,
      status: 'captured',
      capturedAt: new Date(p.created_at * 1000),
      rawEvent: event,
    });
  }

  if (event.event === 'payment.failed') {
    logger.info('Razorpay payment failed', { event: event.payload?.payment?.entity?.id });
  }

  return null;
};
