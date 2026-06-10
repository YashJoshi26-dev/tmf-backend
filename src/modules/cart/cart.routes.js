'use strict';

const router = require('express').Router();
const ctrl = require('./cart.controller');
const v = require('./cart.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');

router.get   ('/', requireAuth,                      ctrl.get);
router.post  ('/', requireAuth, validate(v.save),    ctrl.save);
router.delete('/', requireAuth,                      ctrl.clear);

module.exports = router;
