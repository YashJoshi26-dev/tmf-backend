'use strict';

const svc = require('./order.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.create       = asyncHandler(async (req, res) => ApiResponse.created(res, await svc.createOrder(req.user, req.body), 'Order created'));
exports.getMine      = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listMine(req.user._id, req.query);
  ApiResponse.ok(res, items, 'OK', meta);
});
exports.getById      = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.getById(req.params.id, req.user)));
exports.listAll      = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listAll(req.query);
  ApiResponse.ok(res, items, 'OK', meta);
});
exports.updateStatus = asyncHandler(async (req, res) =>
  ApiResponse.ok(res, await svc.updateStatus(req.params.id, req.body.status, req.user, req.body.note), 'Order status updated'));
