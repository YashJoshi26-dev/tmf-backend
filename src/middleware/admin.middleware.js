'use strict';

const { requireRole } = require('./auth.middleware');

// Convenience export — drop into any admin route after requireAuth.
module.exports = requireRole('admin');
