'use strict';

/** Split an array into chunks of size n. Used to batch Mongo bulkWrite ops (Mongo limit ~1000). */
const chunk = (arr, n = 500) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

/**
 * Execute Model.bulkWrite() across chunks; accumulates summary.
 * Returns { matched, modified, inserted, upserted }.
 */
const runBulkChunks = async (Model, ops, n = 500) => {
  const totals = { matched: 0, modified: 0, inserted: 0, upserted: 0 };
  for (const batch of chunk(ops, n)) {
    if (!batch.length) continue;
    const res = await Model.bulkWrite(batch, { ordered: false });
    totals.matched   += res.matchedCount   || 0;
    totals.modified  += res.modifiedCount  || 0;
    totals.inserted  += res.insertedCount  || 0;
    totals.upserted  += res.upsertedCount  || 0;
  }
  return totals;
};

module.exports = { chunk, runBulkChunks };
