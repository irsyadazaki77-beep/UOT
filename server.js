const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');

const app = express();
const PORT = 3000;

// Environment & Configuration Definition (Poin 15)
const APP_ENV = process.env.NODE_ENV === 'production' ? 'production' : (process.env.APP_ENV || 'development');
const IS_PRODUCTION = APP_ENV === 'production';

const { PLANS, SandboxProvider, StripeProvider, isWebhookProcessed, markWebhookProcessed } = require('./payment-provider');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const IS_PAYMENT_CONFIGURED = Boolean(STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.trim().length > 5);

let paymentProviderInstance;
if (IS_PAYMENT_CONFIGURED) {
    paymentProviderInstance = new StripeProvider(STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET);
} else {
    paymentProviderInstance = new SandboxProvider();
}

// Startup Validation (Poin 10): Fail startup in production if ADMIN_KEY is missing or invalid
if (IS_PRODUCTION) {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || adminKey.trim() === '' || adminKey === 'uot-admin-secret-key-2026') {
        console.error('FATAL: Konfigurasi ADMIN_KEY tidak valid pada mode produksi. ADMIN_KEY wajib disetel via environment.');
        process.exit(1);
    }
}

// Persistent Server-Authoritative Database Store (FASE 11 Architecture)
const { dbInstance, ACHIEVEMENTS_CATALOG } = require('./server-db');
const ContentEngine = require('./content-engine');
const analyticsEngineInstance = require('./analytics-engine');
const userStore = dbInstance.users;
const sessionStore = dbInstance.sessions;
const subscriptionStore = dbInstance.subscriptions;
const learningStateStore = new Map();

// Initialize ContentEngine from ContentRepository and disk storage
const { contentRepository } = require('./db');
const ContentMigrationTool = require('./content-migration-tool');

const CONTENT_DIR = path.join(__dirname, 'data', 'content');
function syncContentWithDisk() {
    if (!fs.existsSync(CONTENT_DIR)) {
        try { fs.mkdirSync(CONTENT_DIR, { recursive: true }); } catch (_) {}
    }
    const domains = ['quizzes', 'lessons', 'learningPaths', 'projects', 'culture', 'books'];
    domains.forEach(domain => {
        let filePath = path.join(CONTENT_DIR, `${domain}.json`);
        if (!fs.existsSync(filePath) && (domain === 'learningPaths' || domain === 'learning-paths')) {
            filePath = path.join(CONTENT_DIR, 'learning-paths.json');
        }
        if (fs.existsSync(filePath)) {
            try {
                const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                ContentEngine.registerContent(domain, items);
            } catch (err) {
                console.error(`[ContentEngine] Gagal memuat file ${filePath}:`, err.message);
            }
        }
    });
}
syncContentWithDisk();

function saveDomainContentToDisk(domain) {
    if (!fs.existsSync(CONTENT_DIR)) {
        try { fs.mkdirSync(CONTENT_DIR, { recursive: true }); } catch (_) {}
    }
    const norm = ContentEngine.normalizeDomain ? ContentEngine.normalizeDomain(domain) : domain;
    const items = contentRepository ? contentRepository.getAll(norm, { includeDrafts: true }) : ContentEngine.getAll(norm, { includeDrafts: true });
    const filePath = path.join(CONTENT_DIR, `${norm}.json`);
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
    if (norm === 'learningPaths') {
        const altPath = path.join(CONTENT_DIR, 'learning-paths.json');
        fs.writeFileSync(altPath, JSON.stringify(items, null, 2), 'utf8');
    }
}

// Seed default demo user for testing & offline sandbox evaluation
(() => {
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultHash = crypto.pbkdf2Sync('demo1234', defaultSalt, 100000, 64, 'sha512').toString('hex');
    const demoUserId = 'usr_demo_7701';
    userStore.set('demo@universeoftech.id', {
        id: demoUserId,
        username: 'DemoLearner',
        email: 'demo@universeoftech.id',
        passwordHash: defaultHash,
        salt: defaultSalt,
        role: 'user',
        isPro: false,
        createdAt: new Date().toISOString()
    });
})();

// Password Hashing with PBKDF2 & Cryptographic Salt (Poin 9)
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
    if (!password || !storedHash || !salt) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const hashBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
}

// Request size limit (Poin 10)
app.use(express.json({
    limit: '256kb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Response compression
app.use(compression());

// Cookie parsing helper
function parseCookies(cookieHeader = '') {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            list[key] = decodeURIComponent(val);
        }
    });
    return list;
}

app.use((req, res, next) => {
    req.cookies = parseCookies(req.headers.cookie);
    next();
});

// Secure HTTP Headers (Poin 10, 18, 19)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';"
    );
    // Bust cache to clear previous X-Frame-Options
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
    next();
});

// In-Memory Token Bucket / Sliding Window Rate Limiter (Poin 10, 15)
const rateLimits = new Map();
function rateLimiter({ windowMs = 60000, max = 30, message = 'Terlalu banyak permintaan, coba lagi nanti.' } = {}) {
    return (req, res, next) => {
        const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const key = `${req.baseUrl || ''}${req.path}:${clientIp}`;
        const now = Date.now();
        const clientRecord = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };

        if (now > clientRecord.resetAt) {
            clientRecord.count = 0;
            clientRecord.resetAt = now + windowMs;
        }

        clientRecord.count++;
        rateLimits.set(key, clientRecord);

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - clientRecord.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(clientRecord.resetAt / 1000));

        if (clientRecord.count > max) {
            return res.status(429).json({
                ok: false,
                error: 'RATE_LIMIT_EXCEEDED',
                message,
                retryAfter: Math.ceil((clientRecord.resetAt - now) / 1000)
            });
        }
        next();
    };
}

// Cleanup rate limits map every 10 minutes
const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, rec] of rateLimits.entries()) {
        if (now > rec.resetAt) rateLimits.delete(key);
    }
}, 600000);
if (cleanupTimer.unref) cleanupTimer.unref();

// Auth failure audit log (Poin 15)
const authFailureAuditLog = [];
function recordAuthFailure(ip, email, reason) {
    const masked = email ? email.replace(/(^.x?)(.*)(@.*$)/, '$1***$3') : 'unknown';
    authFailureAuditLog.push({
        timestamp: new Date().toISOString(),
        ip: ip || '127.0.0.1',
        email: masked,
        reason
    });
    if (authFailureAuditLog.length > 500) authFailureAuditLog.shift();
}

// Password Policy Enforcement (Poin 16)
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

// Server-Authoritative Authentication & Session Middleware (Poin 4, 6, 7, 8, 15)
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies.uot_session) {
        token = req.cookies.uot_session;
    }

    if (!token) {
        req.session = null;
        req.user = null;
        return next();
    }

    const session = sessionStore.get(token);
    if (!session) {
        req.session = null;
        req.user = null;
        return next();
    }

    // Check expiration (24 hours)
    if (Date.now() > session.expiresAt) {
        sessionStore.delete(token);
        req.session = null;
        req.user = null;
        return next();
    }

    const user = Array.from(userStore.values()).find(u => u.id === session.userId);
    if (!user) {
        sessionStore.delete(token);
        req.session = null;
        req.user = null;
        return next();
    }

    // Verify PRO subscription server-side
    const sub = subscriptionStore.get(user.id);
    const isProActive = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);
    user.isPro = isProActive;

    req.session = session;
    req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        isPro: isProActive,
        planId: sub?.planId || 'free'
    };
    next();
}

function requireAuth(req, res, next) {
    if (!req.session || !req.user) {
        return res.status(401).json({
            ok: false,
            error: 'UNAUTHORIZED',
            message: 'Autentikasi diperlukan untuk mengakses resource ini.'
        });
    }
    next();
}

