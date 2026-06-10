'use strict';

const router = require('express').Router();
const ctrl = require('./analytics.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');

router.use(requireAuth, adminOnly);

router.get('/summary',          ctrl.summary);
router.get('/sales',             ctrl.salesOverTime);
router.get('/top-products',      ctrl.topProducts);
router.get('/status-breakdown',  ctrl.statusBreakdown);

module.exports = router;
