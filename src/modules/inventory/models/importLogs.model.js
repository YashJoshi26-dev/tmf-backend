'use strict';

const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
  source: { type: String, enum: ['csv_upload', 'google_sheet', 'manual'], required: true },
  startedAt: { type: Date, default: Date.now },
  finishedAt: Date,
  status: { type: String, enum: ['running', 'success', 'partial', 'failed'], default: 'running' },

  inserted:    { type: Number, default: 0 },
  updated:     { type: Number, default: 0 },
  deactivated: { type: Number, default: 0 },
  skipped:     { type: Number, default: 0 },

  errorList: [{ row: Number, sku: String, message: String }],
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  filename: String,
  totalRows: Number,
}, { timestamps: true });

importLogSchema.index({ source: 1, startedAt: -1 });

module.exports = mongoose.model('ImportLog', importLogSchema);
