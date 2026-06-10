'use strict';

const multer = require('multer');
const ApiError = require('../utils/ApiError');

const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const CSV_MIMES   = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];

const memoryStorage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  if (!IMAGE_MIMES.includes(file.mimetype)) return cb(ApiError.badRequest(`Unsupported image type: ${file.mimetype}`));
  cb(null, true);
};

const csvFilter = (_req, file, cb) => {
  if (!CSV_MIMES.includes(file.mimetype) && !file.originalname.toLowerCase().endsWith('.csv')) {
    return cb(ApiError.badRequest('Only CSV files allowed'));
  }
  cb(null, true);
};

const uploadImage = multer({ storage: memoryStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024, files: 10 } });
const uploadCsv   = multer({ storage: memoryStorage, fileFilter: csvFilter,   limits: { fileSize: 20 * 1024 * 1024, files: 1 } });

module.exports = { uploadImage, uploadCsv };
