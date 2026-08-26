/**
 * UNIVERSE OF TECH - SERVER DATABASE INTEGRATION LAYER
 * FASE 18: High-Reliability Persistent Data Access Bridge
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
} = require('./db');

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

        // Map compatibility proxies for legacy tests
        this._initCompatibilityProxies();
    }

    _initCompatibilityProxies() {
        const self = this;

        this.users = {
            has: (email) => !!self.userRepo.findByEmail(email),
            get: (email) => self.userRepo.findByEmail(email),
            set: (email, user) => {
                const existing = self.userRepo.findByEmail(email) || (user.id ? self.userRepo.findById(user.id) : null);
                if (existing) {
                    return self.userRepo.update(existing.id, user);
                } else {
                    return self.userRepo.create({
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
            delete: (email) => {
                const u = self.userRepo.findByEmail(email);
                return u ? self.userRepo.delete(u.id) : false;
            },
            clear: () => {
                self.db.run('DELETE FROM users');
            },
            values: () => self.userRepo.getAll(10000, 0),
            [Symbol.iterator]: function* () {
                for (const u of self.userRepo.getAll(10000, 0)) {
                    yield [u.email, u];
                }
            }
        };

        this.sessions = {
            has: (token) => !!self.sessionRepo.findByToken(token),
            get: (token) => {
                const s = self.sessionRepo.findByToken(token);
                if (!s) return undefined;
                return {
                    sessionToken: s.token,
                    userId: s.userId,
                    csrfToken: s.csrfToken || s.token,
                    createdAt: new Date(s.createdAt).getTime(),
                    expiresAt: new Date(s.expiresAt).getTime()
                };
            },
            set: (token, session) => {
                const maxAgeMs = (session.expiresAt || (Date.now() + 24 * 60 * 60 * 1000)) - Date.now();
                return self.sessionRepo.create({
                    token,
                    userId: session.userId,
                    csrfToken: session.csrfToken || token,
                    role: session.role || 'user',
                    isPro: !!session.isPro,
                    maxAgeMs: Math.max(1000, maxAgeMs)
                });
            },
            delete: (token) => self.sessionRepo.delete(token),
            clear: () => {
                self.db.run('DELETE FROM sessions');
            }
        };

        this.subscriptions = {
            has: (userId) => !!self.subRepo.findByUserId(userId),
            get: (userId) => {
                const s = self.subRepo.findByUserId(userId);
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
            set: (userId, sub) => {
                return self.subRepo.save({
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
            delete: (userId) => self.subRepo.updateStatus(userId, 'canceled'),
            clear: () => {
                self.db.run('DELETE FROM subscriptions');
            }
        };

        this.invoices = {
            create: (invoice) => self.subRepo.createInvoice(invoice),
            getByUserId: (userId) => self.subRepo.getInvoicesByUserId(userId),
            updateStatus: (id, status) => self.subRepo.updateInvoiceStatus(id, status)
        };

        this.progress = {
            has: (userId) => !!self.progressRepo.getUserProgress(userId),
            get: (userId) => self.progressRepo.getUserProgress(userId),
            set: (userId, p) => {
                // If direct assignment, sync back to progress repo
                if (p && p.settings) self.progressRepo.updateSettings(userId, p.settings);
            },
            clear: () => {
                self.db.run('DELETE FROM user_progress');
                self.db.run('DELETE FROM progress_events');
                self.db.run('DELETE FROM quiz_attempts');
                self.db.run('DELETE FROM user_completed_lessons');
                self.db.run('DELETE FROM achievements');
                self.db.run('DELETE FROM user_inventory');
            }
        };
    }

    getUserProgress(userId) {
        const raw = this.progressRepo.getUserProgress(userId);
        if (!raw) return null;

        const self = this;

        // Reactive xpLedger array
        const xpLedgerProxy = new Proxy(raw.xpLedger || [], {
            get(target, prop, receiver) {
                if (prop === 'push') {
                    return function(...items) {
                        for (const item of items) {
                            if (item) {
                                const evtId = item.eventId || `evt_leg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                                const timestamp = item.timestamp || new Date().toISOString();
                                self.db.run(`
                                    INSERT OR IGNORE INTO progress_events (
                                        event_id, user_id, event_type, client_timestamp, server_timestamp,
                                        xp_awarded, coins_awarded, reason, payload_json, result_json
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    evtId,
                                    userId,
                                    item.eventType || 'legacy_event',
                                    timestamp,
                                    timestamp,
                                    Number(item.xp) || 0,
                                    Number(item.coins) || 0,
                                    item.reason || 'Legacy update',
                                    JSON.stringify(item),
                                    JSON.stringify(item)
                                ]);
                            }
                        }
                        return target.push(...items);
                    };
                }
                return Reflect.get(target, prop, receiver);
            }
        });

        // Reactive settings proxy
        const settingsProxy = new Proxy(raw.settings || {}, {
            set(target, prop, value) {
                target[prop] = value;
                self.progressRepo.updateSettings(userId, { [prop]: value });
                return true;
            }
        });

        // Reactive profile proxy
        const profileProxy = new Proxy(raw.profile || {}, {
            set(target, prop, value) {
                target[prop] = value;
                if (prop === 'username') {
                    self.db.run('UPDATE users SET username = ? WHERE id = ?', [value, userId]);
                }
                if (prop === 'email') {
                    self.db.run('UPDATE users SET email = ? WHERE id = ?', [value, userId]);
                }
                return true;
            }
        });

        raw.xpLedger = xpLedgerProxy;
        raw.settings = settingsProxy;
        raw.profile = profileProxy;

        return new Proxy(raw, {
            get(target, prop, receiver) {
                if (prop === 'lifetimeXp' || prop === 'coins' || prop === 'level' || prop === 'streak' || prop === 'flagged') {
                    const row = self.db.get('SELECT lifetime_xp, coins, level, streak, flagged FROM user_progress WHERE user_id = ?', [userId]);
                    if (row) {
                        if (prop === 'lifetimeXp') return row.lifetime_xp;
                        if (prop === 'coins') return row.coins;
                        if (prop === 'level') return row.level;
                        if (prop === 'streak') return row.streak;
                        if (prop === 'flagged') return Boolean(row.flagged);
                    }
                }
                if (prop === 'suspiciousFlags') {
                    return self.db.all('SELECT reason as type, reason, created_at as timestamp FROM suspicious_flags WHERE user_id = ?', [userId]);
                }
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, value) {
                target[prop] = value;
                if (prop === 'lifetimeXp') {
                    self.db.run('UPDATE user_progress SET lifetime_xp = ? WHERE user_id = ?', [Number(value) || 0, userId]);
                }
                if (prop === 'coins') {
                    self.db.run('UPDATE user_progress SET coins = ? WHERE user_id = ?', [Number(value) || 0, userId]);
                }
                if (prop === 'level') {
                    self.db.run('UPDATE user_progress SET level = ? WHERE user_id = ?', [Number(value) || 1, userId]);
                }
                if (prop === 'streak') {
                    self.db.run('UPDATE user_progress SET streak = ? WHERE user_id = ?', [Number(value) || 0, userId]);
                }
                return true;
            }
        });
    }

    processActivityEvent(userId, event) {
        return this.progressRepo.processActivityEvent(userId, event);
    }

    syncProgress(userId, payload) {
        return this.progressRepo.syncProgress(userId, payload);
    }

    updateSettings(userId, patch) {
        return this.progressRepo.updateSettings(userId, patch);
    }

    equipItem(userId, items) {
        return this.progressRepo.equipItem(userId, items);
    }

    getUserMastery(userId) {
        return this.progressRepo.getUserMastery(userId);
    }

    getUserRecommendations(userId, options) {
        return this.progressRepo.getUserRecommendations(userId, options);
    }

    recordRecommendationInteraction(userId, interactionType, recommendationId, metadata) {
        return this.progressRepo.recordRecommendationInteraction(userId, interactionType, recommendationId, metadata);
    }

    getLeaderboard(options) {
        return this.progressRepo.getLeaderboard(options);
    }

    followUser(currentUserId, targetUserId) {
        return this.progressRepo.followUser(currentUserId, targetUserId);
    }

    unfollowUser(currentUserId, targetUserId) {
        return this.progressRepo.unfollowUser(currentUserId, targetUserId);
    }

    claimChallengeReward(currentUserId, challengeId) {
        return this.progressRepo.claimChallengeReward(currentUserId, challengeId);
    }

    createFriendChallenge(currentUserId, targetUserId, details) {
        return this.progressRepo.createFriendChallenge(currentUserId, targetUserId, details);
    }

    acceptFriendChallenge(currentUserId, challengeId) {
        return this.progressRepo.acceptFriendChallenge(currentUserId, challengeId);
    }

    addNotification(userId, notif) {
        return this.progressRepo.addNotification(userId, notif);
    }

    getNotifications(userId) {
        return this.progressRepo.getNotifications(userId);
    }

    markNotificationsRead(currentUserId) {
        return this.progressRepo.markNotificationsRead(currentUserId);
    }

    getNotificationSummary(userId) {
        return this.progressRepo.getNotificationSummary(userId);
    }

    getSocialProfile(targetUserId, currentUserId) {
        return this.progressRepo.getSocialProfile(targetUserId, currentUserId);
    }

    getChallenges(userId) {
        return this.progressRepo.getChallenges(userId);
    }

    getUserProfile(targetUserId, currentUserId) {
        const progress = this.getUserProgress(targetUserId);
        if (!progress) return null;

        const isFollowing = currentUserId ? progress.followers.includes(currentUserId) : false;
        const isFollowedBy = currentUserId ? progress.following.includes(currentUserId) : false;

        return {
            userId: targetUserId,
            username: progress.profile.username,
            avatar: progress.equippedItems.avatar,
            title: progress.profile.title,
            level: progress.level,
            lifetimeXp: progress.lifetimeXp,
            streak: progress.streak,
            achievements: progress.achievements,
            isFollowing,
            isFollowedBy,
            followersCount: progress.followers.length,
            followingCount: progress.following.length,
            badges: progress.achievements.map(id => ACHIEVEMENTS_CATALOG.find(a => a.id === id)).filter(Boolean)
        };
    }

    getPublicProfile(targetUserId, currentUserId) {
        const profile = this.getUserProfile(targetUserId, currentUserId);
        if (!profile) return null;

        const progress = this.getUserProgress(targetUserId);
        if (progress.settings.privateProfile && targetUserId !== currentUserId) {
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
        // Backup snapshot can also be triggered if needed.
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
