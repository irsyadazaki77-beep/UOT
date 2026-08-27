/**
 * UNIVERSE OF TECH - CONTENT SERVICE (FASE 20)
 * Unified Client-Side Content Access Layer with Multi-Tier Caching,
 * Lazy Chunk Queries, Offline IndexedDB Fallback, and Version Synchronization.
 */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.ContentService = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const DB_NAME = "UOT_CONTENT_CACHE_V2";
    const DB_VERSION = 1;
    const STORE_ITEMS = "content_items";
    const STORE_META = "content_meta";
    const STORAGE_KEY_META = "uot_content_meta_cache";
    const STORAGE_KEY_ITEMS = "uot_content_items_cache";

    // In-memory runtime cache
    const memoryCache = new Map();
    let indexedDbInstance = null;
    let isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;

    // Listen to online/offline network changes
    if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("online", () => {
            isOffline = false;
            console.log("[ContentService] Network online. Synchronizing content version...");
            ContentService.checkVersion();
        });
        window.addEventListener("offline", () => {
            isOffline = true;
            console.warn("[ContentService] Network offline. Operating in local cache mode.");
        });
    }

    /**
     * IndexedDB Initialization Helper
     */
    function getIndexedDb() {
        if (typeof indexedDB === "undefined") return Promise.resolve(null);
        if (indexedDbInstance) return Promise.resolve(indexedDbInstance);

        return new Promise((resolve) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_ITEMS)) {
                        db.createObjectStore(STORE_ITEMS, { keyPath: "key" });
                    }
                    if (!db.objectStoreNames.contains(STORE_META)) {
                        db.createObjectStore(STORE_META, { keyPath: "id" });
                    }
                };
                request.onsuccess = (event) => {
                    indexedDbInstance = event.target.result;
                    resolve(indexedDbInstance);
                };
                request.onerror = () => {
                    console.warn("[ContentService] IndexedDB unavailable, falling back to LocalStorage.");
                    resolve(null);
                };
            } catch (_) {
                resolve(null);
            }
        });
    }

    /**
     * Cache Read/Write Helpers
     */
    async function getCachedItem(key) {
        if (memoryCache.has(key)) return memoryCache.get(key);

        const idb = await getIndexedDb();
        if (idb) {
            return new Promise((resolve) => {
                try {
                    const tx = idb.transaction(STORE_ITEMS, "readonly");
                    const store = tx.objectStore(STORE_ITEMS);
                    const req = store.get(key);
                    req.onsuccess = () => {
                        const val = req.result ? req.result.data : null;
                        if (val) memoryCache.set(key, val);
                        resolve(val);
                    };
                    req.onerror = () => resolve(null);
                } catch (_) {
                    resolve(null);
                }
            });
        }

        // LocalStorage Fallback
        if (typeof localStorage !== "undefined") {
            try {
                const raw = localStorage.getItem(`${STORAGE_KEY_ITEMS}_${key}`);
                if (raw) {
                    const val = JSON.parse(raw);
                    memoryCache.set(key, val);
                    return val;
                }
            } catch (_) {}
        }

        return null;
    }

    async function setCachedItem(key, data) {
        if (!key || data === undefined) return;
        memoryCache.set(key, data);

        const idb = await getIndexedDb();
        if (idb) {
            try {
                const tx = idb.transaction(STORE_ITEMS, "readwrite");
                const store = tx.objectStore(STORE_ITEMS);
                store.put({ key, data, timestamp: Date.now() });
            } catch (_) {}
        } else if (typeof localStorage !== "undefined") {
            try {
                localStorage.setItem(`${STORAGE_KEY_ITEMS}_${key}`, JSON.stringify(data));
            } catch (_) {}
        }
    }

    async function clearAllCache() {
        memoryCache.clear();
        const idb = await getIndexedDb();
        if (idb) {
            try {
                const tx = idb.transaction([STORE_ITEMS, STORE_META], "readwrite");
                tx.objectStore(STORE_ITEMS).clear();
                tx.objectStore(STORE_META).clear();
            } catch (_) {}
        }
        if (typeof localStorage !== "undefined") {
            try {
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith(STORAGE_KEY_ITEMS) || k.startsWith(STORAGE_KEY_META)) {
                        localStorage.removeItem(k);
                    }
                });
            } catch (_) {}
        }
    }

    /**
     * Domain Normalization
     */
    function normalizeDomain(domain) {
        if (!domain || typeof domain !== "string") return "quizzes";
        const d = domain.trim().toLowerCase();
        if (d === "learningpaths" || d === "learning-paths" || d === "learning_paths" || d === "tracks" || d === "track") {
            return "learningPaths";
        }
        if (d === "quizzes" || d === "quiz" || d === "questions" || d === "question") {
            return "quizzes";
        }
        if (d === "lessons" || d === "lesson" || d === "materi") {
            return "lessons";
        }
        if (d === "projects" || d === "project") {
            return "projects";
        }
        if (d === "culture" || d === "budaya" || d === "places") {
            return "culture";
        }
        if (d === "books" || d === "book" || d === "library") {
            return "books";
        }
        return domain;
    }

    /**
     * Network Fetcher with Timeout
     */
    async function fetchApi(endpoint, options = {}) {
        if (typeof fetch === "undefined") return null;
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), options.timeout || 8000) : null;

        try {
            const resp = await fetch(endpoint, {
                ...options,
                signal: controller ? controller.signal : undefined,
                headers: {
                    "Accept": "application/json",
                    ...(options.headers || {})
                }
            });
            if (timeoutId) clearTimeout(timeoutId);
            if (!resp.ok) return null;
            return await resp.json();
        } catch (err) {
            if (timeoutId) clearTimeout(timeoutId);
            return null;
        }
    }

    /**
     * Fallback Data Providers
     */
    function getFallbackData(domain, id) {
        const norm = normalizeDomain(domain);
        if (typeof ContentEngine !== "undefined") {
            if (norm === "quizzes") return ContentEngine.getFallbackQuiz(id, "Data diambil dari state cadangan offline.");
            if (norm === "lessons") return ContentEngine.getFallbackLesson(id, "Data diambil dari state cadangan offline.");
            if (norm === "projects") return ContentEngine.getFallbackProject(id, "Data diambil dari state cadangan offline.");
        }
        return {
            id: id || "fallback-item",
            title: "Konten Sedang Dimuat / Cadangan",
            status: "published",
            isFallback: true
        };
    }

    /**
     * ContentService Public Interface
     */
    const ContentService = {
        normalizeDomain,

        /**
         * Check and synchronize version with server
         */
        async checkVersion() {
            try {
                const res = await fetchApi("/api/content/version");
                if (res && res.ok && res.version) {
                    const localMeta = await getCachedItem("meta_version");
                    if (localMeta && localMeta.version !== res.version) {
                        console.log(`[ContentService] New content version detected (${res.version} vs local ${localMeta.version}). Invalidating stale cache.`);
                        await clearAllCache();
                    }
                    await setCachedItem("meta_version", res);
                    return res;
                }
            } catch (_) {}
            return null;
        },

        /**
         * Get a single item by domain and ID
         */
        async getItem(domain, id) {
            if (!domain || !id) return null;
            const normDomain = normalizeDomain(domain);
            const cacheKey = `${normDomain}_${id}`;

            // Check cache first
            const cached = await getCachedItem(cacheKey);
            if (cached && !isOffline) {
                // Return cache immediately, but revalidate in background if needed
                return cached;
            }

            if (!isOffline) {
                const res = await fetchApi(`/api/content/${normDomain}/${encodeURIComponent(id)}`);
                if (res && res.ok && res.item) {
                    await setCachedItem(cacheKey, res.item);
                    return res.item;
                }
            }

            if (cached) return cached;

            // In-memory ContentEngine fallback
            if (typeof ContentEngine !== "undefined") {
                if (normDomain === "quizzes") return ContentEngine.getQuiz(id);
                if (normDomain === "lessons") return ContentEngine.getLesson(id);
                if (normDomain === "learningPaths") return ContentEngine.getLearningPath(id);
                if (normDomain === "projects") return ContentEngine.getProject(id);
                if (normDomain === "culture") return ContentEngine.getCulture(id);
                if (normDomain === "books") return ContentEngine.getBook(id);
            }

            return getFallbackData(normDomain, id);
        },

        /**
         * Convenient domain-specific getters
         */
        async getQuiz(id) {
            return this.getItem("quizzes", id);
        },

        async getLesson(id) {
            return this.getItem("lessons", id);
        },

        async getLearningPath(id) {
            return this.getItem("learningPaths", id);
        },

        async getProject(id) {
            return this.getItem("projects", id);
        },

        async getCulture(id) {
            return this.getItem("culture", id);
        },

        async getBook(id) {
            return this.getItem("books", id);
        },

        /**
         * Query chunked/filtered quiz questions without pulling whole database
         */
        async getQuestions(options = {}) {
            const { category = null, difficulty = null, limit = 10, skill = null, search = null } = options;
            const queryParams = new URLSearchParams();
            if (category) queryParams.set("category", category);
            if (difficulty) queryParams.set("difficulty", difficulty);
            if (limit) queryParams.set("limit", String(limit));
            if (skill) queryParams.set("skill", skill);
            if (search) queryParams.set("search", search);

            const cacheKey = `questions_query_${queryParams.toString()}`;
            const cached = await getCachedItem(cacheKey);

            if (!isOffline) {
                const res = await fetchApi(`/api/content/quizzes/questions?${queryParams.toString()}`);
                if (res && res.ok && Array.isArray(res.questions)) {
                    await setCachedItem(cacheKey, res.questions);
                    // Also cache individual questions
                    for (const q of res.questions) {
                        if (q && q.id) {
                            setCachedItem(`quizzes_${q.id}`, q);
                        }
                    }
                    return res.questions;
                }
            }

            if (cached) return cached;

            // Fallback to ContentEngine or global questionBank if available
            if (typeof ContentEngine !== "undefined" && typeof ContentEngine.getQuestions === "function") {
                return ContentEngine.getQuestions(options);
            }

            if (typeof window !== "undefined" && Array.isArray(window.questionBank)) {
                let filtered = window.questionBank;
                if (category && category !== "all") filtered = filtered.filter(q => (q.category || q.subject) === category);
                if (difficulty && difficulty !== "all") filtered = filtered.filter(q => q.difficulty === difficulty);
                if (limit && limit > 0) filtered = filtered.slice(0, limit);
                return filtered;
            }

            return [];
        },

        /**
         * Get all items in a domain with optional filters
         */
        async getAll(domain, options = {}) {
            const normDomain = normalizeDomain(domain);
            const queryParams = new URLSearchParams();
            if (options.category) queryParams.set("category", options.category);
            if (options.difficulty) queryParams.set("difficulty", options.difficulty);
            if (options.skill) queryParams.set("skill", options.skill);
            if (options.limit) queryParams.set("limit", String(options.limit));
            if (options.offset) queryParams.set("offset", String(options.offset));

            const cacheKey = `all_${normDomain}_${queryParams.toString()}`;
            const cached = await getCachedItem(cacheKey);

            if (!isOffline) {
                const res = await fetchApi(`/api/content/${normDomain}?${queryParams.toString()}`);
                if (res && res.ok && Array.isArray(res.items)) {
                    await setCachedItem(cacheKey, res.items);
                    for (const it of res.items) {
                        if (it && it.id) {
                            setCachedItem(`${normDomain}_${it.id}`, it);
                        }
                    }
                    return res.items;
                }
            }

            if (cached) return cached;

            if (typeof ContentEngine !== "undefined") {
                return ContentEngine.getAll(normDomain, options);
            }

            return [];
        },

        /**
         * Prefetch and preload essential bundle for offline readiness
         */
        async prefetchBundle() {
            try {
                const res = await fetchApi("/api/content/all");
                if (res && res.ok && res.content) {
                    for (const [dom, items] of Object.entries(res.content)) {
                        const norm = normalizeDomain(dom);
                        if (Array.isArray(items)) {
                            await setCachedItem(`all_${norm}_`, items);
                            for (const it of items) {
                                if (it && it.id) {
                                    await setCachedItem(`${norm}_${it.id}`, it);
                                }
                            }
                        }
                    }
                    console.log("[ContentService] Offline content bundle cached successfully.");
                    return true;
                }
            } catch (err) {
                console.warn("[ContentService] Prefetch bundle warning:", err.message);
            }
            return false;
        },

        clearCache: clearAllCache
    };

    // Auto-init background version check & prefetch if running in browser
    if (typeof window !== "undefined") {
        setTimeout(() => {
            ContentService.checkVersion();
        }, 1000);
    }

    return ContentService;
}));
