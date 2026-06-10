'use strict';

const router = require('express').Router();
const ctrl = require('./order.controller');
const v = require('./order.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');
const validate = require('../../middleware/validation.middleware');

// Customer
router.post('/',     requireAuth, validate(v.create), ctrl.create);
router.get ('/mine', requireAuth,                     ctrl.getMine);
router.get ('/:id',  requireAuth,                     ctrl.getById);

// Admin
router.get  ('/',           requireAuth, adminOnly,                              ctrl.listAll);
router.patch('/:id/status', requireAuth, adminOnly, validate(v.updateStatus),    ctrl.updateStatus);

module.exports = router;
