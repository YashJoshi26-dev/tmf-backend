'use strict';

const svc = require('./banner.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.list    = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.list(req.query.position)));
exports.listAll = asyncHandler(async (_req, res) => ApiResponse.ok(res, await svc.listAll()));
exports.create  = asyncHandler(async (req, res)  => ApiResponse.created(res, await svc.create(req.body), 'Banner created'));
exports.update  = asyncHandler(async (req, res)  => ApiResponse.ok(res, await svc.update(req.params.id, req.body), 'Banner updated'));
exports.remove  = asyncHandler(async (req, res)  => { await svc.remove(req.params.id); ApiResponse.ok(res, null, 'Banner deleted'); });
