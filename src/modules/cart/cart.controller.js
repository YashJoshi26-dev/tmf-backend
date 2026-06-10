'use strict';

const svc = require('./cart.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.get   = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.get(req.user._id)));
exports.save  = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.save(req.user._id, req.body.products), 'Cart saved'));
exports.clear = asyncHandler(async (req, res) => { await svc.clear(req.user._id); ApiResponse.ok(res, null, 'Cart cleared'); });
