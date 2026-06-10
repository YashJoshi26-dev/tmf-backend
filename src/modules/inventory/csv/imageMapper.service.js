'use strict';

/**
 * Convert "url1|url2|url3" → [{url:'url1'},{url:'url2'},{url:'url3'}]
 * Trims whitespace, drops empty entries.
 */
const parseImageList = (raw) => {
  if (!raw) return [];
  return raw
    .toString()
    .split(/[|;,\n]/)
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
};

module.exports = { parseImageList };
