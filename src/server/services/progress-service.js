/**
 * UNIVERSE OF TECH - USER PROGRESS & GAMIFICATION SERVICE
 * FASE 3 & 4 Architecture Refactoring
 */

class ProgressService {
    constructor({ dbInstance, subscriptionStore, analyticsEngineInstance, ACHIEVEMENTS_CATALOG }) {
        this.dbInstance = dbInstance;
        this.subscriptionStore = subscriptionStore;
        this.analyticsEngineInstance = analyticsEngineInstance;
        this.ACHIEVEMENTS_CATALOG = ACHIEVEMENTS_CATALOG;
    }

    async getUserSummary(userId) {
        if (!userId) return null;
        const progress = await this.dbInstance.getUserProgress(userId);
        const sub = await this.subscriptionStore.get(userId);
        const isPro = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);

        return {
            isPro,
            level: progress.level,
            lifetimeXp: progress.lifetimeXp,
            coins: progress.coins,
            streak: progress.streak,
            achievementsCount: progress.achievements ? progress.achievements.length : 0,
            inventoryCount: progress.inventory ? progress.inventory.length : 0
        };
    }

    async getUserProgress(userId) {
        const targetId = userId || 'usr_demo_7701';
        const progress = await this.dbInstance.getUserProgress(targetId);
        return {
            userId: targetId,
            progress: this.dbInstance.sanitizeProgressForResponse(progress)
        };
    }

    async getUserMastery(userId) {
        const targetId = userId || 'usr_demo_7701';
        return {
            userId: targetId,
            mastery: await this.dbInstance.getUserMastery(targetId)
        };
    }

    async getUserRecommendations(userId) {
        const targetId = userId || 'usr_demo_7701';
        return {
            userId: targetId,
            recommendations: await this.dbInstance.getUserRecommendations(targetId)
        };
    }

    async processActivity(userId, activityData) {
        const targetId = userId || 'usr_demo_7701';
        const result = await this.dbInstance.processActivityEvent(targetId, activityData);

        if (this.analyticsEngineInstance && typeof this.analyticsEngineInstance.recordEvent === 'function') {
            this.analyticsEngineInstance.recordEvent({
                event: 'activity_completed',
                timestamp: new Date().toISOString(),
                userId: targetId,
                properties: {
                    type: activityData.type,
                    id: activityData.id,
                    score: activityData.score,
                    xpEarned: result.xpAwarded
                }
            });
        }

        return result;
    }
}

module.exports = ProgressService;
