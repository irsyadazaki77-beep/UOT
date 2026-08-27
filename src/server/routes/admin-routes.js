/**
 * Universe Of Tech - Admin Routes
 */
const express = require('express');

function createAdminRouter({ adminController, middlewares, rateLimiter }) {
    const router = express.Router();
    const { requireAdmin, requireCsrf } = middlewares;

    // Public content version/bundle endpoints (unauthenticated or public)
    router.get(['/api/content/version', '/api/content/meta'], adminController.getContentVersion);
    router.get('/api/content/all', adminController.getContentAll);
    router.get('/api/content/:domain/:id', adminController.getContentItem);

    // Admin analytics and feature-flags
    router.get('/api/admin/analytics', requireAdmin, adminController.getAnalytics);
    router.get('/api/admin/observability', requireAdmin, adminController.getObservability);
    router.post('/api/admin/feature-flags', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, adminController.updateFeatureFlag);

    // Admin content authoring management
    router.get('/api/admin/content', requireAdmin, adminController.getAdminContent);
    router.post('/api/admin/content/save', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, adminController.saveContent);
    router.post('/api/admin/content/publish', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, adminController.publishContent);
    router.post('/api/admin/content/delete', rateLimiter({ max: 30, windowMs: 60000 }), requireAdmin, requireCsrf, adminController.deleteContent);
    router.get('/api/admin/content/validate', requireAdmin, adminController.validateContent);
    router.post('/api/admin/content/import', rateLimiter({ max: 10, windowMs: 60000 }), requireAdmin, requireCsrf, adminController.importContent);
    router.get('/api/admin/content/export', requireAdmin, adminController.exportContent);
    router.post('/api/admin/content/migrate', rateLimiter({ max: 5, windowMs: 60000 }), requireAdmin, requireCsrf, adminController.migrateContent);

    // Admin database status and backup snapshots
    router.get('/api/admin/db/status', requireAdmin, adminController.getDbStatus);
    router.post('/api/admin/db/backup', requireAdmin, requireCsrf, adminController.createDbBackup);
    router.get('/api/admin/db/backups', requireAdmin, adminController.listDbBackups);

    return router;
}

module.exports = createAdminRouter;
