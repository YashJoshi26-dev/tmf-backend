'use strict';

const mongoose = require('mongoose');

/** Append-only audit trail for product changes (sync, manual edit, stock decrement). */
const productHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  sku: { type: String, index: true },
  action: { type: String, enum: ['created', 'updated', 'deactivated', 'stock_changed', 'price_changed'] },
  before: mongoose.Schema.Types.Mixed,
  after:  mongoose.Schema.Types.Mixed,
  source: { type: String, enum: ['csv', 'google_sheet', 'manual', 'order'] },
  importLog: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportLog' },
  at: { type: Date, default: Date.now },
}, { timestamps: false });

productHistorySchema.index({ product: 1, at: -1 });

module.exports = mongoose.model('ProductHistory', productHistorySchema);
