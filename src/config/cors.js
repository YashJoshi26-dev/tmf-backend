'use strict';

const env = require('./env');

const allowList = [env.clientUrl].filter(Boolean);

module.exports = {
  origin: (origin, cb) => {
    // Allow requests with no Origin (server-to-server, curl) and any in allow-list
    if (!origin) return cb(null, true);
    if (allowList.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
