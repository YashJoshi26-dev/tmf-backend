'use strict';

/**
 * Append Cloudinary auto-format/quality transforms to a delivery URL.
 *   cldUrl('https://res.cloudinary.com/x/image/upload/v123/abc.jpg', { w: 400 })
 *     → 'https://res.cloudinary.com/x/image/upload/f_auto,q_auto,w_400/v123/abc.jpg'
 */
const cldUrl = (url, { w, h, q = 'auto', f = 'auto' } = {}) => {
  if (!url || !url.includes('/upload/')) return url;
  const parts = [`f_${f}`, `q_${q}`];
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  return url.replace('/upload/', `/upload/${parts.join(',')}/`);
};

module.exports = { cldUrl };
