/**
 * UNIVERSE OF TECH - CONTENT REPOSITORY
 * FASE 20: Unified Single Source of Truth Content & CMS Repository
 */

const fs = require('fs');
const path = require('path');

class ContentRepository {
    constructor(dbAdapter, options = {}) {
        this.db = dbAdapter;
        this.dataDir = options.dataDir || path.join(__dirname, '..', '..', 'data');
        this.contentDir = options.contentDir || path.join(this.dataDir, 'content');
        this.contentVersion = Date.now();
    }

    normalizeDomain(domain) {
        if (!domain || typeof domain !== 'string') return 'quizzes';
        const d = domain.trim().toLowerCase();
        if (d === 'learningpaths' || d === 'learning-paths' || d === 'learning_paths' || d === 'learningpath' || d === 'tracks' || d === 'track') {
            return 'learningPaths';
        }
        if (d === 'quizzes' || d === 'quiz' || d === 'questions' || d === 'question') {
            return 'quizzes';
        }
        if (d === 'lessons' || d === 'lesson' || d === 'materi') {
            return 'lessons';
        }
        if (d === 'projects' || d === 'project') {
            return 'projects';
        }
        if (d === 'culture' || d === 'budaya' || d === 'places' || d === 'place') {
            return 'culture';
        }
        if (d === 'books' || d === 'book' || d === 'library') {
            return 'books';
        }
        return domain;
    }

    _getDiskFileNames(canonicalDomain) {
        if (canonicalDomain === 'learningPaths' || canonicalDomain === 'learning-paths') {
            return ['learning-paths.json'];
        }
        return [`${canonicalDomain}.json`];
    }

    _syncDomainToDisk(canonicalDomain) {
        try {
            if (!fs.existsSync(this.contentDir)) {
                fs.mkdirSync(this.contentDir, { recursive: true });
            }
            const allItems = this.getAll(canonicalDomain, { includeDrafts: true });
            const fileNames = this._getDiskFileNames(canonicalDomain);
            for (const fn of fileNames) {
                const targetPath = path.join(this.contentDir, fn);
                fs.writeFileSync(targetPath, JSON.stringify(allItems, null, 2), 'utf8');
            }
            this.contentVersion = Date.now();
        } catch (err) {
            console.error(`[ContentRepository] Failed to sync ${canonicalDomain} to disk:`, err.message);
        }
    }

    get(domain, id, options = {}) {
        if (!domain || !id) return null;
        const normDomain = this.normalizeDomain(domain);
        const { includeDrafts = false } = options;

        const row = this.db.get('SELECT * FROM content WHERE domain = ? AND id = ?', [normDomain, id]);
        if (!row) return null;

        if (!includeDrafts && row.status === 'draft') {
            return null;
        }

        try {
            const item = JSON.parse(row.content_json);
            item.status = row.status;
            return item;
        } catch (_) {
            return null;
        }
    }

    getAll(domain, options = {}) {
        const normDomain = this.normalizeDomain(domain);
        const {
            includeDrafts = false,
            status = null,
            category = null,
            difficulty = null,
            skill = null,
            search = null,
            limit = null,
            offset = 0
        } = options;

        let query = 'SELECT * FROM content WHERE domain = ?';
        const params = [normDomain];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        } else if (!includeDrafts) {
            query += ' AND status = ?';
            params.push('published');
        }

        query += ' ORDER BY id ASC';
        const rows = this.db.all(query, params);

        let items = rows.map(r => {
            try {
                const parsed = JSON.parse(r.content_json);
                parsed.status = r.status;
                parsed.version = parsed.version || 1;
                return parsed;
            } catch (_) {
                return { id: r.id, domain: r.domain, title: r.title, status: r.status };
            }
        });

        // Apply in-memory filters for structured fields
        if (category && category !== 'all') {
            items = items.filter(item => {
                const c = (item.category || item.subject || '').toLowerCase();
                return c === category.toLowerCase();
            });
        }

        if (difficulty && difficulty !== 'all') {
            items = items.filter(item => {
                const d = String(item.difficulty || '').toLowerCase();
                return d === String(difficulty).toLowerCase();
            });
        }

        if (skill) {
            items = items.filter(item => {
                if (Array.isArray(item.skills)) {
                    return item.skills.some(s => String(s).toLowerCase().includes(skill.toLowerCase()));
                }
                return false;
            });
        }

