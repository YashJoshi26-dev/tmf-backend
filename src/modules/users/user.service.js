'use strict';

const repo = require('./user.repository');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildMeta } = require('../../utils/pagination');

exports.updateProfile = async (user, payload) => {
  const allowed = ['name', 'image'];
  for (const k of allowed) if (payload[k] !== undefined) user[k] = payload[k];
  await user.save();
  return user;
};

exports.addAddress = async (user, addr) => {
  if (addr.isDefault) user.address.forEach((a) => { a.isDefault = false; });
  if (user.address.length === 0) addr.isDefault = true;
  user.address.push(addr);
  await user.save();
  return user.address;
};

exports.updateAddress = async (user, addressId, payload) => {
  const a = user.address.id(addressId);
  if (!a) throw ApiError.notFound('Address not found');
  if (payload.isDefault) user.address.forEach((x) => { x.isDefault = false; });
  Object.assign(a, payload);
  await user.save();
  return user.address;
};

exports.removeAddress = async (user, addressId) => {
  const a = user.address.id(addressId);
  if (!a) throw ApiError.notFound('Address not found');
  const wasDefault = a.isDefault;
  a.deleteOne();
  if (wasDefault && user.address.length) user.address[0].isDefault = true;
  await user.save();
  return user.address;
};

exports.setDefaultAddress = async (user, addressId) => {
  const a = user.address.id(addressId);
  if (!a) throw ApiError.notFound('Address not found');
  user.address.forEach((x) => { x.isDefault = x._id.toString() === addressId; });
  await user.save();
  return user.address;
};

// Admin
exports.listUsers = async (query) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};
  if (query.role)   filter.role = query.role;
  if (query.search) filter.$or = [
    { name:  { $regex: query.search, $options: 'i' } },
    { email: { $regex: query.search, $options: 'i' } },
    { phone: { $regex: query.search, $options: 'i' } },
  ];
  const [items, total] = await Promise.all([
    repo.list(filter, { sort, skip, limit }),
    repo.count(filter),
  ]);
  return { items, meta: buildMeta({ total, page, limit }) };
};

exports.setActive = async (id, isActive) => {
  const u = await repo.updateById(id, { isActive });
  if (!u) throw ApiError.notFound('User not found');
  return u;
};

exports.setRole = async (id, role) => {
  if (!['user', 'admin'].includes(role)) throw ApiError.badRequest('Invalid role');
  const u = await repo.updateById(id, { role });
  if (!u) throw ApiError.notFound('User not found');
  return u;
};
