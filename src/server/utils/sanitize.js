/**
 * Universe Of Tech - Sanitization Utils
 */

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

module.exports = {
    sanitizeClientPayload
};
