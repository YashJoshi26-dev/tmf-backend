'use strict';

const svc = require('./review.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.list   = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.list(req.params.productId, req.query);
  ApiResponse.ok(res, items, 'OK', meta);
});
exports.create = asyncHandler(async (req, res) =>
  ApiResponse.created(res, await svc.create(req.user, req.params.productId, req.body), 'Review added'));
exports.update = asyncHandler(async (req, res) =>
  ApiResponse.ok(res, await svc.update(req.user, req.params.id, req.body), 'Review updated'));
exports.remove = asyncHandler(async (req, res) => {
  await svc.remove(req.user, req.params.id);
  ApiResponse.ok(res, null, 'Review removed');
});
exports.like   = asyncHandler(async (req, res) =>
  ApiResponse.ok(res, { likes: await svc.toggleLike(req.user, req.params.id) }));
