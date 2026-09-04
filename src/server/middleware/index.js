/**
 * Universe Of Tech - Express Middlewares
 */
const crypto = require('crypto');
const { RateLimiter, MemoryStore } = require('../../rate-limiter');

const defaultStore = new MemoryStore();

function rateLimiter(options = {}) {
    const lim = new RateLimiter({
        store: defaultStore,
        windowMs: options.windowMs || 60000,
        max: options.max || 30,
        message: options.message || 'Terlalu banyak permintaan, coba lagi nanti.'
    });
    return lim.getMiddleware();
}

function createMiddlewares({ userStore, sessionStore, subscriptionStore }) {
    async function authenticate(req, res, next) {
        try {
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

            const session = await sessionStore.get(token);
            if (!session) {
                req.session = null;
                req.user = null;
                return next();
            }

            // Check expiration (24 hours)
            if (Date.now() > session.expiresAt) {
                await sessionStore.delete(token);
                req.session = null;
                req.user = null;
                return next();
            }

            let user = null;
            if (userStore.findById) {
                user = await userStore.findById(session.userId);
            } else {
                const allUsers = typeof userStore.values === 'function' ? await userStore.values() : userStore;
                user = Array.isArray(allUsers) ? allUsers.find(u => u.id === session.userId) : null;
            }

            if (!user) {
                await sessionStore.delete(token);
                req.session = null;
                req.user = null;
                return next();
            }

            // Verify PRO subscription server-side
            const sub = await subscriptionStore.get(user.id);
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
            return next();
        } catch (err) {
            req.session = null;
            req.user = null;
            return next();
        }
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

        if (SERVER_ADMIN_KEY && SERVER_ADMIN_KEY.trim() !== '' && adminKeyHeader) {
            try {
                const hBuf = Buffer.from(adminKeyHeader);
                const sBuf = Buffer.from(SERVER_ADMIN_KEY);
                if (hBuf.length === sBuf.length && crypto.timingSafeEqual(hBuf, sBuf)) {
                    return next();
                }
            } catch (_) {}
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

    return {
        authenticate,
        requireAuth,
        requireAdmin,
        requireCsrf
    };
}

module.exports = {
    rateLimiter,
    createMiddlewares
};
