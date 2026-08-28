/**
 * UNIVERSE OF TECH - HARDENED SECURITY HEADERS MIDDLEWARE
 * FASE 3 & 4 Architecture Refactoring & OWASP Security Hardening
 */
const crypto = require('crypto');
const { IS_PRODUCTION } = require('../config');

function securityHeadersMiddleware(req, res, next) {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    if (IS_PRODUCTION) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

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
            `frame-ancestors 'self'; ` +
            `object-src 'none'; ` +
            `base-uri 'self'; ` +
            `form-action 'self';`
        );
    }

    next();
}

module.exports = securityHeadersMiddleware;
