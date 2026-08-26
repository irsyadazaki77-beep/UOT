/**
 * Universe Of Tech (UOT) - Centralized Activity Service & System Integration Pipeline (FASE 16)
 * Single Pipeline: UI Activity -> Activity Service -> Local Progress -> SyncEngine Queue -> Backend Validation -> Authoritative State -> UI Update
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        const service = factory();
        root.ActivityService = service;
        root.UOTActivityService = service;
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // 1. Standard Event Bus Channel Names
    const EVENTS = Object.freeze({
        ACTIVITY: "uot:activity",
        PROGRESS: "uot:progress",
        SYNC: "uot:sync",
        AUTH: "uot:auth",
        CONTENT: "uot:content",
        MASTERY: "uot:mastery"
    });

    const listeners = new Map();

    function emitEvent(eventName, detailData) {
        // Dispatch in browser
        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            try {
                const event = new CustomEvent(eventName, { detail: detailData, bubbles: true });
                window.dispatchEvent(event);
            } catch (err) {
                console.warn(`[ActivityService] CustomEvent dispatch error (${eventName}):`, err);
            }
        }

        // Notify direct internal subscribers
        if (listeners.has(eventName)) {
            listeners.get(eventName).forEach(handler => {
                try {
                    handler(detailData);
                } catch (err) {
                    console.error(`[ActivityService] Listener error on ${eventName}:`, err);
                }
            });
        }
    }

    function subscribe(eventName, handler) {
        if (typeof handler !== "function") return () => {};
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }
        listeners.get(eventName).add(handler);

        // Also add window event listener if in browser
        const windowHandler = (e) => handler(e.detail);
        if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
            window.addEventListener(eventName, windowHandler);
        }

        return function unsubscribe() {
            if (listeners.has(eventName)) {
                listeners.get(eventName).delete(handler);
            }
            if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
                window.removeEventListener(eventName, windowHandler);
            }
        };
    }

    /**
     * Unified Pipeline Execution Function
     * Handles: Local State -> Sync Queue -> Telemetry -> Mastery -> Event Bus -> Cloud Sync
     */
    function processPipeline(activityType, payload = {}, options = {}) {
        const timestamp = new Date().toISOString();
        const activityId = options.activityId || payload.activityId || `${activityType}_${Date.now()}`;

        // 1. Local Optimistic Progress Update via Progression Engine
        let progressionFeedback = null;
        let progressionResult = null;

        const progressionEngine = typeof window !== "undefined" ? (window.Progression || window.ProgressionEngine) : null;

        if (progressionEngine) {
            try {
                if (activityType === "achievement_unlock" && payload.achievementId) {
                    progressionResult = progressionEngine.unlockAchievement(payload.achievementId);
                    progressionFeedback = {
                        activityType,
                        title: payload.title || "Lencana Pencapaian Diraih!",
                        xpAwarded: progressionResult.xpAwarded || 0,
                        coinsAwarded: progressionResult.coinsAwarded || 0,
                        levelProgress: progressionEngine.getLevelProgress(),
                        streakStatus: progressionEngine.getStreakInfo(),
                        nextObjective: progressionEngine.getNextObjective()
                    };
                } else if (activityType === "mission_claim" && payload.missionId) {
                    if (payload.missionType === "weekly") {
                        progressionResult = progressionEngine.claimWeeklyMission(payload.missionId);
                    } else {
                        progressionResult = progressionEngine.claimDailyMission(payload.missionId);
                    }
                    progressionFeedback = {
                        activityType,
                        title: payload.title || "Klaim Hadiah Misi",
                        xpAwarded: progressionResult.xpAwarded || 0,
                        coinsAwarded: progressionResult.coinsAwarded || 0,
                        levelProgress: progressionEngine.getLevelProgress(),
                        streakStatus: progressionEngine.getStreakInfo(),
                        nextObjective: progressionEngine.getNextObjective()
                    };
                } else {
                    progressionFeedback = progressionEngine.recordActivity(activityType, {
                        ...options,
                        count: payload.count || 1,
                        xp: options.xp !== undefined ? options.xp : payload.xp,
                        coins: options.coins !== undefined ? options.coins : payload.coins,
                        rewardId: options.rewardId || payload.rewardId || `${activityType}:${activityId}`,
                        title: options.title || payload.title,
                        reason: options.reason || payload.reason,
                        showModal: options.showModal ?? false,
                        showSummary: options.showSummary ?? false
                    });
                }
            } catch (err) {
                console.warn("[ActivityService] Progression update failed:", err);
            }
        }

        // 2. Queue Event into SyncEngine for Authoritative Server Validation
        let syncEvent = null;
        const syncEngine = typeof window !== "undefined" ? window.SyncEngine : null;
        if (syncEngine && typeof syncEngine.queueEvent === "function") {
            try {
                syncEvent = syncEngine.queueEvent(mapToSyncEventType(activityType), {
                    activityId,
                    activityType,
                    clientTimestamp: timestamp,
                    ...payload
                });
            } catch (err) {
                console.warn("[ActivityService] SyncEngine queueEvent failed:", err);
            }
        }

        // 3. Telemetry & Analytics Logging
        const analytics = typeof window !== "undefined" ? window.UOTAnalytics : null;
        if (analytics) {
            try {
                if (activityType.includes("lesson") || activityType === "materi") {
                    analytics.trackLesson(payload.action || "complete", payload.lessonId || activityId, payload);
                } else if (activityType.includes("quiz")) {
                    analytics.trackQuiz(payload.action || "complete", payload.quizId || activityId, payload);
                } else {
                    analytics.trackEvent(`${activityType}_completed`, payload);
                }
            } catch (err) {
                console.warn("[ActivityService] Analytics logging failed:", err);
            }
        }

        // 4. Mastery Calculation Update via Recommendation Service
        let masterySummary = null;
        if (typeof window !== "undefined" && window.RecommendationService) {
            try {
                window.RecommendationService.invalidateCache();
                window.RecommendationService.getMastery().then(mastery => {
                    masterySummary = mastery;
                    emitEvent(EVENTS.MASTERY, {
                        activityType,
                        activityId,
                        masterySummary,
                        timestamp
                    });
                }).catch(() => {});
            } catch (err) {
                console.warn("[ActivityService] RecommendationService update failed:", err);
            }
        } else {
            const adaptiveEngine = typeof window !== "undefined" ? window.AdaptiveLearningEngine : null;
            if (adaptiveEngine && typeof adaptiveEngine.generateRecommendations === "function") {
                try {
                    masterySummary = adaptiveEngine.generateRecommendations().masterySummary || {};
                    emitEvent(EVENTS.MASTERY, {
                        activityType,
                        activityId,
                        masterySummary,
                        timestamp
                    });
                } catch (err) {
                    console.warn("[ActivityService] Adaptive Learning update failed:", err);
                }
            }
        }

        // 5. Build Aggregated Pipeline Result
        const currentGameState = progressionEngine ? progressionEngine.getGameState() : null;
        const pipelineResult = {
            ok: true,
            activityId,
            activityType,
            timestamp,
            feedback: progressionFeedback,
            gameState: currentGameState,
            syncEvent,
            masterySummary
        };

        // 6. Dispatch Event Bus Custom Events
        emitEvent(EVENTS.ACTIVITY, {
            type: activityType,
            activityId,
            status: "completed",
            payload,
            feedback: progressionFeedback,
            timestamp
        });

        if (currentGameState) {
            emitEvent(EVENTS.PROGRESS, {
                lifetimeXp: currentGameState.lifetimeXp,
                coins: currentGameState.coins,
                level: currentGameState.level,
                streak: currentGameState.streak,
                levelMetrics: progressionEngine.getLevelProgress ? progressionEngine.getLevelProgress() : null,
                timestamp
            });
        }

        // 7. Trigger Immediate Sync if device is online
        if (syncEngine && typeof syncEngine.flushQueue === "function" && typeof navigator !== "undefined" && navigator.onLine) {
            syncEngine.flushQueue().catch(err => {
                console.warn("[ActivityService] Cloud flush attempt deferred:", err);
            });
        }

        return pipelineResult;
    }

    function mapToSyncEventType(type) {
        const str = String(type || "").toLowerCase();
        if (str.includes("lesson") || str === "materi") return "lesson_complete";
        if (str.includes("quiz")) return "quiz_complete";
        if (str.includes("project")) return "project_complete";
        if (str.includes("game")) return "game_complete";
        if (str.includes("achievement")) return "achievement_unlock";
        if (str.includes("mission")) return "daily_mission_claim";
        if (str.includes("sandbox")) return "sandbox_run";
        return "activity_event";
    }

    // Facade API methods for each major activity
    return Object.freeze({
        EVENTS,
        subscribe,
        on: subscribe,
        emit: emitEvent,

        recordActivity(activityType, payload = {}, options = {}) {
            return processPipeline(activityType, payload, options);
        },

        recordLesson(lessonId, payload = {}, options = {}) {
            return processPipeline("lesson_complete", { lessonId, ...payload }, {
                title: payload.title || "Membaca Bagian Materi",
                reason: "Membaca Bagian Materi",
                configKey: "READ_LESSON_STEP",
                ...options
            });
        },

        recordQuiz(quizId, score, payload = {}, options = {}) {
            const meta = (typeof window !== "undefined" && window.AdaptiveLearningEngine && typeof window.AdaptiveLearningEngine.getActivityMetadata === "function")
                ? window.AdaptiveLearningEngine.getActivityMetadata(quizId)
                : {};

            const enrichedPayload = {
                quizId,
                score: Number(score) || 0,
                skill: payload.skill || meta.skill || "javascript_basics",
                topic: payload.topic || meta.topic || quizId,
                difficulty: Number(payload.difficulty || meta.difficulty || 1),
                answers: payload.answers || [],
                hintCount: payload.hintCount !== undefined ? payload.hintCount : (payload.usedHint ? 1 : 0),
                usedHint: Boolean(payload.usedHint || payload.hintCount > 0),
                completionTimeSeconds: Number(payload.completionTimeSeconds || payload.timeSpentSeconds || payload.duration || 0),
                ...payload
            };

            // Invalidate recommendation cache on activity completion
            if (typeof window !== "undefined" && window.RecommendationService && typeof window.RecommendationService.invalidateCache === "function") {
                window.RecommendationService.invalidateCache();
            }

            return processPipeline("quiz_complete", enrichedPayload, {
                title: payload.title || "Menyelesaikan Kuis",
                reason: score >= 100 ? "Skor Sempurna Kuis" : (score >= 70 ? "Menyelesaikan Kuis (Lulus)" : "Mencoba Latihan Kuis"),
                configKey: score >= 100 ? "QUIZ_PERFECT" : (score >= 70 ? "QUIZ_PASSED" : "QUIZ_ATTEMPT"),
                ...options
            });
        },

        recordProject(projectId, payload = {}, options = {}) {
            return processPipeline("project_complete", { projectId, ...payload }, {
                title: payload.title || "Menyelesaikan Proyek Portofolio",
                reason: "Menyelesaikan Proyek Portofolio",
                configKey: "PROJECT_COMPLETE",
                achievementId: "project_master",
                ...options
            });
        },

        recordGame(gameId, score, payload = {}, options = {}) {
            return processPipeline("game_complete", { gameId, score, ...payload }, {
                title: payload.title || "Menyelesaikan Game Arena",
                reason: "Latihan Interaktif Arena Game",
                configKey: "PRACTICE_CHALLENGE",
                ...options
            });
        },

        recordAchievement(achievementId, payload = {}, options = {}) {
            return processPipeline("achievement_unlock", { achievementId, ...payload }, {
                title: payload.title || "Membuka Lencana Baru",
                reason: "Pencapaian Baru Dibuka",
                ...options
            });
        },

        recordMissionClaim(missionId, type = "daily", payload = {}, options = {}) {
            return processPipeline("mission_claim", { missionId, missionType: type, ...payload }, {
                title: payload.title || "Klaim Misi",
                reason: "Klaim Hadiah Misi",
                ...options
            });
        },

        recordSandboxRun(payload = {}, options = {}) {
            return processPipeline("sandbox_run", payload, {
                title: "Eksperimen Kode di Sandbox",
                reason: "Eksperimen Kode di Sandbox",
                configKey: "SANDBOX_RUN",
                achievementId: "sandbox_hacker",
                ...options
            });
        }
    });
}));
