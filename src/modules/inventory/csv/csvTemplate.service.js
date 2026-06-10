'use strict';

/** The CSV column order shipping to store admins. Keep stable — Sheet users may have formulas referencing columns. */
const HEADERS = [
  'sku', 'name', 'category', 'subcategory', 'brand',
  'fabric', 'color', 'occasion', 'work_type',
  'price', 'mrp', 'discount_pct', 'stock', 'size',
  'bridal', 'trending', 'new', 'bestseller',
  'images', 'video_url', 'description',
  'weight_grams', 'active',
];

const SAMPLE_ROW = {
  sku: 'SR-BNRS-RED-001',
  name: 'Red Banarasi Silk Saree',
  category: 'Sarees',
  subcategory: 'Banarasi',
  brand: 'Heritage',
  fabric: 'Banarasi Silk',
  color: 'Red',
  occasion: 'Bridal|Festive',
  work_type: 'Zari',
  price: 8500,
  mrp: 12000,
  discount_pct: 29,
  stock: 12,
  size: 'Free Size',
  bridal: 'true',
  trending: 'true',
  new: 'true',
  bestseller: 'false',
  images: 'https://res.cloudinary.com/yours/upload/saree1.jpg|https://res.cloudinary.com/yours/upload/saree2.jpg',
  video_url: '',
  description: 'Pure Banarasi silk saree with gold zari border. Comes with unstitched blouse piece.',
  weight_grams: 750,
  active: 'true',
};

const csvEscape = (v) => {
  if (v == null) return '';
  const s = v.toString();
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const buildTemplate = () => {
  const headerLine = HEADERS.join(',');
  const sampleLine = HEADERS.map((h) => csvEscape(SAMPLE_ROW[h])).join(',');
  return `${headerLine}\n${sampleLine}\n`;
};

module.exports = { HEADERS, buildTemplate };
