// routes/sitemap.js
'use strict';

const express = require("express");
const Product = require("../modules/products/product.model");
const Category = require("../modules/categories/category.model");

const router = express.Router();
const BASE_URL = "https://www.themaharajafashion.com";

router.get("/sitemap.xml", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }, "slug updatedAt");
    const categories = await Category.find({}, "slug");

    const BASE_URL = "https://themaharajafashion.com";

const staticPages = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/bridal", priority: "0.9", changefreq: "weekly" },
  { url: "/wholesale", priority: "0.5", changefreq: "monthly" },
  { url: "/lookbook", priority: "0.5", changefreq: "monthly" },
];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticPages.forEach((p) => {
      xml += `  <url><loc>${BASE_URL}${p.url}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>\n`;
    });

    categories.forEach((c) => {
      if (!c.slug) return;
      xml += `  <url><loc>${BASE_URL}/category/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    });

    products.forEach((p) => {
      if (!p.slug) return;
      const date = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      xml += `  <url><loc>${BASE_URL}/product/${p.slug}</loc><lastmod>${date}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

module.exports = router;