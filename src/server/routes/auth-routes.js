/**
 * Universe Of Tech - Authentication Routes
 */
const express = require('express');

function createAuthRouter({ authController, middlewares, rateLimiter }) {
    const router = express.Router();
    const { requireAuth, requireCsrf } = middlewares;

    router.post('/api/auth/register', rateLimiter({ max: 10, windowMs: 60000 }), requireCsrf, authController.register);
    router.post('/api/auth/login', rateLimiter({ max: 10, windowMs: 60000 }), requireCsrf, authController.login);
    router.post('/api/auth/verify-session', authController.verifySession);
    router.post('/api/auth/logout', requireCsrf, authController.logout);
    router.post('/api/auth/forgot-password', rateLimiter({ max: 5, windowMs: 60000 }), requireCsrf, authController.forgotPassword);
    router.post('/api/auth/reset-password', rateLimiter({ max: 5, windowMs: 60000 }), requireCsrf, authController.resetPassword);
    router.get('/api/user/profile', requireAuth, authController.getProfile);

    return router;
}

module.exports = createAuthRouter;
