'use strict';

const ImportLog = require('./models/importLogs.model');
const ProductHistory = require('./models/productHistory.model');

exports.listLogs   = (limit = 50) => ImportLog.find().sort({ startedAt: -1 }).limit(limit).lean();
exports.getLog     = (id)          => ImportLog.findById(id).lean();

exports.productHistory = (productId, limit = 30) =>
  ProductHistory.find({ product: productId }).sort({ at: -1 }).limit(limit).lean();
