/**
 * Universe Of Tech - Admin Controller
 * FASE 1: Full Async Canonical Refactor
 */
const fs = require('fs');
const path = require('path');

class AdminController {
    constructor({ dbInstance, analyticsEngineInstance, ContentEngine, contentRepository, saveDomainContentToDisk, ContentMigrationTool, APP_ENV, searchIndexService, retrievalEngine }) {
        this.dbInstance = dbInstance;
        this.analyticsEngineInstance = analyticsEngineInstance;
        this.ContentEngine = ContentEngine;
        this.contentRepository = contentRepository;
        this.saveDomainContentToDisk = saveDomainContentToDisk;
        this.ContentMigrationTool = ContentMigrationTool;
        this.APP_ENV = APP_ENV;
        this.searchIndexService = searchIndexService;
        this.retrievalEngine = retrievalEngine;
    }

    _refreshIndices = () => {
        if (this.searchIndexService && typeof this.searchIndexService.buildIndex === 'function') {
            this.searchIndexService.buildIndex().catch(e => console.warn('[AdminController] Search index refresh note:', e.message));
        }
        if (this.retrievalEngine && typeof this.retrievalEngine.invalidateIndex === 'function') {
            this.retrievalEngine.invalidateIndex();
        }
    };

    getAnalytics = async (req, res) => {
        try {
            const funnel = this.analyticsEngineInstance ? this.analyticsEngineInstance.getFunnelMetrics() : {};
            const learning = this.analyticsEngineInstance ? this.analyticsEngineInstance.getLearningMetrics() : {};
            const difficultContent = this.analyticsEngineInstance ? this.analyticsEngineInstance.getDifficultContentFlags() : {};
            const errors = this.analyticsEngineInstance ? this.analyticsEngineInstance.getErrorTelemetrySummary() : {};
            const vitals = this.analyticsEngineInstance ? this.analyticsEngineInstance.getPerformanceTelemetrySummary() : {};

            return res.json({
                ok: true,
                timestamp: new Date().toISOString(),
                funnel,
                learning,
                difficultContent,
                errors,
                vitals
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'ANALYTICS_ERROR', message: err.message });
        }
    };

