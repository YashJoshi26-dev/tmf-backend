'use strict';

const svc = require('./inventory.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.template = asyncHandler(async (_req, res) => {
  const csv = svc.template();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-template.csv"');
  res.send(csv);
});

exports.preview = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('CSV file required (field: file)');
  ApiResponse.ok(res, svc.previewCsv(req.file.buffer));
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('CSV file required (field: file)');
  const sync = req.body.sync === 'true' || req.body.sync === true;
  const result = await svc.uploadCsv({
    buffer: req.file.buffer,
    filename: req.file.originalname,
    triggeredBy: req.user._id,
    sync,
  });

  if (sync && result.failedCsv) {
    // Embed the failed-rows CSV as a base64 string in the response for convenience.
    return ApiResponse.ok(res, {
      log: result.log,
      failedRows: result.failures.length,
      failedCsvBase64: Buffer.from(result.failedCsv).toString('base64'),
    }, 'Import done');
  }
  ApiResponse.ok(res, result, sync ? 'Import done' : 'Import queued');
});

exports.syncSheet = asyncHandler(async (req, res) => {
  const async_ = req.query.async === 'true';
  if (async_) {
    await svc.syncSheetAsync(req.user._id);
    return ApiResponse.ok(res, { queued: true }, 'Sync queued');
  }
  const result = await svc.syncSheetNow(req.user._id);
  ApiResponse.ok(res, result, 'Sync complete');
});

exports.listLogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  ApiResponse.ok(res, await svc.listLogs(limit));
});

exports.getLog = asyncHandler(async (req, res) => {
  const log = await svc.getLog(req.params.id);
  if (!log) throw ApiError.notFound('Log not found');
  ApiResponse.ok(res, log);
});

exports.productHistory = asyncHandler(async (req, res) => {
  ApiResponse.ok(res, await svc.history(req.params.productId));
});

exports.bulkStock = asyncHandler(async (req, res) => {
  ApiResponse.ok(res, await svc.bulkStock(req.body.updates), 'Stock updated');
});
