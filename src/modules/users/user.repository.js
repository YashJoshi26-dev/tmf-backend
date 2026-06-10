'use strict';

const User = require('./user.model');

exports.findById       = (id)        => User.findById(id);
exports.findByEmail    = (email)     => User.findOne({ email }).select('+password');
exports.findByPhone    = (phone)     => User.findOne({ phone });
exports.findByEmailOrPhone = (e, p)  => User.findOne({ $or: [{ email: e }, { phone: p }] });
exports.create         = (data)      => User.create(data);
exports.list           = (filter, opts) => User.find(filter).sort(opts.sort).skip(opts.skip).limit(opts.limit).lean();
exports.count          = (filter)    => User.countDocuments(filter);
exports.updateById     = (id, patch) => User.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
