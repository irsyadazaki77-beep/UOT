(() => {
    "use strict";

    const KEYS = Object.freeze({
        session: "eduquestUserSession",
        preferences: "eduquestProfileSettings",
        hub: "eduquestProfileHub",
        rpg: "eduquestRPG",
        subscription: "eduquestSubscription",
        subscriptionDetails: "eduquestSubscriptionDetails",
        subscriptionHistory: "eduquestSubscriptionHistory",
        theme: "eduquest_theme",
        sound: "eduquest_sound"
    });
    const OWNED_KEYS = Object.freeze([
        ...Object.values(KEYS), "eduquestRememberedEmail", "eduquestLmsProgress",
        "eduquestXP", "eduquestStreak", "eduquestLevel", "eduquestBestScore",
        "eduquestLastSession", "bahasa_progress", "uotProfileLastPanel",
        "quiznationLearningJourneyV1", "eduquestProjectProgress",
        "snbt_stats", "tka_checklist", "tka_syllabus_progress", "tka_weekly_roadmap_checked",
        "tka_daily_schedule", "tka_bookmarks", "tka_mistakes_diary", "tka_planner_prefs",
        "tka_diagnostic_result", "tka_prev_readiness_level"
    ]);
    const BACKUP_KEYS = Object.freeze([
        KEYS.session, KEYS.rpg, KEYS.preferences, KEYS.hub, "bahasa_progress",
        "quiznationLearningJourneyV1", "eduquestProjectProgress",
        "eduquestLmsProgress", KEYS.subscription, KEYS.subscriptionDetails,
        KEYS.subscriptionHistory, KEYS.theme, KEYS.sound, "snbt_stats", "tka_checklist",
        "tka_syllabus_progress", "tka_weekly_roadmap_checked", "tka_daily_schedule",
        "tka_bookmarks", "tka_mistakes_diary", "tka_planner_prefs", "tka_diagnostic_result",
        "tka_prev_readiness_level"
    ]);
    const PREF_DEFAULTS = Object.freeze({
        headline: "", bio: "", focus: "frontend", language: "id", dailyGoal: "30",
        startPage: "index.html", reminder: true, reducedMotion: false,
        publicProfile: true, analytics: true, studyMode: "balanced",
        reminderTime: "19:00", accent: "ocean"
    });
    const HUB_DEFAULTS = Object.freeze({
        focusNote: "", focusNoteUpdatedAt: "",
        missions: { read: false, quiz: false, review: false }
    });
    const MAX_BACKUP_BYTES = 1024 * 1024;

    function readJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
        catch { return fallback; }
    }
    function writeJSON(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch { return false; }
    }
    function normalizeText(value, maxLength) {
        return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength);
    }
    function normalizeSession(value) {
        if (!value || typeof value !== "object") return null;
        return {
            ...value,
            isLoggedIn: Boolean(value.isLoggedIn),
            username: normalizeText(value.username || value.name || "Pengguna Universe", 80),
            email: normalizeText(value.email, 254),
            avatar: value.avatar ? normalizeText(value.avatar, 24) : undefined,
            loginAt: value.loginAt || value.loginTime || undefined
        };
    }
    function getSession() { return normalizeSession(readJSON(KEYS.session, null)); }
    function setSession(session) {
        const normalized = normalizeSession(session);
        if (!normalized) return false;
        return writeJSON(KEYS.session, normalized);
    }
    function signIn(profile) {
        const previous = getSession() || {};
        const next = normalizeSession({ ...previous, ...profile, isLoggedIn: true, loginAt: new Date().toISOString() });
        setSession(next);
        window.dispatchEvent(new CustomEvent("uot-account-change", { detail: next }));
        return next;
    }
    function signOut() {
        localStorage.removeItem(KEYS.session);
        window.dispatchEvent(new CustomEvent("uot-account-change", { detail: null }));
    }
    function getPreferences() { return { ...PREF_DEFAULTS, ...readJSON(KEYS.preferences, {}) }; }
    function updatePreferences(patch) {
        const next = { ...getPreferences(), ...(patch && typeof patch === "object" ? patch : {}) };
        writeJSON(KEYS.preferences, next);
        return next;
    }
    function getHub() {
        const raw = readJSON(KEYS.hub, {});
        return { ...HUB_DEFAULTS, ...raw, missions: { ...HUB_DEFAULTS.missions, ...(raw.missions || {}) } };
    }
    function updateHub(patch) {
        const current = getHub();
        const next = { ...current, ...(patch || {}) };
        if (patch?.missions) next.missions = { ...current.missions, ...patch.missions };
        writeJSON(KEYS.hub, next);
        return next;
    }
    function calculateCultureXp(progress) {
        return ((progress.explored || []).length * 10) + ((progress.mastered || []).length * 20) +
            ((progress.quizDone || 0) * 15) + ((progress.voiceSuccessCount || 0) * 25) + Number(progress.bonusXP || 0);
    }
    function getStats() {
        const culture = readJSON("bahasa_progress", {});
        const lms = readJSON("eduquestLmsProgress", {});
        const rpg = readJSON(KEYS.rpg, {});
        const xp = Math.max(Number(localStorage.getItem("eduquestXP") || 0), Number(rpg.xp || 0), Number(lms.xp || 0), calculateCultureXp(culture));
        const streak = Math.max(Number(localStorage.getItem("eduquestStreak") || 0), Number(culture.streak || 0), Number(lms.streak || 0), Number(rpg.streak || 0));
        const attempts = Number(culture.reviewed || lms.totalQuestions || 0);
        const correct = Number(culture.correct || lms.correct || 0);
        return { xp, streak, accuracy: attempts ? Math.round((correct / attempts) * 100) : 0 };
    }
    function sanitizeReturnTo(raw, fallback = "profile.html") {
        if (!raw || typeof raw !== "string") return fallback;
        let value;
        try { value = decodeURIComponent(raw).trim(); } catch { return fallback; }
        if (!value || value.startsWith("//") || value.includes("\\") || value.includes("..") || /^[a-z][a-z\d+.-]*:/i.test(value)) return fallback;
        const match = value.match(/^([a-z0-9-]+\.html)([?#].*)?$/i);
        return match ? `${match[1]}${match[2] || ""}` : fallback;
    }
    function getReturnTo(fallback = "profile.html") {
        return sanitizeReturnTo(new URLSearchParams(location.search).get("returnTo"), fallback);
    }
    function createBackup() {
        return {
            exportedAt: new Date().toISOString(), app: "Universe Of Tech", version: 4,
            data: Object.fromEntries(BACKUP_KEYS.map(key => [key, localStorage.getItem(key)]))
        };
    }
    async function inspectBackup(file) {
        if (!file || file.size > MAX_BACKUP_BYTES) throw new Error("FILE_TOO_LARGE");
        let parsed;
        try { parsed = JSON.parse(await file.text()); } catch { throw new Error("INVALID_JSON"); }
        if (![2, 3, 4].includes(Number(parsed?.version)) || !parsed?.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) throw new Error("INVALID_SCHEMA");
        const entries = BACKUP_KEYS.filter(key => Object.prototype.hasOwnProperty.call(parsed.data, key));
        if (!entries.length || entries.some(key => parsed.data[key] !== null && typeof parsed.data[key] !== "string")) throw new Error("INVALID_SCHEMA");
        return { parsed, entries, version: Number(parsed.version), exportedAt: parsed.exportedAt || "" };
    }
    function importBackup(inspection) {
        inspection.entries.forEach(key => {
            const value = inspection.parsed.data[key];
            if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
        });
        window.dispatchEvent(new CustomEvent("uot-account-change", { detail: getSession() }));
        return inspection.entries.length;
    }
    function deleteAccountData() {
        OWNED_KEYS.forEach(key => localStorage.removeItem(key));
        window.dispatchEvent(new CustomEvent("uot-account-change", { detail: null }));
    }

    window.QuizNationAccount = Object.freeze({
        KEYS, OWNED_KEYS, BACKUP_KEYS, PREF_DEFAULTS, HUB_DEFAULTS, MAX_BACKUP_BYTES,
        readJSON, writeJSON, getSession, setSession, signIn, signOut,
        getPreferences, updatePreferences, getHub, updateHub, getStats,
        sanitizeReturnTo, getReturnTo, createBackup, inspectBackup, importBackup, deleteAccountData
    });
})();
