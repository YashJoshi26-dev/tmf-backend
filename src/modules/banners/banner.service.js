'use strict';

const Banner = require('./banner.model');
const ApiError = require('../../utils/ApiError');

exports.list = (position) => {
  const filter = { isActive: true };
  if (position) filter.position = position;
  const now = new Date();
  return Banner.find({
    ...filter,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt:   null }, { endsAt:   { $gte: now } }] },
    ],
  }).sort({ order: 1, createdAt: -1 });
};

exports.create = (data) => Banner.create(data);
exports.update = async (id, data) => {
  const b = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!b) throw ApiError.notFound('Banner not found');
  return b;
};
exports.remove = async (id) => {
  const b = await Banner.findByIdAndDelete(id);
  if (!b) throw ApiError.notFound('Banner not found');
};
exports.listAll = () => Banner.find().sort({ position: 1, order: 1, createdAt: -1 });
