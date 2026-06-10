'use strict';

const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

module.exports = router;
