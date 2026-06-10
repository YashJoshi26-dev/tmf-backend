'use strict';

const router = require('express').Router();
const ctrl = require('./product.controller');
const v = require('./product.validation');
const { requireAuth, optionalAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');
const validate = require('../../middleware/validation.middleware');

// Public reads
router.get('/search',      ctrl.search);
router.get('/',            optionalAuth, ctrl.list);
router.get('/slug/:slug',  optionalAuth, ctrl.bySlug);
router.get('/:id',         optionalAuth, ctrl.byId);

// Admin writes
router.post  ('/',     requireAuth, adminOnly, validate(v.create), ctrl.create);
router.patch ('/:id',  requireAuth, adminOnly, validate(v.update), ctrl.update);
router.delete('/:id',  requireAuth, adminOnly,                     ctrl.remove);

module.exports = router;
