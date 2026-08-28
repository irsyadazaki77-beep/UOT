/**
 * UNIVERSE OF TECH - ANALYTICS & TELEMETRY SERVICE
 * FASE 3 Architecture Refactoring
 */

class AnalyticsService {
    constructor({ analyticsEngineInstance }) {
        this.analyticsEngine = analyticsEngineInstance;
    }

    recordEvent(eventData) {
        if (!this.analyticsEngine) return { ok: false };
        return this.analyticsEngine.recordEvent(eventData);
    }

    recordError(errorData) {
        if (!this.analyticsEngine) return { ok: false };
        return this.analyticsEngine.recordError(errorData);
    }

    recordVital(vitalData) {
        if (!this.analyticsEngine) return { ok: false };
        return this.analyticsEngine.recordVital(vitalData);
    }

    getFeatureFlags() {
        if (!this.analyticsEngine) return {};
        return this.analyticsEngine.getFeatureFlags();
    }

    updateFeatureFlag(key, data) {
        if (!this.analyticsEngine) return { ok: false };
        return this.analyticsEngine.updateFeatureFlag(key, data);
    }

    getSummary() {
        if (!this.analyticsEngine) return {};
        return {
            funnel: this.analyticsEngine.getFunnelMetrics(),
            learning: this.analyticsEngine.getLearningMetrics(),
            difficultContent: this.analyticsEngine.getDifficultContentFlags(),
            errors: this.analyticsEngine.getErrorTelemetrySummary(),
            vitals: this.analyticsEngine.getPerformanceTelemetrySummary()
        };
    }
}

module.exports = AnalyticsService;