function requireAdmin(req, res, next) {
    const adminKeyHeader = req.headers['x-admin-key'];
    const SERVER_ADMIN_KEY = process.env.ADMIN_KEY;

    if (SERVER_ADMIN_KEY && SERVER_ADMIN_KEY.trim() !== '' && adminKeyHeader && adminKeyHeader === SERVER_ADMIN_KEY) {
        return next();
    }
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        ok: false,
        error: 'FORBIDDEN',
        message: 'Akses khusus administrator. Wewenang ditolak.'
    });
}

// Strict CSRF & Origin Guard for Mutation Endpoints (Poin 1, 2, 3)
function requireCsrf(req, res, next) {
    const csrfHeader = req.headers['x-csrf-token'];
    const origin = req.headers.origin;
    const host = req.headers.host;

    if (origin && host) {
        try {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                return res.status(403).json({ ok: false, error: 'CSRF_ORIGIN_MISMATCH', message: 'Permintaan ditolak: Origin mismatch.' });
            }
        } catch (_) {
            return res.status(403).json({ ok: false, error: 'CSRF_ORIGIN_INVALID', message: 'Permintaan ditolak: Header origin tidak valid.' });
        }
    }

    const expectedCsrf = req.session?.csrfToken || req.cookies?.uot_csrf;
    if (!csrfHeader || !expectedCsrf || csrfHeader !== expectedCsrf) {
        return res.status(403).json({
            ok: false,
            error: 'CSRF_INVALID',
            message: 'Token CSRF tidak valid atau tidak ditemukan.'
        });
    }

    return next();
}

// Helper to issue secure HttpOnly HTTP Cookie (Poin 4, 5, 15)
function setSessionCookie(res, token, csrfToken) {
    const maxAgeSec = 24 * 60 * 60; // 24 Hours
    const sessionCookie = [
        `uot_session=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${maxAgeSec}`
    ];
    if (IS_PRODUCTION) sessionCookie.push('Secure');

    const csrfCookie = [
        `uot_csrf=${encodeURIComponent(csrfToken || '')}`,
        'Path=/',
        'SameSite=Lax',
        `Max-Age=${maxAgeSec}`
    ];
    if (IS_PRODUCTION) csrfCookie.push('Secure');

    res.setHeader('Set-Cookie', [sessionCookie.join('; '), csrfCookie.join('; ')]);
}

function clearSessionCookie(res) {
    const clearSession = [
        'uot_session=',
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=0',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    ];
    const clearCsrf = [
        'uot_csrf=',
        'Path=/',
        'SameSite=Lax',
        'Max-Age=0',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    ];
    if (IS_PRODUCTION) {
        clearSession.push('Secure');
        clearCsrf.push('Secure');
    }
    res.setHeader('Set-Cookie', [clearSession.join('; '), clearCsrf.join('; ')]);
}

// Helper to sanitize payload and prevent client tampering of sensitive properties (Poin 14)
function sanitizeClientPayload(payload) {
    if (!payload || typeof payload !== 'object') return {};
    const clean = { ...payload };
    delete clean.role;
    delete clean.isPro;
    delete clean.userId;
    delete clean.subscription;
    delete clean.id;
    return clean;
}

// Apply authentication middleware to all API requests
app.use('/api', authenticate);
app.use('/v1', authenticate);

// -------------------------------------------------------------
// 1. SYSTEM & CONFIG STATUS API (Poin 15 & 16)
// -------------------------------------------------------------
app.get('/api/csrf-token', (req, res) => {
    let csrfToken = req.session?.csrfToken || req.cookies?.uot_csrf;
    if (!csrfToken) {
        csrfToken = crypto.randomBytes(24).toString('hex');
    }
    if (req.session) {
        req.session.csrfToken = csrfToken;
    }
    const maxAgeSec = 24 * 60 * 60;
    const csrfCookie = [
        `uot_csrf=${encodeURIComponent(csrfToken)}`,
        'Path=/',
        'SameSite=Lax',
        `Max-Age=${maxAgeSec}`
    ];
    if (IS_PRODUCTION) csrfCookie.push('Secure');
    res.setHeader('Set-Cookie', csrfCookie.join('; '));
    return res.json({ ok: true, csrfToken });
});

app.get('/api/health', (req, res) => {
    const mem = process.memoryUsage();
    const dbSize = fs.existsSync(path.join(__dirname, 'data', 'uot_db_store.json'))
        ? fs.statSync(path.join(__dirname, 'data', 'uot_db_store.json')).size
        : 0;

    res.json({
        status: 'ok',
        app: 'Universe Of Tech',
        schemaVersion: 6,
        timestamp: new Date().toISOString(),
        environment: APP_ENV,
        paymentConfigured: IS_PAYMENT_CONFIGURED,
        authAuthoritative: true,
        observability: {
            uptimeSeconds: Math.round(process.uptime()),
            memoryUsageRssMb: Math.round(mem.rss / (1024 * 1024)),
            databaseSizeBytes: dbSize,
            activeUsers: dbInstance.users.size,
            activeProgressRecords: dbInstance.progress.size,
            telemetryEvents: analyticsEngineInstance.events.length,
            telemetryErrors: analyticsEngineInstance.errors.length
        }
    });
});

app.get('/api/config/status', (req, res) => {
    res.json({
        ok: true,
        environment: APP_ENV,
        paymentGateway: {
            isConfigured: IS_PAYMENT_CONFIGURED,
            provider: IS_PAYMENT_CONFIGURED ? 'production_gateway' : 'unconfigured_sandbox_demo',
            mode: IS_PAYMENT_CONFIGURED ? 'production' : 'demo'
        },
        authMode: 'server-authoritative',
        sessionActive: Boolean(req.user),
        user: req.user || null
    });
});

// -------------------------------------------------------------
// 2. SERVER-AUTHORITATIVE AUTHENTICATION API (Poin 2, 4, 5, 15, 16, 17)
// -------------------------------------------------------------

// User Registration
app.post('/api/auth/register', rateLimiter({ max: 10, windowMs: 60000 }), requireCsrf, (req, res) => {
    const { username, email, password } = req.body || {};

    if (!username || typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 60) {
        return res.status(400).json({ ok: false, error: 'INVALID_USERNAME', message: 'Nama lengkap harus terdiri dari 2 - 60 karakter.' });
    }
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
        return res.status(400).json({ ok: false, error: 'INVALID_EMAIL', message: 'Format alamat email tidak valid.' });
    }
    if (!password || typeof password !== 'string' || !PASSWORD_POLICY_REGEX.test(password)) {
        return res.status(400).json({
            ok: false,
            error: 'INVALID_PASSWORD',
            message: 'Kata sandi minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka.'
        });
    }

    if (userStore.has(cleanEmail)) {
        return res.status(409).json({ ok: false, error: 'EMAIL_EXISTS', message: 'Alamat email sudah terdaftar. Silakan masuk.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = 'usr_' + crypto.randomBytes(12).toString('hex');
    const newUser = {
        id: userId,
        username: username.trim(),
        email: cleanEmail,
        passwordHash: hash,
        salt,
        role: 'user',
        isPro: false,
        createdAt: new Date().toISOString()
    };
    userStore.set(cleanEmail, newUser);

    // Rotate Session (Poin 15)
    if (req.session && req.session.sessionToken) {
        sessionStore.delete(req.session.sessionToken);
    }

    const sessionToken = 'uot_sess_' + crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours Expiration

    sessionStore.set(sessionToken, {
        sessionToken,
        userId,
        csrfToken,
        createdAt: Date.now(),
        expiresAt
    });

    setSessionCookie(res, sessionToken, csrfToken);

    // Response does NOT return sessionToken (Poin 4 & 5)
    return res.status(201).json({
        ok: true,
        message: 'Pendaftaran berhasil.',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            isPro: false
        },
        csrfToken
    });
});

// User Login
app.post('/api/auth/login', rateLimiter({ max: 10, windowMs: 60000 }), requireCsrf, (req, res) => {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
        return res.status(400).json({ ok: false, error: 'MISSING_CREDENTIALS', message: 'Email dan kata sandi wajib diisi.' });
    }

    const user = userStore.get(cleanEmail);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
        recordAuthFailure(req.ip, cleanEmail, 'INVALID_CREDENTIALS');
        return res.status(401).json({
            ok: false,
            error: 'INVALID_CREDENTIALS',
            message: 'Email atau kata sandi tidak valid.'
        });
    }

    // Rotate Session on login (Poin 15)
    if (req.session && req.session.sessionToken) {
        sessionStore.delete(req.session.sessionToken);
    }

    const sessionToken = 'uot_sess_' + crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours Expiration

    sessionStore.set(sessionToken, {
        sessionToken,
        userId: user.id,
        csrfToken,
        createdAt: Date.now(),
        expiresAt
    });

    setSessionCookie(res, sessionToken, csrfToken);

    const sub = subscriptionStore.get(user.id);
    const isPro = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);

    // Response does NOT return sessionToken to JavaScript (Poin 4 & 5)
    return res.json({
        ok: true,
        message: 'Login berhasil.',
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            isPro
        },
        csrfToken
    });
});

