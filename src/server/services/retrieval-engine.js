const ContentEngine = require('../../../public/content-engine');

/**
 * Advanced Hybrid Retrieval Engine
 * Supports passage chunking, token normalization, TF-IDF scoring, title/tags weighting,
 * exact-phrase boosts, recency/versioning weighting, and current topic relevance.
 */
class RetrievalEngine {
    constructor() {
        this.domains = ['lessons', 'quizzes', 'learningPaths', 'projects', 'culture', 'books'];
    }

    /**
     * Build passages (chunks) from all registered content across domains
     * @returns {Array} List of passages
     */
    buildPassages() {
        const passages = [];
        
        for (const d of this.domains) {
            let items = [];
            try {
                items = ContentEngine.getAll(d, { includeDrafts: false }) || [];
            } catch (e) {
                console.warn(`[RetrievalEngine] Failed to retrieve content for domain ${d}:`, e.message);
                continue;
            }

            for (const item of items) {
                if (!item || !item.id) continue;

                // Build canonical URL based on the domain type
                let canonicalUrl = '/index.html';
                if (d === 'lessons') canonicalUrl = `/materi.html?id=${item.id}`;
                else if (d === 'projects') canonicalUrl = `/projects.html?id=${item.id}`;
                else if (d === 'culture') canonicalUrl = `/daerah-detail.html?id=${item.id}`;
                else if (d === 'books') canonicalUrl = `/reader.html?id=${item.id}`;
                else if (d === 'quizzes') canonicalUrl = `/quiz-session.html?id=${item.id}`;

                // Gather all possible textual blocks to form the corpus
                const textParts = [];
                if (item.title) textParts.push(item.title);
                if (item.name) textParts.push(item.name);
                if (item.description) textParts.push(item.description);
                if (item.content) textParts.push(item.content);
                if (item.synopsis) textParts.push(item.synopsis);
                if (item.question || item.prompt) textParts.push(item.question || item.prompt);
                if (item.explanation) textParts.push(item.explanation);

                if (Array.isArray(item.options)) {
                    textParts.push(`Pilihan Opsi: ${item.options.join(', ')}`);
                }

                if (Array.isArray(item.contentBlocks)) {
                    item.contentBlocks.forEach(block => {
                        if (block && typeof block.data === 'string') {
                            textParts.push(block.data);
                        }
                    });
                }

                const fullContentText = textParts.join('\n').trim();
                const textLength = fullContentText.length;
                
                // Define sliding chunk size of ~400 characters with 100 character overlap
                const chunkSize = 400;
                const overlap = 100;
                const itemVersion = item.version || 1;
                const itemSkills = item.skills || item.tags || [];
                const primarySkill = itemSkills[0] || 'general';

                if (textLength <= chunkSize) {
                    passages.push({
                        sourceId: item.id,
                        title: item.title || item.name || item.id,
                        chunk: fullContentText,
                        domain: d,
                        contentVersion: itemVersion,
                        contentId: item.id,
                        canonicalUrl,
                        tags: itemSkills,
                        skillId: primarySkill
                    });
                } else {
                    let start = 0;
                    while (start < textLength) {
                        const end = Math.min(start + chunkSize, textLength);
                        const chunkText = fullContentText.substring(start, end).trim();
                        if (chunkText.length > 40) {
                            passages.push({
                                sourceId: item.id,
                                title: item.title || item.name || item.id,
                                chunk: chunkText,
                                domain: d,
                                contentVersion: itemVersion,
                                contentId: item.id,
                                canonicalUrl,
                                tags: itemSkills,
                                skillId: primarySkill
                            });
                        }
                        start += (chunkSize - overlap);
                    }
                }
            }
        }

        return passages;
    }

    /**
     * Advanced hybrid search execution across UOT content
     * @param {String} query - User search prompt
     * @param {String} [domainFilter] - Filter by specific domain
     * @param {Object} [options] - Multi-factor options like skillId, currentTopic, etc.
     * @returns {Array} Top 5 scored passage results
     */
    search(query, domainFilter = null, options = {}) {
        if (!query || typeof query !== 'string' || !query.trim()) {
            return [];
        }

        const passages = this.buildPassages();
        const normalizedQuery = query.toLowerCase().trim();
        
        // Basic tokenization and normalization
        const queryTokens = normalizedQuery
            .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1);

        if (queryTokens.length === 0) {
            return [];
        }

        // Calculate Document Frequency (DF) map
        const dfMap = {};
        passages.forEach(p => {
            const seen = new Set();
            const textToAnalyze = `${p.title} ${p.chunk} ${(p.tags || []).join(' ')}`.toLowerCase();
            queryTokens.forEach(t => {
                if (textToAnalyze.includes(t)) {
                    seen.add(t);
                }
            });
            seen.forEach(t => {
                dfMap[t] = (dfMap[t] || 0) + 1;
            });
        });

        const totalDocuments = passages.length;
        const results = [];

        for (const p of passages) {
            // Apply domain filter if explicitly requested
            if (domainFilter && p.domain !== domainFilter) {
                continue;
            }

            let score = 0;
            const titleText = p.title.toLowerCase();
            const chunkText = p.chunk.toLowerCase();
            const textCorpus = `${titleText} ${chunkText} ${(p.tags || []).join(' ')}`.toLowerCase();

            // 1. EXACT PHRASE MATCHING BOOST
            if (textCorpus.includes(normalizedQuery)) {
                score += 18.0; // Enormous boost for exact phrase match
            }

            // 2. TF-IDF VECTOR SCORING WITH FIELD WEIGHTS
            queryTokens.forEach(t => {
                const df = dfMap[t] || 0;
                // IDF formula with Laplace smoothing
                const idf = Math.log((totalDocuments + 1) / (df + 0.5)) + 1;

                // Field weighting frequencies
                const termCountInTitle = titleText.split(t).length - 1;
                const termCountInChunk = chunkText.split(t).length - 1;

                const titleWeight = 4.0;
                const chunkWeight = 1.0;

                const tfWeighted = (termCountInTitle * titleWeight) + (termCountInChunk * chunkWeight);
                score += tfWeighted * idf;
            });

            // 3. TAGS & SKILLID WEIGHTING BOOSTS
            if (options.skillId) {
                const querySkill = String(options.skillId).toLowerCase();
                if (p.skillId.toLowerCase() === querySkill || p.tags.some(tag => tag.toLowerCase() === querySkill)) {
                    score += 6.0;
                }
            }

            // 4. CURRENT TOPIC RELEVANCE BOOST
            if (options.currentTopic) {
                const queryTopic = String(options.currentTopic).toLowerCase();
                if (p.title.toLowerCase().includes(queryTopic) || p.chunk.toLowerCase().includes(queryTopic)) {
                    score += 8.0;
                }
            }

            // 5. RECENCY & VERSION WEIGHTING
            // SLight boost for higher version numbers to prioritize latest iterations
            score *= (1.0 + ((p.contentVersion || 1) * 0.05));

            if (score > 0) {
                results.push({
                    sourceId: p.sourceId,
                    title: p.title,
                    chunk: p.chunk,
                    domain: p.domain,
                    score: Number(score.toFixed(3)),
                    canonicalUrl: p.canonicalUrl,
                    contentId: p.contentId,
                    contentVersion: p.contentVersion
                });
            }
        }

        // Sort descending by score and return top 5
        return results.sort((a, b) => b.score - a.score).slice(0, 5);
    }
}

module.exports = new RetrievalEngine();
