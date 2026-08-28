/**
 * Universe Of Tech (UOT) - Cloud Synchronization Engine (FASE 11)
 * Client-Side Sync Layer managing Offline Cache, Event Queue, Retry with Exponential Backoff,
 * Domain-Specific Conflict Resolution, and Unobtrusive Sync Status UI.
 */
(() => {
    "use strict";

    const QUEUE_KEY = "uot_pending_events";
    const MIGRATED_KEY = "uot_cloud_migrated";
    const MAX_QUEUE_SIZE = 200;

    let syncStatus = "synced"; // "synced" | "syncing" | "offline" | "error"
    let lastSyncedAt = null;
    let syncTimer = null;
    let backoffDelay = 1000; // Start at 1s, max 30s
    let isFlushing = false;

    function safeParse(str, fallback) {
        if (!str) return fallback;
        try { return JSON.parse(str) ?? fallback; } catch { return fallback; }
    }

    function safeWrite(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
    }

    function generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    function getPendingQueue() {
        const queue = safeParse(localStorage.getItem(QUEUE_KEY), []);
        return Array.isArray(queue) ? queue : [];
    }

    function setPendingQueue(queue) {
        safeWrite(QUEUE_KEY, Array.isArray(queue) ? queue.slice(-MAX_QUEUE_SIZE) : []);
    }

    function checkLegacyDataToMigrate() {
        if (localStorage.getItem(MIGRATED_KEY) === "true") return null;

        const canonicalState = safeParse(localStorage.getItem("uot_game_state"), null);
        const legacyRpg = safeParse(localStorage.getItem("eduquestRPG"), null);
        const legacyLms = safeParse(localStorage.getItem("eduquestLmsProgress"), null);

        if (!canonicalState && !legacyRpg && !legacyLms) return null;

        return {
            canonicalState,
            legacyRpg,
            legacyLms,
            lifetimeXp: canonicalState?.lifetimeXp || legacyRpg?.totalXp || 0,
            coins: canonicalState?.coins || 0,
            achievements: canonicalState?.achievements || [],
            inventory: canonicalState?.inventory || [],
            settings: safeParse(localStorage.getItem("eduquestProfileSettings"), {})
        };
    }

    function isGuest() {
        return !localStorage.getItem("uot_current_user") && !localStorage.getItem("quiznationCurrentUser") && !localStorage.getItem("eduquestUserSession");
    }

    function updateSyncStatus(nextStatus, message = "") {
        syncStatus = nextStatus;
        if (nextStatus === "synced") lastSyncedAt = new Date().toISOString();

        renderSyncBadge(syncStatus, message);

        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            try {
                window.dispatchEvent(new CustomEvent("uot-sync-state-change", {
                    detail: { status: syncStatus, pendingCount: getPendingQueue().length, lastSyncedAt, message }
                }));
            } catch (_) {}
        }
    }

    function renderSyncBadge(status, message = "") {
        if (typeof document === "undefined") return;

        let container = document.getElementById("syncStatusBadge");
        if (!container) {
            const navActions = document.querySelector(".nav-actions") || document.body;
            if (!navActions) return;

            container = document.createElement("div");
            container.id = "syncStatusBadge";
            container.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 14px;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.25s ease;
                cursor: pointer;
                user-select: none;
                margin-left: 8px;
            `;
            navActions.appendChild(container);
        }

        let bg = "rgba(16, 185, 129, 0.12)";
        let border = "1px solid rgba(16, 185, 129, 0.3)";
        let color = "#10b981";
        let icon = "fa-cloud-check";
        let label = "Synced";

        if (isGuest()) {
            bg = "rgba(107, 114, 128, 0.12)";
            border = "1px solid rgba(107, 114, 128, 0.3)";
            color = "#9ca3af";
            icon = "fa-hard-drive";
            label = "Tersimpan di perangkat";
            container.style.display = "inline-flex";
            container.style.opacity = "1";
            container.style.pointerEvents = "auto";
        } else if (status === "synced") {
            container.style.opacity = "0";
            container.style.pointerEvents = "none";
            setTimeout(() => { if (syncStatus === "synced") container.style.display = "none"; }, 300);
            return;
        } else {
            container.style.display = "inline-flex";
            container.style.opacity = "1";
            container.style.pointerEvents = "auto";
        }

        if (!isGuest()) {
            if (status === "syncing") {
                bg = "rgba(59, 130, 246, 0.12)";
                border = "1px solid rgba(59, 130, 246, 0.3)";
                color = "#3b82f6";
                icon = "fa-rotate fa-spin";
                label = "Syncing...";
            } else if (status === "offline") {
                bg = "rgba(107, 114, 128, 0.12)";
                border = "1px solid rgba(107, 114, 128, 0.3)";
                color = "#9ca3af";
                icon = "fa-wifi";
                label = "Offline";
            } else if (status === "error") {
                bg = "rgba(239, 68, 68, 0.12)";
                border = "1px solid rgba(239, 68, 68, 0.3)";
                color = "#ef4444";
                icon = "fa-rotate-right";
                label = "Mencoba lagi...";
                
                // Hide error badge after 5 seconds to prevent permanent navbar clutter
                setTimeout(() => {
                    if (syncStatus === "error") {
                        container.style.opacity = "0";
                        container.style.pointerEvents = "none";
                    }
                }, 5000);
            }
        }

        container.style.background = bg;
        container.style.border = border;
        container.style.color = color;
        container.title = message || (isGuest() ? "Progress disimpan lokal. Login untuk cloud sync." : `Status Cloud Save: ${label}. Klik untuk sinkronisasi ulang.`);

        const pendingCount = getPendingQueue().length;
        const pendingBadge = (pendingCount > 0 && !isGuest()) ? `<span style="font-size:10px; opacity:0.85;">(${pendingCount})</span>` : "";

        container.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${label}</span> ${pendingBadge}`;

        container.onclick = () => {
            if (syncStatus !== "syncing" && !isGuest()) {
                flushQueue(true);
            }
        };
    }

    async function flushQueue(force = false) {
        if (isFlushing) return;

        if (isGuest()) {
            updateSyncStatus("local", "Progress tersimpan secara lokal.");
            return;
        }

        if (typeof navigator !== "undefined" && !navigator.onLine) {
            updateSyncStatus("offline", "Perangkat sedang offline. Progress tersimpan secara lokal.");
            return;
        }

        const queue = getPendingQueue();
        const legacyData = checkLegacyDataToMigrate();

        if (queue.length === 0 && !legacyData && !force) {
            updateSyncStatus("synced");
            return;
        }

        isFlushing = true;
        updateSyncStatus("syncing");

        try {
            const API = window.QuizNationAPI;
            let response = null;
            let status = 200;

            if (API && typeof API.request === "function") {
                response = await API.request("/api/progress/sync", {
                    method: "POST",
                    body: JSON.stringify({
                        events: queue,
                        legacyData
                    })
                });
                status = 200;
            } else {
                const res = await fetch("/api/progress/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Requested-With": "QuizNation" },
                    body: JSON.stringify({ events: queue, legacyData })
                });
                status = res.status;
                
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    response = await res.json();
                } else {
                    response = { ok: res.ok, message: await res.text() };
                }
            }

            if (status >= 200 && status < 300 && (response && response.ok !== false)) {
                const acknowledged = new Set(response.acknowledgedEventIds || queue.map(e => e.eventId));
                const currentQueue = getPendingQueue();
                const remainingQueue = currentQueue.filter(e => !acknowledged.has(e.eventId));
                setPendingQueue(remainingQueue);

                if (legacyData) {
                    localStorage.setItem(MIGRATED_KEY, "true");
                }

                if (response.progress && window.Progression && typeof window.Progression.updateFromCloud === "function") {
                    window.Progression.updateFromCloud(response.progress);
                }

                backoffDelay = 1000;
                updateSyncStatus("synced");
            } else {
                const err = new Error(response?.message || `Sync failed with status ${status}`);
                err.status = status;
                throw err;
            }
        } catch (err) {
            console.warn("[SyncEngine] Sync failed:", err.message);
            updateSyncStatus("error", err.message);
            
            const status = err.status || 0;
            
            if (status === 401 || status === 403) {
                // Auth error - do not retry automatically, wait for login
                if (syncTimer) clearTimeout(syncTimer);
            } else if (status === 400) {
                // Bad request - do not retry automatically
                if (syncTimer) clearTimeout(syncTimer);
            } else if (status === 429) {
                // Rate limited - respect backoff
                backoffDelay = Math.min(backoffDelay * 2, 60000);
                if (syncTimer) clearTimeout(syncTimer);
                syncTimer = setTimeout(() => flushQueue(), backoffDelay);
            } else {
                // Network or 5xx - exponential backoff
                backoffDelay = Math.min(backoffDelay * 2, 30000);
                if (syncTimer) clearTimeout(syncTimer);
                syncTimer = setTimeout(() => flushQueue(), backoffDelay);
            }
        } finally {
            isFlushing = false;
        }
    }

    function triggerDebouncedSync(delay = 1500) {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => flushQueue(), delay);
    }

    function queueEvent(eventType, payload = {}) {
        if (!eventType || typeof eventType !== "string") return null;

        const event = {
            eventId: generateEventId(),
            eventType,
            clientTimestamp: new Date().toISOString(),
            payload
        };

        const queue = getPendingQueue();
        queue.push(event);
        setPendingQueue(queue);

        updateSyncStatus("syncing", "Menyimpan aktivitas ke antrean...");
        triggerDebouncedSync(1500);

        return event;
    }

    async function pullAuthoritativeProgress() {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            updateSyncStatus("offline");
            return;
        }

        try {
            const API = window.QuizNationAPI;
            let response = null;
            if (API && typeof API.request === "function") {
                response = await API.request("/api/progress", { method: "GET" });
            } else {
                const res = await fetch("/api/progress");
                response = await res.json();
            }

            if (response && response.ok && response.progress) {
                if (window.Progression && typeof window.Progression.updateFromCloud === "function") {
                    window.Progression.updateFromCloud(response.progress);
                }
                updateSyncStatus("synced");
            }
        } catch (err) {
            console.warn("[SyncEngine] Pull progress failed:", err.message);
        }
    }

    function init() {
        renderSyncBadge(syncStatus);

        // Network status listeners
        if (typeof window !== "undefined") {
            window.addEventListener("online", () => {
                backoffDelay = 1000;
                updateSyncStatus("syncing", "Koneksi terhubung kembali. Menyinkronkan...");
                flushQueue(true);
            });

            window.addEventListener("offline", () => {
                updateSyncStatus("offline", "Perangkat offline.");
            });

            window.addEventListener("uot-account-change", () => {
                backoffDelay = 1000;
                flushQueue(true);
            });

            document.addEventListener("visibilitychange", () => {
                if (!document.hidden && navigator.onLine) {
                    pullAuthoritativeProgress();
                }
            });
        }

        // Initial sync on startup
        setTimeout(() => {
            if (navigator.onLine) {
                pullAuthoritativeProgress().then(() => flushQueue());
            } else {
                updateSyncStatus("offline");
            }
        }, 800);
    }

    const publicApi = Object.freeze({
        init,
        getState: () => ({ status: syncStatus, pendingCount: getPendingQueue().length, lastSyncedAt }),
        queueEvent,
        flushQueue,
        pullAuthoritativeProgress,
        getQueue: () => getPendingQueue()
    });

    if (typeof window !== "undefined") {
        window.SyncEngine = publicApi;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = publicApi;
    }

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            init();
        }
    }
})();