        if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            items = items.filter(item => {
                const title = (item.title || item.name || item.question || '').toLowerCase();
                const desc = (item.description || item.explanation || item.synopsis || '').toLowerCase();
                return title.includes(term) || desc.includes(term) || item.id.toLowerCase().includes(term);
            });
        }

        if (typeof offset === 'number' && offset > 0) {
            items = items.slice(offset);
        }

        if (typeof limit === 'number' && limit > 0) {
            items = items.slice(0, limit);
        }

        return items;
    }

    queryQuestions(options = {}) {
        const { category = null, difficulty = null, limit = 10, skill = null, search = null } = options;
        const allQuizzes = this.getAll('quizzes', { includeDrafts: false, category, difficulty, skill, search });

        // If quizzes are single question items
        const flatQuestions = [];
        for (const item of allQuizzes) {
            if (Array.isArray(item.questions)) {
                for (const subQ of item.questions) {
                    flatQuestions.push({
                        ...subQ,
                        category: item.category || subQ.category || 'general',
                        trackId: item.trackId,
                        chapterId: item.chapterId
                    });
                }
            } else if (item.question && Array.isArray(item.options)) {
                flatQuestions.push(item);
            }
        }

        if (typeof limit === 'number' && limit > 0 && flatQuestions.length > limit) {
            return flatQuestions.slice(0, limit);
        }

        return flatQuestions;
    }

    save(domain, item, options = {}) {
        if (!domain || !item || !item.id) {
            throw new Error('Invalid content item or missing id');
        }
        const { syncToDisk = true } = options;
        const normDomain = this.normalizeDomain(domain);
        const now = new Date().toISOString();
        const title = item.title || item.name || item.question || item.id;
        const status = item.status || 'published';

        // Auto increment version if not provided
        item.version = typeof item.version === 'number' ? item.version : 1;
        item.updatedAt = now;
        if (!item.createdAt) item.createdAt = now;

        const contentJson = JSON.stringify(item);

        this.db.run(`
            INSERT INTO content (domain, id, title, status, content_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(domain, id) DO UPDATE SET
                title = excluded.title,
                status = excluded.status,
                content_json = excluded.content_json,
                updated_at = excluded.updated_at
        `, [
            normDomain,
            item.id,
            title,
            status,
            contentJson,
            item.createdAt,
            now
        ]);

        if (syncToDisk) {
            this._syncDomainToDisk(normDomain);
        }

        return item;
    }

    importBundle(bundle, options = {}) {
        if (!bundle || typeof bundle !== 'object') return { ok: false, error: 'INVALID_BUNDLE' };
        const { syncToDisk = true } = options;
        let count = 0;
        const domainsToSync = new Set();
        const stmt = this.db.prepare(`
            INSERT INTO content (domain, id, title, status, content_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(domain, id) DO UPDATE SET
                title = excluded.title,
                status = excluded.status,
                content_json = excluded.content_json,
                updated_at = excluded.updated_at
        `);

        const now = new Date().toISOString();

        this.db.transaction(() => {
            for (const [domainKey, items] of Object.entries(bundle)) {
                if (!Array.isArray(items)) continue;
                const normDomain = this.normalizeDomain(domainKey);
                domainsToSync.add(normDomain);
                for (const item of items) {
                    if (!item || !item.id) continue;
                    const title = item.title || item.name || item.question || item.id;
                    const status = item.status || 'published';
                    item.version = typeof item.version === 'number' ? item.version : 1;
                    item.updatedAt = item.updatedAt || now;
                    item.createdAt = item.createdAt || now;
                    const contentJson = JSON.stringify(item);

                    stmt.run(
                        normDomain,
                        item.id,
                        title,
                        status,
                        contentJson,
                        item.createdAt,
                        item.updatedAt
                    );
                    count++;
                }
            }
        });

        this.contentVersion = Date.now();

        if (syncToDisk) {
            for (const dom of domainsToSync) {
                this._syncDomainToDisk(dom);
            }
        }

        return { ok: true, count };
    }

    publish(domain, id, publishStatus = 'published') {
        const normDomain = this.normalizeDomain(domain);
        const item = this.get(normDomain, id, { includeDrafts: true });
        if (!item) return null;
        item.status = publishStatus;
        return this.save(normDomain, item);
    }

    delete(domain, id) {
        const normDomain = this.normalizeDomain(domain);
        const res = this.db.run('DELETE FROM content WHERE domain = ? AND id = ?', [normDomain, id]);
        if (res.changes > 0) {
            this._syncDomainToDisk(normDomain);
            return true;
        }
        return false;
    }

    getMeta() {
        const counts = {};
        const domains = ['quizzes', 'lessons', 'learningPaths', 'projects', 'culture', 'books'];
        for (const d of domains) {
            const rows = this.db.all('SELECT status, COUNT(*) as count FROM content WHERE domain = ? GROUP BY status', [d]);
            counts[d] = { published: 0, draft: 0, total: 0 };
            for (const r of rows) {
                if (r.status === 'published') counts[d].published = Number(r.count);
                if (r.status === 'draft') counts[d].draft = Number(r.count);
                counts[d].total += Number(r.count);
            }
        }

        return {
            version: this.contentVersion,
            timestamp: new Date(this.contentVersion).toISOString(),
            counts
        };
    }

    exportAll() {
        const rows = this.db.all('SELECT * FROM content ORDER BY domain, id');
        const bundle = {
            quizzes: [],
            lessons: [],
            learningPaths: [],
            projects: [],
            culture: [],
            books: []
        };

        for (const r of rows) {
            const domain = r.domain;
            if (!bundle[domain]) bundle[domain] = [];
            try {
                const item = JSON.parse(r.content_json);
                item.status = r.status;
                bundle[domain].push(item);
            } catch (_) {}
        }
        return bundle;
    }
}

module.exports = ContentRepository;
