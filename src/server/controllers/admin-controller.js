/**
 * Universe Of Tech - Admin Controller
 */
const fs = require('fs');
const path = require('path');

class AdminController {
    constructor({ dbInstance, analyticsEngineInstance, ContentEngine, contentRepository, saveDomainContentToDisk, ContentMigrationTool, APP_ENV }) {
        this.dbInstance = dbInstance;
        this.analyticsEngineInstance = analyticsEngineInstance;
        this.ContentEngine = ContentEngine;
        this.contentRepository = contentRepository;
        this.saveDomainContentToDisk = saveDomainContentToDisk;
        this.ContentMigrationTool = ContentMigrationTool;
        this.APP_ENV = APP_ENV;
    }

    getAnalytics = (req, res) => {
        const funnel = this.analyticsEngineInstance.getFunnelMetrics();
        const learning = this.analyticsEngineInstance.getLearningMetrics();
        const difficultContent = this.analyticsEngineInstance.getDifficultContentFlags();
        const errors = this.analyticsEngineInstance.getErrorTelemetrySummary();
        const vitals = this.analyticsEngineInstance.getPerformanceTelemetrySummary();

        return res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            funnel,
            learning,
            difficultContent,
            errors,
            vitals
        });
    };

    getObservability = (req, res) => {
        const mem = process.memoryUsage();
        const dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'uot_db_store.json');
        const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

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
                    totalUsers: this.dbInstance.users.size,
                    totalProgressRecords: this.dbInstance.progress.size
                },
                telemetry: {
                    totalEvents: this.analyticsEngineInstance.events.length,
                    totalErrors: this.analyticsEngineInstance.errors.length,
                    totalVitals: this.analyticsEngineInstance.vitals.length
                }
            },
            errorsSummary: this.analyticsEngineInstance.getErrorTelemetrySummary(),
            vitalsSummary: this.analyticsEngineInstance.getPerformanceTelemetrySummary()
        });
    };

    updateFeatureFlag = (req, res) => {
        const { key, enabled } = req.body || {};
        if (!key) return res.status(400).json({ ok: false, error: 'MISSING_KEY' });

        const result = this.analyticsEngineInstance.updateFeatureFlag(key, { enabled });
        return res.json(result);
    };

    getContentVersion = (req, res) => {
        const meta = this.contentRepository ? this.contentRepository.getMeta() : { version: Date.now(), counts: {} };
        return res.json({
            ok: true,
            version: meta.version,
            engineVersion: this.ContentEngine.ENGINE_VERSION,
            timestamp: meta.timestamp || new Date().toISOString(),
            counts: meta.counts
        });
    };

    getContentAll = (req, res) => {
        if (this.contentRepository) {
            return res.json({
                ok: true,
                version: this.contentRepository.contentVersion,
                engineVersion: this.ContentEngine.ENGINE_VERSION,
                content: {
                    quizzes: this.contentRepository.getAll('quizzes', { includeDrafts: false }),
                    lessons: this.contentRepository.getAll('lessons', { includeDrafts: false }),
                    learningPaths: this.contentRepository.getAll('learningPaths', { includeDrafts: false }),
                    projects: this.contentRepository.getAll('projects', { includeDrafts: false }),
                    culture: this.contentRepository.getAll('culture', { includeDrafts: false }),
                    books: this.contentRepository.getAll('books', { includeDrafts: false })
                }
            });
        }

        return res.json({
            ok: true,
            version: this.ContentEngine.ENGINE_VERSION,
            content: {
                quizzes: this.ContentEngine.getAll('quizzes'),
                lessons: this.ContentEngine.getAll('lessons'),
                projects: this.ContentEngine.getAll('projects'),
                learningPaths: this.ContentEngine.getAll('learningPaths'),
                culture: this.ContentEngine.getAll('culture'),
                books: this.ContentEngine.getAll('books')
            }
        });
    };

    getContentItem = (req, res) => {
        const { domain, id } = req.params;
        const normDomain = this.ContentEngine.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;

        let item = null;
        if (this.contentRepository) {
            item = this.contentRepository.get(normDomain, id);
        } else {
            if (normDomain === 'lessons') item = this.ContentEngine.getLesson(id);
            else if (normDomain === 'quizzes') item = this.ContentEngine.getQuiz(id);
            else if (normDomain === 'projects') item = this.ContentEngine.getProject(id);
        }

        if (!item || item.isFallback) {
            return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
        }
        return res.json({ ok: true, domain: normDomain, item });
    };

    getAdminContent = (req, res) => {
        const bundle = this.contentRepository ? this.contentRepository.exportAll() : this.ContentEngine.exportAll();
        const audit = this.ContentEngine.validateAll();
        const meta = this.contentRepository ? this.contentRepository.getMeta() : { counts: {} };

        return res.json({
            ok: true,
            meta,
            content: bundle,
            audit
        });
    };

    saveContent = (req, res) => {
        const { domain, item } = req.body || {};
        if (!domain || !item || !item.id) {
            return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain dan objek item wajib diisi.' });
        }

        const normDomain = this.ContentEngine.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;

        let validation = { valid: true, errors: [] };
        if (normDomain === 'quizzes') validation = this.ContentEngine.validateQuiz(item);
        else if (normDomain === 'lessons') validation = this.ContentEngine.validateLesson(item);
        else if (normDomain === 'projects') validation = this.ContentEngine.validateProject(item);
        else if (normDomain === 'learningPaths') validation = this.ContentEngine.validateLearningPath(item);
        else if (normDomain === 'culture') validation = this.ContentEngine.validateCulture(item);
        else if (normDomain === 'books') validation = this.ContentEngine.validateBook(item);

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
            savedItem = this.contentRepository.save(normDomain, item);
            this.ContentEngine.registerContent(normDomain, [savedItem]);
        } else {
            item.status = item.status || 'published';
            item.version = (item.version || 1) + 1;
            item.updatedAt = new Date().toISOString();
            this.ContentEngine.registerContent(normDomain, [item]);
            this.saveDomainContentToDisk(normDomain);
            savedItem = item;
        }

        return res.json({
            ok: true,
            message: `Konten '${item.id}' berhasil disimpan di domain '${normDomain}'.`,
            item: savedItem
        });
    };

    publishContent = (req, res) => {
        const { domain, id, status } = req.body || {};
        if (!domain || !id || !status) {
            return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain, ID, dan status wajib diisi.' });
        }

        const normDomain = this.ContentEngine.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;
        const targetStatus = status === 'draft' ? 'draft' : 'published';

        let item = null;
        if (this.contentRepository) {
            item = this.contentRepository.publish(normDomain, id, targetStatus);
            if (item) this.ContentEngine.registerContent(normDomain, [item]);
        } else {
            if (normDomain === 'lessons') item = this.ContentEngine.getLesson(id);
            else if (normDomain === 'quizzes') item = this.ContentEngine.getQuiz(id);
            else if (normDomain === 'projects') item = this.ContentEngine.getProject(id);
            if (item && !item.isFallback) {
                item.status = targetStatus;
                item.updatedAt = new Date().toISOString();
                this.saveDomainContentToDisk(normDomain);
            }
        }

        if (!item || item.isFallback) {
            return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Item tidak ditemukan.' });
        }

        return res.json({
            ok: true,
            message: `Status konten '${id}' diubah menjadi '${item.status}'.`,
            item
        });
    };

    deleteContent = (req, res) => {
        const { domain, id } = req.body || {};
        if (!domain || !id) {
            return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Domain dan ID wajib diisi.' });
        }

        const normDomain = this.ContentEngine.normalizeDomain ? this.ContentEngine.normalizeDomain(domain) : domain;
        let deleted = false;
        if (this.contentRepository) {
            deleted = this.contentRepository.delete(normDomain, id);
        }
        return res.json({ ok: true, deleted, message: deleted ? `Konten '${id}' berhasil dihapus.` : `Konten '${id}' tidak ditemukan.` });
    };

    validateContent = (req, res) => {
        const audit = this.ContentEngine.validateAll();
        return res.json({ ok: true, audit });
    };

    importContent = (req, res) => {
        const { bundle } = req.body || {};
        let count = 0;
        if (this.contentRepository) {
            const importRes = this.contentRepository.importBundle(bundle);
            count = importRes.count || 0;
            this.ContentEngine.importBundle(bundle);
        } else {
            const result = this.ContentEngine.importBundle(bundle);
            if (!result.success) {
                return res.status(400).json({ ok: false, error: 'IMPORT_FAILED', message: result.message });
            }
            count = result.importedCount;
            ['quizzes', 'lessons', 'projects', 'learningPaths', 'culture', 'books'].forEach(this.saveDomainContentToDisk);
        }

        return res.json({
            ok: true,
            message: `Berhasil mengimpor ${count} item konten.`,
            importedCount: count
        });
    };

    exportContent = (req, res) => {
        const bundle = this.contentRepository ? this.contentRepository.exportAll() : this.ContentEngine.exportAll();
        return res.json({ ok: true, bundle });
    };

    migrateContent = (req, res) => {
        try {
            const migrator = new this.ContentMigrationTool();
            const result = migrator.runMigration();
            if (this.contentRepository && result.bundle) {
                this.contentRepository.importBundle(result.bundle);
                this.ContentEngine.importBundle(result.bundle);
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

    getDbStatus = (req, res) => {
        try {
            const { db, userRepository, sessionRepository, analyticsRepository } = require('../../../db');
            const userCount = userRepository.count();
            const eventCountRow = db.get('SELECT COUNT(*) as count FROM progress_events');
            const quizCountRow = db.get('SELECT COUNT(*) as count FROM quiz_attempts');
            const migrationVersionRow = db.get('SELECT MAX(version) as version FROM schema_migrations');
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
                    analyticsEvents: analyticsRepository.getEvents(1000).length
                },
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'DB_STATUS_ERROR', message: err.message });
        }
    };

    createDbBackup = (req, res) => {
        try {
            const { backupService } = require('../../../db');
            const { label = 'manual' } = req.body || {};
            const result = backupService.createSnapshot(label);
            return res.json({
                ok: true,
                message: 'Database snapshot created successfully.',
                backup: result
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'BACKUP_ERROR', message: err.message });
        }
    };

    listDbBackups = (req, res) => {
        try {
            const { backupService } = require('../../../db');
            const snapshots = backupService.listSnapshots();
            return res.json({ ok: true, snapshots });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'BACKUP_LIST_ERROR', message: err.message });
        }
    };
}

module.exports = AdminController;