// Verify Session
app.post('/api/auth/verify-session', (req, res) => {
    if (!req.session || !req.user) {
        return res.status(401).json({
            ok: false,
            verified: false,
            message: 'Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.'
        });
    }

    return res.json({
        ok: true,
        verified: true,
        user: req.user,
        csrfToken: req.session.csrfToken,
        serverTime: new Date().toISOString(),
        expiresAt: new Date(req.session.expiresAt).toISOString()
    });
});

// Logout Invalidation (Poin 15)
app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.uot_session;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    } else if (req.session?.sessionToken) {
        token = req.session.sessionToken;
    }
    if (token) {
        sessionStore.delete(token);
    }
    clearSessionCookie(res);
    return res.json({ ok: true, message: 'Berhasil keluar.' });
});

// Password Reset Architecture (Poin 17: Explicit unavailable)
app.post('/api/auth/forgot-password', rateLimiter({ max: 5, windowMs: 60000 }), (req, res) => {
    return res.status(501).json({
        ok: false,
        error: 'NOT_CONFIGURED',
        message: 'Layanan pemulihan kata sandi via email belum dikonfigurasi pada server ini. Silakan hubungi administrator.'
    });
});

app.post('/api/auth/reset-password', rateLimiter({ max: 5, windowMs: 60000 }), (req, res) => {
    return res.status(501).json({
        ok: false,
        error: 'NOT_CONFIGURED',
        message: 'Layanan reset kata sandi belum dikonfigurasi pada server ini.'
    });
});

// Current User Profile
app.get('/api/user/profile', requireAuth, (req, res) => {
    return res.json({
        ok: true,
        user: req.user
    });
});

// -------------------------------------------------------------
// 3. SUBSCRIPTION & CHECKOUT HARDENING (Poin 3, 4, 11, 12, 13, 14, 16)
// -------------------------------------------------------------

function requirePro(req, res, next) {
    if (!req.session || !req.user) {
        return res.status(401).json({
            ok: false,
            error: 'UNAUTHORIZED',
            message: 'Autentikasi diperlukan.'
        });
    }
    if (!req.user.isPro) {
        return res.status(403).json({
            ok: false,
            error: 'PRO_REQUIRED',
            message: 'Fitur ini memerlukan keanggotaan PRO aktif.',
            upgradeUrl: 'payment.html?source=gating'
        });
    }
    next();
}

// Verify Subscription (Poin 3 — MUST NOT blindly return active=true)
app.post('/api/subscription/verify', (req, res) => {
    if (!req.user) {
        return res.json({
            ok: true,
            active: false,
            status: 'unauthenticated',
            isPro: false,
            message: 'Pengguna belum terautentikasi.'
        });
    }

    const sub = subscriptionStore.get(req.user.id);
    if (!sub || (sub.status !== 'active' && sub.status !== 'past_due') || Date.now() > sub.expiresAt) {
        return res.json({
            ok: true,
            active: false,
            status: sub ? sub.status : 'free',
            isPro: false,
            planId: 'free',
            isDemo: !IS_PAYMENT_CONFIGURED
        });
    }

    return res.json({
        ok: true,
        active: true,
        status: sub.status,
        isPro: true,
        planId: sub.planId,
        invoice: sub.providerSubscriptionId || sub.userId,
        expiresAt: new Date(sub.expiresAt).toISOString(),
        source: sub.source,
        isDemo: sub.source === 'sandbox_demo' || sub.source === 'sandbox',
        cancelAtPeriodEnd: !!sub.cancelAtPeriodEnd
    });
});

// Checkout Session Generator (Poin 16 — DO NOT fake real payment if unconfigured)
app.post('/v1/checkout/sessions', rateLimiter({ max: 15, windowMs: 60000 }), requireCsrf, async (req, res) => {
    const { planId = 'pro', source = 'direct' } = req.body || {};

    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Auth required' });
    }

    if (!IS_PAYMENT_CONFIGURED) {
        if (IS_PRODUCTION) {
            // Production environment must refuse sandbox checkouts if credentials are missing
            return res.status(503).json({
                status: 'error',
                error: 'EXTERNAL_CREDENTIAL_REQUIRED',
                message: 'IMPLEMENTATION READY — EXTERNAL CREDENTIAL REQUIRED'
            });
        }

        // Explicitly return sandbox demo checkout (Poin 13, 14, 16)
        const result = await paymentProviderInstance.createCheckout({
            planId,
            userId: req.user.id,
            email: req.user.email,
            successUrl: `${req.protocol}://${req.get('host')}/pro-hub.html`,
            cancelUrl: `${req.protocol}://${req.get('host')}/payment.html?status=cancel`
        });

        // Store Invoice History (Poin 17)
        dbInstance.invoices.create({
            id: result.reference,
            userId: req.user.id,
            planId,
            amount: PLANS[planId]?.price || 0,
            currency: 'IDR',
            status: 'pending',
            provider: 'sandbox'
        });

        return res.json({
            status: 'ok',
            mode: 'sandbox_demo',
            isDemo: true,
            providerConfigured: false,
            message: 'Payment provider belum dikonfigurasi. Menggunakan sandbox simulasi demo tanpa kartu nyata.',
            checkoutUrl: result.checkoutUrl,
            reference: result.reference
        });
    }

    try {
        const successUrl = `${req.protocol}://${req.get('host')}/pro-hub.html?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${req.protocol}://${req.get('host')}/payment.html?status=cancel`;

        const result = await paymentProviderInstance.createCheckout({
            planId,
            userId: req.user.id,
            email: req.user.email,
            successUrl,
            cancelUrl
        });

        // Store Invoice History (Poin 17)
        dbInstance.invoices.create({
            id: result.reference,
            userId: req.user.id,
            planId,
            amount: PLANS[planId]?.price || 0,
            currency: 'IDR',
            status: 'pending',
            provider: 'stripe'
        });

        return res.json({
            status: 'ok',
            mode: 'production',
            isDemo: false,
            providerConfigured: true,
            checkoutUrl: result.checkoutUrl,
            reference: result.reference
        });
    } catch (err) {
        console.error('Stripe checkout error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: 'Gagal membuat checkout session: ' + err.message
        });
    }
});