    getObservability = async (req, res) => {
        try {
            const mem = process.memoryUsage();
            const dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'uot.sqlite');
            let dbSize = 0;
            try {
                const stat = await fs.promises.stat(dbPath);
                dbSize = stat.size;
            } catch (_) {
                // Ignore if sqlite file not on disk or postgres in use
            }

            const totalUsers = this.dbInstance?.userRepo ? await this.dbInstance.userRepo.count() : 0;

            return res.json({
                ok: true,
                health: {
                    backend: {
                        status: 'healthy',
                        uptimeSeconds: Math.round(process.uptime()),
                        memoryUsageRssMb: Math.round(mem.rss / (1024 * 1024)),
                        memoryHeapMb: Math.round(mem.heapUsed / (1024 * 1024)),
                        nodeVersion: process.version,
                        env: this.APP_ENV
                    },
                    database: {
                        status: 'healthy',
                        storeSizeBytes: dbSize,
                        schemaVersion: 6,
                        totalUsers,
                        totalProgressRecords: totalUsers
                    },
                    telemetry: {
                        totalEvents: this.analyticsEngineInstance?.events?.length || 0,
                        totalErrors: this.analyticsEngineInstance?.errors?.length || 0,
                        totalVitals: this.analyticsEngineInstance?.vitals?.length || 0
                    }
                },
                errorsSummary: this.analyticsEngineInstance ? this.analyticsEngineInstance.getErrorTelemetrySummary() : {},
                vitalsSummary: this.analyticsEngineInstance ? this.analyticsEngineInstance.getPerformanceTelemetrySummary() : {}
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'OBSERVABILITY_ERROR', message: err.message });
        }
    };

    updateFeatureFlag = async (req, res) => {
        try {
            const { key, enabled } = req.body || {};
            if (!key) return res.status(400).json({ ok: false, error: 'MISSING_KEY' });

            const result = this.analyticsEngineInstance.updateFeatureFlag(key, { enabled });
            return res.json(result);
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'FEATURE_FLAG_ERROR', message: err.message });
        }
    };

    getContentVersion = async (req, res) => {
        try {
            const meta = this.contentRepository ? await this.contentRepository.getMeta() : { version: Date.now(), counts: {} };
            return res.json({
                ok: true,
                version: meta.version,
                engineVersion: this.ContentEngine?.ENGINE_VERSION || '2.0.0',
                timestamp: meta.timestamp || new Date().toISOString(),
                counts: meta.counts
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'CONTENT_VERSION_ERROR', message: err.message });
        }
    };

    getContentAll = async (req, res) => {
        try {
            if (this.contentRepository) {
                const bundle = await this.contentRepository.exportAll();
                return res.json({
                    ok: true,
                    version: this.contentRepository.contentVersion,
                    engineVersion: this.ContentEngine?.ENGINE_VERSION || '2.0.0',
                    content: bundle
                });
            }

            return res.json({
                ok: true,
                version: this.ContentEngine?.ENGINE_VERSION || '2.0.0',
                content: {
                    quizzes: this.ContentEngine.getAll('quizzes'),
                    lessons: this.ContentEngine.getAll('lessons'),
                    projects: this.ContentEngine.getAll('projects'),
                    learningPaths: this.ContentEngine.getAll('learningPaths'),
                    culture: this.ContentEngine.getAll('culture'),
                    books: this.ContentEngine.getAll('books')
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'CONTENT_ALL_ERROR', message: err.message });
        }
    };

    getContentItem = async (req, res) => {
        try {
            const { domain, id } = req.params;
            const normDomain = this.ContentEngine?.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;

            let item = null;
            if (this.contentRepository) {
                item = await this.contentRepository.get(normDomain, id);
            } else {
                if (normDomain === 'lessons') item = this.ContentEngine.getLesson(id);
                else if (normDomain === 'quizzes') item = this.ContentEngine.getQuiz(id);
                else if (normDomain === 'projects') item = this.ContentEngine.getProject(id);
            }

            if (!item || item.isFallback) {
                return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
            }
            return res.json({ ok: true, domain: normDomain, item });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'CONTENT_ITEM_ERROR', message: err.message });
        }
    };

    getAdminContent = async (req, res) => {
        try {
            const bundle = this.contentRepository ? await this.contentRepository.exportAll() : this.ContentEngine.exportAll();
            const audit = this.ContentEngine?.validateAll ? this.ContentEngine.validateAll() : { valid: true, issues: [] };
            const meta = this.contentRepository ? await this.contentRepository.getMeta() : { counts: {} };

            return res.json({
                ok: true,
                meta,
                content: bundle,
                audit
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'ADMIN_CONTENT_ERROR', message: err.message });
        }
    };

    saveContent = async (req, res) => {
        try {
            const { domain, item } = req.body || {};
            if (!domain || !item || !item.id) {
                return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain dan objek item wajib diisi.' });
            }

            const normDomain = this.ContentEngine?.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;

            let validation = { valid: true, errors: [] };
            if (this.ContentEngine) {
                if (normDomain === 'quizzes') validation = this.ContentEngine.validateQuiz(item);
                else if (normDomain === 'lessons') validation = this.ContentEngine.validateLesson(item);
                else if (normDomain === 'projects') validation = this.ContentEngine.validateProject(item);
                else if (normDomain === 'learningPaths') validation = this.ContentEngine.validateLearningPath(item);
                else if (normDomain === 'culture') validation = this.ContentEngine.validateCulture(item);
                else if (normDomain === 'books') validation = this.ContentEngine.validateBook(item);
            }

            if (!validation.valid) {
                return res.status(422).json({
                    ok: false,
                    error: 'VALIDATION_FAILED',
                    message: 'Validasi skema konten gagal.',
                    errors: validation.errors
                });
            }

            let savedItem = null;
            if (this.contentRepository) {
                savedItem = await this.contentRepository.save(normDomain, item);
                if (this.ContentEngine) this.ContentEngine.registerContent(normDomain, [savedItem]);
            } else {
                item.status = item.status || 'published';
                item.version = (item.version || 1) + 1;
                item.updatedAt = new Date().toISOString();
                if (this.ContentEngine) this.ContentEngine.registerContent(normDomain, [item]);
                if (typeof this.saveDomainContentToDisk === 'function') this.saveDomainContentToDisk(normDomain);
                savedItem = item;
            }

            this._refreshIndices();

            return res.json({
                ok: true,
                message: `Konten '${item.id}' berhasil disimpan di domain '${normDomain}'.`,
                item: savedItem
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'SAVE_CONTENT_ERROR', message: err.message });
        }
    };

    publishContent = async (req, res) => {
        try {
            const { domain, id, status } = req.body || {};
            if (!domain || !id || !status) {
                return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain, ID, dan status wajib diisi.' });
            }

            const normDomain = this.ContentEngine?.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;
            const targetStatus = status === 'draft' ? 'draft' : 'published';

            let item = null;
            if (this.contentRepository) {
                item = await this.contentRepository.publish(normDomain, id, targetStatus);
                if (item && this.ContentEngine) this.ContentEngine.registerContent(normDomain, [item]);
            } else {
                if (normDomain === 'lessons') item = this.ContentEngine.getLesson(id);
                else if (normDomain === 'quizzes') item = this.ContentEngine.getQuiz(id);
                else if (normDomain === 'projects') item = this.ContentEngine.getProject(id);
                if (item && !item.isFallback) {
                    item.status = targetStatus;
                    item.updatedAt = new Date().toISOString();
                    if (typeof this.saveDomainContentToDisk === 'function') this.saveDomainContentToDisk(normDomain);
                }
            }

            if (!item || item.isFallback) {
                return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Item tidak ditemukan.' });
            }

            this._refreshIndices();

            return res.json({
                ok: true,
                message: `Status konten '${id}' diubah menjadi '${item.status}'.`,
                item
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'PUBLISH_CONTENT_ERROR', message: err.message });
        }
    };

    deleteContent = async (req, res) => {
        try {
            const { domain, id } = req.body || {};
            if (!domain || !id) {
                return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain dan ID wajib diisi.' });
            }

            const normDomain = this.ContentEngine?.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;
            let deleted = false;
            if (this.contentRepository) {
                deleted = await this.contentRepository.delete(normDomain, id);
            }
            this._refreshIndices();
            return res.json({ ok: true, deleted, message: deleted ? `Konten '${id}' berhasil dihapus.` : `Konten '${id}' tidak ditemukan.` });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'DELETE_CONTENT_ERROR', message: err.message });
        }
    };

    validateContent = async (req, res) => {
        try {
            const audit = this.ContentEngine?.validateAll ? this.ContentEngine.validateAll() : { valid: true, issues: [] };
            return res.json({ ok: true, audit });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'VALIDATE_CONTENT_ERROR', message: err.message });
        }
    };

    importContent = async (req, res) => {
        try {
            const { bundle } = req.body || {};
            let count = 0;
            if (this.contentRepository) {
                const importRes = await this.contentRepository.importBundle(bundle);
                count = importRes?.count || 0;
                if (this.ContentEngine) this.ContentEngine.importBundle(bundle);
            } else {
                const result = this.ContentEngine.importBundle(bundle);
                if (!result.success) {
                    return res.status(400).json({ ok: false, error: 'IMPORT_FAILED', message: result.message });
                }
                count = result.importedCount;
                if (typeof this.saveDomainContentToDisk === 'function') {
                    ['quizzes', 'lessons', 'projects', 'learningPaths', 'culture', 'books'].forEach(this.saveDomainContentToDisk);
                }
            }

            this._refreshIndices();

            return res.json({
                ok: true,
                message: `Berhasil mengimpor ${count} item konten.`,
                importedCount: count
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'IMPORT_CONTENT_ERROR', message: err.message });
        }
    };

    exportContent = async (req, res) => {
        try {
            const bundle = this.contentRepository ? await this.contentRepository.exportAll() : this.ContentEngine.exportAll();
            return res.json({ ok: true, bundle });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'EXPORT_CONTENT_ERROR', message: err.message });
        }
    };

    migrateContent = async (req, res) => {
        try {
            const migrator = new this.ContentMigrationTool();
            const result = migrator.runMigration();
            if (this.contentRepository && result.bundle) {
                await this.contentRepository.importBundle(result.bundle);
                if (this.ContentEngine) this.ContentEngine.importBundle(result.bundle);
            }
            return res.json({
                ok: true,
                message: 'Migrasi seluruh konten berhasil diselesaikan.',
                stats: result.stats
            });
        } catch (err) {
            return res.status(500).json({
                ok: false,
                error: 'MIGRATION_ERROR',
                message: err.message
            });
        }
    };

    getDbStatus = async (req, res) => {
        try {
            const { db, userRepository, analyticsRepository } = require('../../../db');
            const userCount = await userRepository.count();
            const eventCountRow = await db.getAsync('SELECT COUNT(*) as count FROM progress_events');
            const quizCountRow = await db.getAsync('SELECT COUNT(*) as count FROM quiz_attempts');
            const migrationVersionRow = await db.getAsync('SELECT MAX(id) as version FROM schema_migrations');
            const analyticsEvents = await analyticsRepository.getEvents(1000);
            const isPostgres = !!process.env.DATABASE_URL;

            return res.json({
                ok: true,
                database: {
                    engine: isPostgres ? 'postgresql' : 'sqlite',
                    mode: isPostgres ? 'Production PostgreSQL Pool' : 'Local SQLite WAL Persistence',
                    version: migrationVersionRow?.version || 1,
                    health: 'healthy'
                },
                counts: {
                    users: userCount,
                    progressEvents: eventCountRow?.count || 0,
                    quizAttempts: quizCountRow?.count || 0,
                    analyticsEvents: analyticsEvents.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'DB_STATUS_ERROR', message: err.message });
        }
    };

    createDbBackup = async (req, res) => {
        try {
            const { backupService } = require('../../../db');
            const { label = 'manual' } = req.body || {};
            const result = await backupService.createSnapshot(label);
            return res.json({
                ok: true,
                message: 'Database snapshot created successfully.',
                backup: result
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'BACKUP_ERROR', message: err.message });
        }
    };

    listDbBackups = async (req, res) => {
        try {
            const { backupService } = require('../../../db');
            const snapshots = await backupService.listSnapshots();
            return res.json({ ok: true, snapshots });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'BACKUP_LIST_ERROR', message: err.message });
        }
    };
}

module.exports = AdminController;
