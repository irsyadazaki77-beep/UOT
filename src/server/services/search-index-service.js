/**
 * UNIVERSE OF TECH - CANONICAL SEARCH INDEX SERVICE
 * FASE 3: High Performance In-Memory Content Search Index
 * Eliminates synchronous fs.readFileSync on query time.
 */

class SearchIndexService {
    constructor({ contentRepository, ContentEngine } = {}) {
        this.contentRepository = contentRepository;
        this.ContentEngine = ContentEngine;
        this.index = [];
        this.version = 0;
        this.isReady = false;
        this.domainConfig = {
            books: { type: 'Buku & Referensi', defaultUrl: 'library.html', urlFn: (id) => `reader.html?book=${encodeURIComponent(id)}` },
            culture: { type: 'Budaya Nusantara', defaultUrl: 'quiz-budaya-lms.html', urlFn: (id) => `daerah-detail.html?id=${encodeURIComponent(id)}` },
            learningPaths: { type: 'Learning Path', defaultUrl: 'learning-journey.html', urlFn: () => 'learning-journey.html' },
            lessons: { type: 'Materi Belajar', defaultUrl: 'materi.html', urlFn: (id, item) => `materi-basic.html?topik=${encodeURIComponent(item.track || 'programming')}` },
            projects: { type: 'Proyek Nyata', defaultUrl: 'projects.html', urlFn: (id) => `projects.html?id=${encodeURIComponent(id)}` },
            quizzes: { type: 'Quiz & Latihan', defaultUrl: 'quiz.html', urlFn: () => 'quiz.html' }
        };
    }

    /**
     * Build or rebuild the search index in memory from Canonical ContentRepository
     */
    async buildIndex() {
        const newIndex = [];
        const domains = Object.keys(this.domainConfig);

        for (const domain of domains) {
            const config = this.domainConfig[domain];
            let items = [];

            try {
                if (this.contentRepository) {
                    items = await this.contentRepository.getAll(domain, { includeDrafts: false }) || [];
                } else if (this.ContentEngine) {
                    items = this.ContentEngine.getAll(domain, { includeDrafts: false }) || [];
                }
            } catch (err) {
                console.warn(`[SearchIndexService] Failed to load domain ${domain}:`, err.message);
                continue;
            }

            if (!Array.isArray(items)) continue;

            for (const item of items) {
                if (!item) continue;
                const id = item.id || '';
                const title = item.title || item.name || '';
                const desc = item.description || item.summary || item.content || item.synopsis || '';
                const tags = Array.isArray(item.tags) ? item.tags : (Array.isArray(item.skills) ? item.skills : []);
                const tagsStr = tags.join(' ');

                const targetUrl = item.id && config.urlFn ? config.urlFn(item.id, item) : config.defaultUrl;

                const searchableText = `${title} ${desc} ${tagsStr}`.toLowerCase();

                newIndex.push({
                    id,
                    title,
                    description: desc.length > 130 ? desc.substring(0, 127) + '...' : desc,
                    type: config.type,
                    domain,
                    url: targetUrl,
                    searchableText,
                    titleLower: title.toLowerCase(),
                    tags: tags.map(t => String(t).toLowerCase())
                });
            }
        }

        this.index = newIndex;
        this.version = Date.now();
        this.isReady = true;
        return this.index.length;
    }

    /**
     * Search the in-memory index with fast token and exact phrase scoring
     * @param {string} rawQuery
     * @param {number} limit
     */
    search(rawQuery, limit = 8) {
        const query = String(rawQuery || '').trim().toLowerCase();
        if (!query || query.length < 2) {
            return [];
        }

        const queryTokens = query
            .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1);

        const scored = [];
        const seen = new Set();

        for (const entry of this.index) {
            let score = 0;

            // 1. Exact match in title
            if (entry.titleLower === query) {
                score += 50;
            } else if (entry.titleLower.includes(query)) {
                score += 25;
            }

            // 2. Exact match in full searchable text
            if (entry.searchableText.includes(query)) {
                score += 15;
            }

            // 3. Token matches
            for (const token of queryTokens) {
                if (entry.titleLower.includes(token)) {
                    score += 8;
                }
                if (entry.tags.some(t => t.includes(token))) {
                    score += 6;
                }
                if (entry.searchableText.includes(token)) {
                    score += 2;
                }
            }

            if (score > 0) {
                const dedupKey = `${entry.title}-${entry.type}`;
                if (!seen.has(dedupKey)) {
                    seen.add(dedupKey);
                    scored.push({
                        title: entry.title,
                        description: entry.description,
                        type: entry.type,
                        url: entry.url,
                        score
                    });
                }
            }
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(({ score, ...item }) => item);
    }
}

module.exports = SearchIndexService;
