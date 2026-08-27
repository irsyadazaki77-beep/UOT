/**
 * Universe Of Tech - Subscription Routes
 */
const express = require('express');

function createSubscriptionRouter({ subscriptionController, middlewares, rateLimiter }) {
    const router = express.Router();
    const { requireAuth, requireCsrf } = middlewares;

    router.post('/api/subscription/verify', subscriptionController.verify);
    router.post('/v1/checkout/sessions', rateLimiter({ max: 15, windowMs: 60000 }), requireCsrf, subscriptionController.checkout);
    router.post('/api/subscription/sandbox-activate', rateLimiter({ max: 10, windowMs: 60000 }), requireAuth, requireCsrf, subscriptionController.sandboxActivate);
    router.post('/api/subscription/cancel', requireAuth, requireCsrf, subscriptionController.cancel);
    router.get('/api/subscription/history', requireAuth, subscriptionController.history);
    router.post('/api/payment/webhook', subscriptionController.webhook);

    return router;
}

module.exports = createSubscriptionRouter;
