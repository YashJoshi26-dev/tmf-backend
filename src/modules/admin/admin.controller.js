'use strict';

const svc = require('./admin.service');
const userSvc = require('../users/user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.overview = asyncHandler(async (_req, res) => ApiResponse.ok(res, await svc.overview()));

// User management (lifted from user service)
exports.listUsers  = asyncHandler(async (req, res) => {
  const { items, meta } = await userSvc.listUsers(req.query);
  ApiResponse.ok(res, items, 'OK', meta);
});
exports.setActive  = asyncHandler(async (req, res) => ApiResponse.ok(res, await userSvc.setActive(req.params.id, req.body.isActive), 'Updated'));
exports.setRole    = asyncHandler(async (req, res) => ApiResponse.ok(res, await userSvc.setRole(req.params.id, req.body.role), 'Role updated'));
