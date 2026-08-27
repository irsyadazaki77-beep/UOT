/**
 * Universe Of Tech - Security & Server Hardening Audit Test Suite (Phase 17)
 * Validates server-authoritative session, cookie auth, CSRF defense, password policies,
 * rate limiting, secure headers, admin protection, and sanitization.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/server.js');

let server;
let baseUrl;
let cookieJar = {};

function updateCookieJar(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookiesArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    cookiesArr.forEach(str => {
        const parts = str.split(';');
        const pair = parts[0].trim();
        const eqIdx = pair.indexOf('=');
        if (eqIdx > 0) {
            const key = pair.substring(0, eqIdx);
            const val = pair.substring(eqIdx + 1);
            if (val === '' || str.includes('Max-Age=0') || str.includes('Expires=Thu, 01 Jan 1970')) {
                delete cookieJar[key];
            } else {
                cookieJar[key] = val;
            }
        }
    });
}

function getCookieString() {
    return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
}

function makeRequest(path, { method = 'GET', headers = {}, body = null, cookie = null } = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        const reqHeaders = {
            ...headers
        };

        const cookieHeader = cookie || getCookieString();
        if (cookieHeader) {
            reqHeaders['Cookie'] = cookieHeader;
        }

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: reqHeaders
        };

        if (body && typeof body === 'object') {
            body = JSON.stringify(body);
            if (!options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/json';
            }
        }

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                updateCookieJar(res.headers['set-cookie']);
                let json = null;
                try { json = JSON.parse(data); } catch (_) {}
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    raw: data,
                    json
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function runTests() {
    console.log('\n--- STARTING PHASE 17 SECURITY & AUTHENTICATION AUDIT SUITE ---');

    await new Promise((resolve) => {
        server = app.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            console.log(`[Test Server] Running on ${baseUrl}`);
            resolve();
        });
    });

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`  [FAIL] ${name}:`, err.message);
            failed++;
        }
    }

    // TEST 1: Secure Headers Verification
    await test('Security Headers (CSP, X-Content-Type-Options, Referrer-Policy)', async () => {
        const res = await makeRequest('/api/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
        assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
        assert(res.headers['content-security-policy'], 'Missing CSP header');
        assert.strictEqual(res.json?.status, 'ok');
    });

    // TEST 2: CSRF Endpoint & Basic Protection
    let csrfToken = '';
    await test('CSRF token endpoint supplies token and CSRF is required for mutations', async () => {
        const csrfRes = await makeRequest('/api/csrf-token');
        assert.strictEqual(csrfRes.status, 200);
        assert(csrfRes.json?.csrfToken, 'Must return csrfToken');
        csrfToken = csrfRes.json.csrfToken;

        // Mutation without CSRF token must fail (403)
        const unProtectedRes = await makeRequest('/api/auth/register', {
            method: 'POST',
            body: { username: 'CSRFTester', email: 'csrf@test.local', password: 'Password123#' }
        });
        assert.strictEqual(unProtectedRes.status, 403, 'Mutation without CSRF token must return 403');

        // Mutation with X-Requested-With header alone (old bypass) must STILL FAIL (403)
        const bypassRes = await makeRequest('/api/auth/register', {
            method: 'POST',
            headers: { 'X-Requested-With': 'QuizNation' },
            body: { username: 'CSRFTester', email: 'csrf@test.local', password: 'Password123#' }
        });
        assert.strictEqual(bypassRes.status, 403, 'X-Requested-With header must not bypass CSRF');
    });

    // TEST 3: Password Policy Enforcement
    await test('Registration enforces password complexity policy (8+ chars, upper, lower, digit)', async () => {
        const weakRes = await makeRequest('/api/auth/register', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrfToken },
            body: { username: 'WeakPassUser', email: 'weak@test.local', password: 'simplepassword' }
        });
        assert.strictEqual(weakRes.status, 400, 'Weak password must be rejected');
        assert(weakRes.json?.message?.includes('Kata sandi minimal 8 karakter'), 'Message must explain password policy');
    });

    // TEST 4: Registration, Session Cookie & No sessionToken leakage in JSON
    let userCookie = '';
    let userCsrfToken = '';
    await test('User Registration sets HttpOnly cookie and does NOT expose sessionToken in JSON', async () => {
        const validRes = await makeRequest('/api/auth/register', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrfToken },
            body: { username: 'Audit Tester', email: `audittester_${Date.now()}@uot.test`, password: 'StrongPassword#2026' }
        });
        assert.strictEqual(validRes.status, 201);
        assert.strictEqual(validRes.json?.ok, true);
        assert.strictEqual(validRes.json?.sessionToken, undefined, 'sessionToken MUST NOT be returned in JSON payload');
        assert(validRes.json?.csrfToken, 'csrfToken should be returned in JSON response');
        userCsrfToken = validRes.json.csrfToken;

        const setCookie = validRes.headers['set-cookie'];
        assert(setCookie, 'Set-Cookie header must be present');
        const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
        assert(cookieStr.includes('HttpOnly'), 'Cookie must be HttpOnly');
        assert(cookieStr.includes('SameSite=Lax'), 'Cookie must specify SameSite=Lax');
        userCookie = cookieStr.split(';')[0];
    });

    // TEST 5: Verify Authenticated Session with Cookie
    await test('Verify authenticated session with HttpOnly cookie succeeds', async () => {
        const res = await makeRequest('/api/auth/verify-session', {
            method: 'POST',
            headers: { 'X-CSRF-Token': userCsrfToken },
            cookie: userCookie
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.json?.verified, true);
        assert.strictEqual(res.json?.user?.username, 'Audit Tester');
    });

    // TEST 6: Unauthenticated Progress Mutation is Rejected
    await test('Unauthenticated progress mutation request is rejected (HTTP 401)', async () => {
        const res = await makeRequest('/api/progress/events', {
            method: 'POST',
            cookie: 'uot_session=invalid',
            headers: { 'X-CSRF-Token': csrfToken },
            body: { eventType: 'lesson_complete', payload: { lessonId: 'javascript-101' } }
        });
        assert.strictEqual(res.status, 401, 'Unauthenticated progress event must return 401');
    });

    // TEST 7: Authenticated Progress Mutation succeeds
    await test('Authenticated progress mutation with valid session cookie succeeds', async () => {
        const res = await makeRequest('/api/progress/events', {
            method: 'POST',
            headers: { 'X-CSRF-Token': userCsrfToken },
            body: { eventType: 'lesson_complete', eventId: `evt_${Date.now()}`, payload: { lessonId: 'javascript-101' } }
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.json?.ok, true);
    });

    // TEST 8: Admin Security Protection
    await test('Admin route enforces x-admin-key header protection', async () => {
        const noKeyRes = await makeRequest('/api/admin/content');
        assert.strictEqual(noKeyRes.status, 403, 'Admin endpoint without admin key must return 403');
    });

    // TEST 9: Checkout API explicitly labels SANDBOX DEMO when payment provider is unconfigured
    await test('Checkout API explicitly labels SANDBOX DEMO when payment provider is unconfigured', async () => {
        const res = await makeRequest('/v1/checkout/sessions', {
            method: 'POST',
            headers: { 'X-CSRF-Token': userCsrfToken },
            cookie: userCookie,
            body: { planId: 'annual', source: 'audit_test' }
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.json?.mode, 'sandbox_demo');
        assert.strictEqual(res.json?.isDemo, true);
    });

        // TEST 10: Request Size Limit Protection
    await test('Payload size limit protection rejects oversized bodies', async () => {
        const largeString = 'A'.repeat(300 * 1024); // 300KB
        const res = await makeRequest('/v1/learning-state', {
            method: 'PUT',
            headers: { 'X-CSRF-Token': userCsrfToken },
            cookie: userCookie,
            body: { state: { bigData: largeString } }
        });
        assert.strictEqual(res.status, 413, 'Oversized payload must receive HTTP 413 Payload Too Large');
    });

    // TEST 11: Dynamic CSP Nonce Verification
    await test('CSP dynamic nonce is unique and injected into HTML script tags', async () => {
        const res = await makeRequest('/index.html');
        assert.strictEqual(res.status, 200);
        const csp = res.headers['content-security-policy'];
        assert(csp, 'CSP header must be present');
        
        const nonceMatch = csp.match(/nonce-([A-Za-z0-9+/=]+)/);
        assert(nonceMatch, 'CSP must contain a nonce');
        const nonce = nonceMatch[1];
        
        assert(res.raw.includes(`nonce="${nonce}"`), 'Served HTML script tag must contain the generated CSP nonce');
    });

    // TEST 12: Rate Limiting Headers presence
    await test('Rate Limiting headers are present on state changing requests', async () => {
        const res = await makeRequest('/api/auth/register', {
            method: 'POST',
            body: {}
        });
        assert(res.headers['x-ratelimit-limit'], 'Rate Limit Limit header must be present');
        assert(res.headers['x-ratelimit-remaining'], 'Rate Limit Remaining header must be present');
    });

    // TEST 13: Sandbox Activation Endpoint requires Auth
    await test('Sandbox Activation requires user authentication', async () => {
        const res = await makeRequest('/api/subscription/sandbox-activate', {
            method: 'POST',
            headers: { 'X-CSRF-Token': userCsrfToken },
            cookie: 'uot_session=invalid',
            body: { planId: 'pro' }
        });
        assert.strictEqual(res.status, 401, 'Unauthenticated sandbox activation must return 401');
    });

    server.close();

    console.log(`\nAUDIT COMPLETE: ${passed} Passed, ${failed} Failed\n`);
    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch((err) => {
    console.error('Fatal audit suite error:', err);
    if (server) server.close();
    process.exit(1);
});
