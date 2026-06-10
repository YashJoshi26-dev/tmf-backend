'use strict';

const crypto = require('crypto');
const Order = require('./order.model');
const repo = require('./order.repository');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const Coupon = require('../coupons/coupon.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { tryReserve } = require('../inventory/helpers/stock.helpers');
const paymentSvc = require('../payments/payment.service');
const emailSvc   = require('../notifications/email.service');
const { computeShipping } = require('./order.helpers');
const logger = require('../../utils/logger');

exports.createOrder = async (user, { shippingAddress, paymentMethod, couponCode, taxPrice = 0, idempotencyKey }) => {
  if (!['razorpay', 'cod', 'stripe'].includes(paymentMethod)) {
    throw ApiError.badRequest('Unsupported payment method');
  }

  // ── Idempotency: prevent duplicate orders on double-click ──
  const iKey = idempotencyKey || crypto.randomUUID();
  const existing = await Order.findOne({ idempotencyKey: iKey });
  if (existing) {
    logger.info('Duplicate order prevented', { idempotencyKey: iKey, orderId: existing._id });
    const payment = existing.status === 'Not Processed' && paymentMethod === 'razorpay'
      ? await paymentSvc.createRazorpayOrder({
          amount: existing.total,
          receipt: existing._id.toString(),
          notes: { orderId: existing._id.toString(), userId: user._id.toString() },
        })
      : null;
    return { order: existing, payment };
  }

  // ── Get server-side cart ──
  const cart = await Cart.findOne({ user: user._id });
  if (!cart || !cart.products?.length) throw ApiError.badRequest('Cart is empty');

  // ── Reserve stock ──
  for (const item of cart.products) {
    const product = await Product.findById(item.product);
    if (!product) throw ApiError.badRequest(`Product ${item.name} no longer exists`);
    const r = tryReserve(product, {
      subProductId: item.productSubId,
      style: item.style,
      size: item.size,
      qty: item.qty,
    });
    if (!r.ok) throw ApiError.badRequest(`Insufficient stock for ${item.name} (${item.size})`);
    await product.save();
  }

  const subtotal = cart.totalAfterDiscount > 0 ? cart.totalAfterDiscount : cart.cartTotal;
  const shippingPrice = computeShipping(subtotal);

  // ── Coupon ──
  let couponApplied = '';
  if (couponCode) {
    const c = await Coupon.findOne({ coupon: couponCode.toUpperCase() });
    if (c && c.isValid().ok) {
      c.usedBy.push(user._id);
      c.usedCount += 1;
      await c.save();
      couponApplied = c.coupon;
    }
  }

  // ── Create order ──
  const order = await Order.create({
    user: user._id,
    products: cart.products,
    shippingAddress,
    paymentMethod,
    total: subtotal + shippingPrice + taxPrice,
    totalBeforeDiscount: cart.cartTotal,
    couponApplied,
    shippingPrice,
    taxPrice,
    idempotencyKey: iKey,
    statusHistory: [{ status: 'Not Processed', by: user._id, note: 'Order placed' }],
  });

  // ── Clear cart ──
  await Cart.findOneAndDelete({ user: user._id });

  // ── Payment session ──
  let payment = null;
  if (paymentMethod === 'razorpay') {
    payment = await paymentSvc.createRazorpayOrder({
      amount: order.total,
      receipt: order._id.toString(),
      notes: { orderId: order._id.toString(), userId: user._id.toString() },
    });
  }

  // ── Email (fire and forget) ──
  if (user.email) {
    emailSvc.sendOrderConfirmationEmail(user.email, user.name, order)
      .catch((e) => logger.warn('Order email failed', { error: e.message }));
  }

  logger.info('Order created', { orderId: order._id, userId: user._id, total: order.total });
  return { order, payment };
};

exports.getById = async (id, user) => {
  const order = await repo.byIdPopulated(id);
  if (!order) throw ApiError.notFound('Order not found');
  if (user.role !== 'admin' && order.user._id.toString() !== user._id.toString()) {
    throw ApiError.forbidden('Not your order');
  }
  return order;
};

exports.listMine = async (userId, query) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { user: userId };
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    repo.list(filter, { sort, skip, limit }),
    repo.count(filter),
  ]);
  return { items, meta: buildMeta({ total, page, limit }) };
};

exports.listAll = async (query) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.isPaid !== undefined) filter.isPaid = query.isPaid === 'true';
  const [items, total] = await Promise.all([
    repo.list(filter, { sort, skip, limit }),
    repo.count(filter),
  ]);
  return { items, meta: buildMeta({ total, page, limit }) };
};

exports.updateStatus = async (id, newStatus, admin, note) => {
  const order = await repo.byId(id);
  if (!order) throw ApiError.notFound('Order not found');
  order.transitionTo(newStatus, admin._id, note);
  await order.save();
  return order;
};

exports.markPaid = async (id, paymentResult) => {
  const order = await repo.byId(id);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.isPaid) return order;
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = paymentResult;
  if (order.status === 'Not Processed') order.transitionTo('Processing', null, 'Payment received');
  await order.save();
  return order;
};