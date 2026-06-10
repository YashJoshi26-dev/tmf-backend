'use strict';

const router = require('express').Router();
const ctrl = require('./inventory.controller');
const v = require('./inventory.validation');
const { requireAuth } = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/admin.middleware');
const validate = require('../../middleware/validation.middleware');
const { uploadCsv } = require('../../middleware/upload.middleware');

// Everything here is admin-only
router.use(requireAuth, adminOnly);

router.get ('/template',                   ctrl.template);
router.post('/preview', uploadCsv.single('file'), ctrl.preview);
router.post('/upload',  uploadCsv.single('file'), ctrl.upload);

router.post('/sync',                       ctrl.syncSheet);
router.get ('/logs',                       ctrl.listLogs);
router.get ('/logs/:id',                   ctrl.getLog);

router.get ('/history/:productId',         ctrl.productHistory);
router.post('/stock', validate(v.bulkStock), ctrl.bulkStock);

module.exports = router;
