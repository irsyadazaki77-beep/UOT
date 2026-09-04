/**
 * UNIVERSE OF TECH - SOCIAL & LEADERBOARD SERVICE
 * FASE 3 Architecture Refactoring
 */

class SocialService {
    constructor({ dbInstance, subscriptionStore }) {
        this.dbInstance = dbInstance;
        this.subscriptionStore = subscriptionStore;
    }

    async getLeaderboard({ limit = 50, currentUserId = null } = {}) {
        return await this.dbInstance.getLeaderboard(limit, currentUserId);
    }

    async getWeeklyChallenges(userId = null) {
        return await this.dbInstance.getWeeklyChallenges(userId);
    }

    async getPublicProfile(userId) {
        return await this.dbInstance.getPublicProfile(userId);
    }
}

module.exports = SocialService;
