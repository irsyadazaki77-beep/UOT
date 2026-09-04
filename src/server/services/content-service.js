/**
 * UNIVERSE OF TECH - CONTENT CATALOG SERVICE
 * FASE 1 & 6 Architecture Refactoring & Dynamic Content Pagination (Async Canonical)
 */

class ContentService {
    constructor({ contentRepository, ContentEngine }) {
        this.contentRepository = contentRepository;
        this.ContentEngine = ContentEngine;
    }

    async getMetadata() {
        if (!this.contentRepository) {
            return {
                version: Date.now(),
                engineVersion: this.ContentEngine ? this.ContentEngine.ENGINE_VERSION : '2.0.0',
                counts: {}
            };
        }
        const meta = await this.contentRepository.getMeta();
        return {
            version: meta.version,
            engineVersion: this.ContentEngine ? this.ContentEngine.ENGINE_VERSION : '2.0.0',
            timestamp: meta.timestamp || new Date().toISOString(),
            counts: meta.counts
        };
    }

    async getAllDomainContent(domain, { includeDrafts = false, page = null, limit = null, category = null, track = null, search = null } = {}) {
        if (!this.contentRepository) return [];
        let items = await this.contentRepository.getAll(domain, { includeDrafts });
        if (!Array.isArray(items)) {
            items = [];
        }

        if (category) {
            const catLower = String(category).toLowerCase();
            items = items.filter(item => (item.category && String(item.category).toLowerCase() === catLower) || (item.track && String(item.track).toLowerCase() === catLower));
        }

        if (track) {
            const trackLower = String(track).toLowerCase();
            items = items.filter(item => (item.track && String(item.track).toLowerCase() === trackLower) || (item.trackId && String(item.trackId).toLowerCase() === trackLower));
        }

        if (search) {
            const query = String(search).toLowerCase();
            items = items.filter(item => {
                const titleMatch = item.title && String(item.title).toLowerCase().includes(query);
                const descMatch = item.description && String(item.description).toLowerCase().includes(query);
                const nameMatch = item.name && String(item.name).toLowerCase().includes(query);
                return titleMatch || descMatch || nameMatch;
            });
        }

        if (page !== null && limit !== null) {
            const p = Math.max(1, parseInt(page, 10) || 1);
            const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
            const total = items.length;
            const totalPages = Math.ceil(total / l);
            const offset = (p - 1) * l;
            const paginatedItems = items.slice(offset, offset + l);

            return {
                items: paginatedItems,
                pagination: {
                    page: p,
                    limit: l,
                    totalItems: total,
                    totalPages,
                    hasNext: p < totalPages,
                    hasPrev: p > 1
                }
            };
        }

        return items;
    }

    async getItem(domain, id, { includeDrafts = false } = {}) {
        if (!this.contentRepository) return null;
        return await this.contentRepository.get(domain, id, { includeDrafts });
    }
}

module.exports = ContentService;
