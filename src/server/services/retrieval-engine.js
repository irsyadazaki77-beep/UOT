const ContentEngine = require('../../../public/content-engine');

/**
 * Advanced Hybrid Retrieval Engine with In-Memory Caching & Semantic Chunking
 * FASE 3: Optimized RAG Retrieval Pipeline
 */
class RetrievalEngine {
    constructor() {
        this.domains = ['lessons', 'quizzes', 'learningPaths', 'projects', 'culture', 'books'];
        this.cachedPassages = null;
        this.cachedDfMap = null;
        this.lastBuildTime = 0;
        this.contentVersion = '1.0.0';
    }

    /**
     * Invalidate cached retrieval index
     */
    invalidateIndex() {
        this.cachedPassages = null;
        this.cachedDfMap = null;
        this.lastBuildTime = 0;
    }

    /**
     * Semantic text chunker: splits by code blocks, paragraphs, and headings
     */
    semanticChunk(text, maxChunkLen = 450, minChunkLen = 60) {
        if (!text || typeof text !== 'string') return [];
        const raw = text.trim();
        if (raw.length <= maxChunkLen) return [raw];

        const chunks = [];
        // Split by major semantic boundaries: code blocks, double newlines, headings
        const sections = raw.split(/\n\s*\n+/);

        let current = '';
        for (const sec of sections) {
            const trimmedSec = sec.trim();
            if (!trimmedSec) continue;

            if (current.length + trimmedSec.length + 1 <= maxChunkLen) {
                current = current ? `${current}\n\n${trimmedSec}` : trimmedSec;
            } else {
                if (current.length >= minChunkLen) {
                    chunks.push(current);
                    current = '';
                }
                
                // If a single section exceeds maxChunkLen, split by sentences or lines
                if (trimmedSec.length > maxChunkLen) {
                    const sentences = trimmedSec.split(/(?<=[.!?])\s+/);
                    for (const sent of sentences) {
                        if (current.length + sent.length + 1 <= maxChunkLen) {
                            current = current ? `${current} ${sent}` : sent;
                        } else {
                            if (current.length >= minChunkLen) chunks.push(current);
                            current = sent;
                        }
                    }
                } else {
                    current = trimmedSec;
                }
            }
        }

        if (current && current.length >= 30) {
            chunks.push(current);
        }

        return chunks.length > 0 ? chunks : [raw.substring(0, maxChunkLen)];
    }

    /**
     * Build passages (chunks) from all registered content across domains (Cached)
     * @returns {Array} List of passages
     */
    buildPassages() {
        if (this.cachedPassages && Array.isArray(this.cachedPassages)) {
            return this.cachedPassages;
        }

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
                if (d === 'lessons') canonicalUrl = `/materi-basic.html?topik=${encodeURIComponent(item.track || 'programming')}`;
                else if (d === 'projects') canonicalUrl = `/projects.html?id=${encodeURIComponent(item.id)}`;
                else if (d === 'culture') canonicalUrl = `/daerah-detail.html?id=${encodeURIComponent(item.id)}`;
                else if (d === 'books') canonicalUrl = `/reader.html?book=${encodeURIComponent(item.id)}`;
                else if (d === 'quizzes') canonicalUrl = `/quiz.html?id=${encodeURIComponent(item.id)}`;

                const itemVersion = item.version || 1;
                const itemSkills = item.skills || item.tags || [];
                const primarySkill = itemSkills[0] || 'general';
                const title = item.title || item.name || item.id;

                // Gather all structured textual blocks
                const textBlocks = [];
                if (item.description) textBlocks.push(item.description);
                if (item.synopsis) textBlocks.push(item.synopsis);
                if (item.content) textBlocks.push(item.content);
                if (item.question || item.prompt) textBlocks.push(`Pertanyaan: ${item.question || item.prompt}`);
                if (item.explanation) textBlocks.push(`Penjelasan: ${item.explanation}`);

                if (Array.isArray(item.options)) {
                    textBlocks.push(`Pilihan Opsi: ${item.options.join(', ')}`);
                }

                if (Array.isArray(item.contentBlocks)) {
                    item.contentBlocks.forEach(block => {
                        if (block && typeof block.data === 'string') {
                            textBlocks.push(block.data);
                        }
                    });
                }

                const fullContentText = textBlocks.join('\n\n').trim();

                // Semantic chunking
                const chunks = this.semanticChunk(fullContentText);

                if (chunks.length === 0 && (title || item.description)) {
                    passages.push({
                        sourceId: item.id,
                        title,
                        chunk: item.description || title,
                        domain: d,
                        contentVersion: itemVersion,
                        contentId: item.id,
                        canonicalUrl,
                        tags: itemSkills,
                        skillId: primarySkill
                    });
                } else {
                    for (const chunkText of chunks) {
                        passages.push({
                            sourceId: item.id,
                            title,
                            chunk: chunkText,
                            domain: d,
                            contentVersion: itemVersion,
                            contentId: item.id,
                            canonicalUrl,
                            tags: itemSkills,
                            skillId: primarySkill
                        });
                    }
                }
            }
        }

        // Build precalculated Document Frequency (DF) map for fast search
        const dfMap = {};
        passages.forEach(p => {
            const seen = new Set();
            const textToAnalyze = `${p.title} ${p.chunk} ${(p.tags || []).join(' ')}`.toLowerCase();
            const words = textToAnalyze.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ').split(/\s+/).filter(w => w.length > 2);
            for (const w of words) {
                if (!seen.has(w)) {
                    seen.add(w);
                    dfMap[w] = (dfMap[w] || 0) + 1;
                }
            }
        });

        this.cachedPassages = passages;
        this.cachedDfMap = dfMap;
        this.lastBuildTime = Date.now();

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
        const dfMap = this.cachedDfMap || {};
        const normalizedQuery = query.toLowerCase().trim();
        
        // Basic tokenization and normalization
        const queryTokens = normalizedQuery
            .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1);

        if (queryTokens.length === 0) {
            return [];
        }

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
                score += 20.0;
            }

            // 2. TF-IDF VECTOR SCORING WITH FIELD WEIGHTS
            for (const t of queryTokens) {
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
            }

            // 3. TAGS & SKILLID WEIGHTING BOOSTS
            if (options.skillId) {
                const querySkill = String(options.skillId).toLowerCase();
                if (p.skillId.toLowerCase() === querySkill || (p.tags && p.tags.some(tag => tag.toLowerCase() === querySkill))) {
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
