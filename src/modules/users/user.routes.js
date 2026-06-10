'use strict';

const router = require('express').Router();
const ctrl = require('./user.controller');
const v = require('./user.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');

router.get  ('/me',                requireAuth, ctrl.me);
router.patch('/me',                requireAuth, validate(v.updateProfile), ctrl.updateProfile);

router.post  ('/me/addresses',                  requireAuth, validate(v.address),        ctrl.addAddress);
router.patch ('/me/addresses/:id',              requireAuth, validate(v.updateAddress),  ctrl.updateAddress);
router.delete('/me/addresses/:id',              requireAuth,                              ctrl.removeAddress);
router.post  ('/me/addresses/:id/default',      requireAuth,                              ctrl.setDefaultAddress);

module.exports = router;
