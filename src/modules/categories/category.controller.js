'use strict';

const svc = require('./category.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.list   = asyncHandler(async (_req, res) => ApiResponse.ok(res, await svc.listAll()));
exports.tree   = asyncHandler(async (_req, res) => ApiResponse.ok(res, await svc.tree()));
exports.create = asyncHandler(async (req, res) => ApiResponse.created(res, await svc.create(req.body), 'Category created'));
exports.update = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.update(req.params.id, req.body), 'Category updated'));
exports.remove = asyncHandler(async (req, res) => { await svc.remove(req.params.id); ApiResponse.ok(res, null, 'Category deleted'); });
