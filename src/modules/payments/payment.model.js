'use strict';

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  provider: { type: String, enum: ['razorpay', 'stripe', 'cod'], required: true },

  providerOrderId:   String,   // rzp_order_xxx
  providerPaymentId: String,   // pay_xxx (set on capture)
  providerSignature: String,

  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true,
  },
  failureReason: String,
  rawEvent:      mongoose.Schema.Types.Mixed, // last webhook payload, for debugging
  capturedAt: Date,
  refundedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
