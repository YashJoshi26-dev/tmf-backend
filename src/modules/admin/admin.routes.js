'use strict';

const router = require('express').Router();
const ctrl = require('./admin.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');

router.use(requireAuth, adminOnly);

router.get  ('/overview',          ctrl.overview);

router.get  ('/users',             ctrl.listUsers);
router.patch('/users/:id/active',  ctrl.setActive);
router.patch('/users/:id/role',    ctrl.setRole);

module.exports = router;
