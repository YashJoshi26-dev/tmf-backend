'use strict';

const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:        { type: String, required: true },
  image:       { type: String, default: '' },
  size:        { type: String, required: true },
  qty:         { type: Number, required: true, min: 1 },
  color:       { color: String, image: String },
  price:       { type: Number, required: true, min: 0 },
  priceBefore: { type: Number, required: true, min: 0 },
  productSubId: String,
  discount:    { type: Number, default: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Human-readable IDs
  orderId:       { type: String, unique: true, sparse: true },
  invoiceNumber: { type: String },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  products: { type: [orderProductSchema], validate: (v) => v.length > 0 },

  // Idempotency key — prevents duplicate orders on double-click
  idempotencyKey: { type: String, index: true, sparse: true },

  shippingAddress: {
    fullName: String, phoneNumber: String, state: String, city: String,
    zipCode: String, address1: String, address2: String, country: String,
  },

  paymentMethod: { type: String, enum: ['razorpay', 'cod', 'stripe'], required: true },
  paymentResult: {
    id: String, status: String, email: String,
    rawProvider: String, capturedAt: Date,
  },

  total:               { type: Number, required: true, min: 0 },
  totalBeforeDiscount: { type: Number, default: 0 },
  couponApplied:       { type: String, default: '' },
  shippingPrice:       { type: Number, default: 0 },
  taxPrice:            { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['Not Processed', 'Processing', 'Dispatched', 'Cancelled', 'Completed'],
    default: 'Not Processed',
    index: true,
  },
  statusHistory: [{
    status: String,
    at:   { type: Date, default: Date.now },
    by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
  }],

  isPaid:      { type: Boolean, default: false },
  paidAt:      Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
}, { timestamps: true });

// Auto-generate orderId and invoiceNumber
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `#ORD-${1000 + count + 1}`;
  }
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const year  = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${1000 + count + 1}`;
  }
  next();
});

orderSchema.methods.transitionTo = function (next, actor = null, note = '') {
  const allowed = {
    'Not Processed': ['Processing', 'Cancelled'],
    'Processing':    ['Dispatched', 'Cancelled'],
    'Dispatched':    ['Completed', 'Cancelled'],
    'Completed':     [],
    'Cancelled':     [],
  };
  if (!allowed[this.status]?.includes(next)) {
    throw new Error(`Illegal status transition: ${this.status} → ${next}`);
  }
  this.status = next;
  this.statusHistory.push({ status: next, by: actor, note });
  if (next === 'Completed') { this.isDelivered = true; this.deliveredAt = new Date(); }
};

module.exports = mongoose.model('Order', orderSchema);