'use strict';

const svc = require('./analytics.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.summary         = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.summary(req.query)));
exports.salesOverTime   = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.salesOverTime(req.query)));
exports.topProducts     = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.topProducts(req.query)));
exports.statusBreakdown = asyncHandler(async (_req, res) => ApiResponse.ok(res, await svc.statusBreakdown()));
