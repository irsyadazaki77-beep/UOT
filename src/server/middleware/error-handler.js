/**
 * UNIVERSE OF TECH - CENTRALIZED ERROR HANDLING MIDDLEWARE
 */

function errorHandlerMiddleware(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const errorCode = err.code || (status === 404 ? 'NOT_FOUND' : (status === 400 ? 'BAD_REQUEST' : (status === 401 ? 'UNAUTHORIZED' : (status === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR'))));
    const message = err.message || 'Terjadi kesalahan internal pada server. Silakan coba kembali.';

    if (status >= 500) {
        console.error(`[UOT-Server Error] [ReqID: ${req.id || 'N/A'}]`, err.stack || err);
    }

    res.status(status).json({
        ok: false,
        error: errorCode,
        message,
        requestId: req.id || undefined
    });
}

module.exports = errorHandlerMiddleware;
