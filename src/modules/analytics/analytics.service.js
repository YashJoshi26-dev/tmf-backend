'use strict';

const Order   = require('../orders/order.model');
const Product = require('../products/product.model');
const User    = require('../users/user.model');
const { range } = require('./analytics.helpers');

/** Top-level dashboard tiles. */
exports.summary = async (query) => {
  const { start, end } = range(query, 30);

  const [revenueAgg, paidCount, allCount, customers, productsCount] = await Promise.all([
    Order.aggregate([
      { $match: { isPaid: true, paidAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ isPaid: true, paidAt: { $gte: start, $lte: end } }),
    Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Product.countDocuments({ isActive: true }),
  ]);

  return {
    revenue: revenueAgg[0]?.total || 0,
    paidOrders: paidCount,
    totalOrders: allCount,
    newCustomers: customers,
    activeProducts: productsCount,
    range: { start, end },
  };
};

/** Day-by-day revenue + order count for charts. */
exports.salesOverTime = async (query) => {
  const { start, end } = range(query, 30);
  return Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: start, $lte: end } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
    } },
    { $sort: { _id: 1 } },
  ]);
};

/** Highest-grossing products in window. */
exports.topProducts = async (query) => {
  const { start, end } = range(query, 30);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);
  return Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: start, $lte: end } } },
    { $unwind: '$products' },
    { $group: {
        _id: '$products.product',
        name: { $first: '$products.name' },
        revenue: { $sum: { $multiply: ['$products.price', '$products.qty'] } },
        units: { $sum: '$products.qty' },
    } },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);
};

/** Orders pending fulfilment, grouped by status. */
exports.statusBreakdown = async () =>
  Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
