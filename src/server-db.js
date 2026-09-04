/**
 * UNIVERSE OF TECH - SERVER DATABASE INTEGRATION LAYER
 * FASE 18: High-Reliability Persistent Data Access Bridge (Async Canonical)
 */

const {
    db,
    userRepository,
    sessionRepository,
    progressRepository,
    subscriptionRepository,
    contentRepository,
    analyticsRepository,
    backupService,
    SERVER_REWARDS,
    ACHIEVEMENTS_CATALOG,
    WEEKLY_CHALLENGES_CATALOG,
    calculateLevelMetrics
} = require('../db');

class ServerDatabaseBridge {
    constructor() {
        this.db = db;
        this.userRepo = userRepository;
        this.sessionRepo = sessionRepository;
        this.progressRepo = progressRepository;
        this.subRepo = subscriptionRepository;
        this.contentRepo = contentRepository;
        this.analyticsRepo = analyticsRepository;
        this.backup = backupService;

        // Map compatibility proxies for legacy callers & test suites
        this._initCompatibilityProxies();
    }

    async run(sql, params) {
        return await this.db.runAsync(sql, params);
    }

    async get(sql, params) {
        return await this.db.getAsync(sql, params);
    }

    async all(sql, params) {
        return await this.db.allAsync(sql, params);
    }

    _initCompatibilityProxies() {
        const self = this;

        this.users = {
            has: async (email) => !!(await self.userRepo.findByEmail(email)),
            get: async (email) => await self.userRepo.findByEmail(email),
            findById: async (id) => await self.userRepo.findById(id),
            set: async (email, user) => {
                const existing = (await self.userRepo.findByEmail(email)) || (user.id ? await self.userRepo.findById(user.id) : null);
                if (existing) {
                    return await self.userRepo.update(existing.id, user);
                } else {
                    return await self.userRepo.create({
                        id: user.id || `usr_${Date.now()}`,
                        username: user.username || 'Learner',
                        email: email,
                        passwordHash: user.passwordHash || 'default',
                        salt: user.salt || 'default',
                        role: user.role || 'user',
                        isPro: !!user.isPro
                    });
                }
            },
            delete: async (email) => {
                const u = await self.userRepo.findByEmail(email);
                return u ? await self.userRepo.delete(u.id) : false;
            },
            clear: async () => {
                await self.db.runAsync('DELETE FROM users');
            },
            values: async () => await self.userRepo.getAll(10000, 0),
            count: async () => await self.userRepo.count()
        };

        this.sessions = {
            has: async (token) => !!(await self.sessionRepo.findByToken(token)),
            get: async (token) => {
                const s = await self.sessionRepo.findByToken(token);
                if (!s) return undefined;
                return {
                    sessionToken: s.token,
                    userId: s.userId,
                    csrfToken: s.csrfToken || s.token,
                    createdAt: new Date(s.createdAt).getTime(),
                    expiresAt: new Date(s.expiresAt).getTime()
                };
            },
            set: async (token, session) => {
                const maxAgeMs = (session.expiresAt || (Date.now() + 24 * 60 * 60 * 1000)) - Date.now();
                return await self.sessionRepo.create({
                    token,
                    userId: session.userId,
                    csrfToken: session.csrfToken || token,
                    role: session.role || 'user',
                    isPro: !!session.isPro,
                    maxAgeMs: Math.max(1000, maxAgeMs)
                });
            },
            delete: async (token) => await self.sessionRepo.delete(token),
            clear: async () => {
                await self.db.runAsync('DELETE FROM sessions');
            },
            cleanExpired: async () => await self.sessionRepo.cleanExpired()
        };

        this.subscriptions = {
            has: async (userId) => !!(await self.subRepo.findByUserId(userId)),
            get: async (userId) => {
                const s = await self.subRepo.findByUserId(userId);
                if (!s) return undefined;
                return {
                    userId: s.userId,
                    planId: s.planId,
                    status: s.status,
                    source: s.source,
                    startsAt: new Date(s.startsAt).getTime(),
                    expiresAt: s.expiresAt ? new Date(s.expiresAt).getTime() : Date.now() + 365 * 86400000,
                    isPro: s.status === 'active',
                    providerCustomerId: s.providerCustomerId,
                    providerSubscriptionId: s.providerSubscriptionId,
                    cancelAtPeriodEnd: s.cancelAtPeriodEnd
                };
            },
            set: async (userId, sub) => {
                return await self.subRepo.save({
                    userId,
                    planId: sub.planId || 'pro',
                    status: sub.status || 'active',
                    source: sub.source || 'manual',
                    startsAt: sub.startsAt ? new Date(sub.startsAt).toISOString() : new Date().toISOString(),
                    expiresAt: sub.expiresAt ? new Date(sub.expiresAt).toISOString() : null,
                    isTrial: !!sub.isTrial,
                    providerCustomerId: sub.providerCustomerId || null,
                    providerSubscriptionId: sub.providerSubscriptionId || null,
                    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ? 1 : 0
                });
            },
            delete: async (userId) => await self.subRepo.updateStatus(userId, 'canceled'),
            clear: async () => {
                await self.db.runAsync('DELETE FROM subscriptions');
            },
            values: async () => await self.subRepo.getAll(10000, 0)
        };

        this.invoices = {
            create: async (invoice) => await self.subRepo.createInvoice(invoice),
            get: async (id) => await self.subRepo.getInvoiceById(id),
            getByUserId: async (userId) => await self.subRepo.getInvoicesByUserId(userId),
            update: async (id, updates) => await self.subRepo.updateInvoiceStatus(id, typeof updates === 'string' ? updates : updates.status),
            updateStatus: async (id, status) => await self.subRepo.updateInvoiceStatus(id, status)
        };

        this.progress = {
            has: async (userId) => !!(await self.progressRepo.getUserProgress(userId)),
            get: async (userId) => await self.progressRepo.getUserProgress(userId),
            set: async (userId, p) => {
                if (p && p.settings) await self.progressRepo.updateSettings(userId, p.settings);
            },
            clear: async () => {
                await self.db.runAsync('DELETE FROM user_progress');
                await self.db.runAsync('DELETE FROM progress_events');
                await self.db.runAsync('DELETE FROM quiz_attempts');
                await self.db.runAsync('DELETE FROM user_completed_lessons');
                await self.db.runAsync('DELETE FROM achievements');
                await self.db.runAsync('DELETE FROM user_inventory');
            }
        };
    }

