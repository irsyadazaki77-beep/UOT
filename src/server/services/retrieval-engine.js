const ContentEngine = require('../../../public/content-engine');

class RetrievalEngine {
    constructor() {
        this.domains = ['materi', 'games', 'culture', 'snbt', 'projects', 'reader'];
    }

    /**
     * Basic keyword-based retrieval across Universe of Tech content.
     */
    search(query, domain = null) {
        let results = [];
        const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
        
        const targetDomains = domain ? [domain] : this.domains;

        for (const d of targetDomains) {
            let items = [];
            try {
                // If the app has ContentEngine.getAll, we use it. 
                // We mock it for safety in case it's not fully supporting filtering by search directly.
                items = ContentEngine.getAll(d, { includeDrafts: false });
            } catch (e) {
                continue;
            }

            if (!items) continue;

            for (const item of items) {
                let score = 0;
                const textToSearch = `${item.title || ''} ${item.description || ''} ${item.content || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
                
                for (const term of searchTerms) {
                    if (textToSearch.includes(term)) {
                        score += 1;
                    }
                }

                if (score > 0) {
                    results.push({
                        domain: d,
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        tags: item.tags,
                        score: score
                    });
                }
            }
        }

        // Sort by score descending and take top 5
        return results.sort((a, b) => b.score - a.score).slice(0, 5);
    }
}

module.exports = new RetrievalEngine();
