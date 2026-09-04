/**
 * UNIVERSE OF TECH - EXPRESS APPLICATION FACTORY (createApp)
 * FASE 3: Backend Architecture Refactoring & Decoupling
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');

const {
    PORT,
    APP_ENV,
    IS_PRODUCTION,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    IS_PAYMENT_CONFIGURED,
    CONTENT_DIR
} = require('./config');

const { PLANS, SandboxProvider, StripeProvider } = require('../payment-provider');
const { dbInstance, ACHIEVEMENTS_CATALOG } = require('../server-db');
const ContentEngine = require('../../public/content-engine');
const analyticsEngineInstance = require('../analytics-engine');
const { contentRepository } = require('../../db');
const ContentMigrationTool = require('../content-migration-tool');

const requestIdMiddleware = require('./utils/request-id');
const securityHeadersMiddleware = require('./middleware/security-headers');
const errorHandlerMiddleware = require('./middleware/error-handler');
const { rateLimiter, createMiddlewares } = require('./middleware');

// Services
const AuthService = require('./services/auth-service');
const SubscriptionService = require('./services/subscription-service');
const ProgressService = require('./services/progress-service');
const ContentService = require('./services/content-service');
const SocialService = require('./services/social-service');
const AnalyticsService = require('./services/analytics-service');
const SearchIndexService = require('./services/search-index-service');
const retrievalEngine = require('./services/retrieval-engine');

// Controllers & Routes
const AuthController = require('./controllers/auth-controller');
const createAuthRouter = require('./routes/auth-routes');

const SubscriptionController = require('./controllers/subscription-controller');
const createSubscriptionRouter = require('./routes/subscription-routes');

const ProgressController = require('./controllers/progress-controller');
const createProgressRouter = require('./routes/progress-routes');

const SocialController = require('./controllers/social-controller');
const createSocialRouter = require('./routes/social-routes');

const TelemetryController = require('./controllers/telemetry-controller');
const createTelemetryRouter = require('./routes/telemetry-routes');

const AdminController = require('./controllers/admin-controller');
const createAdminRouter = require('./routes/admin-routes');

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

// In-memory cache and structured repository logging for auth failure auditing
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

    if (dbInstance && dbInstance.analyticsRepo && typeof dbInstance.analyticsRepo.recordAuthFailure === 'function') {
        dbInstance.analyticsRepo.recordAuthFailure({ ip, email, reason }).catch(err => {
            console.error('[Audit] Failed to record structured auth failure:', err.message);
        });
    }
}

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

function createApp(options = {}) {
    const app = express();

    const userStore = options.userStore || dbInstance.users;
    const sessionStore = options.sessionStore || dbInstance.sessions;
    const subscriptionStore = options.subscriptionStore || dbInstance.subscriptions;
    const learningStateStore = options.learningStateStore || new Map();

    let paymentProviderInstance;
    if (options.paymentProviderInstance) {
        paymentProviderInstance = options.paymentProviderInstance;
    } else if (IS_PAYMENT_CONFIGURED) {
        paymentProviderInstance = new StripeProvider(STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET);
    } else {
        paymentProviderInstance = new SandboxProvider();
    }

    // 1. Core Parsers & Global Middlewares
    app.use(express.json({
        limit: '256kb',
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));

    app.use(compression());

    app.use((req, res, next) => {
        req.cookies = parseCookies(req.headers.cookie);
        next();
    });

    app.use(requestIdMiddleware);
    app.use(securityHeadersMiddleware);

    // 2. Middlewares & Auth layer
    const middlewares = createMiddlewares({ userStore, sessionStore, subscriptionStore });
    app.use('/api', middlewares.authenticate);
    app.use('/v1', middlewares.authenticate);

    // 3. Initialize Services
    const authService = new AuthService({
        userStore,
        sessionStore,
        subscriptionStore,
        auditLogger: recordAuthFailure
    });

    const subscriptionService = new SubscriptionService({
        subscriptionStore,
        dbInstance,
        paymentProviderInstance,
        stripeWebhookSecret: STRIPE_WEBHOOK_SECRET
    });

    const progressService = new ProgressService({
        dbInstance,
        subscriptionStore,
        analyticsEngineInstance,
        ACHIEVEMENTS_CATALOG
    });

    const contentService = new ContentService({
        contentRepository,
        ContentEngine
    });

    const searchIndexService = new SearchIndexService({
        contentRepository,
        ContentEngine
    });
    // Prime the search index at startup asynchronously
    searchIndexService.buildIndex().catch(e => console.warn('[SearchIndex] Warmup note:', e.message));

    const socialService = new SocialService({
        dbInstance,
        subscriptionStore
    });

    const analyticsService = new AnalyticsService({
        analyticsEngineInstance
    });

    const AIController = require('./controllers/ai-controller');
    const { createAIRouter } = require('./routes/ai-router');

    // 4. Mount Domain Routes
    const authController = new AuthController({
        userStore,
        sessionStore,
        subscriptionStore,
        recordAuthFailure,
        setSessionCookie,
        clearSessionCookie
    });
    app.use('/', createAuthRouter({ authController, middlewares, rateLimiter }));

    const aiController = new AIController({
        dbInstance,
        analyticsEngineInstance
    });
    app.use('/', createAIRouter({ aiController, middlewares, rateLimiter }));

    const subscriptionController = new SubscriptionController({
        subscriptionStore,
        dbInstance,
        paymentProviderInstance,
        stripeWebhookSecret: STRIPE_WEBHOOK_SECRET
    });
    app.use('/', createSubscriptionRouter({ subscriptionController, middlewares, rateLimiter }));

    const progressController = new ProgressController({
        dbInstance,
        subscriptionStore,
        learningStateStore,
        analyticsEngineInstance,
        ACHIEVEMENTS_CATALOG
    });
    app.use('/', createProgressRouter({ progressController, middlewares, rateLimiter }));

    const socialController = new SocialController({ dbInstance });
    app.use('/', createSocialRouter({ socialController, middlewares, rateLimiter }));

    const telemetryController = new TelemetryController({ analyticsEngineInstance });
    app.use('/', createTelemetryRouter({ telemetryController, rateLimiter }));

    const adminController = new AdminController({
        dbInstance,
        analyticsEngineInstance,
        ContentEngine,
        contentRepository,
        saveDomainContentToDisk,
        ContentMigrationTool,
        APP_ENV,
        searchIndexService,
        retrievalEngine
    });
    app.use('/', createAdminRouter({ adminController, middlewares, rateLimiter }));

    // 5. Dynamic Content Catalog APIs with Pagination & Filtering (FASE 6)
    app.get('/api/content/:domain', async (req, res) => {
        try {
            const { domain } = req.params;
            const { page, limit, category, track, search, includeDrafts } = req.query;
            const result = await contentService.getAllDomainContent(domain, {
                includeDrafts: includeDrafts === 'true',
                page,
                limit,
                category,
                track,
                search
            });
            return res.json({
                ok: true,
                domain,
                data: result
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'CONTENT_FETCH_ERROR', message: err.message });
        }
    });

    app.get('/api/content/:domain/:id', async (req, res) => {
        try {
            const { domain, id } = req.params;
            const item = await contentService.getItem(domain, id);
            if (!item) {
                return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
            }
            return res.json({ ok: true, domain, data: item });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'CONTENT_ITEM_ERROR', message: err.message });
        }
    });

    app.get('/api/learning-journey/goals', (req, res) => {
        try {
            const goalsPath = path.join(__dirname, '../../data/content/journey-goals.json');
            if (fs.existsSync(goalsPath)) {
                const data = fs.readFileSync(goalsPath, 'utf8');
                return res.json({ ok: true, goals: JSON.parse(data) });
            }
            return res.status(404).json({ ok: false, message: "Journey goals configuration file not found." });
        } catch (err) {
            return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: err.message });
        }
    });

    // Content-backed Search Endpoint (FASE 3 - In-Memory Search Index Service)
    app.get('/api/search', async (req, res) => {
        try {
            const query = String(req.query.q || '').trim();
            if (!query || query.length < 2) {
                return res.json({ ok: true, query, results: [] });
            }

            if (!searchIndexService.isReady) {
                await searchIndexService.buildIndex();
            }

            const results = searchIndexService.search(query, 8);
            return res.json({ ok: true, query, results });
        } catch (err) {
            return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: err.message });
        }
    });

    // 6. CSRF Token Endpoint
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

    // 7. Sanitized Public Health Endpoint (FASE 4 OWASP Hardening)
    app.get('/api/health', async (req, res) => {
        const mem = process.memoryUsage();
        let dbHealthy = true;
        let dbError = null;
        try {
            await dbInstance.db.getAsync('SELECT 1');
        } catch (err) {
            dbHealthy = false;
            dbError = err.message;
        }

        let activeUsers = 0;
        if (dbHealthy && dbInstance.userRepo) {
            try {
                activeUsers = await dbInstance.userRepo.count();
            } catch (_) {}
        }

        const statusCode = dbHealthy ? 200 : 503;

        res.status(statusCode).json({
            status: dbHealthy ? 'ok' : 'degraded',
            app: 'Universe Of Tech',
            schemaVersion: 6,
            timestamp: new Date().toISOString(),
            environment: APP_ENV,
            paymentConfigured: IS_PAYMENT_CONFIGURED,
            authAuthoritative: true,
            database: {
                status: dbHealthy ? 'healthy' : 'unhealthy',
                ...(dbError ? { error: dbError } : {})
            },
            observability: {
                uptimeSeconds: Math.round(process.uptime()),
                memoryUsageRssMb: Math.round(mem.rss / (1024 * 1024)),
                activeUsers,
                activeProgressRecords: activeUsers,
                telemetryEvents: analyticsEngineInstance.events ? analyticsEngineInstance.events.length : 0,
                telemetryErrors: analyticsEngineInstance.errors ? analyticsEngineInstance.errors.length : 0
            }
        });
    });

    // 8. Config Status Endpoint
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

    // 9. Static Asset Serving & Nonce Injection
    const distDir = path.resolve(__dirname, '..', '..', 'dist');
    const publicDir = (IS_PRODUCTION && fs.existsSync(distDir)) ? distDir : path.resolve(__dirname, '..', '..', 'public');

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

    // Optimized static caching policy (FASE 6)
    app.use(express.static(publicDir, {
        extensions: ['html', 'htm'],
        maxAge: 0,
        setHeaders: (res, filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff2', '.woff', '.ttf', '.ico'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
            } else if (['.css', '.js'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
            } else {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                res.setHeader('Expires', '0');
            }
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

    // 404 Fallback
    app.use((req, res) => {
        const notFoundPath = path.join(publicDir, 'index.html');
        if (fs.existsSync(notFoundPath)) {
            res.status(404).sendFile(notFoundPath);
        } else {
            res.status(404).send('Page not found');
        }
    });

    // Centralized Error Handler
    app.use(errorHandlerMiddleware);

    return app;
}

module.exports = {
    createApp,
    setSessionCookie,
    clearSessionCookie,
    recordAuthFailure
};
