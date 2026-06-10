'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const sign = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' });

const verify = (token, secret) => jwt.verify(token, secret, { algorithms: ['HS256'] });

exports.generateAccessToken  = (user) => sign({ sub: user._id.toString(), role: user.role, type: 'access'  }, env.jwt.access.secret,  env.jwt.access.expiresIn);
exports.generateRefreshToken = (user) => sign({ sub: user._id.toString(),                    type: 'refresh' }, env.jwt.refresh.secret, env.jwt.refresh.expiresIn);
exports.generateResetToken   = (user, purpose = 'password_reset') =>
  sign({ sub: user._id.toString(), purpose, type: 'reset' }, env.jwt.reset.secret, env.jwt.reset.expiresIn);

exports.verifyAccessToken  = (t) => verify(t, env.jwt.access.secret);
exports.verifyRefreshToken = (t) => verify(t, env.jwt.refresh.secret);
exports.verifyResetToken   = (t) => verify(t, env.jwt.reset.secret);
