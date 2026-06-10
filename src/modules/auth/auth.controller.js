'use strict';

const svc = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const env = require('../../config/env');

const cookieOpts = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
};

const setAuthCookies = (res, access, refresh) => {
  res.cookie('access_token',  access,  { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refresh, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
};

const deviceInfo = (req) => ({ device: req.headers['user-agent'], ip: req.ip });

exports.register = asyncHandler(async (req, res) => {
  const { user } = await svc.register(req.body);
  ApiResponse.created(res, { user }, 'Registered. Check email to verify.');
});

exports.login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await svc.login({ ...req.body, ...deviceInfo(req) });
  setAuthCookies(res, accessToken, refreshToken);
  ApiResponse.ok(res, { user, accessToken, refreshToken }, 'Logged in');
});

exports.otpSend = asyncHandler(async (req, res) => {
  const result = await svc.otpSend(req.body.phone);
  ApiResponse.ok(res, result, 'OTP sent');
});

exports.otpVerify = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await svc.otpVerify(req.body, deviceInfo(req));
  setAuthCookies(res, accessToken, refreshToken);
  ApiResponse.ok(res, { user, accessToken, refreshToken }, 'Verified');
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refresh_token;
  const { accessToken, refreshToken } = await svc.refreshTokens(token);
  setAuthCookies(res, accessToken, refreshToken);
  ApiResponse.ok(res, { accessToken, refreshToken }, 'Tokens refreshed');
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refresh_token;
  if (token && req.user) await svc.logout(req.user, token);
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  ApiResponse.ok(res, null, 'Logged out');
});

exports.logoutAll = asyncHandler(async (req, res) => {
  await svc.logoutAll(req.user);
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  ApiResponse.ok(res, null, 'Logged out from all devices');
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  await svc.forgotPassword(req.body.email);
  ApiResponse.ok(res, null, 'If that email exists, a reset link has been sent');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  await svc.resetPassword(req.body);
  ApiResponse.ok(res, null, 'Password reset successful');
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const user = await svc.verifyEmail(req.body.token || req.query.token);
  ApiResponse.ok(res, { user }, 'Email verified');
});

exports.changePassword = asyncHandler(async (req, res) => {
  await svc.changePassword(req.user, req.body.oldPassword, req.body.newPassword);
  ApiResponse.ok(res, null, 'Password changed');
});
