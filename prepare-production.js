"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const rawBase = process.argv[2] || process.env.SITE_URL || "";
let siteBase;
try { siteBase = new URL(rawBase); }
catch { console.error("Gunakan: npm run prepare:production -- https://domain-anda.example"); process.exit(1); }
if (siteBase.protocol !== "https:") {
    console.error("SITE_URL produksi wajib menggunakan HTTPS.");
    process.exit(1);
}
siteBase.pathname = siteBase.pathname.replace(/\/?$/, "/");
siteBase.search = "";
siteBase.hash = "";

const sitemapPath = path.join(root, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
sitemap = sitemap.replace(/<loc>([^<]+)<\/loc>/g, (_, location) => {
    const absolute = new URL(location.replace(/^\//, ""), siteBase).href;
    return `<loc>${absolute}</loc>`;
});
fs.writeFileSync(sitemapPath, sitemap);

const publicPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname.split("/").pop());
for (const page of publicPages) {
    const filePath = path.join(root, page);
    if (!fs.existsSync(filePath)) continue;
    let html = fs.readFileSync(filePath, "utf8");
    const canonicalUrl = new URL(page, siteBase).href;
    const canonical = `<link rel="canonical" href="${canonicalUrl}">`;
    const ogUrl = `<meta property="og:url" content="${canonicalUrl}">`;
    html = /<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(html)
        ? html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/i, canonical)
        : html.replace(/<\/head>/i, `    ${canonical}\n</head>`);
    html = /<meta\b[^>]*property=["']og:url["'][^>]*>/i.test(html)
        ? html.replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/i, ogUrl)
        : html.replace(/<\/head>/i, `    ${ogUrl}\n</head>`);
    fs.writeFileSync(filePath, html);
}

fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", siteBase).href}\n`);
console.log(`Metadata produksi disiapkan untuk ${siteBase.origin}.`);
