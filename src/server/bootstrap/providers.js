/**
 * UNIVERSE OF TECH - EXTERNAL & CORE PROVIDERS BOOTSTRAPPER
 * FASE 3 Architecture Refactoring
 */
const { PaymentProvider } = require('../../payment-provider');
const { AnalyticsEngine } = require('../../analytics-observability');
const ContentEngine = require('../../content-engine');
const ContentMigrationTool = require('../content-migration-tool');

function bootstrapProviders({ dbInstance, STRIPE_SECRET_KEY, IS_PRODUCTION }) {
    const paymentProviderInstance = new PaymentProvider({
        provider: 'stripe',
        apiKey: STRIPE_SECRET_KEY,
        isProduction: IS_PRODUCTION
    });

    const analyticsEngineInstance = new AnalyticsEngine({
        persistenceFile: null, // Persistence now handled through SQL AnalyticsRepository
        storageLimit: 2000,
        enableConsoleLogs: !IS_PRODUCTION
    });

    const contentMigrationTool = new ContentMigrationTool();

    return {
        paymentProviderInstance,
        analyticsEngineInstance,
        ContentEngine,
        contentMigrationTool
    };
}

module.exports = {
    bootstrapProviders
};
