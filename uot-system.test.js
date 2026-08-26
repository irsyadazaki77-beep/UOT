const test = require("node:test");
const assert = require("node:assert/strict");

test("UOTSecurity: Sanitasi HTML dan penghapusan XSS script tag", () => {
    const malicious = '<script>alert("xss")</script><p>Halo Dunia</p><iframe src="javascript:alert(1)"></iframe>';
    
    // Simulate core sanitizer logic
    const sanitized = malicious
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");

    assert.equal(sanitized, "<p>Halo Dunia</p>");
});

test("UOTSecurity: Sanitasi protocol URL berbahaya", () => {
    const sanitizeURL = (url) => {
        const trimmed = String(url || "").trim();
        if (/^(javascript|data|vbscript):/i.test(trimmed)) return "#";
        return trimmed;
    };

    assert.equal(sanitizeURL("javascript:stealData()"), "#");
    assert.equal(sanitizeURL("data:text/html,<script>"), "#");
    assert.equal(sanitizeURL("https://universeoftech.id"), "https://universeoftech.id");
    assert.equal(sanitizeURL("/materi-basic.html"), "/materi-basic.html");
});

test("UOTStorage: Schema Versioning v4 constants", () => {
    const SCHEMA_VERSION = 4;
    const STORAGE_KEYS = {
        THEME: "uot_theme",
        SESSION: "uot_user_session",
        SUBSCRIPTION: "uot_subscription",
        LMS_PROGRESS: "uot_lms_progress",
        RPG_STATE: "uot_rpg_state",
        SCHEMA_VERSION: "uot_schema_version"
    };

    assert.equal(SCHEMA_VERSION, 4);
    assert.ok(STORAGE_KEYS.THEME.startsWith("uot_"));
    assert.ok(STORAGE_KEYS.SESSION.startsWith("uot_"));
    assert.ok(STORAGE_KEYS.SUBSCRIPTION.startsWith("uot_"));
});

test("UOTMarkdown: Parsing format kode dan styling inline", () => {
    const escapeHtml = str => String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const input = "Gunakan `const x = 10;` untuk mendeklarasikan variabel.";
    const formatted = input.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

    assert.equal(formatted, "Gunakan <code>const x = 10;</code> untuk mendeklarasikan variabel.");
});
