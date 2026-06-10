'use strict';

const router = require('express').Router();
const ctrl = require('./coupon.controller');
const v = require('./coupon.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');
const validate = require('../../middleware/validation.middleware');

// Customer
router.post('/apply', requireAuth, validate(v.apply), ctrl.apply);

// Admin
router.get   ('/',    requireAuth, adminOnly,                       ctrl.list);
router.post  ('/',    requireAuth, adminOnly, validate(v.create),   ctrl.create);
router.patch ('/:id', requireAuth, adminOnly, validate(v.update),   ctrl.update);
router.delete('/:id', requireAuth, adminOnly,                       ctrl.remove);

module.exports = router;
