'use strict';

const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:        { type: String, required: true },
  image:       { type: String, default: '' },     // FIX: was required:true
  size:        { type: String, required: true },
  qty:         { type: Number, required: true, min: 1 },
  color:       { color: String, image: String },
  price:       { type: Number, required: true, min: 0 },
  priceBefore: { type: Number, required: true, min: 0 },
  discount:    { type: Number, default: 0 },
  productSubId: { type: String, default: '' },
  style:       { type: Number, default: 0 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  products: [lineSchema],
  cartTotal:          { type: Number, default: 0 },
  totalAfterDiscount: { type: Number, default: 0 },
  couponCode:         { type: String, default: '' },
}, { timestamps: true });

cartSchema.methods.recompute = function () {
  this.cartTotal = Number(this.products.reduce((s, p) => s + p.price * p.qty, 0).toFixed(2));
};

module.exports = mongoose.model('Cart', cartSchema);