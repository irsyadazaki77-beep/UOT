/**
 * Universe Of Tech - Social Routes
 */
const express = require('express');

function createSocialRouter({ socialController, middlewares, rateLimiter }) {
    const router = Router = express.Router();
    const { requireAuth, requireCsrf } = middlewares;

    router.patch('/api/settings', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, socialController.patchSettings);
    router.post('/api/inventory/equip', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, socialController.equipItem);

    router.get('/api/social/leaderboard', socialController.getLeaderboard);
    router.get('/api/social/profile/:targetUserId', socialController.getSocialProfile);
    router.post('/api/social/follow', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, socialController.follow);
    router.post('/api/social/unfollow', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, socialController.unfollow);
    router.get('/api/social/friends', socialController.getFriends);

    router.get('/api/social/challenges', socialController.getChallenges);
    router.post('/api/social/challenges/claim', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, socialController.claimChallengeReward);
    router.post('/api/social/friend-challenge/create', rateLimiter({ max: 20, windowMs: 60000 }), requireAuth, requireCsrf, socialController.createFriendChallenge);
    router.post('/api/social/friend-challenge/accept', rateLimiter({ max: 20, windowMs: 60000 }), requireAuth, requireCsrf, socialController.acceptFriendChallenge);

    router.get('/api/social/notifications', socialController.getNotifications);
    router.post('/api/social/notifications/read', requireAuth, requireCsrf, socialController.markNotificationsRead);

    return router;
}

module.exports = createSocialRouter;
