'use strict';

const svc = require('./coupon.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.list   = asyncHandler(async (_req, res) => ApiResponse.ok(res, await svc.list()));
exports.create = asyncHandler(async (req, res)  => ApiResponse.created(res, await svc.create(req.body), 'Coupon created'));
exports.update = asyncHandler(async (req, res)  => ApiResponse.ok(res, await svc.update(req.params.id, req.body), 'Coupon updated'));
exports.remove = asyncHandler(async (req, res)  => { await svc.remove(req.params.id); ApiResponse.ok(res, null, 'Coupon deleted'); });
exports.apply  = asyncHandler(async (req, res)  => ApiResponse.ok(res, await svc.apply(req.user._id, req.body.coupon), 'Coupon applied'));
