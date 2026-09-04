/**
 * Universe Of Tech (UOT) - Unified Game State, Progression Engine & Gameplay Loop
 * Canonical Single Source of Truth for XP, Levels, Coins, Streaks, Missions, Mastery, and Objectives.
 */
(() => {
    "use strict";

    const SCHEMA_VERSION = 2;
    const CANONICAL_STORAGE_KEY = "uot_game_state";
    const LEGACY_RPG_KEY = "eduquestRPG";
    const LEGACY_XP_KEY = "eduquestXP";
    const LEGACY_STREAK_KEY = "eduquestStreak";
    const LEGACY_LMS_KEY = "eduquestLmsProgress";
    const LEGACY_CULTURE_KEY = "bahasa_progress";
    const LEGACY_PROJECTS_KEY = "eduquestProjectProgress";
    const LEGACY_JOURNEY_KEY = "quiznationLearningJourneyV1";
    const LEGACY_CURRICULUM_KEY = "uot_curriculum_progress";

    // 13. Centralized Reward Configuration
    const REWARDS_CONFIG = Object.freeze({
        // Learning & Reading
        READ_LESSON_STEP: { xp: 15, coins: 8, reason: "Membaca Bagian Materi" },
        COMPLETE_CHAPTER: { xp: 50, coins: 25, reason: "Menyelesaikan Bab Materi" },
        COMPLETE_TRACK: { xp: 200, coins: 100, reason: "Menyelesaikan Seluruh Jalur Belajar" },

        // Quizzes & Assessments (difficulty: easy=1x, medium=1.5x, hard=2x)
        QUIZ_QUESTION_CORRECT: { xp: 10, coins: 5, reason: "Menjawab Soal Kuis dengan Benar" },
        QUIZ_PASSED: { xp: 40, coins: 20, reason: "Menyelesaikan Kuis (Skor >= 70%)" },
        QUIZ_PERFECT: { xp: 75, coins: 40, reason: "Skor Sempurna Kuis (100%)" },

        // Code Sandbox & Experiments
        SANDBOX_RUN: { xp: 15, coins: 8, reason: "Eksperimen Kode di Sandbox" },
        SANDBOX_CHALLENGE_SOLVED: { xp: 60, coins: 30, reason: "Menyelesaikan Lab Tantangan Kode" },

        // Real Projects
        PROJECT_STEP_COMPLETE: { xp: 25, coins: 12, reason: "Menyelesaikan Langkah Proyek" },
        PROJECT_COMPLETE: { xp: 120, coins: 60, reason: "Menyelesaikan Proyek Portofolio" },

        // SNBT / TKA
        SNBT_DIAGNOSTIC_COMPLETE: { xp: 80, coins: 40, reason: "Menyelesaikan Tes Diagnosis SNBT" },
        SNBT_TRYOUT_COMPLETE: { xp: 150, coins: 75, reason: "Menyelesaikan Simulasi Tryout SNBT" },

        // Culture & Language
        CULTURE_EXPLORE_PLACE: { xp: 15, coins: 8, reason: "Eksplorasi Budaya Daerah" },
        LANGUAGE_SESSION_COMPLETE: { xp: 30, coins: 15, reason: "Menyelesaikan Sesi Flashcard Bahasa" },

        // Missions & Streaks
        DAILY_MISSION_SINGLE: { xp: 40, coins: 20, reason: "Menyelesaikan Misi Harian" },
        DAILY_MISSION_ALL_CLEAR: { xp: 80, coins: 40, reason: "Semua Misi Harian Selesai! (All-Clear)" },
        WEEKLY_MISSION_SINGLE: { xp: 120, coins: 60, reason: "Menyelesaikan Misi Mingguan" },
        WEEKLY_MISSION_ALL_CLEAR: { xp: 250, coins: 120, reason: "Semua Misi Mingguan Selesai! (Grand Clear)" },
        STREAK_MILESTONE_7D: { xp: 100, coins: 50, reason: "Bonus Streak 7 Hari Berturut-turut! 🔥" },
        STREAK_MILESTONE_30D: { xp: 500, coins: 250, reason: "Bonus Streak 30 Hari Legendaris! 🌟" }
    });

    const MASTERY_LEVELS = Object.freeze({
        NOT_STARTED: { key: "NOT_STARTED", label: "Belum Dimulai", color: "var(--text-muted, #8b949e)", icon: "fa-circle-notch", percent: 0 },
        LEARNING: { key: "LEARNING", label: "Sedang Dipelajari", color: "var(--blue, #3b82f6)", icon: "fa-book-open", percent: 35 },
        PRACTICING: { key: "PRACTICING", label: "Dalam Latihan", color: "var(--orange, #f59e0b)", icon: "fa-flask", percent: 70 },
        MASTERED: { key: "MASTERED", label: "Telah Dikuasai", color: "var(--green, #10b981)", icon: "fa-circle-check", percent: 100 }
    });

    const DEFAULT_AVATARS = [
        { avatar: "👨‍💻", name: "Junior Dev", cost: 0, unlockLevel: 1 },
        { avatar: "🧙‍♂️", name: "Code Wizard", cost: 100, unlockLevel: 2 },
        { avatar: "🐱‍💻", name: "Ninja Hacker", cost: 250, unlockLevel: 3 },
        { avatar: "⚡", name: "Speed Coder", cost: 350, unlockLevel: 4 },
        { avatar: "🤖", name: "AI Android", cost: 500, unlockLevel: 5 },
        { avatar: "🛡️", name: "Security Guard", cost: 400, unlockLevel: 6 },
        { avatar: "🚀", name: "Rocket Builder", cost: 600, unlockLevel: 7 },
        { avatar: "👑", name: "Tech Emperor", cost: 1000, unlockLevel: 7 },
        { avatar: "🎨", name: "Design Magician", cost: 300, unlockLevel: 2 }
    ];

    const LEVEL_UNLOCKS = [
        { level: 1, title: "Script Kiddie", reward: "Avatar Junior Dev 👨‍💻", challenge: "Dasar Logika Komputasi" },
        { level: 2, title: "Syntax Squire", reward: "Avatar Code Wizard 🧙‍♂️ & Design Magician 🎨", challenge: "Speed Coder Arena" },
        { level: 3, title: "Logic Knight", reward: "Avatar Ninja Hacker 🐱‍💻", challenge: "Web Security Defense Lab" },
        { level: 4, title: "DOM Conqueror", reward: "Avatar Speed Coder ⚡", challenge: "Interactive Portfolio Project" },
        { level: 5, title: "Query Warlord", reward: "Avatar AI Android 🤖 & Lencana Warlord", challenge: "SQL Injection Defense Simulator" },
        { level: 6, title: "DevOps Architect", reward: "Avatar Security Guard 🛡️", challenge: "Cloud Infrastructure Architecture Lab" },
        { level: 7, title: "AI Archmage", reward: "Avatar Tech Emperor 👑 & Rocket Builder 🚀", challenge: "Neural Prompting Mastery Sandbox" }
    ];

    const ACHIEVEMENTS_CATALOG = [
        {
            id: "first_step",
            title: "First Step Coder",
            desc: "Selesaikan pendaftaran atau checklist profil pertamamu.",
            icon: "🚀",
            xp: 50,
            coins: 25,
            category: "basics",
            quote: '"Langkah pertama adalah langkah terpenting dalam perjalanan seribu mil." - Lao Tzu'
        },
        {
            id: "drill_champion",
            title: "Drill Champion",
            desc: "Selesaikan kuis Arena harian pertama.",
            icon: "⚔️",
            xp: 80,
            coins: 40,
            category: "challenges",
            quote: '"Repetisi adalah ibu dari segala keahlian." - Pepatah Kuno'
        },
        {
            id: "sandbox_hacker",
            title: "Sandbox Hacker",
            desc: "Jalankan atau visualisasikan kode Javascript di Sandbox.",
            icon: "💻",
            xp: 100,
            coins: 50,
            category: "sandbox",
            quote: '"Kode adalah puisi yang tertulis dalam angka dan instruksi."'
        },
        {
            id: "sql_master",
            title: "SQL Warlord",
            desc: "Jalankan kueri SQL tingkat lanjut di Sandbox.",
            icon: "🗄️",
            xp: 120,
            coins: 60,
            category: "sandbox",
            quote: '"Data yang terstruktur adalah fondasi dari keputusan yang bijak."'
        },
        {
            id: "security_expert",
            title: "Security Guardian",
            desc: "Pahami pertahanan dari serangan siber & XSS.",
            icon: "🛡️",
            xp: 150,
            coins: 75,
            category: "security",
            quote: '"Keamanan bukanlah produk, melainkan sebuah proses yang disiplin."'
        },
        {
            id: "cloud_architect",
            title: "Cloud Architect",
            desc: "Pelajari materi Cloud Computing & arsitektur sistem.",
            icon: "☁️",
            xp: 150,
            coins: 75,
            category: "cloud",
            quote: '"Membangun di atas awan, berpijak pada fondasi kokoh."'
        },
        {
            id: "ai_whisperer",
            title: "AI Whisperer",
            desc: "Eksplorasi modul AI Prompting dan Machine Learning.",
            icon: "🤖",
            xp: 200,
            coins: 100,
            category: "ai",
            quote: '"Masa depan adalah milik mereka yang belajar bekerja berdampingan dengan AI."'
        },
        {
            id: "level_legend",
            title: "Grandmaster Technologist",
            desc: "Raih level 5 atau buka 5 lencana pencapaian.",
            icon: "👑",
            xp: 250,
            coins: 125,
            category: "mastery",
            quote: '"Legenda tidak dilahirkan dalam semalam, melainkan ditempa lewat ribuan baris kode."'
        },
        {
            id: "pro_badge",
            title: "PRO Technologist",
            desc: "Aktifkan status Universe Of Tech PRO.",
            icon: "💎",
            xp: 200,
            coins: 100,
            category: "special",
            quote: '"Investasi terbaik adalah investasi pada peningkatan kapasitas diri sendiri."'
        },
        {
            id: "sqli_hacker",
            title: "Cyber Defense Master",
            desc: "Selesaikan tantangan simulasi keamanan SQL Injection.",
            icon: "🔐",
            xp: 150,
            coins: 75,
            category: "security",
            quote: '"Ketahui bagaimana sistem dibobol untuk mengetahui cara melindunginya."'
        },
        {
            id: "culture_explorer",
            title: "Culture Explorer",
            desc: "Jelajahi minimal 5 destinasi budaya di Wonderful Nusantara.",
            icon: "🏛️",
            xp: 100,
            coins: 50,
            category: "culture",
            quote: '"Mengenal akar tradisi memperkaya wawasan teknologi."'
        },
        {
            id: "polyglot_scout",
            title: "Nusantara Polyglot",
            desc: "Kuasai kosakata dasar dari 3 bahasa daerah Nusantara.",
            icon: "🗣️",
            xp: 150,
            coins: 75,
            category: "culture",
            quote: '"Bahasa adalah cermin identitas bangsa."'
        },
        {
            id: "snbt_warrior",
            title: "SNBT Conqueror",
            desc: "Selesaikan diagnosis atau tryout persiapan SNBT & TKA.",
            icon: "🎯",
            xp: 200,
            coins: 100,
            category: "exam",
            quote: '"Persiapan matang mengalahkan keraguan."'
        },
        {
            id: "project_master",
            title: "Portfolio Architect",
            desc: "Selesaikan proyek portofolio interaktif pertamamu.",
            icon: "🎨",
            xp: 200,
            coins: 100,
            category: "projects",
            quote: '"Karya nyata adalah pembuktian terbaik dari kemampuan teknismu."'
        },
        {
            id: "streak_master",
            title: "Consistent Coder",
            desc: "Pertahankan 7 hari streak belajar aktif.",
            icon: "🔥",
            xp: 150,
            coins: 75,
            category: "habits",
            quote: '"Konsistensi kecil setiap hari menghasilkan lompatan besar di masa depan."'
        }
    ];

    function safeStorage(customStorage) {
        if (customStorage) return customStorage;
        if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
        return {
            _data: {},
            getItem(k) { return Object.prototype.hasOwnProperty.call(this._data, k) ? this._data[k] : null; },
            setItem(k, v) { this._data[k] = String(v); },
            removeItem(k) { delete this._data[k]; },
            clear() { this._data = {}; }
        };
    }

    function safeParseJSON(str, fallback) {
        if (!str || typeof str !== "string") return fallback;
        try {
            const parsed = JSON.parse(str);
            return (parsed && typeof parsed === "object") ? parsed : fallback;
        } catch {
            return fallback;
        }
    }

    function getLocalDateString(dateInput = new Date()) {
        if (typeof dateInput === "string") {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) return dateInput.trim();
            const parsed = new Date(dateInput);
            if (!isNaN(parsed.getTime())) dateInput = parsed;
            else dateInput = new Date();
        }
        const d = (dateInput instanceof Date && !isNaN(dateInput)) ? dateInput : new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getLocalWeekString(dateInput = new Date()) {
        if (typeof dateInput === "string") {
            const parsed = new Date(dateInput);
            if (!isNaN(parsed.getTime())) dateInput = parsed;
            else dateInput = new Date();
        }
        const d = (dateInput instanceof Date && !isNaN(dateInput)) ? dateInput : new Date();
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return `${date.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
    }

    function diffDays(dateStr1, dateStr2) {
        if (!dateStr1 || !dateStr2) return null;
        try {
            const [y1, m1, d1] = dateStr1.split("-").map(Number);
            const [y2, m2, d2] = dateStr2.split("-").map(Number);
            const utc1 = Date.UTC(y1, m1 - 1, d1);
            const utc2 = Date.UTC(y2, m2 - 1, d2);
            return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
        } catch {
            return null;
        }
    }

    function getLevelTitle(level) {
        const titles = {
            1: "Script Kiddie",
            2: "Syntax Squire",
            3: "Logic Knight",
            4: "DOM Conqueror",
            5: "Query Warlord",
            6: "DevOps Architect",
            7: "AI Archmage"
        };
        return titles[level] || "Tech Legend";
    }

    function calculateLevelMetrics(lifetimeXp) {
        const validXp = Math.max(0, Number.isFinite(Number(lifetimeXp)) ? Number(lifetimeXp) : 0);
        let level = 1;
        let accumulated = 0;

        while (true) {
            const neededForNext = level * 100;
            if (accumulated + neededForNext > validXp) {
                const currentLevelXp = validXp - accumulated;
                const percentage = Math.min(100, Math.max(0, Math.round((currentLevelXp / neededForNext) * 100)));
                const remaining = Math.max(0, neededForNext - currentLevelXp);
                return {
                    level,
                    lifetimeXp: validXp,
                    currentLevelXp,
                    xpNeededForNext: neededForNext,
                    xpRemainingForNext: remaining,
                    percentage,
                    title: getLevelTitle(level)
                };
            }
            accumulated += neededForNext;
            level++;
        }
    }

    function createDefaultDailyMissions(dateKey = getLocalDateString()) {
        return {
            dateKey,
            allClaimed: false,
            missions: {
                daily_read_lesson: {
                    id: "daily_read_lesson",
                    type: "read_lesson",
                    title: "Membaca 1 Bab Materi",
                    desc: "Pelajari minimal 1 modul atau topik pembelajaran baru hari ini.",
                    target: 1,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: REWARDS_CONFIG.DAILY_MISSION_SINGLE.xp,
                    coins: REWARDS_CONFIG.DAILY_MISSION_SINGLE.coins,
                    icon: "📖",
                    actionUrl: "materi-basic.html"
                },
                daily_answer_quiz: {
                    id: "daily_answer_quiz",
                    type: "answer_quiz",
                    title: "Jawab 5 Soal Kuis Latihan",
                    desc: "Uji ingatan dan pemahaman melalui latihan soal interaktif.",
                    target: 5,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: 50,
                    coins: 25,
                    icon: "⚡",
                    actionUrl: "quiz.html"
                },
                daily_practice_code: {
                    id: "daily_practice_code",
                    type: "practice",
                    title: "Latihan Praktik / Bahasa",
                    desc: "Eksperimen kode di Sandbox atau selesaikan 1 sesi flashcard bahasa daerah.",
                    target: 1,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: 45,
                    coins: 20,
                    icon: "💻",
                    actionUrl: "latihan-bahasa.html"
                },
                daily_advance_project: {
                    id: "daily_advance_project",
                    type: "project_or_exam",
                    title: "Langkah Proyek / Simulasi SNBT",
                    desc: "Kerjakan portofolio karya nyata atau evaluasi diagnostik SNBT.",
                    target: 1,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: 60,
                    coins: 30,
                    icon: "🎯",
                    actionUrl: "projects.html"
                }
            }
        };
    }

    function createDefaultWeeklyMissions(weekKey = getLocalWeekString()) {
        return {
            weekKey,
            allClaimed: false,
            missions: {
                weekly_complete_chapter: {
                    id: "weekly_complete_chapter",
                    type: "read_lesson",
                    title: "Selesaikan 3 Bab Materi Penuh",
                    desc: "Selesaikan pembelajaran mendalam di salah satu jalur karir.",
                    target: 3,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: 150,
                    coins: 75,
                    icon: "📚",
                    actionUrl: "materi.html"
                },
                weekly_quiz_master: {
                    id: "weekly_quiz_master",
                    type: "answer_quiz",
                    title: "Kuasai 15 Soal Latihan & Evaluasi",
                    desc: "Jawab 15 soal kuis dengan akurasi tinggi sepanjang minggu ini.",
                    target: 15,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: 180,
                    coins: 90,
                    icon: "🏆",
                    actionUrl: "quiz.html"
                },
                weekly_finish_project: {
                    id: "weekly_finish_project",
                    type: "project_or_exam",
                    title: "Selesaikan 1 Proyek / Tryout Lengkap",
                    desc: "Tuntaskan 1 proyek portofolio siap pamer atau tryout SNBT.",
                    target: 1,
                    progress: 0,
                    completed: false,
                    claimed: false,
                    xp: 250,
                    coins: 120,
                    icon: "🚀",
                    actionUrl: "projects.html"
                }
            }
        };
    }

    function createDefaultState(lifetimeXp = 0, initialCoins = 0) {
        const metrics = calculateLevelMetrics(lifetimeXp);
        const todayStr = getLocalDateString();
        const weekStr = getLocalWeekString();

        return {
            schemaVersion: SCHEMA_VERSION,
            lifetimeXp: metrics.lifetimeXp,
            currentLevelXp: metrics.currentLevelXp,
            level: metrics.level,
            coins: Math.max(0, Number(initialCoins) || 0),
            streak: 0,
            lastActiveDate: null,
            streakHistory: [],
            streakFreeze: 1, // 1 free protection shield
            achievements: [],
            inventory: ["👨‍💻"],
            equippedItems: { avatar: "👨‍💻" },
            dailyMissions: createDefaultDailyMissions(todayStr),
            weeklyMissions: createDefaultWeeklyMissions(weekStr),
            masteryOverrides: {},
            completedRewards: {},
            rewardHistory: [],
            updatedAt: new Date().toISOString()
        };
    }

    class ProgressionEngine {
        constructor(customStorage = null) {
            this.storage = safeStorage(customStorage);
            this.state = this.loadAndMigrate();
        }

        loadAndMigrate() {
            const raw = this.storage.getItem(CANONICAL_STORAGE_KEY);
            let state = safeParseJSON(raw, null);

            if (state && typeof state === "object") {
                // Ensure state integrity & upgrade schema
                state.schemaVersion = SCHEMA_VERSION;
                state.lifetimeXp = Math.max(0, Number.isFinite(Number(state.lifetimeXp)) ? Number(state.lifetimeXp) : 0);
                state.coins = Math.max(0, Number.isFinite(Number(state.coins)) ? Number(state.coins) : 0);
                state.streak = Math.max(0, Number.isFinite(Number(state.streak)) ? Number(state.streak) : 0);
                state.lastActiveDate = state.lastActiveDate || null;
                state.streakHistory = Array.isArray(state.streakHistory) ? [...new Set(state.streakHistory)] : [];
                state.streakFreeze = Number.isFinite(Number(state.streakFreeze)) ? Number(state.streakFreeze) : 1;
                state.achievements = Array.isArray(state.achievements) ? [...new Set(state.achievements)] : [];
                state.inventory = Array.isArray(state.inventory) && state.inventory.length ? [...new Set(state.inventory)] : ["👨‍💻"];
                state.equippedItems = (state.equippedItems && typeof state.equippedItems === "object") ? state.equippedItems : { avatar: "👨‍💻" };
                if (!state.equippedItems.avatar) state.equippedItems.avatar = state.inventory[0] || "👨‍💻";
                state.completedRewards = (state.completedRewards && typeof state.completedRewards === "object") ? state.completedRewards : {};
                state.rewardHistory = Array.isArray(state.rewardHistory) ? state.rewardHistory : [];
                state.masteryOverrides = (state.masteryOverrides && typeof state.masteryOverrides === "object") ? state.masteryOverrides : {};

                // Daily & Weekly Missions refresh check
                const todayStr = getLocalDateString();
                const weekStr = getLocalWeekString();

                if (!state.dailyMissions || state.dailyMissions.dateKey !== todayStr) {
                    state.dailyMissions = createDefaultDailyMissions(todayStr);
                }
                if (!state.weeklyMissions || state.weeklyMissions.weekKey !== weekStr) {
                    state.weeklyMissions = createDefaultWeeklyMissions(weekStr);
                }

                const metrics = calculateLevelMetrics(state.lifetimeXp);
                state.level = metrics.level;
                state.currentLevelXp = metrics.currentLevelXp;
                
                // Explicitly mark as migrated so we never write to legacy keys
                state.migrated_legacy = true;
                return state;
            }

            // Perform Full Legacy Migration
            const legacyRpg = safeParseJSON(this.storage.getItem(LEGACY_RPG_KEY), {});
            const legacyXp = Number(this.storage.getItem(LEGACY_XP_KEY) || 0);
            const legacyLms = safeParseJSON(this.storage.getItem(LEGACY_LMS_KEY), {});
            const legacyCulture = safeParseJSON(this.storage.getItem(LEGACY_CULTURE_KEY), {});
            const legacyProjects = safeParseJSON(this.storage.getItem(LEGACY_PROJECTS_KEY), {});

            const legacyStreak = Math.max(
                Number(this.storage.getItem(LEGACY_STREAK_KEY) || 0),
                Number(legacyRpg.streak || 0),
                Number(legacyCulture.streak || 0),
                Number(legacyLms.streak || 0)
            );

            const rpgTotal = Math.max(Number(legacyRpg.totalXp || 0), Number(legacyRpg.xp || 0));
            const lmsTotal = Number(legacyLms.xp || 0);
            const cultureTotal = (((legacyCulture.explored || []).length * 10) +
                ((legacyCulture.mastered || []).length * 20) +
                ((legacyCulture.quizDone || 0) * 15) +
                ((legacyCulture.voiceSuccessCount || 0) * 25) +
                Number(legacyCulture.bonusXP || 0));
            
            const projectsList = legacyProjects.projects && typeof legacyProjects.projects === "object" ? Object.values(legacyProjects.projects) : [];
            const projectsTotal = projectsList.filter(p => p?.status === "completed").length * 100;

            const combinedXp = Math.max(rpgTotal, legacyXp, lmsTotal, cultureTotal, projectsTotal, 0);
            const startingCoins = Math.max(Number(legacyRpg.coins || 0), Math.floor(combinedXp / 2), 50);

            const mergedAchievements = new Set([
                ...(Array.isArray(legacyRpg.achievements) ? legacyRpg.achievements : []),
                ...(Array.isArray(legacyLms.unlockedBadges) ? legacyLms.unlockedBadges : [])
            ]);

            const mergedInventory = new Set([
                "👨‍💻",
                ...(Array.isArray(legacyRpg.unlockedAvatars) ? legacyRpg.unlockedAvatars : [])
            ]);
            const activeAvatar = legacyRpg.activeAvatar || "👨‍💻";
            mergedInventory.add(activeAvatar);

            const completedRewards = {};
            mergedAchievements.forEach(achId => {
                completedRewards[`achievement:${achId}`] = { timestamp: new Date().toISOString(), migrated: true };
            });

            if (legacyProjects.projects && typeof legacyProjects.projects === "object") {
                Object.entries(legacyProjects.projects).forEach(([pId, record]) => {
                    if (record?.status === "completed") {
                        completedRewards[`project:${pId}`] = { timestamp: record.completedAt || new Date().toISOString(), migrated: true };
                    }
                });
            }

            const todayStr = getLocalDateString();
            const weekStr = getLocalWeekString();

            const migratedState = {
                schemaVersion: SCHEMA_VERSION,
                lifetimeXp: combinedXp,
                currentLevelXp: calculateLevelMetrics(combinedXp).currentLevelXp,
                level: calculateLevelMetrics(combinedXp).level,
                coins: startingCoins,
                streak: legacyStreak,
                lastActiveDate: legacyStreak > 0 ? todayStr : null,
                streakHistory: legacyStreak > 0 ? [todayStr] : [],
                streakFreeze: 1,
                achievements: Array.from(mergedAchievements),
                inventory: Array.from(mergedInventory),
                equippedItems: { avatar: activeAvatar },
                dailyMissions: createDefaultDailyMissions(todayStr),
                weeklyMissions: createDefaultWeeklyMissions(weekStr),
                masteryOverrides: {},
                completedRewards,
                rewardHistory: [
                    {
                        id: "migrated_initial",
                        type: "migration",
                        amount: combinedXp,
                        reason: "Initial legacy profile migration",
                        timestamp: new Date().toISOString()
                    }
                ],
                updatedAt: new Date().toISOString(),
                migrated_legacy: true
            };

            // Wipe out legacy keys forever to prevent cluttering or multiple sources of truth (excluding active synced keys for backward compatibility)
            const legacyKeys = [
                "quiznationCurrentUser",
                "uot_current_user",
                "eduquestUserSession",
                "eduquestLevel",
                "eduquestSubscription",
                "bahasa_progress",
                "eduquestLmsProgress",
                "eduquestProjectProgress",
                "quiznationLearningJourneyV1",
                "uot_curriculum_progress"
            ];
            legacyKeys.forEach(k => {
                try {
                    this.storage.removeItem(k);
                } catch (_) {}
            });

            this.persist(migratedState);
            return migratedState;
        }

        persist(state = this.state) {
            state.updatedAt = new Date().toISOString();
            const metrics = calculateLevelMetrics(state.lifetimeXp);
            state.level = metrics.level;
            state.currentLevelXp = metrics.currentLevelXp;

            // 1. Write Canonical State
            try {
                this.storage.setItem(CANONICAL_STORAGE_KEY, JSON.stringify(state));
            } catch (err) {
                console.warn("[ProgressionEngine] Failed to write canonical storage:", err);
            }

            // 2. Synchronize Legacy Storage Keys for complete backward compatibility
            try {
                const legacyRpgData = {
                    level: state.level,
                    xp: state.currentLevelXp,
                    totalXp: state.lifetimeXp,
                    coins: state.coins,
                    streak: state.streak,
                    achievements: state.achievements,
                    unlockedAvatars: state.inventory,
                    activeAvatar: state.equippedItems.avatar || "👨‍💻"
                };
                this.storage.setItem(LEGACY_RPG_KEY, JSON.stringify(legacyRpgData));
                this.storage.setItem(LEGACY_XP_KEY, String(state.lifetimeXp));
                this.storage.setItem(LEGACY_STREAK_KEY, String(state.streak));
            } catch (err) {
                console.warn("[ProgressionEngine] Failed to sync legacy keys:", err);
            }

            // 3. Dispatch Global Custom Events in Browser
            if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
                try {
                    window.dispatchEvent(new CustomEvent("uot-progression-updated", { detail: this.getGameState() }));
                } catch (_) {}
            }
        }

        getGameState() {
            // Check daily and weekly missions validity on read
            const todayStr = getLocalDateString();
            const weekStr = getLocalWeekString();
            let changed = false;

            if (!this.state.dailyMissions || this.state.dailyMissions.dateKey !== todayStr) {
                this.state.dailyMissions = createDefaultDailyMissions(todayStr);
                changed = true;
            }
            if (!this.state.weeklyMissions || this.state.weeklyMissions.weekKey !== weekStr) {
                this.state.weeklyMissions = createDefaultWeeklyMissions(weekStr);
                changed = true;
            }
            if (changed) this.persist();

            return JSON.parse(JSON.stringify(this.state));
        }

        getLifetimeXp() { return this.state.lifetimeXp; }
        getCurrentLevelXp() { return this.state.currentLevelXp; }
        getPlayerLevel() { return this.state.level; }
        getCoins() { return this.state.coins; }
        getLevelProgress() { return calculateLevelMetrics(this.state.lifetimeXp); }
        getRewardHistory() { return [...this.state.rewardHistory]; }
        getAchievementsCatalog() { return JSON.parse(JSON.stringify(ACHIEVEMENTS_CATALOG)); }
        getAvatarsCatalog() { return JSON.parse(JSON.stringify(DEFAULT_AVATARS)); }
        getRewardsConfig() { return JSON.parse(JSON.stringify(REWARDS_CONFIG)); }
        getLevelUnlocks() { return JSON.parse(JSON.stringify(LEVEL_UNLOCKS)); }

        // ==========================================
        // 6. STREAK ENGINE (Local Date-Driven)
        // ==========================================
        touchStreak(targetDate = new Date()) {
            const todayStr = getLocalDateString(targetDate);
            const last = this.state.lastActiveDate;

            if (last === todayStr) {
                if (!this.state.streakHistory.includes(todayStr)) {
                    this.state.streakHistory.push(todayStr);
                    this.persist();
                }
                return {
                    activeToday: true,
                    streak: this.state.streak,
                    incremented: false,
                    streakHistory: [...this.state.streakHistory],
                    message: "Sudah aktif belajar hari ini! 🔥"
                };
            }

            if (!last) {
                // First activity ever
                this.state.streak = 1;
                this.state.lastActiveDate = todayStr;
                this.state.streakHistory = [todayStr];
                this.persist();
                return {
                    activeToday: true,
                    streak: 1,
                    firstDay: true,
                    incremented: true,
                    streakHistory: [...this.state.streakHistory],
                    message: "Streak hari ke-1 dimulai! 🔥"
                };
            }

            const diff = diffDays(last, todayStr);

            if (diff === 1) {
                // Consecutive active day!
                this.state.streak += 1;
                this.state.lastActiveDate = todayStr;
                this.state.streakHistory.push(todayStr);
                if (this.state.streakHistory.length > 30) {
                    this.state.streakHistory = this.state.streakHistory.slice(-30);
                }

                // Check 7-day streak achievement
                if (this.state.streak >= 7 && !this.state.achievements.includes("streak_master")) {
                    this.unlockAchievement("streak_master");
                }
                if (this.state.streak === 7) {
                    this.awardFromConfig("STREAK_MILESTONE_7D", 1, `streak:7d:${todayStr}`);
                } else if (this.state.streak === 30) {
                    this.awardFromConfig("STREAK_MILESTONE_30D", 1, `streak:30d:${todayStr}`);
                }

                this.persist();
                return {
                    activeToday: true,
                    streak: this.state.streak,
                    incremented: true,
                    streakHistory: [...this.state.streakHistory],
                    message: `🔥 Streak naik menjadi ${this.state.streak} hari berturut-turut!`
                };
            } else if (diff > 1) {
                // Missed one or more days
                if (this.state.streakFreeze > 0) {
                    // Protected by streak freeze shield
                    this.state.streakFreeze -= 1;
                    this.state.lastActiveDate = todayStr;
                    this.state.streakHistory.push(todayStr);
                    this.persist();
                    return {
                        activeToday: true,
                        streak: this.state.streak,
                        preservedByFreeze: true,
                        incremented: false,
                        streakHistory: [...this.state.streakHistory],
                        message: `🛡️ Streak ${this.state.streak} hari diselamatkan oleh Shield Freeze!`
                    };
                } else {
                    // Reset streak
                    this.state.streak = 1;
                    this.state.lastActiveDate = todayStr;
                    this.state.streakHistory.push(todayStr);
                    this.persist();
                    return {
                        activeToday: true,
                        streak: 1,
                        reset: true,
                        incremented: false,
                        streakHistory: [...this.state.streakHistory],
                        message: "Streak di-reset. Mari bangun kembali kebiasaan baik hari ini! 💪"
                    };
                }
            } else {
                // Edge case (time traveling backwards or same day)
                return {
                    activeToday: true,
                    streak: this.state.streak,
                    incremented: false,
                    streakHistory: [...this.state.streakHistory]
                };
            }
        }

        getStreakInfo() {
            const todayStr = getLocalDateString();
            const last = this.state.lastActiveDate;
            const diff = last ? diffDays(last, todayStr) : null;
            const isActiveToday = last === todayStr;

            return {
                streak: this.state.streak,
                isActiveToday,
                lastActiveDate: this.state.lastActiveDate,
                streakHistory: [...this.state.streakHistory],
                streakFreeze: this.state.streakFreeze,
                statusText: isActiveToday ? "Aktif hari ini" : (diff === 1 ? "Lanjutkan streak hari ini!" : "Mulai streak baru hari ini")
            };
        }

        // ==========================================
        // 2 & 3. DAILY & WEEKLY MISSIONS ENGINE
        // ==========================================
        updateMissionsProgress(activityType, count = 1) {
            const numCount = Math.max(1, Number(count) || 1);
            const todayStr = getLocalDateString();
            const weekStr = getLocalWeekString();

            if (!this.state.dailyMissions || this.state.dailyMissions.dateKey !== todayStr) {
                this.state.dailyMissions = createDefaultDailyMissions(todayStr);
            }
            if (!this.state.weeklyMissions || this.state.weeklyMissions.weekKey !== weekStr) {
                this.state.weeklyMissions = createDefaultWeeklyMissions(weekStr);
            }

            const updatedDaily = [];
            const updatedWeekly = [];

            // Update Daily Missions
            Object.values(this.state.dailyMissions.missions).forEach(mission => {
                if (mission.type === activityType && !mission.completed) {
                    mission.progress = Math.min(mission.target, mission.progress + numCount);
                    if (mission.progress >= mission.target) {
                        mission.completed = true;
                        updatedDaily.push(mission);
                    }
                }
            });

            // Update Weekly Missions
            Object.values(this.state.weeklyMissions.missions).forEach(mission => {
                if (mission.type === activityType && !mission.completed) {
                    mission.progress = Math.min(mission.target, mission.progress + numCount);
                    if (mission.progress >= mission.target) {
                        mission.completed = true;
                        updatedWeekly.push(mission);
                    }
                }
            });

            this.persist();
            return { updatedDaily, updatedWeekly };
        }

        claimDailyMission(missionId) {
            const todayStr = getLocalDateString();
            if (!this.state.dailyMissions || this.state.dailyMissions.dateKey !== todayStr) {
                this.state.dailyMissions = createDefaultDailyMissions(todayStr);
            }

            const mission = this.state.dailyMissions.missions[missionId];
            if (!mission) return { claimed: false, error: "MISSION_NOT_FOUND" };
            if (!mission.completed) return { claimed: false, error: "MISSION_NOT_COMPLETED" };
            if (mission.claimed) return { claimed: false, error: "ALREADY_CLAIMED" };

            mission.claimed = true;
            const rewardKey = `mission:daily:${todayStr}:${missionId}`;
            this.awardXp(mission.xp, `Misi Harian: ${mission.title}`, rewardKey);
            this.awardCoins(mission.coins, `Misi Harian: ${mission.title}`, `${rewardKey}:coins`);

            // Check if all daily missions are claimed -> grant All-Clear bonus
            const allMissions = Object.values(this.state.dailyMissions.missions);
            const allCompleted = allMissions.every(m => m.completed);
            let allClearAwarded = false;

            if (allCompleted && !this.state.dailyMissions.allClaimed) {
                const allClaimedNow = allMissions.every(m => m.claimed);
                if (allClaimedNow) {
                    this.state.dailyMissions.allClaimed = true;
                    this.awardFromConfig("DAILY_MISSION_ALL_CLEAR", 1, `mission:daily:allclear:${todayStr}`);
                    allClearAwarded = true;
                }
            }

            this.persist();

            return {
                claimed: true,
                mission,
                xpAwarded: mission.xp,
                coinsAwarded: mission.coins,
                allClearAwarded
            };
        }

        claimWeeklyMission(missionId) {
            const weekStr = getLocalWeekString();
            if (!this.state.weeklyMissions || this.state.weeklyMissions.weekKey !== weekStr) {
                this.state.weeklyMissions = createDefaultWeeklyMissions(weekStr);
            }

            const mission = this.state.weeklyMissions.missions[missionId];
            if (!mission) return { claimed: false, error: "MISSION_NOT_FOUND" };
            if (!mission.completed) return { claimed: false, error: "MISSION_NOT_COMPLETED" };
            if (mission.claimed) return { claimed: false, error: "ALREADY_CLAIMED" };

            mission.claimed = true;
            const rewardKey = `mission:weekly:${weekStr}:${missionId}`;
            this.awardXp(mission.xp, `Misi Mingguan: ${mission.title}`, rewardKey);
            this.awardCoins(mission.coins, `Misi Mingguan: ${mission.title}`, `${rewardKey}:coins`);

            const allMissions = Object.values(this.state.weeklyMissions.missions);
            const allCompleted = allMissions.every(m => m.completed);
            let allClearAwarded = false;

            if (allCompleted && !this.state.weeklyMissions.allClaimed) {
                const allClaimedNow = allMissions.every(m => m.claimed);
                if (allClaimedNow) {
                    this.state.weeklyMissions.allClaimed = true;
                    this.awardFromConfig("WEEKLY_MISSION_ALL_CLEAR", 1, `mission:weekly:allclear:${weekStr}`);
                    allClearAwarded = true;
                }
            }

            this.persist();

            return {
                claimed: true,
                mission,
                xpAwarded: mission.xp,
                coinsAwarded: mission.coins,
                allClearAwarded
            };
        }

        // ==========================================
        // 4. LEARNING MASTERY SYSTEM
        // ==========================================
        getMasterySummary() {
            // Read real progress from curriculum, LMS, projects, culture, SNBT
            const curriculumProgress = safeParseJSON(this.storage.getItem(LEGACY_CURRICULUM_KEY), {});
            const lmsProgress = safeParseJSON(this.storage.getItem(LEGACY_LMS_KEY), {});
            const cultureProgress = safeParseJSON(this.storage.getItem(LEGACY_CULTURE_KEY), {});
            const projectsProgress = safeParseJSON(this.storage.getItem(LEGACY_PROJECTS_KEY), {});
            const journeyProgress = safeParseJSON(this.storage.getItem(LEGACY_JOURNEY_KEY), {});

            const completedLessons = Array.isArray(curriculumProgress.completedLessons) ? curriculumProgress.completedLessons : [];
            const quizScores = lmsProgress.progress?.quizScores || {};
            const completedProjects = Object.values(projectsProgress.projects || {}).filter(p => p?.status === "completed").length;
            const cultureExplored = (cultureProgress.explored || []).length;
            const cultureQuiz = cultureProgress.quizDone || 0;

            const skills = [
                {
                    id: "web-dev",
                    title: "Web & Frontend Development",
                    icon: "fa-laptop-code",
                    category: "Tech",
                    lessonsCount: completedLessons.filter(id => id.startsWith("web") || id.startsWith("html") || id.startsWith("css")).length,
                    quizPassed: Object.entries(quizScores).some(([k, v]) => k.includes("web") && v >= 80),
                    projectDone: completedProjects >= 1
                },
                {
                    id: "database-sql",
                    title: "Database Relasional & SQL",
                    icon: "fa-database",
                    category: "Tech",
                    lessonsCount: completedLessons.filter(id => id.startsWith("database") || id.startsWith("sql")).length,
                    quizPassed: Object.entries(quizScores).some(([k, v]) => k.includes("database") && v >= 80),
                    projectDone: false
                },
                {
                    id: "cyber-security",
                    title: "Keamanan Sistem & Defense",
                    icon: "fa-shield-halved",
                    category: "Tech",
                    lessonsCount: completedLessons.filter(id => id.startsWith("cyber") || id.startsWith("sec")).length,
                    quizPassed: Object.entries(quizScores).some(([k, v]) => k.includes("cyber") && v >= 80),
                    projectDone: this.state.achievements.includes("security_expert")
                },
                {
                    id: "cloud-ai",
                    title: "Cloud Computing & AI Logic",
                    icon: "fa-brain",
                    category: "Tech",
                    lessonsCount: completedLessons.filter(id => id.startsWith("cloud") || id.startsWith("ai")).length,
                    quizPassed: Object.entries(quizScores).some(([k, v]) => (k.includes("cloud") || k.includes("ai")) && v >= 80),
                    projectDone: this.state.achievements.includes("ai_whisperer")
                },
                {
                    id: "snbt-tka",
                    title: "Penalaran & Persiapan SNBT",
                    icon: "fa-graduation-cap",
                    category: "Exam",
                    lessonsCount: journeyProgress.completedSteps?.filter(s => String(s).includes("snbt")).length || 0,
                    quizPassed: Number(this.storage.getItem("tka_diagnostic_result") || 0) > 600,
                    projectDone: Boolean(this.storage.getItem("tka_syllabus_progress"))
                },
                {
                    id: "culture-nusantara",
                    title: "Bahasa & Budaya Nusantara",
                    icon: "fa-map-location-dot",
                    category: "Culture",
                    lessonsCount: cultureExplored,
                    quizPassed: cultureQuiz >= 3,
                    projectDone: (cultureProgress.mastered || []).length >= 2
                }
            ];

            const mappedSkills = skills.map(skill => {
                let status = MASTERY_LEVELS.NOT_STARTED;
                if (skill.quizPassed || skill.projectDone) {
                    status = MASTERY_LEVELS.MASTERED;
                } else if (skill.lessonsCount >= 3 || skill.quizPassed) {
                    status = MASTERY_LEVELS.PRACTICING;
                } else if (skill.lessonsCount >= 1) {
                    status = MASTERY_LEVELS.LEARNING;
                }

                return {
                    id: skill.id,
                    title: skill.title,
                    icon: skill.icon,
                    category: skill.category,
                    mastery: status.key,
                    label: status.label,
                    color: status.color,
                    percent: status.percent
                };
            });

            const masteredCount = mappedSkills.filter(s => s.mastery === "MASTERED").length;
            const learningCount = mappedSkills.filter(s => s.mastery === "LEARNING").length;
            const practicingCount = mappedSkills.filter(s => s.mastery === "PRACTICING").length;
            const notStartedCount = mappedSkills.filter(s => s.mastery === "NOT_STARTED").length;

            return {
                skills: mappedSkills,
                totalSkills: mappedSkills.length,
                totalLessons: completedLessons.length,
                mastered: masteredCount,
                learning: learningCount,
                practicing: practicingCount,
                notStarted: notStartedCount,
                masteryPercentage: mappedSkills.length ? Math.round((masteredCount / mappedSkills.length) * 100) : 0
            };
        }

        // ==========================================
        // 1 & 9. NEXT OBJECTIVE SYSTEM (Real Progress Driven)
        // ==========================================
        getNextObjective() {
            const curriculumProgress = safeParseJSON(this.storage.getItem(LEGACY_CURRICULUM_KEY), {});
            const completedLessons = Array.isArray(curriculumProgress.completedLessons) ? curriculumProgress.completedLessons : [];
            const lmsProgress = safeParseJSON(this.storage.getItem(LEGACY_LMS_KEY), {});
            const quizScores = lmsProgress.progress?.quizScores || {};
            const projectsProgress = safeParseJSON(this.storage.getItem(LEGACY_PROJECTS_KEY), {});
            const projects = projectsProgress.projects || {};
            const cultureProgress = safeParseJSON(this.storage.getItem(LEGACY_CULTURE_KEY), {});

            // 1. Check if user hasn't completed basic web development lesson
            if (!completedLessons.includes("web-html-semantik") && !completedLessons.includes("web_ch1")) {
                return {
                    id: "obj_html_basics",
                    stage: "LEARN",
                    type: "materi",
                    title: "Pelajari Fondasi HTML5 & Struktur Semantik",
                    category: "Web & Frontend",
                    description: "Pahami hierarki dokumen web, elemen ramah aksesibilitas, dan SEO dasar.",
                    actionUrl: "materi-basic.html?topik=web",
                    ctaText: "Mulai Bab Ini",
                    icon: "fa-laptop-code",
                    badge: "Bab 1 Dasar",
                    xpReward: REWARDS_CONFIG.READ_LESSON_STEP.xp,
                    coinsReward: REWARDS_CONFIG.READ_LESSON_STEP.coins,
                    progress: { current: 0, total: 4, percent: 0 }
                };
            }

            // 2. Check CSS Flexbox & Layout
            if (!completedLessons.includes("web-css-flexbox") && !completedLessons.includes("web_ch2")) {
                return {
                    id: "obj_css_flexbox",
                    stage: "LEARN",
                    type: "materi",
                    title: "Kuasai Flexbox & CSS Grid Modern",
                    category: "Web & Frontend",
                    description: "Bangun tata letak responsif yang rapi dan nyaman di semua ukuran layar.",
                    actionUrl: "materi-basic.html?topik=web",
                    ctaText: "Lanjut Belajar",
                    icon: "fa-layer-group",
                    badge: "Bab 2 Layout",
                    xpReward: REWARDS_CONFIG.READ_LESSON_STEP.xp,
                    coinsReward: REWARDS_CONFIG.READ_LESSON_STEP.coins,
                    progress: { current: 1, total: 4, percent: 25 }
                };
            }

            // 3. Check JavaScript DOM Practice / Quiz
            if (!quizScores["web-dev_quiz"] && !quizScores["web-basic_quiz"]) {
                return {
                    id: "obj_quiz_frontend",
                    stage: "PRACTICE",
                    type: "quiz",
                    title: "Uji Pemahaman Frontend di Kuis Interaktif",
                    category: "Evaluasi Kuis",
                    description: "Selesaikan 10 soal adaptif untuk mengukur pemahaman HTML, CSS, dan DOM.",
                    actionUrl: "quiz.html",
                    ctaText: "Mulai Kuis",
                    icon: "fa-circle-question",
                    badge: "Target Akurasi 80%",
                    xpReward: REWARDS_CONFIG.QUIZ_PASSED.xp,
                    coinsReward: REWARDS_CONFIG.QUIZ_PASSED.coins,
                    progress: { current: 2, total: 4, percent: 50 }
                };
            }

            // 4. Check First Portfolio Project
            const firstProject = projects["html-basics"] || projects["portfolio-dashboard"];
            if (!firstProject || firstProject.status !== "completed") {
                return {
                    id: "obj_portfolio_project",
                    stage: "PROJECT",
                    type: "project",
                    title: "Bangun Proyek Portofolio Web Pertama",
                    category: "Proyek Nyata",
                    description: "Satukan semua konsep web menjadi dashboard portofolio interaktif siap pamer.",
                    actionUrl: "projects.html",
                    ctaText: "Buka Workspace Proyek",
                    icon: "fa-hammer",
                    badge: "Portofolio Utama",
                    xpReward: REWARDS_CONFIG.PROJECT_COMPLETE.xp,
                    coinsReward: REWARDS_CONFIG.PROJECT_COMPLETE.coins,
                    progress: { current: 3, total: 4, percent: 75 }
                };
            }

            // 5. Check Database / SQL Mastery
            if (!quizScores["database-sql_quiz"]) {
                return {
                    id: "obj_sql_mastery",
                    stage: "PRACTICE",
                    type: "practice",
                    title: "Eksplorasi Query Database & Relasi SQL",
                    category: "Database & Backend",
                    description: "Pelajari perintah SELECT, WHERE, JOIN, dan manipulasi data di Sandbox SQL.",
                    actionUrl: "materi-basic.html?topik=database",
                    ctaText: "Pelajari SQL",
                    icon: "fa-database",
                    badge: "Modul SQL",
                    xpReward: REWARDS_CONFIG.READ_LESSON_STEP.xp,
                    coinsReward: REWARDS_CONFIG.READ_LESSON_STEP.coins,
                    progress: { current: 1, total: 3, percent: 33 }
                };
            }

            // 6. Check Nusantara Culture & Language
            if ((cultureProgress.explored || []).length < 3) {
                return {
                    id: "obj_culture_explore",
                    stage: "CHALLENGE",
                    type: "practice",
                    title: "Jelajahi 3 Destinasi Budaya Wonderful Nusantara",
                    category: "Bahasa & Budaya",
                    description: "Pelajari kosa kata daerah dan kekayaan tradisi lokal Nusantara.",
                    actionUrl: "bahasa-daerah.html",
                    ctaText: "Eksplorasi Budaya",
                    icon: "fa-map-location-dot",
                    badge: "Culture Passport",
                    xpReward: REWARDS_CONFIG.CULTURE_EXPLORE_PLACE.xp,
                    coinsReward: REWARDS_CONFIG.CULTURE_EXPLORE_PLACE.coins,
                    progress: { current: (cultureProgress.explored || []).length, total: 3, percent: Math.round(((cultureProgress.explored || []).length / 3) * 100) }
                };
            }

            // 7. Advanced Grandmaster Objective
            return {
                id: "obj_grandmaster",
                stage: "MASTER",
                type: "quiz",
                title: "Tantangan Simulasi SNBT / Cloud Architect",
                category: "Mastery Level",
                description: "Selesaikan evaluasi komprehensif tingkat tinggi untuk memperkuat portofolio.",
                actionUrl: "snbt.html",
                ctaText: "Buka Simulasi",
                icon: "fa-crown",
                badge: "Mastery Grandmaster",
                xpReward: REWARDS_CONFIG.SNBT_TRYOUT_COMPLETE.xp,
                coinsReward: REWARDS_CONFIG.SNBT_TRYOUT_COMPLETE.coins,
                progress: { current: 4, total: 4, percent: 100 }
            };
        }

        // ==========================================
        // 5 & 13. CENTRALIZED ACTIVITY RECORDING
        // ==========================================
        recordActivity(activityType, options = {}) {
            // Touch streak automatically on every real learning activity
            const streakRes = this.touchStreak();

            // Update Daily & Weekly Missions Progress
            const missionCount = Math.max(1, Number(options.count || 1));
            const actStr = String(activityType || "").toLowerCase();
            const missionType = options.missionType || (
                actStr.includes("lesson") || actStr.includes("materi") || actStr.includes("chapter") ? "read_lesson" :
                actStr.includes("quiz") ? "answer_quiz" :
                actStr.includes("project") || actStr.includes("snbt") || actStr.includes("exam") ? "project_or_exam" : "practice"
            );
            const missionRes = this.updateMissionsProgress(missionType, missionCount);

            // Calculate XP & Coins from Centralized Config
            const configKey = options.configKey || (
                missionType === "read_lesson" ? "READ_LESSON_STEP" :
                missionType === "answer_quiz" ? "QUIZ_PASSED" :
                missionType === "project_or_exam" ? "PROJECT_COMPLETE" : "PRACTICE_CHALLENGE"
            );
            const configItem = REWARDS_CONFIG[configKey] || { xp: 15, coins: 8, reason: "Aktivitas Belajar" };
            const multiplier = Math.max(0.5, Number(options.multiplier || 1));

            const xpAmount = Math.max(0, Math.round((options.xp !== undefined ? options.xp : configItem.xp) * multiplier));
            const coinsAmount = Math.max(0, Math.round((options.coins !== undefined ? options.coins : configItem.coins) * multiplier));
            const reason = options.reason || configItem.reason;
            const rewardId = options.rewardId || null;

            let xpRes = { awarded: false };
            if (xpAmount > 0) {
                xpRes = this.awardXp(xpAmount, reason, rewardId);
            }
            if (coinsAmount > 0) {
                this.awardCoins(coinsAmount, reason, rewardId ? `${rewardId}:coins` : null);
            }

            if (options.achievementId) {
                this.unlockAchievement(options.achievementId);
            }

            // Progression Summary Feedback
            const feedback = {
                activityType,
                title: options.title || reason,
                xpAwarded: xpAmount,
                xpEarned: xpAmount,
                coinsAwarded: coinsAmount,
                coinsEarned: coinsAmount,
                levelProgress: this.getLevelProgress(),
                streakStatus: streakRes,
                missionsCompleted: [...missionRes.updatedDaily, ...missionRes.updatedWeekly],
                nextObjective: this.getNextObjective(),
                leveledUp: Boolean(xpRes.leveledUp)
            };

            // Trigger visual feedback modal / toast if in browser
            if (typeof window !== "undefined" && options.showModal !== false && options.showSummary !== false) {
                this.showProgressionFeedback(feedback);
            }

            return feedback;
        }

        awardFromConfig(configKey, multiplier = 1, rewardId = null, extraReason = "") {
            const item = REWARDS_CONFIG[configKey];
            if (!item) return { awarded: false, error: "UNKNOWN_CONFIG_KEY" };
            const xp = Math.round(item.xp * multiplier);
            const coins = Math.round(item.coins * multiplier);
            const reason = extraReason ? `${item.reason} - ${extraReason}` : item.reason;

            const res = this.awardXp(xp, reason, rewardId);
            if (coins > 0) {
                this.awardCoins(coins, reason, rewardId ? `${rewardId}:coins` : null);
            }
            return { ...res, coinsAwarded: coins };
        }

        // ==========================================
        // CORE REWARD METHODS (Idempotent & Non-Decreasing)
        // ==========================================
        awardXp(amount, reason = "Aktivitas Belajar", rewardId = null) {
            const numericAmount = Math.max(0, Math.floor(Number(amount) || 0));
            if (numericAmount <= 0) {
                return {
                    awarded: false,
                    reason: "INVALID_AMOUNT",
                    amount: 0,
                    lifetimeXp: this.state.lifetimeXp,
                    level: this.state.level
                };
            }

            if (rewardId) {
                const normalizedId = String(rewardId).trim();
                if (this.state.completedRewards[normalizedId]) {
                    return {
                        awarded: false,
                        alreadyAwarded: true,
                        rewardId: normalizedId,
                        lifetimeXp: this.state.lifetimeXp,
                        level: this.state.level
                    };
                }
                this.state.completedRewards[normalizedId] = {
                    amount: numericAmount,
                    reason,
                    timestamp: new Date().toISOString()
                };
            }

            const prevLevel = this.state.level;
            this.state.lifetimeXp += numericAmount;

            const bonusCoins = Math.max(1, Math.round(numericAmount / 2));
            this.state.coins += bonusCoins;

            const metrics = calculateLevelMetrics(this.state.lifetimeXp);
            this.state.level = metrics.level;
            this.state.currentLevelXp = metrics.currentLevelXp;

            const historyItem = {
                id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                type: "xp",
                amount: numericAmount,
                bonusCoins,
                reason,
                rewardId: rewardId ? String(rewardId).trim() : null,
                timestamp: new Date().toISOString()
            };

            this.state.rewardHistory.unshift(historyItem);
            if (this.state.rewardHistory.length > 100) {
                this.state.rewardHistory = this.state.rewardHistory.slice(0, 100);
            }

            this.persist();

            const leveledUp = this.state.level > prevLevel;
            if (leveledUp) {
                // 11. Trigger Celebration on Major Milestone ONLY
                this.triggerCelebration("LEVEL_UP");
                if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
                    try {
                        window.dispatchEvent(new CustomEvent("uot-level-up", {
                            detail: { previousLevel: prevLevel, newLevel: this.state.level, title: metrics.title }
                        }));
                    } catch (_) {}
                }
            }

            return {
                awarded: true,
                amount: numericAmount,
                bonusCoins,
                lifetimeXp: this.state.lifetimeXp,
                currentLevelXp: this.state.currentLevelXp,
                level: this.state.level,
                leveledUp,
                previousLevel: prevLevel,
                newLevel: this.state.level,
                title: metrics.title
            };
        }

        awardCoins(amount, reason = "Hadiah Koin", rewardId = null) {
            const numericAmount = Math.max(0, Math.floor(Number(amount) || 0));
            if (numericAmount <= 0) {
                return { awarded: false, reason: "INVALID_AMOUNT", coins: this.state.coins };
            }

            if (rewardId) {
                const normalizedId = String(rewardId).trim();
                if (this.state.completedRewards[normalizedId]) {
                    return { awarded: false, alreadyAwarded: true, rewardId: normalizedId, coins: this.state.coins };
                }
                this.state.completedRewards[normalizedId] = {
                    coins: numericAmount,
                    reason,
                    timestamp: new Date().toISOString()
                };
            }

            this.state.coins += numericAmount;
            this.persist();

            return { awarded: true, amount: numericAmount, coins: this.state.coins };
        }

        spendCoins(amount, itemKey, category = "avatar") {
            const cost = Math.max(0, Math.floor(Number(amount) || 0));
            if (!itemKey || typeof itemKey !== "string") {
                return { success: false, error: "INVALID_ITEM" };
            }

            if (this.state.coins < cost) {
                return {
                    success: false,
                    error: "INSUFFICIENT_COINS",
                    required: cost,
                    available: this.state.coins
                };
            }

            // lifetimeXp remains untouched!
            this.state.coins -= cost;

            if (!this.state.inventory.includes(itemKey)) {
                this.state.inventory.push(itemKey);
            }

            if (category === "avatar") {
                this.state.equippedItems.avatar = itemKey;
            }

            this.persist();

            return {
                success: true,
                item: itemKey,
                category,
                remainingCoins: this.state.coins,
                inventory: [...this.state.inventory],
                equippedAvatar: this.state.equippedItems.avatar
            };
        }

        equipAvatar(avatar) {
            if (!avatar || typeof avatar !== "string") return { success: false, error: "INVALID_AVATAR" };
            if (!this.state.inventory.includes(avatar)) return { success: false, error: "NOT_OWNED" };
            this.state.equippedItems.avatar = avatar;
            this.persist();
            return { success: true, avatar };
        }

        unlockAchievement(achievementId) {
            if (!achievementId) return { unlocked: false, error: "MISSING_ID" };
            const normalizedId = String(achievementId).trim();

            if (this.state.achievements.includes(normalizedId)) {
                return { unlocked: false, alreadyUnlocked: true, achievementId: normalizedId };
            }

            const catalogItem = ACHIEVEMENTS_CATALOG.find(a => a.id === normalizedId) || {
                id: normalizedId,
                title: normalizedId.replace(/_/g, " ").toUpperCase(),
                xp: 100,
                coins: 50,
                icon: "🏆",
                desc: "Pencapaian berhasil diraih."
            };

            this.state.achievements.push(normalizedId);
            this.awardXp(catalogItem.xp, `Lencana: ${catalogItem.title}`, `achievement:${normalizedId}`);
            this.awardCoins(catalogItem.coins || Math.round(catalogItem.xp / 2), `Bonus Koin: ${catalogItem.title}`, `achievement-coins:${normalizedId}`);

            // Milestone celebration
            this.triggerCelebration("ACHIEVEMENT_UNLOCKED");

            if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
                try {
                    window.dispatchEvent(new CustomEvent("uot-achievement-unlocked", { detail: catalogItem }));
                } catch (_) {}
            }

            if (this.state.achievements.length >= 5 && !this.state.achievements.includes("level_legend")) {
                this.unlockAchievement("level_legend");
            }

            return {
                unlocked: true,
                achievement: catalogItem,
                xpAwarded: catalogItem.xp,
                coinsAwarded: catalogItem.coins
            };
        }

        completeActivity(rewardId, options = {}) {
            if (!rewardId) return { completed: false, error: "MISSING_REWARD_ID" };
            const normalizedId = String(rewardId).trim();

            if (this.state.completedRewards[normalizedId]) {
                return {
                    completed: false,
                    alreadyCompleted: true,
                    rewardId: normalizedId,
                    lifetimeXp: this.state.lifetimeXp,
                    level: this.state.level
                };
            }

            const xpAmount = Math.max(0, Number(options.xp || 0));
            const coinAmount = Math.max(0, Number(options.coins || 0));
            const reason = options.reason || "Penyelesaian Aktivitas";

            if (xpAmount > 0) {
                this.awardXp(xpAmount, reason, normalizedId);
            } else {
                this.state.completedRewards[normalizedId] = {
                    reason,
                    timestamp: new Date().toISOString(),
                    ...options.metadata
                };
                this.persist();
            }

            if (coinAmount > 0) {
                this.awardCoins(coinAmount, reason, `${normalizedId}:coins`);
            }

            if (options.achievementId) {
                this.unlockAchievement(options.achievementId);
            }

            return {
                completed: true,
                rewardId: normalizedId,
                xpAwarded: xpAmount,
                coinsAwarded: coinAmount,
                lifetimeXp: this.state.lifetimeXp,
                level: this.state.level
            };
        }

        // ==========================================
        // 11 & 12. CELEBRATIONS & PROGRESSION SUMMARY UI
        // ==========================================
        triggerCelebration(milestoneType = "GENERAL") {
            if (typeof window === "undefined" || !window.document) return;
            // Only trigger celebration on true major milestones: LEVEL_UP, PROJECT_COMPLETE, ACHIEVEMENT_UNLOCKED
            if (["LEVEL_UP", "PROJECT_COMPLETE", "ACHIEVEMENT_UNLOCKED", "MASTERY_UPGRADE"].includes(milestoneType)) {
                if (typeof window.triggerConfetti === "function") {
                    try { window.triggerConfetti(); } catch (_) {}
                }
            }
        }

        showProgressionFeedback(data) {
            if (typeof window === "undefined" || !window.document) return;
            
            // Check if existing dialog exists, remove it safely
            const oldModal = document.getElementById("uotProgressionSummaryModal");
            if (oldModal) oldModal.remove();

            const modal = document.createElement("div");
            modal.id = "uotProgressionSummaryModal";
            modal.className = "uot-progression-modal-backdrop";
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-modal", "true");
            modal.setAttribute("aria-label", "Ringkasan Progres Belajar");

            const levelMetrics = data.levelProgress || calculateLevelMetrics(this.state.lifetimeXp);
            const nextObj = data.nextObjective || this.getNextObjective();
            const streakInfo = this.getStreakInfo();

            modal.innerHTML = `
                <div class="uot-progression-summary-card">
                    <button type="button" class="uot-modal-close" id="btnProgressionClose" aria-label="Tutup Ringkasan">&times;</button>
                    
                    <div class="uot-summary-header">
                        <div class="uot-summary-icon-box ${data.leveledUp ? 'level-up' : ''}">
                            <i class="fa-solid ${data.leveledUp ? 'fa-crown' : 'fa-circle-check'}"></i>
                        </div>
                        <div>
                            <span class="uot-summary-tag">${data.leveledUp ? '🎉 LEVEL UP!' : 'Aktivitas Selesai'}</span>
                            <h3 class="uot-summary-title">${escapeHTML(data.title || "Progres Berhasil Dicatat")}</h3>
                        </div>
                    </div>

                    <div class="uot-rewards-strip">
                        <div class="uot-reward-pill xp">
                            <span class="pill-label">XP Didapat</span>
                            <strong>+${Number(data.xpAwarded || 0).toLocaleString("id-ID")} XP</strong>
                        </div>
                        <div class="uot-reward-pill coins">
                            <span class="pill-label">Koin</span>
                            <strong>+${Number(data.coinsAwarded || 0).toLocaleString("id-ID")} 🪙</strong>
                        </div>
                        <div class="uot-reward-pill streak">
                            <span class="pill-label">Streak</span>
                            <strong>🔥 ${streakInfo.streak} Hari</strong>
                        </div>
                    </div>

                    <div class="uot-summary-level-meter">
                        <div class="level-meta-row">
                            <span><strong>Level ${levelMetrics.level}</strong> (${levelMetrics.title})</span>
                            <span>${levelMetrics.currentLevelXp} / ${levelMetrics.xpNeededForNext} XP</span>
                        </div>
                        <div class="meter-bar-track">
                            <div class="meter-bar-fill" style="width: ${levelMetrics.percentage}%"></div>
                        </div>
                    </div>

                    ${nextObj ? `
                    <div class="uot-next-objective-box">
                        <div class="next-obj-badge"><i class="fa-solid fa-compass"></i> Next Objective</div>
                        <h4>${escapeHTML(nextObj.title)}</h4>
                        <p>${escapeHTML(nextObj.description)}</p>
                        <a href="${nextObj.actionUrl}" class="btn-continue-objective">
                            <span>${escapeHTML(nextObj.ctaText || "Lanjut Belajar")}</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                    ` : ''}

                    <div class="uot-summary-footer">
                        <button type="button" class="btn-summary-dismiss" id="btnDismissSummary">Tutup</button>
                    </div>
                </div>
            `;

            // Insert styles if not already present
            if (!document.getElementById("uotProgressionSummaryStyles")) {
                const style = document.createElement("style");
                style.id = "uotProgressionSummaryStyles";
                style.textContent = `
                    .uot-progression-modal-backdrop {
                        position: fixed; inset: 0; z-index: 10000;
                        background: rgba(15, 23, 42, 0.65);
                        backdrop-filter: blur(4px);
                        display: flex; align-items: center; justify-content: center;
                        padding: 16px; animation: uotFadeIn 0.2s ease-out;
                    }
                    @keyframes uotFadeIn { from { opacity: 0; } to { opacity: 1; } }
                    .uot-progression-summary-card {
                        background: var(--surface, #ffffff);
                        color: var(--text, #1e293b);
                        border-radius: 16px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05);
                        max-width: 480px; width: 100%;
                        padding: 24px; position: relative;
                    }
                    .dark-theme .uot-progression-summary-card {
                        background: #1e293b; color: #f8fafc;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
                    }
                    .uot-modal-close {
                        position: absolute; top: 16px; right: 16px;
                        background: transparent; border: none; font-size: 24px;
                        line-height: 1; cursor: pointer; color: inherit; opacity: 0.6;
                    }
                    .uot-modal-close:hover { opacity: 1; }
                    .uot-summary-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
                    .uot-summary-icon-box {
                        width: 48px; height: 48px; border-radius: 12px;
                        background: #dcfce7; color: #16a34a;
                        display: flex; align-items: center; justify-content: center; font-size: 22px;
                    }
                    .uot-summary-icon-box.level-up { background: #fef08a; color: #ca8a04; }
                    .uot-summary-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary, #2563eb); }
                    .uot-summary-title { margin: 2px 0 0 0; font-size: 18px; font-weight: 700; }
                    .uot-rewards-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
                    .uot-reward-pill {
                        background: var(--surface-soft, #f1f5f9);
                        padding: 10px 8px; border-radius: 10px; text-align: center;
                    }
                    .dark-theme .uot-reward-pill { background: #334155; }
                    .pill-label { display: block; font-size: 11px; opacity: 0.75; margin-bottom: 2px; }
                    .uot-reward-pill strong { font-size: 14px; font-weight: 800; }
                    .uot-reward-pill.xp strong { color: #2563eb; }
                    .dark-theme .uot-reward-pill.xp strong { color: #60a5fa; }
                    .uot-reward-pill.coins strong { color: #d97706; }
                    .dark-theme .uot-reward-pill.coins strong { color: #fbbf24; }
                    .uot-summary-level-meter { margin-bottom: 20px; }
                    .level-meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
                    .meter-bar-track { height: 8px; background: var(--surface-soft, #e2e8f0); border-radius: 99px; overflow: hidden; }
                    .dark-theme .meter-bar-track { background: #475569; }
                    .meter-bar-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #10b981); border-radius: 99px; transition: width 0.4s ease; }
                    .uot-next-objective-box {
                        background: var(--surface-soft, #f8fafc);
                        border: 1px solid var(--border, #e2e8f0);
                        border-radius: 12px; padding: 14px; margin-bottom: 16px;
                    }
                    .dark-theme .uot-next-objective-box { background: #0f172a; border-color: #334155; }
                    .next-obj-badge { font-size: 11px; font-weight: 700; color: #2563eb; display: inline-flex; align-items: center; gap: 5px; margin-bottom: 4px; }
                    .dark-theme .next-obj-badge { color: #60a5fa; }
                    .uot-next-objective-box h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 700; }
                    .uot-next-objective-box p { margin: 0 0 10px 0; font-size: 12px; opacity: 0.8; line-height: 1.4; }
                    .btn-continue-objective {
                        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                        width: 100%; padding: 10px; border-radius: 8px;
                        background: #2563eb; color: #ffffff; text-decoration: none;
                        font-size: 13px; font-weight: 600; text-align: center;
                    }
                    .btn-continue-objective:hover { background: #1d4ed8; }
                    .uot-summary-footer { text-align: right; }
                    .btn-summary-dismiss {
                        background: transparent; border: 1px solid var(--border, #cbd5e1);
                        color: inherit; padding: 8px 16px; border-radius: 8px;
                        font-size: 13px; cursor: pointer;
                    }
                    .btn-summary-dismiss:hover { background: var(--surface-soft, #f1f5f9); }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(modal);

            const closeModal = () => modal.remove();
            modal.querySelector("#btnProgressionClose")?.addEventListener("click", closeModal);
            modal.querySelector("#btnDismissSummary")?.addEventListener("click", closeModal);
            modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
        }

        resetProgression() {
            const fresh = createDefaultState(0, 50);
            this.state = fresh;
            this.persist(fresh);
            return fresh;
        }

        updateFromCloud(cloudProgress) {
            if (!cloudProgress || typeof cloudProgress !== "object") return false;

            const validLifetimeXp = Math.max(0, Number(cloudProgress.lifetimeXp) || 0);
            this.state.lifetimeXp = validLifetimeXp;
            this.state.coins = Math.max(0, Number(cloudProgress.coins) || 0);

            const metrics = calculateLevelMetrics(this.state.lifetimeXp);
            this.state.level = metrics.level;
            this.state.currentLevelXp = metrics.currentLevelXp;

            if (Array.isArray(cloudProgress.achievements)) {
                const set = new Set([...(this.state.achievements || []), ...cloudProgress.achievements]);
                this.state.achievements = Array.from(set);
            }

            if (Array.isArray(cloudProgress.inventory)) {
                const set = new Set([...(this.state.inventory || []), ...cloudProgress.inventory]);
                this.state.inventory = Array.from(set);
            }

            if (cloudProgress.equippedItems) {
                this.state.equippedItems = { ...this.state.equippedItems, ...cloudProgress.equippedItems };
            }

            if (cloudProgress.settings) {
                this.state.settings = { ...this.state.settings, ...cloudProgress.settings };
            }

            this.persist();

            if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
                try {
                    window.dispatchEvent(new CustomEvent("uot-game-state-change", { detail: this.getGameState() }));
                } catch (_) {}
            }

            return true;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>'"]/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
        }[char]));
    }

    // Singleton instance
    let instance = null;
    function getEngine() {
        if (!instance) {
            instance = new ProgressionEngine();
        }
        return instance;
    }

    // Public API
    const publicApi = {
        getGameState: () => getEngine().getGameState(),
        getLifetimeXp: () => getEngine().getLifetimeXp(),
        getCurrentLevelXp: () => getEngine().getCurrentLevelXp(),
        getPlayerLevel: () => getEngine().getPlayerLevel(),
        getCoins: () => getEngine().getCoins(),
        getLevelProgress: () => getEngine().getLevelProgress(),
        getRewardHistory: () => getEngine().getRewardHistory(),
        getAchievementsCatalog: () => getEngine().getAchievementsCatalog(),
        getAvatarsCatalog: () => getEngine().getAvatarsCatalog(),
        getRewardsConfig: () => getEngine().getRewardsConfig(),
        getLevelUnlocks: () => getEngine().getLevelUnlocks(),
        getLevelTitle,
        calculateLevelMetrics,
        getLocalDateString,
        getLocalWeekString,
        MASTERY_LEVELS,

        // Core Actions
        awardXp: (amount, reason, rewardId) => getEngine().awardXp(amount, reason, rewardId),
        awardCoins: (amount, reason, rewardId) => getEngine().awardCoins(amount, reason, rewardId),
        awardFromConfig: (configKey, mult, id, extra) => getEngine().awardFromConfig(configKey, mult, id, extra),
        spendCoins: (amount, itemKey, category) => getEngine().spendCoins(amount, itemKey, category),
        equipAvatar: (avatar) => getEngine().equipAvatar(avatar),
        unlockAchievement: (achievementId) => getEngine().unlockAchievement(achievementId),
        completeActivity: (rewardId, payload) => getEngine().completeActivity(rewardId, payload),

        // Gameplay Loop Features
        touchStreak: (targetDate) => getEngine().touchStreak(targetDate),
        getStreakInfo: () => getEngine().getStreakInfo(),
        recordActivity: (type, options) => getEngine().recordActivity(type, options),
        claimDailyMission: (missionId) => getEngine().claimDailyMission(missionId),
        claimWeeklyMission: (missionId) => getEngine().claimWeeklyMission(missionId),
        getMasterySummary: () => getEngine().getMasterySummary(),
        getNextObjective: () => getEngine().getNextObjective(),
        triggerCelebration: (type) => getEngine().triggerCelebration(type),
        showProgressionFeedback: (opts) => getEngine().showProgressionFeedback(opts),

        resetProgression: () => getEngine().resetProgression(),
        updateFromCloud: (cloudProgress) => getEngine().updateFromCloud(cloudProgress),
        createEngine: (storage) => new ProgressionEngine(storage),
        ProgressionEngine
    };

    // Global Bindings
    if (typeof window !== "undefined") {
        window.Progression = publicApi;
        window.ProgressionEngine = publicApi;
        window.UOTProgression = publicApi;
        window.getGameState = publicApi.getGameState;
        window.awardXp = publicApi.awardXp;
        window.awardCoins = publicApi.awardCoins;
        window.spendCoins = publicApi.spendCoins;
        window.unlockAchievement = publicApi.unlockAchievement;
        window.completeActivity = publicApi.completeActivity;
        window.getLevelProgress = publicApi.getLevelProgress;
        window.getLifetimeXp = publicApi.getLifetimeXp;
        window.getCurrentLevelXp = publicApi.getCurrentLevelXp;
        window.getPlayerLevel = publicApi.getPlayerLevel;
        window.getStreakInfo = publicApi.getStreakInfo;
        window.getNextObjective = publicApi.getNextObjective;
        window.addXp = (amount) => publicApi.awardXp(amount, "Aktivitas Belajar");
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = publicApi;
    }
})();

