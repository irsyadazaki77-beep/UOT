/**
 * Universe Of Tech - Progress & Learning State Routes
 */
const express = require('express');

function createProgressRouter({ progressController, middlewares, rateLimiter }) {
    const router = express.Router();
    const { requireAuth, requireCsrf } = middlewares;

    router.get('/api/me', progressController.getMe);
    router.get('/api/progress', progressController.getProgress);
    router.get('/api/mastery', progressController.getMastery);
    router.get('/api/recommendations', progressController.getRecommendations);
    router.post('/api/recommendations/interaction', rateLimiter({ max: 60, windowMs: 60000 }), progressController.recordRecommendationInteraction);

    router.get('/v1/learning-state', progressController.getLearningState);
    router.put('/v1/learning-state', rateLimiter({ max: 60, windowMs: 60000 }), requireAuth, requireCsrf, progressController.putLearningState);

    router.post('/api/progress/events', rateLimiter({ max: 60, windowMs: 60000 }), requireAuth, requireCsrf, progressController.processEvent);
    router.post('/api/progress/sync', rateLimiter({ max: 30, windowMs: 60000 }), requireAuth, requireCsrf, progressController.syncProgress);
    router.patch('/api/progress/settings', requireAuth, requireCsrf, progressController.patchSettings);

    router.get('/api/achievements', progressController.getAchievements);
    router.get('/api/inventory', progressController.getInventory);

    return router;
}

module.exports = createProgressRouter;
