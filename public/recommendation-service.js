/**
 * Universe Of Tech (UOT) - Centralized Recommendation Service (FASE 21)
 * Single Source of Truth for Adaptive Learning Recommendations across Dashboard,
 * Learning Journey, and Materi Pages.
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.RecommendationService = factory();
        root.UOTRecommendation = root.RecommendationService;
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    let cachedRecommendations = null;
    let cacheTimestamp = 0;
    const CACHE_TTL_MS = 30000; // 30 seconds client cache

    /**
     * Get authoritative recommendations from API or local fallback
     */
    async function getRecommendations(options = {}) {
        const forceRefresh = Boolean(options.forceRefresh);
        const now = Date.now();

        if (!forceRefresh && cachedRecommendations && (now - cacheTimestamp < CACHE_TTL_MS)) {
            return cachedRecommendations;
        }

        // 1. Try server-authoritative API
        try {
            const resp = await fetch("/api/recommendations", {
                headers: { "Accept": "application/json" }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.ok && data.recommendations) {
                    cachedRecommendations = data.recommendations;
                    cacheTimestamp = now;
                    return cachedRecommendations;
                }
            }
        } catch (e) {
            // API network/offline fallback
        }

        // 2. Offline / Local fallback using AdaptiveLearningEngine
        const engine = (typeof window !== "undefined" && window.AdaptiveLearningEngine)
            ? window.AdaptiveLearningEngine
            : (typeof require === "function" ? require("./adaptive-learning-engine") : null);

        if (engine && typeof engine.generateRecommendations === "function") {
            let attempts = [];
            let recHistory = [];

            if (typeof window !== "undefined" && window.ProgressionEngine && typeof window.ProgressionEngine.getProgress === "function") {
                const p = window.ProgressionEngine.getProgress();
                attempts = p.attemptHistory || [];
                recHistory = p.recommendationHistory || [];
            } else if (typeof window !== "undefined" && window.localStorage) {
                try {
                    const localProg = JSON.parse(localStorage.getItem("eduquestProgress") || "{}");
                    attempts = localProg.attemptHistory || [];
                    recHistory = localProg.recommendationHistory || [];
                } catch (err) {}
            }

            const recs = engine.generateRecommendations(attempts, recHistory, now);
            cachedRecommendations = recs;
            cacheTimestamp = now;
            return recs;
        }

        return {
            isColdStart: true,
            recommendedNext: [],
            continue: [],
            needsPractice: [],
            readyForChallenge: [],
            reviewDue: [],
            recentlyMastered: [],
            remedialTrigger: null,
            masterySummary: {},
            explanation: "Sistem adaptif memuat data rekomendasi..."
        };
    }

    /**
     * Get authoritative skill mastery map from API or local engine
     */
    async function getMastery(options = {}) {
        const forceRefresh = Boolean(options.forceRefresh);
        if (!forceRefresh && cachedRecommendations && cachedRecommendations.masterySummary) {
            return cachedRecommendations.masterySummary;
        }

        try {
            const resp = await fetch("/api/mastery", {
                headers: { "Accept": "application/json" }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.ok && data.mastery) {
                    return data.mastery;
                }
            }
        } catch (e) {}

        const recs = await getRecommendations(options);
        return recs.masterySummary || {};
    }

    /**
     * Track user interaction with recommendations for analytics & diversity cooldown
     */
    async function trackInteraction(interactionType, recommendationId, metadata = {}) {
        if (!interactionType || !recommendationId) return;

        // 1. Send to server
        try {
            fetch("/api/recommendations/interaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interactionType, recommendationId, metadata })
            }).catch(() => {});
        } catch (e) {}

        // 2. Client Activity Service Notification
        if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.emit === "function") {
            window.ActivityService.emit("recommendation_interaction", {
                interactionType,
                recommendationId,
                metadata,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Tags and groups a list of lessons according to adaptive recommendations
     */
    function filterMateri(lessonsList = [], recommendations = null) {
        const recs = recommendations || cachedRecommendations;
        if (!recs || !Array.isArray(lessonsList)) return lessonsList;

        const engine = (typeof window !== "undefined" && window.AdaptiveLearningEngine)
            ? window.AdaptiveLearningEngine
            : null;

        const continueMap = new Set((recs.continue || []).map(r => r.id));
        const nextMap = new Set((recs.recommendedNext || []).map(r => r.id));
        const practiceMap = new Set((recs.needsPractice || []).map(r => r.id));
        const challengeMap = new Set((recs.readyForChallenge || []).map(r => r.id));
        const reviewMap = new Set((recs.reviewDue || []).map(r => r.id));

        return lessonsList.map(lesson => {
            const skillId = lesson.skill || (engine ? engine.getActivityMetadata(lesson).skill : "javascript_basics");
            let recTag = null;
            let explanation = null;

            if (recs.remedialTrigger && recs.remedialTrigger.skillId === skillId) {
                recTag = "remedial";
                explanation = recs.remedialTrigger.explanation;
            } else if (reviewMap.has(skillId)) {
                recTag = "review_due";
                const item = (recs.reviewDue || []).find(r => r.id === skillId);
                explanation = item?.explanation || "Jadwal review Spaced Repetition untuk mempertahankan daya ingat.";
            } else if (practiceMap.has(skillId)) {
                recTag = "needs_practice";
                const item = (recs.needsPractice || []).find(r => r.id === skillId);
                explanation = item?.explanation || "Perlu latihan untuk meningkatkan pemahaman ke tingkat Mahir.";
            } else if (continueMap.has(skillId)) {
                recTag = "continue";
                const item = (recs.continue || []).find(r => r.id === skillId);
                explanation = item?.explanation || "Lanjutkan materi yang sedang kamu pelajari.";
            } else if (nextMap.has(skillId)) {
                recTag = "recommended_next";
                const item = (recs.recommendedNext || []).find(r => r.id === skillId);
                explanation = item?.explanation || "Materi selanjutnya yang cocok dengan urutan prasyarat kamu.";
            } else if (challengeMap.has(skillId)) {
                recTag = "ready_for_challenge";
                const item = (recs.readyForChallenge || []).find(r => r.id === skillId);
                explanation = item?.explanation || "Kamu sudah mahir! Ambil materi tingkat lanjut dan proyek tantangan.";
            }

            return {
                ...lesson,
                adaptiveTag: recTag,
                adaptiveExplanation: explanation,
                mastery: recs.masterySummary ? recs.masterySummary[skillId] : null
            };
        });
    }

    /**
     * Clear cached recommendations
     */
    function invalidateCache() {
        cachedRecommendations = null;
        cacheTimestamp = 0;
    }

    return Object.freeze({
        getRecommendations,
        getMastery,
        trackInteraction,
        filterMateri,
        invalidateCache
    });
}));
