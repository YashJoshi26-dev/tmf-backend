'use strict';

const repo = require('./auth.repository');
const ApiError = require('../../utils/ApiError');
const jwtSvc = require('../../services/jwt.service');
const otpSvc = require('../../services/otp.service');
const emailSvc = require('../notifications/email.service');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/* ---------------------- EMAIL / PASSWORD ---------------------- */

exports.register = async ({ name, email, password }) => {
  const exists = await repo.findByEmail(email);
  if (exists) throw ApiError.conflict('Email already registered');
  const user = await repo.create({ name, email, password });

  // Fire-and-forget verification email
  const token = jwtSvc.generateResetToken(user, 'email_verify');
  const url = `${env.clientUrl}/auth/verify?token=${token}`;
  emailSvc.sendVerificationEmail(user.email, user.name, url)
    .catch((e) => logger.warn('Verify email failed', { error: e.message }));

  return { user };
};

exports.login = async ({ email, password, device, ip }) => {
  const user = await repo.findByEmail(email);
  if (!user)            throw ApiError.unauthorized('Invalid credentials');
  if (!user.isActive)   throw ApiError.forbidden('Account disabled');
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');
  return _completeSession(user, device, ip);
};

/* --------------------------- OTP ----------------------------- */

exports.otpSend = (phone) => otpSvc.send(phone);

exports.otpVerify = async ({ phone, code, name }, { device, ip }) => {
  await otpSvc.verify(phone, code);
  let user = await repo.findByPhone(phone);
  if (!user) {
    user = await repo.create({
      name: name || `Customer-${phone.slice(-4)}`,
      phone,
      phoneVerified: true,
    });
  } else if (!user.phoneVerified) {
    user.phoneVerified = true;
    await user.save();
  }
  if (!user.isActive) throw ApiError.forbidden('Account disabled');
  return _completeSession(user, device, ip);
};

/* ---------------------- REFRESH / LOGOUT --------------------- */

exports.refreshTokens = async (oldRT) => {
  if (!oldRT) throw ApiError.unauthorized('Refresh token required');
  let payload;
  try { payload = jwtSvc.verifyRefreshToken(oldRT); }
  catch { throw ApiError.unauthorized('Invalid refresh token'); }

  const user = await repo.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('User invalid');

  const stored = user.refreshTokens.find((rt) => rt.token === oldRT);
  if (!stored) throw ApiError.unauthorized('Refresh token revoked');

  // One-time use: rotate
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== oldRT);
  const newRT = jwtSvc.generateRefreshToken(user);
  user.refreshTokens.push({ token: newRT, device: stored.device, ip: stored.ip });
  await user.save();

  return {
    accessToken:  jwtSvc.generateAccessToken(user),
    refreshToken: newRT,
  };
};

exports.logout = async (user, refreshToken) => {
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
  await user.save();
};

exports.logoutAll = async (user) => {
  user.refreshTokens = [];
  await user.save();
};

/* ---------------------- PASSWORD FLOWS ----------------------- */

exports.forgotPassword = async (email) => {
  const user = await repo.findByEmail(email);
  if (!user) return; // silent — no enumeration
  const token = jwtSvc.generateResetToken(user, 'password_reset');
  const url = `${env.clientUrl}/auth/reset?token=${token}`;
  await emailSvc.sendPasswordResetEmail(user.email, user.name, url);
};

exports.resetPassword = async ({ token, newPassword }) => {
  let payload;
  try { payload = jwtSvc.verifyResetToken(token); }
  catch { throw ApiError.badRequest('Invalid or expired token'); }
  if (payload.purpose !== 'password_reset') throw ApiError.badRequest('Wrong token purpose');

  const user = await repo.findById(payload.sub);
  if (!user) throw ApiError.notFound('User not found');
  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
};

exports.verifyEmail = async (token) => {
  let payload;
  try { payload = jwtSvc.verifyResetToken(token); }
  catch { throw ApiError.badRequest('Invalid or expired token'); }
  if (payload.purpose !== 'email_verify') throw ApiError.badRequest('Wrong token purpose');

  const user = await repo.findById(payload.sub);
  if (!user) throw ApiError.notFound('User not found');
  if (!user.emailVerified) { user.emailVerified = true; await user.save(); }
  return user;
};

exports.changePassword = async (user, oldPassword, newPassword) => {
  const full = await repo.findById(user._id);
  // we need the +password select again
  const withPwd = await require('../users/user.model').findById(user._id).select('+password');
  const ok = await withPwd.comparePassword(oldPassword);
  if (!ok) throw ApiError.badRequest('Old password is incorrect');
  withPwd.password = newPassword;
  withPwd.refreshTokens = [];
  await withPwd.save();
};

/* ------------------------- INTERNAL --------------------------- */

const _completeSession = async (user, device, ip) => {
  const accessToken  = jwtSvc.generateAccessToken(user);
  const refreshToken = jwtSvc.generateRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken, device, ip });
  if (user.refreshTokens.length > 5) user.refreshTokens.shift();
  user.lastLoginAt = new Date();
  await user.save();
  return { user, accessToken, refreshToken };
};
