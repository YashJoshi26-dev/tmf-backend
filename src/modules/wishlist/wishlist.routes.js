'use strict';

const router = require('express').Router();
const ctrl = require('./wishlist.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

router.get   ('/',             requireAuth, ctrl.get);
router.post  ('/:productId',   requireAuth, ctrl.toggle);
router.delete('/',             requireAuth, ctrl.clear);

module.exports = router;