    async getUserProgress(userId) {
        return await this.progressRepo.getUserProgress(userId);
    }

    async processActivityEvent(userId, event) {
        return await this.progressRepo.processActivityEvent(userId, event);
    }

    async processActivity(userId, event) {
        return await this.processActivityEvent(userId, event);
    }

    async syncProgress(userId, payload) {
        return await this.progressRepo.syncProgress(userId, payload);
    }

    async updateSettings(userId, patch) {
        return await this.progressRepo.updateSettings(userId, patch);
    }

    async equipItem(userId, items) {
        return await this.progressRepo.equipItem(userId, items);
    }

    async getUserMastery(userId) {
        return await this.progressRepo.getUserMastery(userId);
    }

    async getUserRecommendations(userId, options) {
        return await this.progressRepo.getUserRecommendations(userId, options);
    }

    async recordRecommendationInteraction(userId, interactionType, recommendationId, metadata) {
        return await this.progressRepo.recordRecommendationInteraction(userId, interactionType, recommendationId, metadata);
    }

    async getLeaderboard(options) {
        return await this.progressRepo.getLeaderboard(options);
    }

    async followUser(currentUserId, targetUserId) {
        return await this.progressRepo.followUser(currentUserId, targetUserId);
    }

    async unfollowUser(currentUserId, targetUserId) {
        return await this.progressRepo.unfollowUser(currentUserId, targetUserId);
    }

    async claimChallengeReward(currentUserId, challengeId) {
        return await this.progressRepo.claimChallengeReward(currentUserId, challengeId);
    }

    async createFriendChallenge(currentUserId, targetUserId, details) {
        return await this.progressRepo.createFriendChallenge(currentUserId, targetUserId, details);
    }

    async acceptFriendChallenge(currentUserId, challengeId) {
        return await this.progressRepo.acceptFriendChallenge(currentUserId, challengeId);
    }

    async addNotification(userId, notif) {
        return await this.progressRepo.addNotification(userId, notif);
    }

    async getNotifications(userId) {
        return await this.progressRepo.getNotifications(userId);
    }

    async markNotificationsRead(currentUserId) {
        return await this.progressRepo.markNotificationsRead(currentUserId);
    }

    async getNotificationSummary(userId) {
        return await this.progressRepo.getNotificationSummary(userId);
    }

    async getSocialProfile(targetUserId, currentUserId) {
        return await this.progressRepo.getSocialProfile(targetUserId, currentUserId);
    }

    async getChallenges(userId) {
        return await this.progressRepo.getChallenges(userId);
    }

    async getUserProfile(targetUserId, currentUserId) {
        const progress = await this.getUserProgress(targetUserId);
        if (!progress) return null;

        const isFollowing = currentUserId ? (progress.followers || []).includes(currentUserId) : false;
        const isFollowedBy = currentUserId ? (progress.following || []).includes(currentUserId) : false;

        return {
            userId: targetUserId,
            username: progress.profile?.username,
            avatar: progress.equippedItems?.avatar,
            title: progress.profile?.title,
            level: progress.level,
            lifetimeXp: progress.lifetimeXp,
            streak: progress.streak,
            achievements: progress.achievements,
            isFollowing,
            isFollowedBy,
            followersCount: (progress.followers || []).length,
            followingCount: (progress.following || []).length,
            badges: (progress.achievements || []).map(id => ACHIEVEMENTS_CATALOG.find(a => a.id === id)).filter(Boolean)
        };
    }

    async getPublicProfile(targetUserId, currentUserId) {
        const profile = await this.getUserProfile(targetUserId, currentUserId);
        if (!profile) return null;

        const progress = await this.getUserProgress(targetUserId);
        if (progress?.settings?.privateProfile && targetUserId !== currentUserId) {
            return {
                userId: targetUserId,
                username: profile.username,
                avatar: profile.avatar,
                isPrivate: true,
                message: "Profil ini disetel privat oleh pengguna."
            };
        }

        return profile;
    }

    sanitizeProgressForResponse(p) {
        return this.progressRepo.sanitizeProgressForResponse(p);
    }

    saveToDisk() {
        // SQLite automatically persists to disk with WAL mode.
        // PostgreSQL handles transaction durability natively.
    }
}

const dbInstance = new ServerDatabaseBridge();

module.exports = {
    ServerDatabase: ServerDatabaseBridge,
    dbInstance,
    SERVER_REWARDS,
    ACHIEVEMENTS_CATALOG,
    WEEKLY_CHALLENGES_CATALOG,
    calculateLevelMetrics
};
