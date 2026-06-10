'use strict';

const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  let limit = parseInt(query.limit, 10) || defaultLimit;
  limit = Math.min(Math.max(limit, 1), maxLimit);
  const skip = (page - 1) * limit;

  let sort = {};
  if (query.sort) {
    query.sort.split(',').forEach((f) => {
      const t = f.trim();
      if (!t) return;
      if (t.startsWith('-')) sort[t.slice(1)] = -1; else sort[t] = 1;
    });
  } else sort = { createdAt: -1 };

  return { page, limit, skip, sort };
};

const buildMeta = ({ total, page, limit }) => ({
  total, page, limit,
  totalPages: Math.ceil(total / limit) || 1,
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

module.exports = { parsePagination, buildMeta };
