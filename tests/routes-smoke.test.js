/**
 * Universe Of Tech - Comprehensive Routes, PWA, Assets & Internal Links Smoke Test Suite
 * Covers items 16, 17, 18:
 * 16. Internal links verification (no dead href/src)
 * 17. PWA asset existence (manifest, sw.js precache items, icons, offline.html)
 * 18. Route smoke test (Live HTTP server testing for all pages and APIs)
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const app = require("../src/server.js");

const ROOT = path.resolve(__dirname, "../public");

// -------------------------------------------------------------
// 16. INTERNAL LINKS & REFERENCES INTEGRITY TEST
// -------------------------------------------------------------
test("Smoke 16: Internal Links & Asset References Integrity", () => {
    const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));
    const errors = [];

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(path.join(ROOT, file), "utf8");

        // Check href and src
        const matches = content.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi);
        for (const match of matches) {
            const rawRef = match[1];
            // Skip external, protocol, anchors, data URIs, and dynamic templates
            if (!rawRef || /^(?:https?:|mailto:|tel:|javascript:|data:|\/api\/|\/v1\/|#|\$\{)/i.test(rawRef)) {
                continue;
            }

            const cleanRef = rawRef.split("?")[0].split("#")[0];
            if (!cleanRef) continue;

            const resolvedPath = path.resolve(ROOT, path.dirname(file), decodeURIComponent(cleanRef));
            if (!fs.existsSync(resolvedPath)) {
                errors.push(`[${file}] Broken reference to: "${rawRef}" (resolved: ${resolvedPath})`);
            }
        }
    });

    assert.equal(errors.length, 0, `Found broken internal references:\n${errors.join("\n")}`);
});

// -------------------------------------------------------------
// 17. PWA ASSETS & SERVICE WORKER PRECACHE INTEGRITY TEST
// -------------------------------------------------------------
test("Smoke 17: PWA Manifest & Service Worker Assets Existence", () => {
    // 1. Manifest
    const manifestPath = path.join(ROOT, "manifest.webmanifest");
    assert.ok(fs.existsSync(manifestPath), "manifest.webmanifest must exist");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    assert.ok(manifest.name, "Manifest must have a name");
    assert.ok(manifest.start_url, "Manifest must have a start_url");
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest must have icons");

    manifest.icons.forEach(icon => {
        const iconSrc = icon.src.replace(/^\.\//, "");
        assert.ok(fs.existsSync(path.join(ROOT, iconSrc)), `Manifest icon missing: ${icon.src}`);
    });

    // 2. Service Worker & Precache Assets
    const swPath = path.join(ROOT, "sw.js");
    assert.ok(fs.existsSync(swPath), "sw.js must exist");
    const swContent = fs.readFileSync(swPath, "utf8");

    const precachedMatches = [...swContent.matchAll(/["']\.\/([^"']+)["']/g)].map(m => m[1]);
    assert.ok(precachedMatches.length > 0, "sw.js must have precached assets list");

    const missingAssets = [];
    precachedMatches.forEach(asset => {
        const cleanAsset = asset.split("?")[0];
        if (!fs.existsSync(path.join(ROOT, cleanAsset))) {
            missingAssets.push(cleanAsset);
        }
    });

    assert.equal(missingAssets.length, 0, `Missing SW precache assets: ${missingAssets.join(", ")}`);

    // 3. Offline fallback page
    assert.ok(fs.existsSync(path.join(ROOT, "offline.html")), "offline.html fallback page must exist");
});

// -------------------------------------------------------------
// 18. LIVE ROUTE SMOKE TESTS (HTTP SERVER)
// -------------------------------------------------------------
test("Smoke 18: Live HTTP Route Smoke Test for Pages & APIs", async (t) => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    t.after(() => {
        server.close();
    });

    async function req(urlPath, options = {}) {
        const res = await fetch(`${baseUrl}${urlPath}`, {
            redirect: "manual",
            ...options
        });
        const text = await res.text();
        return { status: res.status, headers: res.headers, text };
    }

    // Critical HTML pages
    const pages = [
        "/",
        "/index.html",
        "/materi.html",
        "/materi-basic.html",
        "/quiz.html",
        "/quiz-session.html",
        "/snbt.html",
        "/bahasa-daerah.html",
        "/library.html",
        "/projects.html",
        "/leaderboard.html",
        "/achievements.html",
        "/profile.html",
        "/payment.html",
        "/login.html",
        "/offline.html",
        "/games.html"
    ];

    for (const page of pages) {
        const res = await req(page);
        assert.equal(res.status, 200, `Page ${page} must return HTTP 200 (got ${res.status})`);
        assert.ok(res.text.includes("<!DOCTYPE html>") || res.text.includes("<html"), `Page ${page} must return valid HTML content`);
        // Security header assertion
        assert.ok(res.headers.get("x-content-type-options"), `Page ${page} missing X-Content-Type-Options`);
        assert.ok(res.headers.get("content-security-policy"), `Page ${page} missing Content-Security-Policy`);
    }

    // Clean URL routing (e.g. /materi -> materi.html)
    const cleanRoutes = ["/materi", "/quiz", "/profile", "/library", "/snbt", "/projects"];
    for (const route of cleanRoutes) {
        const res = await req(route);
        assert.equal(res.status, 200, `Clean URL ${route} must return HTTP 200`);
    }

    // Static Assets
    const staticAssets = [
        "/app-shell.css",
        "/tokens.css",
        "/progression-engine.js",
        "/manifest.webmanifest",
        "/sw.js",
        "/universe-of-tech-logo.webp"
    ];
    for (const asset of staticAssets) {
        const res = await req(asset);
        assert.equal(res.status, 200, `Static asset ${asset} must return HTTP 200`);
    }

    // API Routes
    const healthRes = await req("/api/health");
    assert.equal(healthRes.status, 200);
    const healthData = JSON.parse(healthRes.text);
    assert.equal(healthData.status, "ok");
    assert.equal(healthData.app, "Universe Of Tech");

    const configRes = await req("/api/config/status");
    assert.equal(configRes.status, 200);
    const configData = JSON.parse(configRes.text);
    assert.equal(configData.ok, true);

    const verifySessionRes = await req("/api/auth/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "invalid-token" })
    });
    assert.equal(verifySessionRes.status, 401);
    const verifyData = JSON.parse(verifySessionRes.text);
    assert.equal(verifyData.verified, false);

    const learningStateRes = await req("/v1/learning-state");
    assert.equal(learningStateRes.status, 200);
    const learningStateData = JSON.parse(learningStateRes.text);
    assert.equal(learningStateData.status, "ok");

    // 404 handler for invalid routes
    const notFoundRes = await req("/non-existent-page-route-random-404");
    assert.equal(notFoundRes.status, 404, "Invalid route must return HTTP 404");
});
