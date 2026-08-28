/**
 * UNIVERSE OF TECH - SOCIAL & LEADERBOARD SERVICE
 * FASE 3 Architecture Refactoring
 */

class SocialService {
    constructor({ dbInstance, subscriptionStore }) {
        this.dbInstance = dbInstance;
        this.subscriptionStore = subscriptionStore;
    }

    getLeaderboard({ limit = 50, currentUserId = null } = {}) {
        return this.dbInstance.getLeaderboard(limit, currentUserId);
    }

    getWeeklyChallenges(userId = null) {
        return this.dbInstance.getWeeklyChallenges(userId);
    }

    getPublicProfile(userId) {
        return this.dbInstance.getPublicProfile(userId);
    }
}

module.exports = SocialService;
