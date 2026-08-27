/**
 * Universe Of Tech - Telemetry Controller
 */
class TelemetryController {
    constructor({ analyticsEngineInstance }) {
        this.analyticsEngineInstance = analyticsEngineInstance;
    }

    recordEvent = (req, res) => {
        const { event, timestamp, sessionId, userId, properties, userConsent } = req.body || {};
        const effectiveUserId = req.user ? req.user.id : (userId || 'anon_usr');

        const result = this.analyticsEngineInstance.recordEvent({
            event,
            timestamp,
            sessionId,
            userId: effectiveUserId,
            properties,
            userConsent: userConsent !== false
        });

        return res.json(result);
    };

    recordError = (req, res) => {
        const { errorType, message, stack, route, userAgent, sessionId, userId } = req.body || {};
        const effectiveUserId = req.user ? req.user.id : (userId || 'anon_usr');

        const result = this.analyticsEngineInstance.recordError({
            errorType,
            message,
            stack,
            route,
            userAgent,
            sessionId,
            userId: effectiveUserId
        });

        return res.json(result);
    };

    recordVitals = (req, res) => {
        const { metric, value, rating, page, deviceType, sessionId } = req.body || {};

        const result = this.analyticsEngineInstance.recordVitals({
            metric,
            value,
            rating,
            page,
            deviceType,
            sessionId
        });

        return res.json(result);
    };

    getFeatureFlags = (req, res) => {
        const userId = req.user ? req.user.id : 'anon_usr';
        const sessionId = req.headers['x-session-id'] || 'sess_default';

        const result = this.analyticsEngineInstance.getFeatureFlagsForUser(userId, sessionId);
        return res.json({ ok: true, ...result });
    };
}

module.exports = TelemetryController;
