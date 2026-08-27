/**
 * UNIVERSE OF TECH - HARDENED PRODUCTION READY NODE ENTRYPOINT
 * ARCHITECTURE REFACTORING & MODULARIZATION (FASE 3)
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');

// 1. Configs & Core Setup
const {
    PORT,
    APP_ENV,
    IS_PRODUCTION,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    IS_PAYMENT_CONFIGURED,
    CONTENT_DIR
} = require('./server/config');

const { PLANS, SandboxProvider, StripeProvider } = require('./payment-provider');

// Fail startup in production if ADMIN_KEY is missing or invalid
if (IS_PRODUCTION) {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || adminKey.trim() === '' || adminKey === 'uot-admin-secret-key-2026') {
        console.error('FATAL: Konfigurasi ADMIN_KEY tidak valid pada mode produksi. ADMIN_KEY wajib disetel via environment.');
        process.exit(1);
    }
}

// 2. Initialize Providers & Persistent Stores
let paymentProviderInstance;
if (IS_PAYMENT_CONFIGURED) {
    paymentProviderInstance = new StripeProvider(STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET);
} else {
    paymentProviderInstance = new SandboxProvider();
}

const { dbInstance, ACHIEVEMENTS_CATALOG } = require('./server-db');
const ContentEngine = require('../public/content-engine');
const analyticsEngineInstance = require('./analytics-engine');

const userStore = dbInstance.users;
const sessionStore = dbInstance.sessions;
const subscriptionStore = dbInstance.subscriptions;
const learningStateStore = new Map();

const { contentRepository } = require('../db');
const ContentMigrationTool = require('./content-migration-tool');

// Sync domain content with JSON disk storage
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

// Seed default demo user for local/testing convenience
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

// Session cleanup timer
const sessionCleanupTimer = setInterval(() => {
    try {
        if (dbInstance.sessions && dbInstance.sessions.cleanExpired) {
            dbInstance.sessions.cleanExpired();
        }
    } catch (err) {
        console.error('Failed to clean up expired sessions:', err);
    }
}, 3600000);
if (sessionCleanupTimer.unref) sessionCleanupTimer.unref();

// Auth Failure Auditing
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

// 3. Initiate Express Application & Core Middlewares
const app = express();

app.use(express.json({
    limit: '256kb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use(compression());

// Cookie parsing
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

// Secure HTTP Headers & Nonce Generation
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');

    if (req.path === '/sandbox-runner.html') {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'none'; script-src 'self' 'unsafe-eval'; connect-src 'none'; img-src 'none'; style-src 'none'; font-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none';"
        );
    } else {
        res.setHeader(
            'Content-Security-Policy',
            `default-src 'self'; ` +
            `script-src 'self' 'nonce-${nonce}' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; ` +
            `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; ` +
            `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; ` +
            `img-src 'self' data: https:; ` +
            `connect-src 'self' https:; ` +
            `object-src 'none'; ` +
            `base-uri 'self'; ` +
            `form-action 'self';`
        );
    }
    next();
});

// Session Cookie Helpers
function setSessionCookie(res, token, csrfToken) {
    const maxAgeSec = 24 * 60 * 60;
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

// 4. Instantiating Controllers, Middlewares, and Routers
const { rateLimiter, createMiddlewares } = require('./server/middleware');
const middlewares = createMiddlewares({ userStore, sessionStore, subscriptionStore });

// Apply authentication parser middleware on /api and /v1 paths
app.use('/api', middlewares.authenticate);
app.use('/v1', middlewares.authenticate);

// Instantiating Auth
const AuthController = require('./server/controllers/auth-controller');
const createAuthRouter = require('./server/routes/auth-routes');
const authController = new AuthController({
    userStore,
    sessionStore,
    subscriptionStore,
    recordAuthFailure,
    setSessionCookie,
    clearSessionCookie
});
const authRouter = createAuthRouter({ authController, middlewares, rateLimiter });
app.use('/', authRouter);

// Instantiating Subscription
const SubscriptionController = require('./server/controllers/subscription-controller');
const createSubscriptionRouter = require('./server/routes/subscription-routes');
const subscriptionController = new SubscriptionController({
    subscriptionStore,
    dbInstance,
    paymentProviderInstance,
    stripeWebhookSecret: STRIPE_WEBHOOK_SECRET
});
const subscriptionRouter = createSubscriptionRouter({ subscriptionController, middlewares, rateLimiter });
app.use('/', subscriptionRouter);

// Instantiating Progress
const ProgressController = require('./server/controllers/progress-controller');
const createProgressRouter = require('./server/routes/progress-routes');
const progressController = new ProgressController({
    dbInstance,
    subscriptionStore,
    learningStateStore,
    analyticsEngineInstance,
    ACHIEVEMENTS_CATALOG
});
const progressRouter = createProgressRouter({ progressController, middlewares, rateLimiter });
app.use('/', progressRouter);

// Instantiating Social
const SocialController = require('./server/controllers/social-controller');
const createSocialRouter = require('./server/routes/social-routes');
const socialController = new SocialController({ dbInstance });
const socialRouter = createSocialRouter({ socialController, middlewares, rateLimiter });
app.use('/', socialRouter);

// Instantiating Telemetry
const TelemetryController = require('./server/controllers/telemetry-controller');
const createTelemetryRouter = require('./server/routes/telemetry-routes');
const telemetryController = new TelemetryController({ analyticsEngineInstance });
const telemetryRouter = createTelemetryRouter({ telemetryController, rateLimiter });
app.use('/', telemetryRouter);

// Instantiating Admin
const AdminController = require('./server/controllers/admin-controller');
const createAdminRouter = require('./server/routes/admin-routes');
const adminController = new AdminController({
    dbInstance,
    analyticsEngineInstance,
    ContentEngine,
    contentRepository,
    saveDomainContentToDisk,
    ContentMigrationTool,
    APP_ENV
});
const adminRouter = createAdminRouter({ adminController, middlewares, rateLimiter });
app.use('/', adminRouter);

// 5. System Level Configuration & Fallbacks
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
    const dbPath = path.resolve(__dirname, '..', 'data', 'uot_db_store.json');
    const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

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

// 6. Static Asset Serving & Injectionfallbacks
const distDir = path.resolve(__dirname, '..', 'dist');
const publicDir = (IS_PRODUCTION && fs.existsSync(distDir)) ? distDir : path.resolve(__dirname, '..', 'public');

app.use((req, res, next) => {
    let filePath = null;
    const ext = path.extname(req.path);
    
    if (ext === '.html') {
        filePath = path.join(publicDir, req.path);
    } else if (req.path === '/' || ext === '') {
        const pageName = req.path === '/' ? 'index' : req.path.substring(1);
        const potentialPath = path.join(publicDir, `${pageName}.html`);
        if (fs.existsSync(potentialPath)) {
            filePath = potentialPath;
        }
    }

    if (filePath && fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf8', (err, html) => {
            if (err) return next();
            
            const nonce = res.locals.nonce;
            const updatedHtml = html.replace(/<script\b([^>]*)>/gi, (match, attrs) => {
                if (attrs.includes('nonce=')) {
                    return match;
                }
                return `<script nonce="${nonce}"${attrs}>`;
            });
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(updatedHtml);
        });
    } else {
        next();
    }
});

app.use(express.static(publicDir, {
    extensions: ['html', 'htm'],
    maxAge: 0,
    setHeaders: (res, path, stat) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Expires', '0');
        res.setHeader('Clear-Site-Data', '"cache"');
    }
}));

app.get('/:page', (req, res, next) => {
    const pageName = req.params.page;
    const filePath = path.join(publicDir, `${pageName}.html`);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    next();
});

app.use((req, res) => {
    const notFoundPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Centralized Error Handling
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
