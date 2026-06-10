'use strict';

const svc = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.me                = asyncHandler(async (req, res) => ApiResponse.ok(res, req.user));
exports.updateProfile     = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.updateProfile(req.user, req.body), 'Profile updated'));
exports.addAddress        = asyncHandler(async (req, res) => ApiResponse.created(res, await svc.addAddress(req.user, req.body), 'Address added'));
exports.updateAddress     = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.updateAddress(req.user, req.params.id, req.body), 'Address updated'));
exports.removeAddress     = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.removeAddress(req.user, req.params.id), 'Address removed'));
exports.setDefaultAddress = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.setDefaultAddress(req.user, req.params.id), 'Default updated'));

exports.listUsers  = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listUsers(req.query);
  ApiResponse.ok(res, items, 'OK', meta);
});
exports.setActive  = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.setActive(req.params.id, req.body.isActive), 'Updated'));
exports.setRole    = asyncHandler(async (req, res) => ApiResponse.ok(res, await svc.setRole(req.params.id, req.body.role), 'Role updated'));
