'use strict';

const paymentSvc = require('./payment.service');
const orderSvc = require('../orders/order.service');
const Order = require('../orders/order.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** Verify Razorpay payment from the client checkout success callback. */
exports.verifyRazorpay = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not your order');
  }

  const payment = await paymentSvc.verifyRazorpay({
    orderId, user: req.user,
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    amount: order.total,
  });

  // Now mark the order paid
  await orderSvc.markPaid(orderId, {
    id: razorpay_payment_id,
    status: 'captured',
    rawProvider: 'razorpay',
    capturedAt: new Date(),
  });

  ApiResponse.ok(res, { payment, orderId }, 'Payment verified');
});

/** Razorpay webhook — raw body parser is mounted on the route. */
exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const payment = await paymentSvc.handleRazorpayWebhook(req.body, sig);
  if (payment?.order) {
    await orderSvc.markPaid(payment.order.toString(), {
      id: payment.providerPaymentId,
      status: 'captured',
      rawProvider: 'razorpay',
      capturedAt: new Date(),
    }).catch(() => {});
  }
  res.json({ received: true });
});