// Explicit Sandbox Activation for Demo Mode (Poin 13 & 14)
app.post('/api/subscription/sandbox-activate', rateLimiter({ max: 10, windowMs: 60000 }), requireCsrf, (req, res) => {
    if (IS_PRODUCTION) {
        return res.status(403).json({
            ok: false,
            error: 'SANDBOX_DISABLED',
            message: 'Aktivasi sandbox tidak diizinkan pada environment produksi.'
        });
    }

    const { planId = 'pro', promoCode = '' } = req.body || {};
    const userId = req.user ? req.user.id : 'usr_guest_demo';
    const durationDays = planId === 'annual' ? 365 : 30;
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

    const demoSub = {
        userId,
        planId,
        status: 'active',
        source: 'sandbox_demo',
        startsAt: new Date().toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        providerCustomerId: 'cust_sandbox_' + crypto.randomBytes(4).toString('hex'),
        providerSubscriptionId: 'sub_sandbox_' + crypto.randomBytes(4).toString('hex'),
        cancelAtPeriodEnd: false
    };

    subscriptionStore.set(userId, demoSub);

    // Update users table
    if (req.user) {
        dbInstance.run('UPDATE users SET is_pro = 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), userId]);
    }

    // Save invoice
    const reference = 'SANDBOX-ACTIVATE-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    dbInstance.invoices.create({
        id: reference,
        userId,
        planId,
        amount: PLANS[planId]?.price || 0,
        currency: 'IDR',
        status: 'paid',
        provider: 'sandbox'
    });

    return res.json({
        ok: true,
        mode: 'sandbox_demo',
        isDemo: true,
        message: 'Akselerasi Pro simulasi aktif (Sandbox Demo).',
        subscription: {
            ...demoSub,
            invoice: reference,
            expiresAt: new Date(expiresAt).toISOString()
        }
    });
});

// Subscription Cancellation (Poin 18)
app.post('/api/subscription/cancel', requireAuth, requireCsrf, async (req, res) => {
    const sub = subscriptionStore.get(req.user.id);
    if (!sub || sub.status !== 'active') {
        return res.status(400).json({ ok: false, error: 'NO_ACTIVE_SUBSCRIPTION', message: 'Anda tidak memiliki langganan PRO aktif.' });
    }

    if (sub.source === 'stripe' && IS_PAYMENT_CONFIGURED && sub.providerSubscriptionId) {
        try {
            await paymentProviderInstance.cancelSubscription(sub.providerSubscriptionId);
            subscriptionStore.set(req.user.id, {
                ...sub,
                cancelAtPeriodEnd: true
            });
            return res.json({ ok: true, message: 'Langganan Anda akan dibatalkan pada akhir periode tagihan.' });
        } catch (e) {
            return res.status(500).json({ ok: false, error: 'PROVIDER_ERROR', message: e.message });
        }
    } else {
        // Sandbox cancellation
        subscriptionStore.set(req.user.id, {
            ...sub,
            cancelAtPeriodEnd: true,
            status: 'canceled'
        });
        dbInstance.run('UPDATE users SET is_pro = 0, updated_at = ? WHERE id = ?', [new Date().toISOString(), req.user.id]);
        return res.json({ ok: true, message: 'Langganan sandbox simulasi dibatalkan.' });
    }
});

// Subscription Billing Invoice History (Poin 17)
app.get('/api/subscription/history', requireAuth, (req, res) => {
    const invoices = dbInstance.invoices.getByUserId(req.user.id);
    return res.json({
        ok: true,
        invoices
    });
});

