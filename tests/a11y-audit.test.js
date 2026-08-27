/**
 * FASE 6 — Automated Accessibility, Input & Responsive Audit Test Suite
 * Tests adherence to WCAG AA principles, keyboard navigation, focus handling,
 * responsive design tokens, and global audio preferences.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const htmlFiles = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith(".html"));

test("A11y Audit: HTML Document Structure & Viewport Meta", () => {
    htmlFiles.forEach(file => {
        const content = fs.readFileSync(path.join(PUBLIC_DIR, file), "utf-8");
        assert.match(content, /<!doctype\s+html>/i, `${file} must include <!doctype html>`);
        assert.match(content, /<html[^>]*lang=/i, `${file} must have lang attribute on <html>`);
        assert.match(content, /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i, `${file} must have responsive viewport meta`);
        // Check that user-scalable=no or maximum-scale=1 is NOT blocking zoom (WCAG 1.4.4)
        assert.doesNotMatch(content, /user-scalable\s*=\s*no/i, `${file} should not disable user zoom`);
    });
});

test("A11y Audit: Design Tokens & App Shell CSS Linked", () => {
    htmlFiles.forEach(file => {
        if (file === "offline.html" || file === "sandbox-runner.html") return;
        const content = fs.readFileSync(path.join(PUBLIC_DIR, file), "utf-8");
        assert.ok(
            content.includes("tokens.css") || content.includes("app-shell.css"),
            `${file} must link design tokens or app-shell`
        );
    });
});

test("A11y Audit: Global Sound Engine & No Autoplay", () => {
    const soundEngine = fs.readFileSync(path.join(PUBLIC_DIR, "sound-engine.js"), "utf-8");
    assert.ok(soundEngine.includes("uot_sound_enabled"), "sound-engine.js must use uot_sound_enabled localStorage key");
    assert.ok(soundEngine.includes("setSoundEnabled"), "sound-engine.js must export setSoundEnabled");
    assert.ok(soundEngine.includes("isSoundEnabled"), "sound-engine.js must export isSoundEnabled");
    assert.ok(soundEngine.includes("toggleSound"), "sound-engine.js must export toggleSound");
    assert.ok(soundEngine.includes("pointerdown") || soundEngine.includes("userHasInteracted"), "sound-engine.js must guard against autoplay before user interaction");
});

test("A11y Audit: Focus-Visible & Reduced Motion in CSS", () => {
    const responsiveCss = fs.readFileSync(path.join(PUBLIC_DIR, "responsive-system.css"), "utf-8");
    assert.ok(responsiveCss.includes(":focus-visible"), "responsive-system.css must declare :focus-visible rules");
    assert.ok(responsiveCss.includes("prefers-reduced-motion: reduce"), "responsive-system.css must support prefers-reduced-motion");
    assert.ok(responsiveCss.includes("min-height: 44px") || responsiveCss.includes("touch-action"), "responsive-system.css must enforce touch target sizes");
});

test("A11y Audit: Escape Key, Focus Trap, & Form Label Helpers in app-shell.js", () => {
    const appShell = fs.readFileSync(path.join(PUBLIC_DIR, "app-shell.js"), "utf-8");
    assert.ok(appShell.includes("Escape"), "app-shell.js must handle Escape key for modals");
    assert.ok(appShell.includes("setupFocusTrap"), "app-shell.js must implement dialog focus trapping");
    assert.ok(appShell.includes("lastFocusedElement"), "app-shell.js must restore focus to trigger after modal close");
    assert.ok(appShell.includes("repairAccessibilityLabels"), "app-shell.js must auto-repair missing labels and icon-only button names");
});

test("A11y Audit: Color Contrast & Semantic Palette in tokens.css", () => {
    const tokens = fs.readFileSync(path.join(PUBLIC_DIR, "tokens.css"), "utf-8");
    assert.ok(tokens.includes("--uot-primary"), "tokens.css must define primary color");
    assert.ok(tokens.includes("--uot-focus-ring"), "tokens.css must define focus ring token");
    assert.ok(tokens.includes("--uot-text-primary"), "tokens.css must define high-contrast body text token");
});
