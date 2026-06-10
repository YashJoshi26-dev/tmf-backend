'use strict';

const svc = require('./product.service');
const searchSvc = require('../../services/search.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.list      = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.list(req.query);
  ApiResponse.ok(res, items, 'OK', meta);
});
exports.byId      = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.findById(req.params.id)));
exports.bySlug    = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.findBySlug(req.params.slug)));
exports.create    = asyncHandler(async (req, res) => ApiResponse.created(res, await svc.create(req.body), 'Product created'));
exports.update    = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.update(req.params.id, req.body), 'Product updated'));
exports.remove    = asyncHandler(async (req, res) => { await svc.remove(req.params.id); ApiResponse.ok(res, null, 'Product deleted'); });

exports.search    = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  if (req.query.suggest === 'true') {
    return ApiResponse.ok(res, await searchSvc.suggest(q, 8));
  }
  ApiResponse.ok(res, await searchSvc.searchProducts(q, { limit: 24 }));
});
