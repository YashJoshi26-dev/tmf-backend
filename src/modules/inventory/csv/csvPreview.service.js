'use strict';

const Papa = require('papaparse');
const { validateRow } = require('./csvValidation.service');

/**
 * Preview an uploaded CSV — returns the first N rows with per-row validity
 * so the admin can confirm before the real import.
 */
const preview = (buffer, n = 20) => {
  const text = buffer.toString('utf8');
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });

  const rows = parsed.data.slice(0, n).map((row, i) => {
    const v = validateRow(row);
    return {
      rowIndex: i + 2, // +2 to account for header row + 1-based numbering
      raw: row,
      ok: v.ok,
      errors: v.ok ? [] : v.errors,
      normalised: v.ok ? v.value : null,
    };
  });

  return {
    totalRows: parsed.data.length,
    previewRows: rows,
    headers: parsed.meta.fields || [],
    parseErrors: parsed.errors || [],
  };
};

module.exports = { preview };
