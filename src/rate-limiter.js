/**
 * UNIVERSE OF TECH - RESILIENT DISTRIBUTED RATE LIMITER
 * FASE 2: Hardened Rate Limiter supporting shared/external state storage
 */

const rateLimitsStore = new Map();

class MemoryStore {
    constructor() {
        this.store = rateLimitsStore;
    }

    async increment(key, windowMs) {
        const now = Date.now();
        const record = this.store.get(key) || { count: 0, resetAt: now + windowMs };

        if (now > record.resetAt) {
            record.count = 0;
            record.resetAt = now + windowMs;
        }

        record.count++;
        this.store.set(key, record);

        return {
            count: record.count,
            resetAt: record.resetAt
        };
    }
}

class RateLimiter {
    constructor({ store = new MemoryStore(), windowMs = 60000, max = 30, message = 'Terlalu banyak permintaan, silakan coba lagi nanti.' } = {}) {
        this.store = store;
        this.windowMs = windowMs;
        this.max = max;
        this.message = message;
    }

    getMiddleware() {
        return async (req, res, next) => {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const userId = req.user ? req.user.id : 'guest';
            
            // Incorporate IP, route, and user identity to prevent bypasses or unfair locks
            const key = `ratelimit:${req.baseUrl || ''}${req.path}:${clientIp}:${userId}`;

            try {
                const result = await this.store.increment(key, this.windowMs);

                res.setHeader('X-RateLimit-Limit', this.max);
                res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - result.count));
                res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

                if (result.count > this.max) {
                    return res.status(429).json({
                        ok: false,
                        error: 'RATE_LIMIT_EXCEEDED',
                        message: this.message,
                        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
                    });
                }
                next();
            } catch (err) {
                console.error('[RateLimiter] Error performing rate limiting checks:', err);
                // Fail-open to prevent locking users out of the application in case of store failures
                next();
            }
        };
    }
}

module.exports = {
    RateLimiter,
    MemoryStore
};
