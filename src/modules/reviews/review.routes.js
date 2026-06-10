'use strict';

const router = require('express').Router();
const ctrl = require('./review.controller');
const v = require('./review.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');

// Mounted at /products/:productId/reviews via the routes index
router.get   ('/products/:productId/reviews',           ctrl.list);
router.post  ('/products/:productId/reviews',           requireAuth, validate(v.create), ctrl.create);
router.patch ('/reviews/:id',                           requireAuth, validate(v.update), ctrl.update);
router.delete('/reviews/:id',                           requireAuth,                     ctrl.remove);
router.post  ('/reviews/:id/like',                      requireAuth,                     ctrl.like);

module.exports = router;
