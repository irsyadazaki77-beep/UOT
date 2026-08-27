/**
 * Universe Of Tech - Social and Shop Controller
 */
const { sanitizeClientPayload } = require('../utils/sanitize');

class SocialController {
    constructor({ dbInstance }) {
        this.dbInstance = dbInstance;
    }

    patchSettings = (req, res) => {
        const userId = req.user.id;
        const patch = sanitizeClientPayload(req.body || {});

        const result = this.dbInstance.updateSettings(userId, patch);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    equipItem = (req, res) => {
        const userId = req.user.id;
        const { avatar, theme, accent } = req.body || {};

        const result = this.dbInstance.equipItem(userId, { avatar, theme, accent });
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    getLeaderboard = (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const { period = 'weekly', cohort = 'global', page = 1, limit = 20 } = req.query || {};
        const result = this.dbInstance.getLeaderboard({ period, cohort, page, limit, currentUserId });
        return res.json(result);
    };

    getSocialProfile = (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const { targetUserId } = req.params;
        const result = this.dbInstance.getSocialProfile(targetUserId, currentUserId);
        if (!result.ok) {
            return res.status(404).json(result);
        }
        return res.json(result);
    };

    follow = (req, res) => {
        const currentUserId = req.user.id;
        const { targetUserId } = req.body || {};
        const result = this.dbInstance.followUser(currentUserId, targetUserId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    unfollow = (req, res) => {
        const currentUserId = req.user.id;
        const { targetUserId } = req.body || {};
        const result = this.dbInstance.unfollowUser(currentUserId, targetUserId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    getFriends = (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const progress = this.dbInstance.getUserProgress(currentUserId);
        if (!progress) return res.status(404).json({ ok: false, error: "USER_NOT_FOUND" });

        const followingProfiles = (progress.following || []).map(id => this.dbInstance.getSocialProfile(id, currentUserId)).filter(r => r.ok);
        const followerProfiles = (progress.followers || []).map(id => this.dbInstance.getSocialProfile(id, currentUserId)).filter(r => r.ok);

        return res.json({
            ok: true,
            following: followingProfiles,
            followers: followerProfiles
        });
    };

    getChallenges = (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const result = this.dbInstance.getChallenges(currentUserId);
        return res.json(result);
    };

    claimChallengeReward = (req, res) => {
        const currentUserId = req.user.id;
        const { challengeId } = req.body || {};
        const result = this.dbInstance.claimChallengeReward(currentUserId, challengeId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    createFriendChallenge = (req, res) => {
        const currentUserId = req.user.id;
        const { targetUserId, challengeType, targetGoal } = req.body || {};
        const result = this.dbInstance.createFriendChallenge(currentUserId, targetUserId, { challengeType, targetGoal });
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    acceptFriendChallenge = (req, res) => {
        const currentUserId = req.user.id;
        const { challengeId } = req.body || {};
        const result = this.dbInstance.acceptFriendChallenge(currentUserId, challengeId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    getNotifications = (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const result = this.dbInstance.getNotifications(currentUserId);
        return res.json(result);
    };

    markNotificationsRead = (req, res) => {
        const currentUserId = req.user.id;
        const result = this.dbInstance.markNotificationsRead(currentUserId);
        return res.json(result);
    };
}

module.exports = SocialController;
