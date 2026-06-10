'use strict';

const analyticsSvc = require('../analytics/analytics.service');
const Order = require('../orders/order.model');
const ImportLog = require('../inventory/models/importLogs.model');

/**
 * Single endpoint that fuels the admin home page.
 * Combines summary tiles + recent orders + last sync.
 */
exports.overview = async () => {
  const [summary, recentOrders, lastSync] = await Promise.all([
    analyticsSvc.summary({}),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email').lean(),
    ImportLog.findOne({ status: { $in: ['success', 'partial'] } }).sort({ finishedAt: -1 }).lean(),
  ]);
  return { summary, recentOrders, lastSync };
};
