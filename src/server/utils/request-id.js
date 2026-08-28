/**
 * UNIVERSE OF TECH - REQUEST ID & CORRELATION MIDDLEWARE
 */
const crypto = require('crypto');

function requestIdMiddleware(req, res, next) {
    const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
    const requestId = (typeof incomingId === 'string' && incomingId.trim().length > 0)
        ? incomingId.trim()
        : (crypto.randomUUID ? crypto.randomUUID() : `req_${crypto.randomBytes(16).toString('hex')}`);

    req.id = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
}

module.exports = requestIdMiddleware;
