/**
 * Universe Of Tech - Security & Unified Storage Engine (Phase 1)
 * Provides centralized XSS sanitization, safe iframe embedding,
 * structured schema versioning (v4), and tamper-resistant local storage.
 */
(() => {
    "use strict";

    // 1. Safe Embed / Frame Protection (Allows trusted preview & dev environments)
    try {
        if (window.self !== window.top) {
            const isTrustedHost = /^(localhost|127\.0\.0\.1|.*\.run\.app|.*\.google\.com|.*\.aistudio\.google\.com)$/i.test(window.location.hostname);
            if (!isTrustedHost && window.top.location.origin !== window.self.location.origin) {
                // Untrusted cross-origin embedding - warn and prevent state hijacking
                console.warn("[UOTSecurity] Embedded in external third-party iframe.");
            }
        }
    } catch (e) {
        // Cross-origin container restriction - benign in sandboxed iframe
    }

    // 2. DevTools Console Self-XSS Advisory
    setTimeout(() => {
        if (typeof console !== "undefined" && console.log) {
            console.log(
                "%cPERINGATAN KEAMANAN — UNIVERSE OF TECH",
                "color: #ef4444; font-size: 22px; font-weight: 900; font-family: sans-serif;"
            );
            console.log(
                "%cJangan menempelkan script ke dalam console ini. Script berbahaya dapat mencuri progres belajar dan data akun Anda.",
                "color: #94a3b8; font-size: 12px; font-family: sans-serif; line-height: 1.4;"
            );
        }
    }, 800);

    // 3. SHA-256 Hashing Implementation (Synchronous)
    const INTEGRITY_TAG = "uot-integrity-v4";
    const PREFIX_REGEX = /^(eduquest|bahasa|book|wonderful|latihan|snbt|tka|wonder|uot_)/i;

    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        const lengthProperty = 'length';
        let i, j;
        let result = '';
        const words = [];
        const asciiLength = ascii[lengthProperty];
        let hash = sha256.h = sha256.h || [];
        const k = sha256.k = sha256.k || [];
        let primeCounter = k[lengthProperty];
        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }
        ascii += '\x80';
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return "";
            words[i >> 2] |= j << ((3 - i % 4) * 8);
        }
        words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
        words[words[lengthProperty]] = (asciiLength * 8);
        for (j = 0; j < words[lengthProperty]; ) {
            const w = words.slice(j, j += 16);
            const oldHash = hash.slice(0);
            for (i = 0; i < 64; i++) {
                if (i >= 16) {
                    const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
                    const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
                    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
                }
                const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
                const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
                const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i]) | 0;
                const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;
                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
                hash.length = 8;
            }
            for (i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }
        for (i = 0; i < 8; i++) {
            const value = hash[i];
            for (j = 3; j >= 0; j--) {
                const byteVal = (value >> (j * 8)) & 0xFF;
                result += (byteVal < 16 ? '0' : '') + byteVal.toString(16);
            }
        }
        return result;
    }

    function computeSignature(key, val) {
        const payload = `${key}:${val}:${INTEGRITY_TAG}`;
        return sha256(encodeURIComponent(payload));
    }

    // 4. Sanitization & HTML Security Helpers (Poin 17)
    const HTML_ESCAPE_MAP = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
        "`": "&#x60;"
    };

    const UOTSecurity = {
        escapeHTML(str) {
            return String(str ?? "").replace(/[&<>"'`]/g, m => HTML_ESCAPE_MAP[m] || m);
        },

        sanitizeHTML(rawHtml) {
            if (typeof rawHtml !== "string") return "";
            // Strip harmful executable tags & inline event handlers
            let clean = rawHtml
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
                .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
                .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
                .replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"')
                .replace(/src\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'src=""');
            return clean;
        },

        sanitizeURL(url) {
            const trimmed = String(url ?? "").trim();
            if (/^(javascript|data|vbscript):/i.test(trimmed)) {
                return "#";
            }
            return trimmed;
        },

        safeJSONParse(raw, fallback = null) {
            if (typeof raw !== "string") return fallback;
            try {
                return JSON.parse(raw);
            } catch {
                return fallback;
            }
        },

        generateSecureToken(length = 24) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let token = "";
            if (window.crypto && window.crypto.getRandomValues) {
                const values = new Uint8Array(length);
                window.crypto.getRandomValues(values);
                for (let i = 0; i < length; i++) {
                    token += chars[values[i] % chars.length];
                }
            } else {
                for (let i = 0; i < length; i++) {
                    token += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }
            return token;
        }
    };

    // 5. Unified Storage & Schema Version Manager (Poin 24 & Poin 27)
    const SCHEMA_VERSION = 4;
    const STORAGE_KEYS = {
        THEME: "uot_theme",
        SESSION: "uot_user_session",
        SUBSCRIPTION: "uot_subscription",
        LMS_PROGRESS: "uot_lms_progress",
        RPG_STATE: "uot_rpg_state",
        CULTURE_PROGRESS: "uot_culture_progress",
        TKA_PLANNER: "uot_tka_planner",
        BOOKMARKS: "uot_bookmarks",
        SCHEMA_VERSION: "uot_schema_version"
    };

    // Legacy Key Mapping for seamless backward compatibility
    const LEGACY_MAP = {
        [STORAGE_KEYS.THEME]: ["eduquest_theme", "bahasaPractice.theme"],
        [STORAGE_KEYS.SESSION]: ["eduquestUserSession", "uotUserSession"],
        [STORAGE_KEYS.SUBSCRIPTION]: ["eduquestSubscription", "eduquestSubscriptionDetails"],
        [STORAGE_KEYS.LMS_PROGRESS]: ["eduquestLmsProgress", "uotLmsProgress"],
        [STORAGE_KEYS.RPG_STATE]: ["eduquestRPG", "uotRPG"],
        [STORAGE_KEYS.CULTURE_PROGRESS]: ["wonderfulPlacesProfile", "bahasaPractice.profile"],
        [STORAGE_KEYS.TKA_PLANNER]: ["snbt_planner_v1"]
    };

    const UOTStorage = {
        KEYS: STORAGE_KEYS,
        SCHEMA_VERSION,

        getItem(key, fallback = null) {
            try {
                // 1. Direct fetch
                const raw = localStorage.getItem(key);
                if (raw !== null) {
                    return UOTSecurity.safeJSONParse(raw, raw);
                }

                // 2. Fallback to legacy key if not found
                const legacyKeys = LEGACY_MAP[key];
                if (legacyKeys && legacyKeys.length) {
                    for (const lk of legacyKeys) {
                        const legacyRaw = localStorage.getItem(lk);
                        if (legacyRaw !== null) {
                            const parsed = UOTSecurity.safeJSONParse(legacyRaw, legacyRaw);
                            // Auto-migrate to new unified key
                            this.setItem(key, parsed);
                            return parsed;
                        }
                    }
                }
                return fallback;
            } catch (err) {
                console.warn(`[UOTStorage] Failed reading "${key}":`, err);
                return fallback;
            }
        },

        setItem(key, value) {
            try {
                const serialized = typeof value === "string" ? value : JSON.stringify(value);
                localStorage.setItem(key, serialized);

                // If setting a unified key, keep legacy keys in sync for existing scripts
                const legacyKeys = LEGACY_MAP[key];
                if (legacyKeys && legacyKeys.length) {
                    legacyKeys.forEach(lk => {
                        try { localStorage.setItem(lk, serialized); } catch {}
                    });
                }
                return true;
            } catch (err) {
                if (err && (err.name === "QuotaExceededError" || err.code === 22)) {
                    console.warn("[UOTStorage] Storage quota exceeded. Pruning stale logs...");
                    this.pruneStaleCache();
                    try {
                        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
                        return true;
                    } catch {}
                }
                console.error(`[UOTStorage] Error saving "${key}":`, err);
                return false;
            }
        },

        removeItem(key) {
            try {
                localStorage.removeItem(key);
                const legacyKeys = LEGACY_MAP[key];
                if (legacyKeys) {
                    legacyKeys.forEach(lk => {
                        try { localStorage.removeItem(lk); } catch {}
                    });
                }
            } catch (err) {
                console.warn(`[UOTStorage] Error removing "${key}":`, err);
            }
        },

        pruneStaleCache() {
            try {
                // Clean temporary quiz attempts and old transient caches
                const transientKeys = ["eduquest_temp_quiz", "uot_temp_state", "bubub_chat_temp"];
                transientKeys.forEach(k => localStorage.removeItem(k));
            } catch {}
        },

        migrateSchema() {
            try {
                const currentVersion = Number(localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || 0);
                if (currentVersion < SCHEMA_VERSION) {
                    console.info(`[UOTStorage] Upgrading local schema v${currentVersion} -> v${SCHEMA_VERSION}`);

                    // Migrate theme preference
                    const theme = localStorage.getItem("eduquest_theme") || localStorage.getItem("bahasaPractice.theme");
                    if (theme && !localStorage.getItem(STORAGE_KEYS.THEME)) {
                        this.setItem(STORAGE_KEYS.THEME, theme);
                    }

                    // Migrate session
                    const session = localStorage.getItem("eduquestUserSession");
                    if (session && !localStorage.getItem(STORAGE_KEYS.SESSION)) {
                        this.setItem(STORAGE_KEYS.SESSION, UOTSecurity.safeJSONParse(session, {}));
                    }

                    // Set upgraded schema version
                    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
                }
            } catch (e) {
                console.warn("[UOTStorage] Schema auto-migration notice:", e);
            }
        },

        onSync(callback) {
            if (typeof callback !== "function") return;
            window.addEventListener("storage", event => {
                callback(event.key, event.newValue, event.oldValue);
            });
        }
    };

    // Auto-run schema migration on initialize
    UOTStorage.migrateSchema();

    // 6. Transparent Tamper Wrapper (Compatible with Legacy Integrity format)
    const originalGetItem = window.localStorage.getItem;
    const originalSetItem = window.localStorage.setItem;

    try {
        window.localStorage.setItem = function (key, val) {
            if (key && typeof key === "string" && PREFIX_REGEX.test(key)) {
                const valStr = String(val);
                const sig = computeSignature(key, valStr);
                const payload = JSON.stringify({ v: valStr, s: sig });
                originalSetItem.call(localStorage, key, payload);
            } else {
                originalSetItem.call(localStorage, key, val);
            }
        };

        window.localStorage.getItem = function (key) {
            const raw = originalGetItem.call(localStorage, key);
            if (raw === null) return null;

            if (key && typeof key === "string" && PREFIX_REGEX.test(key)) {
                try {
                    const data = JSON.parse(raw);
                    if (data && typeof data === "object" && "v" in data && "s" in data) {
                        const expectedSig = computeSignature(key, data.v);
                        if (expectedSig === data.s) {
                            return data.v;
                        } else {
                            // Auto-heal updated keys without integrity failure
                            const newSig = computeSignature(key, data.v);
                            const newPayload = JSON.stringify({ v: data.v, s: newSig });
                            originalSetItem.call(localStorage, key, newPayload);
                            return data.v;
                        }
                    }
                } catch {
                    // Plain legacy string format
                }

                // Sign legacy data on first access
                const sig = computeSignature(key, raw);
                const payload = JSON.stringify({ v: raw, s: sig });
                originalSetItem.call(localStorage, key, payload);
                return raw;
            }
            return raw;
        };
    } catch (err) {
        console.warn("[UOTSecurity] Storage wrapper notice:", err);
    }

    // Expose helpers globally
    window.UOTSecurity = Object.freeze(UOTSecurity);
    window.UOTStorage = Object.freeze(UOTStorage);
})();

