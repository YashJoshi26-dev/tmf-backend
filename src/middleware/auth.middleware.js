'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const jwtSvc = require('../services/jwt.service');
const User = require('../modules/users/user.model');

const extractToken = (req) => {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  if (req.cookies?.access_token)    return req.cookies.access_token;
  return null;
};

const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication token missing');

  let payload;
  try { payload = jwtSvc.verifyAccessToken(token); }
  catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Token expired');
    throw ApiError.unauthorized('Invalid token');
  }
  if (payload.type !== 'access') throw ApiError.unauthorized('Wrong token type');

  const user = await User.findById(payload.sub);
  if (!user)           throw ApiError.unauthorized('User no longer exists');
  if (!user.isActive)  throw ApiError.forbidden('Account disabled');
  if (user.isPasswordChangedAfter && user.isPasswordChangedAfter(payload.iat)) {
    throw ApiError.unauthorized('Password changed, please log in again');
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwtSvc.verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user?.isActive) req.user = user;
  } catch { /* ignore */ }
  next();
});

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
  next();
};

module.exports = { requireAuth, optionalAuth, requireRole };
