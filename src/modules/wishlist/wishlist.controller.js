'use strict';

const svc = require('./wishlist.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.get    = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.get(req.user._id)));
exports.toggle = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.toggle(req.user._id, req.params.productId, req.body.style), 'Wishlist updated'));
exports.clear  = asyncHandler(async (req, res) => { await svc.clear(req.user._id); ApiResponse.ok(res, null, 'Wishlist cleared'); });
