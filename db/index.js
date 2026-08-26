/**
 * UNIVERSE OF TECH - DATABASE & REPOSITORY DATA ACCESS LAYER
 * FASE 18 Centralized Entry Point
 */

const { getDb } = require('./db-adapter');
const Migrator = require('./migrator');
const UserRepository = require('./repositories/user-repository');
const SessionRepository = require('./repositories/session-repository');
const { ProgressRepository, SERVER_REWARDS, ACHIEVEMENTS_CATALOG, WEEKLY_CHALLENGES_CATALOG, calculateLevelMetrics } = require('./repositories/progress-repository');
const SubscriptionRepository = require('./repositories/subscription-repository');
const ContentRepository = require('./repositories/content-repository');
const AnalyticsRepository = require('./repositories/analytics-repository');
const BackupService = require('./backup');

const { ContentCatalog, contentCatalog } = require('./content-catalog');
const { RewardLedger } = require('./reward-ledger');
const { REWARD_POLICY } = require('./reward-policy');

// Initialize DB and Run Migrations
const db = getDb();
const migrator = new Migrator(db);
migrator.runMigrations();

// Instantiate Repositories
const userRepository = new UserRepository(db);
const sessionRepository = new SessionRepository(db);
const progressRepository = new ProgressRepository(db);
const subscriptionRepository = new SubscriptionRepository(db);
const contentRepository = new ContentRepository(db);
const analyticsRepository = new AnalyticsRepository(db);

const backupService = new BackupService(db, {
    user: userRepository,
    session: sessionRepository,
    progress: progressRepository,
    subscription: subscriptionRepository,
    content: contentRepository,
    analytics: analyticsRepository
});

module.exports = {
    db,
    migrator,
    userRepository,
    sessionRepository,
    progressRepository,
    subscriptionRepository,
    contentRepository,
    analyticsRepository,
    backupService,
    contentCatalog,
    ContentCatalog,
    RewardLedger,
    REWARD_POLICY,
    SERVER_REWARDS,
    ACHIEVEMENTS_CATALOG,
    WEEKLY_CHALLENGES_CATALOG,
    calculateLevelMetrics
};
