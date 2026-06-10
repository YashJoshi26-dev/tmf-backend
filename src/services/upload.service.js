'use strict';

const cloudinary = require('../config/cloudinary');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const uploadBuffer = (buffer, { folder = env.cloudinary.folder, resource_type = 'image' } = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type }, (err, result) => {
      if (err) {
        logger.error('Cloudinary upload failed', { error: err.message });
        return reject(ApiError.internal('Image upload failed'));
      }
      resolve({ public_id: result.public_id, url: result.secure_url, width: result.width, height: result.height });
    });
    stream.end(buffer);
  });

const uploadMany = (files, opts) => Promise.all(files.map((f) => uploadBuffer(f.buffer, opts)));

const destroy = async (publicId) => {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId); }
  catch (e) { logger.warn('Cloudinary destroy failed', { publicId, error: e.message }); }
};

const destroyMany = (ids = []) => Promise.all(ids.filter(Boolean).map(destroy));

module.exports = { uploadBuffer, uploadMany, destroy, destroyMany };
