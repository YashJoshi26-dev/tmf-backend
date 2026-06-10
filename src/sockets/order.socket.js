'use strict';

const { emitToUser, emitToAdmin } = require('./index');

exports.onOrderCreated   = (order)            => { emitToUser(order.user, 'order:created', { id: order._id }); emitToAdmin('order:created', { id: order._id }); };
exports.onStatusChanged  = (order, prev)      => emitToUser(order.user, 'order:status', { id: order._id, status: order.status, prev });
exports.onPaymentCaptured= (order)            => { emitToUser(order.user, 'order:paid', { id: order._id }); emitToAdmin('order:paid', { id: order._id }); };
