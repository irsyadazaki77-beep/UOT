"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, '../public');
const failures = [];
const warnings = [];
const htmlFiles = fs.readdirSync(ROOT).filter(file => file.endsWith(".html"));
const jsFiles = fs.readdirSync(ROOT).filter(file => file.endsWith(".js"));
const criticalPages = new Set(["index.html", "login.html", "materi.html", "quiz.html", "library.html", "profile.html", "payment.html"]);
const searchableFiles = [...htmlFiles, ...jsFiles];
const sources = new Map(searchableFiles.map(file => [file, fs.readFileSync(path.join(ROOT, file), "utf8")]));
const isOrphanDraft = file => file !== "index.html" && !searchableFiles.some(other => other !== file && sources.get(other).includes(file));

function localTargetExists(fromFile, rawRef) {
    const ref = rawRef.split("#")[0].split("?")[0];
    if (!ref || /^(?:https?:|mailto:|tel:|javascript:|data:|\/)/i.test(ref)) return true;
    return fs.existsSync(path.resolve(ROOT, path.dirname(fromFile), decodeURIComponent(ref)));
}

for (const file of htmlFiles) {
    const source = sources.get(file);
    if (!/<html\b[^>]*\blang=["']id["']/i.test(source)) failures.push(`${file}: atribut lang="id" tidak ditemukan.`);
    if (!/<title>[^<]+<\/title>/i.test(source)) failures.push(`${file}: title tidak ditemukan.`);
    if (criticalPages.has(file) && !/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+/i.test(source)) {
        failures.push(`${file}: meta description tidak ditemukan.`);
    }

    const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)]
        .map(match => match[1])
        .filter(id => !id.includes("${"));
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    if (duplicateIds.length) failures.push(`${file}: id duplikat: ${duplicateIds.join(", ")}.`);

    for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) {
        if (!localTargetExists(file, match[1])) {
            const message = `${file}: referensi tidak ditemukan: ${match[1]}.`;
            if (isOrphanDraft(file)) warnings.push(`${message} Halaman belum terhubung dari situs utama.`);
            else failures.push(message);
        }
    }
    for (const match of source.matchAll(/<img\b([^>]*)>/gi)) {
        if (!/\balt=["'][^"']*["']/i.test(match[1])) failures.push(`${file}: elemen img tanpa atribut alt.`);
    }
}

const serviceWorker = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
for (const match of serviceWorker.matchAll(/["']\.\/([^"']+)["']/g)) {
    const target = match[1];
    if (target && !fs.existsSync(path.join(ROOT, target))) failures.push(`sw.js: aset cache tidak ditemukan: ${target}.`);
}

for (const file of jsFiles) {
    try {
        execFileSync(process.execPath, ["--check", path.join(ROOT, file)], { stdio: "pipe" });
    } catch (error) {
        const detail = error.stderr?.toString().trim().split(/\r?\n/).slice(-1)[0] || "sintaks tidak valid";
        failures.push(`${file}: ${detail}`);
    }
}

const sessionHtml = sources.get("quiz-session.html") || "";
const sessionJs = sources.get("quiz-session.js") || "";
if (/style-src[^;]*?(?:'unsafe-inline'|style-src-attr\s+'unsafe-inline')/i.test(sessionHtml)) {
    warnings.push("quiz-session.html: CSP style mengizinkan inline style; pertahankan halaman sesi tanpa unsafe-inline.");
}
if (/\bstyle\s*=\s*["']/i.test(sessionHtml) || /\.style(?:\.|\[)/.test(sessionJs) || /<[^>]+\sstyle\s*=/i.test(sessionJs)) {
    failures.push("Ruang quiz memakai inline style yang bertentangan dengan CSP halaman sesi.");
}

if (!fs.existsSync(path.join(ROOT, "_headers"))) warnings.push("Header keamanan deployment belum tersedia.");
warnings.forEach(message => console.warn(`WARN: ${message}`));
if (failures.length) {
    failures.forEach(message => console.error(`FAIL: ${message}`));
    console.error(`\n${failures.length} pemeriksaan gagal.`);
    process.exit(1);
}
console.log(`OK: ${htmlFiles.length} halaman, ${jsFiles.length} berkas JavaScript, tautan lokal, metadata inti, dan cache PWA lolos pemeriksaan.`);
