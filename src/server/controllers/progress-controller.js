/**
 * Universe Of Tech - Progress Controller
 */
const { sanitizeClientPayload } = require('../utils/sanitize');

class ProgressController {
    constructor({ dbInstance, subscriptionStore, learningStateStore, analyticsEngineInstance, ACHIEVEMENTS_CATALOG }) {
        this.dbInstance = dbInstance;
        this.subscriptionStore = subscriptionStore;
        this.learningStateStore = learningStateStore;
        this.analyticsEngineInstance = analyticsEngineInstance;
        this.ACHIEVEMENTS_CATALOG = ACHIEVEMENTS_CATALOG;
    }

    getMe = (req, res) => {
        if (!req.user) {
            return res.json({
                ok: false,
                authenticated: false,
                user: null,
                message: 'Pengguna belum terautentikasi.'
            });
        }

        const progress = this.dbInstance.getUserProgress(req.user.id);
        const sub = this.subscriptionStore.get(req.user.id);
        const isPro = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);

        return res.json({
            ok: true,
            authenticated: true,
            user: {
                ...req.user,
                isPro
            },
            summary: {
                level: progress.level,
                lifetimeXp: progress.lifetimeXp,
                coins: progress.coins,
                streak: progress.streak,
                achievementsCount: progress.achievements.length,
                inventoryCount: progress.inventory.length
            }
        });
    };

    getProgress = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const progress = this.dbInstance.getUserProgress(userId);

        return res.json({
            ok: true,
            userId,
            progress: this.dbInstance.sanitizeProgressForResponse(progress)
        });
    };

    getMastery = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const mastery = this.dbInstance.getUserMastery(userId);

        return res.json({
            ok: true,
            userId,
            mastery
        });
    };

    getRecommendations = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const recommendations = this.dbInstance.getUserRecommendations(userId);

        return res.json({
            ok: true,
            userId,
            recommendations
        });
    };

    recordRecommendationInteraction = (req, res) => {
        const userId = req.user ? req.user.id : (req.body?.userId || 'usr_demo_7701');
        const { interactionType, recommendationId, metadata } = req.body || {};

        if (!interactionType || !recommendationId) {
            return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD", message: "interactionType dan recommendationId diperlukan." });
        }

        const result = this.dbInstance.recordRecommendationInteraction(userId, interactionType, recommendationId, metadata);

        if (this.analyticsEngineInstance && typeof this.analyticsEngineInstance.recordEvent === 'function') {
            this.analyticsEngineInstance.recordEvent({
                event: interactionType,
                timestamp: new Date().toISOString(),
                userId,
                properties: {
                    recommendationId,
                    ...(metadata || {})
                }
            });
        }

        return res.json(result);
    };

    getLearningState = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const item = this.learningStateStore.get(userId) || { state: {}, updatedAt: null };
        return res.json({
            status: 'ok',
            userId: userId,
            state: item.state,
            updatedAt: item.updatedAt
        });
    };

    putLearningState = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const { state } = req.body || {};
        const updatedAt = new Date().toISOString();

        this.learningStateStore.set(userId, {
            state: state || {},
            updatedAt
        });

        return res.json({
            status: 'ok',
            userId: userId,
            updatedAt
        });
    };

    processEvent = (req, res) => {
        const userId = req.user.id;
        const event = sanitizeClientPayload(req.body || {});

        const result = this.dbInstance.processActivityEvent(userId, event);
        if (!result.ok) {
            return res.status(400).json(result);
        }

        if (event && event.eventType) {
            this.analyticsEngineInstance.recordEvent({
                event: event.eventType,
                timestamp: event.timestamp || new Date().toISOString(),
                userId,
                properties: event.payload || {}
            });
        }

        return res.json(result);
    };

    syncProgress = (req, res) => {
        const userId = req.user.id;
        const { events = [], legacyData = null } = req.body || {};

        if (!Array.isArray(events)) {
            return res.status(400).json({ ok: false, error: 'INVALID_PAYLOAD', message: 'Events harus berupa array.' });
        }

        const cleanLegacyData = sanitizeClientPayload(legacyData);
        const result = this.dbInstance.syncProgress(userId, { events, legacyData: cleanLegacyData });

        if (result.processedCount > 0 && this.analyticsEngineInstance) {
            this.analyticsEngineInstance.recordEvent({
                event: 'BATCH_SYNC_SUCCESS',
                timestamp: new Date().toISOString(),
                userId,
                properties: {
                    processedCount: result.processedCount,
                    totalEventsInBatch: events.length
                }
            });
        }

        return res.json(result);
    };

    patchSettings = (req, res) => {
        const userId = req.user.id;
        const { preferences = {} } = req.body || {};

        const result = this.dbInstance.updateUserSettings(userId, preferences);
        return res.json({
            ok: true,
            preferences: result.preferences
        });
    };

    getAchievements = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const progress = this.dbInstance.getUserProgress(userId);
        const unlockedSet = new Set(progress.achievements || []);

        const catalog = this.ACHIEVEMENTS_CATALOG.map(item => ({
            ...item,
            unlocked: unlockedSet.has(item.id)
        }));

        return res.json({
            ok: true,
            total: catalog.length,
            unlockedCount: unlockedSet.size,
            achievements: catalog
        });
    };

    getInventory = (req, res) => {
        const userId = req.user ? req.user.id : 'usr_demo_7701';
        const progress = this.dbInstance.getUserProgress(userId);

        return res.json({
            ok: true,
            coins: progress.coins,
            inventory: progress.inventory,
            equippedItems: progress.equippedItems
        });
    };
}

module.exports = ProgressController;
