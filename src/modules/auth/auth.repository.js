'use strict';

const User = require('../users/user.model');

exports.findByEmail = (email) => User.findOne({ email }).select('+password');
exports.findByPhone = (phone) => User.findOne({ phone });
exports.findById    = (id)    => User.findById(id);
exports.create      = (data)  => User.create(data);
