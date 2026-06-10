'use strict';

const { HEADERS } = require('./csvTemplate.service');

/**
 * Given a list of failed rows (with their raw fields + error messages),
 * produce a CSV string the admin can fix and re-upload.
 */
const buildFailedRowsCsv = (failures = []) => {
  const headerLine = [...HEADERS, '_errors'].join(',');
  const lines = failures.map((f) => {
    const cells = HEADERS.map((h) => {
      const v = f.raw?.[h] ?? '';
      const s = v.toString();
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    });
    cells.push(`"${(f.errors || []).join(' | ').replace(/"/g, '""')}"`);
    return cells.join(',');
  });
  return [headerLine, ...lines].join('\n') + '\n';
};

module.exports = { buildFailedRowsCsv };
