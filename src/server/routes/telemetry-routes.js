/**
 * Universe Of Tech - Telemetry Routes
 */
const express = require('express');

function createTelemetryRouter({ telemetryController, rateLimiter }) {
    const router = express.Router();

    router.post('/api/analytics/event', rateLimiter({ max: 120, windowMs: 60000 }), telemetryController.recordEvent);
    router.post('/api/analytics/error', rateLimiter({ max: 60, windowMs: 60000 }), telemetryController.recordError);
    router.post('/api/analytics/vitals', rateLimiter({ max: 120, windowMs: 60000 }), telemetryController.recordVitals);
    router.get('/api/feature-flags', telemetryController.getFeatureFlags);

    return router;
}

module.exports = createTelemetryRouter;
