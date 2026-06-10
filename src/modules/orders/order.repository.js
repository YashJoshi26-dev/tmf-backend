'use strict';

const Order = require('./order.model');

exports.create  = (data, opts) => Order.create([data], opts).then((arr) => arr[0]);
exports.byId    = (id)         => Order.findById(id);
exports.byIdPopulated = (id)   => Order.findById(id).populate('user', 'name email phone');
exports.list    = (filter, o)  => Order.find(filter).sort(o.sort).skip(o.skip).limit(o.limit).populate('user', 'name email phone').lean();
exports.count   = (filter)     => Order.countDocuments(filter);
