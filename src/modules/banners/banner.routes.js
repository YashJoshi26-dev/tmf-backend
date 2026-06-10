'use strict';

const router = require('express').Router();
const ctrl = require('./banner.controller');
const v = require('./banner.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');
const validate = require('../../middleware/validation.middleware');

router.get('/', ctrl.list);

router.get   ('/all',    requireAuth, adminOnly,                       ctrl.listAll);
router.post  ('/',       requireAuth, adminOnly, validate(v.create),   ctrl.create);
router.patch ('/:id',    requireAuth, adminOnly, validate(v.update),   ctrl.update);
router.delete('/:id',    requireAuth, adminOnly,                       ctrl.remove);

module.exports = router;