// Webhook endpoint (Poin 5, 6, 7)
app.post('/api/payment/webhook', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

    let event;
    try {
        event = await paymentProviderInstance.verifyWebhook(rawBody, req.headers);
    } catch (err) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: 'INVALID_SIGNATURE', message: err.message });
    }

    const db = dbInstance;

    // Idempotency check (Poin 7)
    if (isWebhookProcessed(db, event.id)) {
        console.log(`[Webhook] Duplicate event ignored: ${event.id}`);
        return res.json({ received: true, duplicate: true });
    }

    try {
        const dataObject = event.data.object;

        switch (event.type) {
            case 'checkout.session.completed': {
                const userId = dataObject.client_reference_id || dataObject.metadata?.userId;
                const planId = dataObject.metadata?.planId || 'pro';
                const subId = dataObject.subscription;
                const custId = dataObject.customer;
                const reference = dataObject.metadata?.reference;

                if (!userId) {
                    throw new Error('No user associated with checkout session');
                }

                let startsAt = new Date().toISOString();
                let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                if (planId === 'annual') {
                    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
                }

                if (IS_PAYMENT_CONFIGURED && subId) {
                    try {
                        const stripeSub = await paymentProviderInstance.getSubscription(subId);
                        startsAt = stripeSub.currentPeriodStart;
                        expiresAt = stripeSub.currentPeriodEnd;
                    } catch (e) {
                        console.error('Failed to retrieve subscription periods from Stripe:', e.message);
                    }
                }

                subscriptionStore.set(userId, {
                    planId,
                    status: 'active',
                    source: IS_PAYMENT_CONFIGURED ? 'stripe' : 'sandbox',
                    startsAt,
                    expiresAt,
                    providerCustomerId: custId,
                    providerSubscriptionId: subId,
                    cancelAtPeriodEnd: false
                });

                db.run('UPDATE users SET is_pro = 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), userId]);

                const invId = reference || 'INV-' + crypto.randomBytes(6).toString('hex').toUpperCase();
                db.invoices.create({
                    id: invId,
                    userId,
                    planId,
                    amount: PLANS[planId]?.price || 0,
                    currency: 'IDR',
                    status: 'paid',
                    provider: IS_PAYMENT_CONFIGURED ? 'stripe' : 'sandbox'
                });
                break;
            }

            case 'invoice.paid': {
                const subId = dataObject.subscription;
                if (subId && IS_PAYMENT_CONFIGURED) {
                    try {
                        const stripeSub = await paymentProviderInstance.getSubscription(subId);
                        const subRow = db.get('SELECT user_id FROM subscriptions WHERE provider_subscription_id = ?', [subId]);
                        if (subRow) {
                            subscriptionStore.set(subRow.user_id, {
                                planId: stripeSub.planId,
                                status: stripeSub.status,
                                source: 'stripe',
                                startsAt: stripeSub.currentPeriodStart,
                                expiresAt: stripeSub.currentPeriodEnd,
                                providerCustomerId: dataObject.customer,
                                providerSubscriptionId: subId,
                                cancelAtPeriodEnd: stripeSub.cancelAtPeriodEnd ? 1 : 0
                            });
                            const isProActive = stripeSub.status === 'active';
                            db.run('UPDATE users SET is_pro = ?, updated_at = ? WHERE id = ?', [isProActive ? 1 : 0, new Date().toISOString(), subRow.user_id]);
                        }
                    } catch (e) {
                        console.error('invoice.paid process failure:', e.message);
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subId = dataObject.id;
                if (subId && IS_PAYMENT_CONFIGURED) {
                    try {
                        const stripeSub = await paymentProviderInstance.getSubscription(subId);
                        const subRow = db.get('SELECT user_id FROM subscriptions WHERE provider_subscription_id = ?', [subId]);
                        if (subRow) {
                            subscriptionStore.set(subRow.user_id, {
                                planId: stripeSub.planId,
                                status: stripeSub.status,
                                source: 'stripe',
                                startsAt: stripeSub.currentPeriodStart,
                                expiresAt: stripeSub.currentPeriodEnd,
                                providerCustomerId: dataObject.customer,
                                providerSubscriptionId: subId,
                                cancelAtPeriodEnd: stripeSub.cancelAtPeriodEnd ? 1 : 0
                            });
                            const isProActive = stripeSub.status === 'active';
                            db.run('UPDATE users SET is_pro = ?, updated_at = ? WHERE id = ?', [isProActive ? 1 : 0, new Date().toISOString(), subRow.user_id]);
                        }
                    } catch (e) {
                        console.error('subscription.updated process failure:', e.message);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subId = dataObject.id;
                const subRow = db.get('SELECT user_id FROM subscriptions WHERE provider_subscription_id = ?', [subId]);
                if (subRow) {
                    subscriptionStore.set(subRow.user_id, {
                        planId: 'pro',
                        status: 'expired',
                        source: IS_PAYMENT_CONFIGURED ? 'stripe' : 'sandbox',
                        startsAt: new Date().toISOString(),
                        expiresAt: new Date().toISOString(),
                        providerCustomerId: dataObject.customer,
                        providerSubscriptionId: subId,
                        cancelAtPeriodEnd: 1
                    });
                    db.run('UPDATE users SET is_pro = 0, updated_at = ? WHERE id = ?', [new Date().toISOString(), subRow.user_id]);
                }
                break;
            }
        }

        markWebhookProcessed(db, event.id);
        return res.json({ received: true });
    } catch (err) {
        console.error('[Webhook] Processing error:', err.message);
        return res.status(500).json({ error: 'PROCESSING_ERROR', message: err.message });
    }
});

// -------------------------------------------------------------
// 4. USER DATA & LEARNING STATE ISOLATION (Poin 17 & 18)
// -------------------------------------------------------------
app.get('/v1/learning-state', (req, res) => {
    if (!req.user) {
        return res.json({
            status: 'ok',
            mode: 'guest',
            state: null,
            updatedAt: null
        });
    }

    const record = learningStateStore.get(req.user.id) || { state: {}, updatedAt: null };
    return res.json({
        status: 'ok',
        userId: req.user.id,
        state: record.state,
        updatedAt: record.updatedAt
    });
});

app.put('/v1/learning-state', rateLimiter({ max: 60, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const { state } = req.body || {};
    const updatedAt = new Date().toISOString();

    learningStateStore.set(req.user.id, {
        state: state || {},
        updatedAt
    });

    return res.json({
        status: 'ok',
        userId: req.user.id,
        updatedAt
    });
});

// -------------------------------------------------------------
// 5. FASE 11 — CLOUD SAVE, SYNC & AUTHORITATIVE PROGRESS APIs
// -------------------------------------------------------------

// GET /api/me (Current User Profile & Summary Progress)
app.get('/api/me', (req, res) => {
    if (!req.user) {
        return res.json({
            ok: false,
            authenticated: false,
            user: null,
            message: 'Pengguna belum terautentikasi.'
        });
    }

    const progress = dbInstance.getUserProgress(req.user.id);
    const sub = subscriptionStore.get(req.user.id);
    const isPro = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);

    return res.json({
        ok: true,
        authenticated: true,
        user: {
            ...req.user,
            isPro
        },
        summary: {
            level: progress.level,
            lifetimeXp: progress.lifetimeXp,
            coins: progress.coins,
            streak: progress.streak,
            achievementsCount: progress.achievements.length,
            inventoryCount: progress.inventory.length
        }
    });
});

// GET /api/progress (Authoritative User Progress Document)
app.get('/api/progress', (req, res) => {
    const userId = req.user ? req.user.id : 'usr_demo_7701';
    const progress = dbInstance.getUserProgress(userId);

    return res.json({
        ok: true,
        userId,
        progress: dbInstance.sanitizeProgressForResponse(progress)
    });
});

// GET /api/mastery (Adaptive Academic Skill Mastery Breakdown)
app.get('/api/mastery', (req, res) => {
    const userId = req.user ? req.user.id : 'usr_demo_7701';
    const mastery = dbInstance.getUserMastery(userId);

    return res.json({
        ok: true,
        userId,
        mastery
    });
});

// GET /api/recommendations (Adaptive Learning Recommendations & Remedial Status)
app.get('/api/recommendations', (req, res) => {
    const userId = req.user ? req.user.id : 'usr_demo_7701';
    const recommendations = dbInstance.getUserRecommendations(userId);

    return res.json({
        ok: true,
        userId,
        recommendations
    });
});

// POST /api/recommendations/interaction (Track Recommendation Clicks, Remedial Starts, Diagnostics)
app.post('/api/recommendations/interaction', rateLimiter({ max: 60, windowMs: 60000 }), (req, res) => {
    const userId = req.user ? req.user.id : (req.body?.userId || 'usr_demo_7701');
    const { interactionType, recommendationId, metadata } = req.body || {};

    if (!interactionType || !recommendationId) {
        return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD", message: "interactionType dan recommendationId diperlukan." });
    }

    const result = dbInstance.recordRecommendationInteraction(userId, interactionType, recommendationId, metadata);

    // Auto-record telemetry event
    if (analyticsEngineInstance && typeof analyticsEngineInstance.recordEvent === 'function') {
        analyticsEngineInstance.recordEvent({
            event: interactionType,
            timestamp: new Date().toISOString(),
            userId,
            properties: {
                recommendationId,
                ...(metadata || {})
            }
        });
    }

    return res.json(result);
});

// POST /api/progress/events (Process Activity Events with Validation & Idempotency)
app.post('/api/progress/events', rateLimiter({ max: 60, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const userId = req.user.id;
    const event = sanitizeClientPayload(req.body || {});

    const result = dbInstance.processActivityEvent(userId, event);
    if (!result.ok) {
        return res.status(400).json(result);
    }

    // Auto-Record to Centralized Telemetry
    if (event && event.eventType) {
        analyticsEngineInstance.recordEvent({
            event: event.eventType,
            timestamp: event.timestamp || new Date().toISOString(),
            userId,
            properties: event.payload || {}
        });
    }

    return res.json(result);
});

// POST /api/progress/sync (Batch Event Sync & One-Time Migration)
app.post('/api/progress/sync', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const userId = req.user.id;
    const { events = [], legacyData = null } = req.body || {};

    const cleanLegacyData = sanitizeClientPayload(legacyData);
    const result = dbInstance.syncProgress(userId, { events, legacyData: cleanLegacyData });
    return res.json(result);
});

// GET /api/achievements (Catalog & Unlocked Status)
app.get('/api/achievements', (req, res) => {
    const userId = req.user ? req.user.id : 'usr_demo_7701';
    const progress = dbInstance.getUserProgress(userId);
    const unlockedSet = new Set(progress.achievements || []);

    const catalog = ACHIEVEMENTS_CATALOG.map(item => ({
        ...item,
        unlocked: unlockedSet.has(item.id)
    }));

    return res.json({
        ok: true,
        total: catalog.length,
        unlockedCount: unlockedSet.size,
        achievements: catalog
    });
});

// GET /api/inventory (Unlocked Items & Equipped State)
app.get('/api/inventory', (req, res) => {
    const userId = req.user ? req.user.id : 'usr_demo_7701';
    const progress = dbInstance.getUserProgress(userId);

    return res.json({
        ok: true,
        coins: progress.coins,
        inventory: progress.inventory,
        equippedItems: progress.equippedItems
    });
});

// PATCH /api/settings (Update User Settings)
app.patch('/api/settings', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const userId = req.user.id;
    const patch = sanitizeClientPayload(req.body || {});

    const result = dbInstance.updateSettings(userId, patch);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// POST /api/inventory/equip (Equip Owned Items)
app.post('/api/inventory/equip', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const userId = req.user.id;
    const { avatar, theme, accent } = req.body || {};

    const result = dbInstance.equipItem(userId, { avatar, theme, accent });
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// -------------------------------------------------------------
// 6. FASE 14 — SOCIAL LEARNING, REAL LEADERBOARD & COMPETITIVE SYSTEM APIs
// -------------------------------------------------------------

// GET /api/social/leaderboard (Real Server-Calculated Leaderboard)
app.get('/api/social/leaderboard', (req, res) => {
    const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
    const { period = 'weekly', cohort = 'global', page = 1, limit = 20 } = req.query || {};
    const result = dbInstance.getLeaderboard({ period, cohort, page, limit, currentUserId });
    return res.json(result);
});

// GET /api/social/profile/:targetUserId (Public/Private Social Profile)
app.get('/api/social/profile/:targetUserId', (req, res) => {
    const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
    const { targetUserId } = req.params;
    const result = dbInstance.getSocialProfile(targetUserId, currentUserId);
    if (!result.ok) {
        return res.status(404).json(result);
    }
    return res.json(result);
});

// POST /api/social/follow (Follow User)
app.post('/api/social/follow', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body || {};
    const result = dbInstance.followUser(currentUserId, targetUserId);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// POST /api/social/unfollow (Unfollow User)
app.post('/api/social/unfollow', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body || {};
    const result = dbInstance.unfollowUser(currentUserId, targetUserId);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// GET /api/social/friends (Friends/Following List)
app.get('/api/social/friends', (req, res) => {
    const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
    const progress = dbInstance.getUserProgress(currentUserId);
    if (!progress) return res.status(404).json({ ok: false, error: "USER_NOT_FOUND" });

    const followingProfiles = (progress.following || []).map(id => dbInstance.getSocialProfile(id, currentUserId)).filter(r => r.ok);
    const followerProfiles = (progress.followers || []).map(id => dbInstance.getSocialProfile(id, currentUserId)).filter(r => r.ok);

    return res.json({
        ok: true,
        following: followingProfiles,
        followers: followerProfiles
    });
});

// GET /api/social/challenges (Weekly Learning Challenges Status)
app.get('/api/social/challenges', (req, res) => {
    const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
    const result = dbInstance.getChallenges(currentUserId);
    return res.json(result);
});

// POST /api/social/challenges/claim (Claim Weekly Challenge Reward)
app.post('/api/social/challenges/claim', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const { challengeId } = req.body || {};
    const result = dbInstance.claimChallengeReward(currentUserId, challengeId);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// POST /api/social/friend-challenge/create (Create 1v1 Friend Learning Challenge)
app.post('/api/social/friend-challenge/create', rateLimiter({ max: 20, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const { targetUserId, challengeType, targetGoal } = req.body || {};
    const result = dbInstance.createFriendChallenge(currentUserId, targetUserId, { challengeType, targetGoal });
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// POST /api/social/friend-challenge/accept (Accept Friend Challenge)
app.post('/api/social/friend-challenge/accept', rateLimiter({ max: 20, windowMs: 60000 }), requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const { challengeId } = req.body || {};
    const result = dbInstance.acceptFriendChallenge(currentUserId, challengeId);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    return res.json(result);
});

// GET /api/social/notifications (Non-Spam User Notifications)
app.get('/api/social/notifications', (req, res) => {
    const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
    const result = dbInstance.getNotifications(currentUserId);
    return res.json(result);
});

// POST /api/social/notifications/read (Mark Notifications Read)
app.post('/api/social/notifications/read', requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const result = dbInstance.markNotificationsRead(currentUserId);
    return res.json(result);
});

// PATCH /api/progress/settings (Update Progress Settings)
app.patch('/api/progress/settings', requireAuth, requireCsrf, (req, res) => {
    const currentUserId = req.user.id;
    const patch = sanitizeClientPayload(req.body || {});
    const result = dbInstance.updateSettings(currentUserId, patch);
    return res.json(result);
});

// -------------------------------------------------------------
// 7. FASE 15 — PRODUCT ANALYTICS, OBSERVABILITY & FEATURE FLAGS APIs
// -------------------------------------------------------------

// POST /api/analytics/event (Ingest Telemetry Event)
app.post('/api/analytics/event', rateLimiter({ max: 120, windowMs: 60000 }), (req, res) => {
    const { event, timestamp, sessionId, userId, properties, userConsent } = req.body || {};
    const effectiveUserId = req.user ? req.user.id : (userId || 'anon_usr');

    const result = analyticsEngineInstance.recordEvent({
        event,
        timestamp,
        sessionId,
        userId: effectiveUserId,
        properties,
        userConsent: userConsent !== false
    });

    return res.json(result);
});

// POST /api/analytics/error (Ingest Error Telemetry)
app.post('/api/analytics/error', rateLimiter({ max: 60, windowMs: 60000 }), (req, res) => {
    const { errorType, message, stack, route, userAgent, sessionId, userId } = req.body || {};
    const effectiveUserId = req.user ? req.user.id : (userId || 'anon_usr');

    const result = analyticsEngineInstance.recordError({
        errorType,
        message,
        stack,
        route,
        userAgent,
        sessionId,
        userId: effectiveUserId
    });

    return res.json(result);
});

// POST /api/analytics/vitals (Ingest Web Vitals Performance Telemetry)
app.post('/api/analytics/vitals', rateLimiter({ max: 120, windowMs: 60000 }), (req, res) => {
    const { metric, value, rating, page, deviceType, sessionId } = req.body || {};

    const result = analyticsEngineInstance.recordVitals({
        metric,
        value,
        rating,
        page,
        deviceType,
        sessionId
    });

    return res.json(result);
});

// GET /api/feature-flags (Evaluate Feature Flags for Client)
app.get('/api/feature-flags', (req, res) => {
    const userId = req.user ? req.user.id : 'anon_usr';
    const sessionId = req.headers['x-session-id'] || 'sess_default';

    const result = analyticsEngineInstance.getFeatureFlagsForUser(userId, sessionId);
    return res.json({ ok: true, ...result });
});

// Admin: GET /api/admin/analytics (Centralized Analytics Dashboard Data)
app.get('/api/admin/analytics', requireAdmin, (req, res) => {
    const funnel = analyticsEngineInstance.getFunnelMetrics();
    const learning = analyticsEngineInstance.getLearningMetrics();
    const difficultContent = analyticsEngineInstance.getDifficultContentFlags();
    const errors = analyticsEngineInstance.getErrorTelemetrySummary();
    const vitals = analyticsEngineInstance.getPerformanceTelemetrySummary();

    return res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        funnel,
        learning,
        difficultContent,
        errors,
        vitals
    });
});

// Admin: GET /api/admin/observability (Health Monitoring & Telemetry Detail)
app.get('/api/admin/observability', requireAdmin, (req, res) => {
    const mem = process.memoryUsage();
    const dbSize = fs.existsSync(path.join(__dirname, 'data', 'uot_db_store.json'))
        ? fs.statSync(path.join(__dirname, 'data', 'uot_db_store.json')).size
        : 0;

    return res.json({
        ok: true,
        health: {
            backend: {
                status: 'healthy',
                uptimeSeconds: Math.round(process.uptime()),
                memoryUsageRssMb: Math.round(mem.rss / (1024 * 1024)),
                memoryHeapMb: Math.round(mem.heapUsed / (1024 * 1024)),
                nodeVersion: process.version,
                env: APP_ENV
            },
            database: {
                status: 'healthy',
                storeSizeBytes: dbSize,
                schemaVersion: 6,
                totalUsers: dbInstance.users.size,
                totalProgressRecords: dbInstance.progress.size
            },
            telemetry: {
                totalEvents: analyticsEngineInstance.events.length,
                totalErrors: analyticsEngineInstance.errors.length,
                totalVitals: analyticsEngineInstance.vitals.length
            }
        },
        errorsSummary: analyticsEngineInstance.getErrorTelemetrySummary(),
        vitalsSummary: analyticsEngineInstance.getPerformanceTelemetrySummary()
    });
});

// Admin: POST /api/admin/feature-flags (Update Feature Flags State)
app.post('/api/admin/feature-flags', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, (req, res) => {
    const { key, enabled } = req.body || {};
    if (!key) return res.status(400).json({ ok: false, error: 'MISSING_KEY' });

    const result = analyticsEngineInstance.updateFeatureFlag(key, { enabled });
    return res.json(result);
});

// -------------------------------------------------------------
// 7. FASE 20 — CONTENT MANAGEMENT & RUNTIME MIGRATION APIs
// -------------------------------------------------------------

// Public: GET /api/content/version & GET /api/content/meta (Version & cache sync)
app.get(['/api/content/version', '/api/content/meta'], (req, res) => {
    const meta = contentRepository ? contentRepository.getMeta() : { version: Date.now(), counts: {} };
    return res.json({
        ok: true,
        version: meta.version,
        engineVersion: ContentEngine.ENGINE_VERSION,
        timestamp: meta.timestamp || new Date().toISOString(),
        counts: meta.counts
    });
});

// Public: GET /api/content/all (Published content bundle)
app.get('/api/content/all', (req, res) => {
    if (contentRepository) {
        return res.json({
            ok: true,
            version: contentRepository.contentVersion,
            engineVersion: ContentEngine.ENGINE_VERSION,
            content: {
                quizzes: contentRepository.getAll('quizzes', { includeDrafts: false }),
                lessons: contentRepository.getAll('lessons', { includeDrafts: false }),
                learningPaths: contentRepository.getAll('learningPaths', { includeDrafts: false }),
                projects: contentRepository.getAll('projects', { includeDrafts: false }),
                culture: contentRepository.getAll('culture', { includeDrafts: false }),
                books: contentRepository.getAll('books', { includeDrafts: false })
            }
        });
    }

    return res.json({
        ok: true,
        version: ContentEngine.ENGINE_VERSION,
        content: {
            quizzes: ContentEngine.getAll('quizzes'),
            lessons: ContentEngine.getAll('lessons'),
            learningPaths: ContentEngine.getAll('learningPaths'),
            projects: ContentEngine.getAll('projects'),
            culture: ContentEngine.getAll('culture'),
            books: ContentEngine.getAll('books')
        }
    });
});

// Public: GET /api/content/quizzes/questions (Query filtered quiz questions without massive payload)
app.get('/api/content/quizzes/questions', (req, res) => {
    const { category, difficulty, limit = 10, skill, search } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    if (contentRepository) {
        const questions = contentRepository.queryQuestions({
            category: category ? String(category) : null,
            difficulty: difficulty ? String(difficulty) : null,
            limit: limitNum,
            skill: skill ? String(skill) : null,
            search: search ? String(search) : null
        });
        return res.json({ ok: true, count: questions.length, questions });
    }

    const questions = ContentEngine.getQuestions({
        category: category ? String(category) : null,
        difficulty: difficulty ? String(difficulty) : null,
        limit: limitNum,
        skill: skill ? String(skill) : null,
        search: search ? String(search) : null
    });
    return res.json({ ok: true, count: questions.length, questions });
});

// Public: GET /api/content/:domain (List items with pagination & filters)
app.get('/api/content/:domain', (req, res) => {
    const { domain } = req.params;
    const { category, difficulty, skill, search, limit, offset } = req.query;
    const normDomain = ContentEngine.normalizeDomain ? ContentEngine.normalizeDomain(domain) : domain;

    const limitNum = limit ? Math.min(500, Math.max(1, parseInt(limit, 10) || 20)) : null;
    const offsetNum = offset ? Math.max(0, parseInt(offset, 10) || 0) : 0;

    let items = [];
    if (contentRepository) {
        items = contentRepository.getAll(normDomain, {
            includeDrafts: false,
            category: category ? String(category) : null,
            difficulty: difficulty ? String(difficulty) : null,
            skill: skill ? String(skill) : null,
            search: search ? String(search) : null,
            limit: limitNum,
            offset: offsetNum
        });
    } else {
        items = ContentEngine.getAll(normDomain, {
            includeDrafts: false,
            category: category ? String(category) : null,
            difficulty: difficulty ? String(difficulty) : null,
            skill: skill ? String(skill) : null,
            search: search ? String(search) : null,
            limit: limitNum,
            offset: offsetNum
        });
    }

    return res.json({ ok: true, domain: normDomain, count: items.length, items });
});

// Public: GET /api/content/:domain/:id (Fetch single item with fallback protection)
app.get('/api/content/:domain/:id', (req, res) => {
    const { domain, id } = req.params;
    const normDomain = ContentEngine.normalizeDomain ? ContentEngine.normalizeDomain(domain) : domain;

    let item = null;
    if (contentRepository) {
        item = contentRepository.get(normDomain, id, { includeDrafts: false });
    }

    if (!item) {
        if (normDomain === 'lessons') item = ContentEngine.getLesson(id);
        else if (normDomain === 'quizzes') item = ContentEngine.getQuiz(id);
        else if (normDomain === 'projects') item = ContentEngine.getProject(id);
        else if (normDomain === 'learningPaths') item = ContentEngine.getLearningPath(id);
        else if (normDomain === 'culture') item = ContentEngine.getCulture(id);
        else if (normDomain === 'books') item = ContentEngine.getBook(id);
    }

    if (!item) {
        return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    }
    return res.json({ ok: true, domain: normDomain, item });
});

// Admin: GET /api/admin/content (List all content including drafts)
app.get('/api/admin/content', requireAdmin, (req, res) => {
    const bundle = contentRepository ? contentRepository.exportAll() : ContentEngine.exportAll();
    const audit = ContentEngine.validateAll();
    const meta = contentRepository ? contentRepository.getMeta() : { counts: {} };

    return res.json({
        ok: true,
        meta,
        content: bundle,
        audit
    });
});

// Admin: POST /api/admin/content/save (Create or update content with validation)
app.post('/api/admin/content/save', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, (req, res) => {
    const { domain, item } = req.body || {};
    if (!domain || !item || !item.id) {
        return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain dan objek item wajib diisi.' });
    }

    const normDomain = ContentEngine.normalizeDomain ? ContentEngine.normalizeDomain(domain) : domain;

    // Standardized Schema Validation
    let validation = { valid: true, errors: [] };
    if (normDomain === 'quizzes') validation = ContentEngine.validateQuiz(item);
    else if (normDomain === 'lessons') validation = ContentEngine.validateLesson(item);
    else if (normDomain === 'projects') validation = ContentEngine.validateProject(item);
    else if (normDomain === 'learningPaths') validation = ContentEngine.validateLearningPath(item);
    else if (normDomain === 'culture') validation = ContentEngine.validateCulture(item);
    else if (normDomain === 'books') validation = ContentEngine.validateBook(item);

    if (!validation.valid) {
        return res.status(422).json({
            ok: false,
            error: 'VALIDATION_FAILED',
            message: 'Validasi skema konten gagal.',
            errors: validation.errors
        });
    }

    let savedItem = null;
    if (contentRepository) {
        savedItem = contentRepository.save(normDomain, item);
        ContentEngine.registerContent(normDomain, [savedItem]);
    } else {
        item.status = item.status || 'published';
        item.version = (item.version || 1) + 1;
        item.updatedAt = new Date().toISOString();
        ContentEngine.registerContent(normDomain, [item]);
        saveDomainContentToDisk(normDomain);
        savedItem = item;
    }

    return res.json({
        ok: true,
        message: `Konten '${item.id}' berhasil disimpan di domain '${normDomain}'.`,
        item: savedItem
    });
});

// Admin: POST /api/admin/content/publish (Toggle draft vs published state)
app.post('/api/admin/content/publish', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, (req, res) => {
    const { domain, id, status } = req.body || {};
    if (!domain || !id || !status) {
        return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain, ID, dan status wajib diisi.' });
    }

    const normDomain = ContentEngine.normalizeDomain ? ContentEngine.normalizeDomain(domain) : domain;
    const targetStatus = status === 'draft' ? 'draft' : 'published';

    let item = null;
    if (contentRepository) {
        item = contentRepository.publish(normDomain, id, targetStatus);
        if (item) ContentEngine.registerContent(normDomain, [item]);
    } else {
        if (normDomain === 'lessons') item = ContentEngine.getLesson(id);
        else if (normDomain === 'quizzes') item = ContentEngine.getQuiz(id);
        else if (normDomain === 'projects') item = ContentEngine.getProject(id);
        if (item && !item.isFallback) {
            item.status = targetStatus;
            item.updatedAt = new Date().toISOString();
            saveDomainContentToDisk(normDomain);
        }
    }

    if (!item || item.isFallback) {
        return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Item tidak ditemukan.' });
    }

    return res.json({
        ok: true,
        message: `Status konten '${id}' diubah menjadi '${item.status}'.`,
        item
    });
});

// Admin: POST /api/admin/content/delete (Delete content item)
app.post('/api/admin/content/delete', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, (req, res) => {
    const { domain, id } = req.body || {};
    if (!domain || !id) {
        return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain dan ID wajib diisi.' });
    }

    const normDomain = ContentEngine.normalizeDomain ? ContentEngine.normalizeDomain(domain) : domain;
    let deleted = false;
    if (contentRepository) {
        deleted = contentRepository.delete(normDomain, id);
    }
    return res.json({ ok: true, deleted, message: deleted ? `Konten '${id}' berhasil dihapus.` : `Konten '${id}' tidak ditemukan.` });
});

// Admin: GET /api/admin/content/validate (Run automated diagnostic audit)
app.get('/api/admin/content/validate', requireAdmin, (req, res) => {
    const audit = ContentEngine.validateAll();
    return res.json({ ok: true, audit });
});

// Admin: POST /api/admin/content/import (Import batch JSON bundle)
app.post('/api/admin/content/import', rateLimiter({ max: 10, windowMs: 60000 }), requireAdmin, requireCsrf, (req, res) => {
    const { bundle } = req.body || {};
    let count = 0;
    if (contentRepository) {
        const importRes = contentRepository.importBundle(bundle);
        count = importRes.count || 0;
        ContentEngine.importBundle(bundle);
    } else {
        const result = ContentEngine.importBundle(bundle);
        if (!result.success) {
            return res.status(400).json({ ok: false, error: 'IMPORT_FAILED', message: result.message });
        }
        count = result.importedCount;
        ['quizzes', 'lessons', 'projects', 'learningPaths', 'culture', 'books'].forEach(saveDomainContentToDisk);
    }

    return res.json({
        ok: true,
        message: `Berhasil mengimpor ${count} item konten.`,
        importedCount: count
    });
});

// Admin: GET /api/admin/content/export (Export entire content registry)
app.get('/api/admin/content/export', requireAdmin, (req, res) => {
    const bundle = contentRepository ? contentRepository.exportAll() : ContentEngine.exportAll();
    return res.json({ ok: true, bundle });
});

// Admin: POST /api/admin/content/migrate (Run content migration tool)
app.post('/api/admin/content/migrate', rateLimiter({ max: 5, windowMs: 60000 }), requireAdmin, requireCsrf, (req, res) => {
    try {
        const migrator = new ContentMigrationTool();
        const result = migrator.runMigration();
        if (contentRepository && result.bundle) {
            contentRepository.importBundle(result.bundle);
            ContentEngine.importBundle(result.bundle);
        }
        return res.json({
            ok: true,
            message: 'Migrasi seluruh konten berhasil diselesaikan.',
            stats: result.stats
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            error: 'MIGRATION_ERROR',
            message: err.message
        });
    }
});

// -------------------------------------------------------------
// FASE 18 — DATABASE & PERSISTENCE ADMIN ENDPOINTS
// -------------------------------------------------------------

// Admin: GET /api/admin/db/status (Database diagnostics & health)
app.get('/api/admin/db/status', requireAdmin, (req, res) => {
    try {
        const { db, userRepository, sessionRepository, analyticsRepository } = require('./db');
        const userCount = userRepository.count();
        const eventCountRow = db.get('SELECT COUNT(*) as count FROM progress_events');
        const quizCountRow = db.get('SELECT COUNT(*) as count FROM quiz_attempts');
        const migrationVersionRow = db.get('SELECT MAX(version) as version FROM schema_migrations');
        const isPostgres = !!process.env.DATABASE_URL;

        return res.json({
            ok: true,
            database: {
                engine: isPostgres ? 'postgresql' : 'sqlite',
                mode: isPostgres ? 'Production PostgreSQL Pool' : 'Local SQLite WAL Persistence',
                version: migrationVersionRow?.version || 1,
                health: 'healthy'
            },
            counts: {
                users: userCount,
                progressEvents: eventCountRow?.count || 0,
                quizAttempts: quizCountRow?.count || 0,
                analyticsEvents: analyticsRepository.getEvents(1000).length
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'DB_STATUS_ERROR', message: err.message });
    }
});

// Admin: POST /api/admin/db/backup (Create database snapshot)
app.post('/api/admin/db/backup', requireAdmin, requireCsrf, (req, res) => {
    try {
        const { backupService } = require('./db');
        const { label = 'manual' } = req.body || {};
        const result = backupService.createSnapshot(label);
        return res.json({
            ok: true,
            message: 'Database snapshot created successfully.',
            backup: result
        });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'BACKUP_ERROR', message: err.message });
    }
});

// Admin: GET /api/admin/db/backups (List database snapshots)
app.get('/api/admin/db/backups', requireAdmin, (req, res) => {
    try {
        const { backupService } = require('./db');
        const snapshots = backupService.listSnapshots();
        return res.json({ ok: true, snapshots });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'BACKUP_LIST_ERROR', message: err.message });
    }
});

// -------------------------------------------------------------
// 6. STATIC ASSET SERVING & CLEAN ROUTING
// -------------------------------------------------------------
app.use(express.static(__dirname, {
    extensions: ['html', 'htm'],
    maxAge: 0,
    setHeaders: (res, path, stat) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Expires', '0');
        res.setHeader('Clear-Site-Data', '"cache"');
    }
}));

// Clean URL routing fallback for HTML pages
app.get('/:page', (req, res, next) => {
    const pageName = req.params.page;
    const filePath = path.join(__dirname, `${pageName}.html`);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    next();
});

// 404 Fallback
app.use((req, res) => {
    const notFoundPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Centralized Error Handler (Poin 10 — No internal stack traces leaked)
app.use((err, req, res, next) => {
    console.error('[UOT-Server Error]', err.message || err);
    res.status(err.status || 500).json({
        ok: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Terjadi kesalahan pada server. Silakan coba kembali sesaat lagi.'
    });
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Universe Of Tech hardened server running on http://0.0.0.0:${PORT} [${APP_ENV}]`);
    });
}

module.exports = app;
