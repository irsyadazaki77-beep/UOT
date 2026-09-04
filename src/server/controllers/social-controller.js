/**
 * Universe Of Tech - Social and Shop Controller
 */
const { sanitizeClientPayload } = require('../utils/sanitize');

class SocialController {
    constructor({ dbInstance }) {
        this.dbInstance = dbInstance;
    }

    patchSettings = async (req, res) => {
        const userId = req.user.id;
        const patch = sanitizeClientPayload(req.body || {});

        const result = await this.dbInstance.updateSettings(userId, patch);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    equipItem = async (req, res) => {
        const userId = req.user.id;
        const { avatar, theme, accent } = req.body || {};

        const result = await this.dbInstance.equipItem(userId, { avatar, theme, accent });
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    getLeaderboard = async (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const { period = 'weekly', cohort = 'global', page = 1, limit = 20 } = req.query || {};
        const result = await this.dbInstance.getLeaderboard({ period, cohort, page, limit, currentUserId });
        return res.json(result);
    };

    getSocialProfile = async (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const { targetUserId } = req.params;
        const result = await this.dbInstance.getSocialProfile(targetUserId, currentUserId);
        if (!result.ok) {
            return res.status(404).json(result);
        }
        return res.json(result);
    };

    follow = async (req, res) => {
        const currentUserId = req.user.id;
        const { targetUserId } = req.body || {};
        const result = await this.dbInstance.followUser(currentUserId, targetUserId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    unfollow = async (req, res) => {
        const currentUserId = req.user.id;
        const { targetUserId } = req.body || {};
        const result = await this.dbInstance.unfollowUser(currentUserId, targetUserId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    getFriends = async (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const progress = await this.dbInstance.getUserProgress(currentUserId);
        if (!progress) return res.status(404).json({ ok: false, error: "USER_NOT_FOUND" });

        const followingProfiles = (await Promise.all((progress.following || []).map(id => this.dbInstance.getSocialProfile(id, currentUserId)))).filter(r => r && r.ok);
        const followerProfiles = (await Promise.all((progress.followers || []).map(id => this.dbInstance.getSocialProfile(id, currentUserId)))).filter(r => r && r.ok);

        return res.json({
            ok: true,
            following: followingProfiles,
            followers: followerProfiles
        });
    };

    getChallenges = async (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const result = await this.dbInstance.getChallenges(currentUserId);
        return res.json(result);
    };

    claimChallengeReward = async (req, res) => {
        const currentUserId = req.user.id;
        const { challengeId } = req.body || {};
        const result = await this.dbInstance.claimChallengeReward(currentUserId, challengeId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    createFriendChallenge = async (req, res) => {
        const currentUserId = req.user.id;
        const { targetUserId, challengeType, targetGoal } = req.body || {};
        const result = await this.dbInstance.createFriendChallenge(currentUserId, targetUserId, { challengeType, targetGoal });
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    acceptFriendChallenge = async (req, res) => {
        const currentUserId = req.user.id;
        const { challengeId } = req.body || {};
        const result = await this.dbInstance.acceptFriendChallenge(currentUserId, challengeId);
        if (!result.ok) {
            return res.status(400).json(result);
        }
        return res.json(result);
    };

    getNotifications = async (req, res) => {
        const currentUserId = req.user ? req.user.id : 'usr_demo_7701';
        const result = await this.dbInstance.getNotifications(currentUserId);
        return res.json(result);
    };

    markNotificationsRead = async (req, res) => {
        const currentUserId = req.user.id;
        const result = await this.dbInstance.markNotificationsRead(currentUserId);
        return res.json(result);
    };
}

module.exports = SocialController;
