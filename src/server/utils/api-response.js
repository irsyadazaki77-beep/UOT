/**
 * UNIVERSE OF TECH - STANDARDIZED API RESPONSE UTILITIES
 */

function success(res, data = {}, status = 200, extra = {}) {
    return res.status(status).json({
        ok: true,
        ...data,
        ...extra
    });
}

function error(res, errorCode, message, status = 400, details = null) {
    const payload = {
        ok: false,
        error: errorCode || 'BAD_REQUEST',
        message: message || 'Terjadi kesalahan pada permintaan.'
    };
    if (details) {
        payload.details = details;
    }
    return res.status(status).json(payload);
}

module.exports = {
    success,
    error
};
