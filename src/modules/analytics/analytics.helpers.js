'use strict';

/** Date helpers for analytics queries. */

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
};

/** Build a [start, end] window from query params, defaulting to last N days. */
const range = (query, defaultDays = 30) => {
  const end = query.end ? new Date(query.end) : new Date();
  const start = query.start ? new Date(query.start) : daysAgo(defaultDays);
  return { start, end };
};

module.exports = { startOfDay, daysAgo, range };
