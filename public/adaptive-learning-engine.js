
/**
 * Universe Of Tech (UOT) - Adaptive Learning & Mastery Engine (FASE 2)
 * Granular Skill Taxonomy, Unified Pipeline Ready, Robust Mastery Formula.
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.AdaptiveLearningEngine = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // -------------------------------------------------------------
    // 1. GRANULAR SKILL & DOMAIN MODEL HIERARCHY
    // -------------------------------------------------------------
    const DOMAIN_MODEL = Object.freeze({
        programming: {
            id: "programming",
            title: "Pemrograman & Web",
            icon: "fa-code",
            accent: "#6558f5",
            skills: {
                // HTML
                html_structure: { id: "html_structure", name: "HTML Dasar & Struktur", domain: "programming", prerequisites: [], recommendedLesson: "materi.html#html", practiceQuiz: "quiz.html?category=programming&topic=html" },
                html_forms: { id: "html_forms", name: "HTML Forms & Input", domain: "programming", prerequisites: ["html_structure"], recommendedLesson: "materi.html#html", practiceQuiz: "quiz.html?category=programming&topic=html_forms" },
                html_a11y: { id: "html_a11y", name: "HTML Semantik & Aksesibilitas", domain: "programming", prerequisites: ["html_structure"], recommendedLesson: "materi.html#html", practiceQuiz: "quiz.html?category=programming&topic=html_a11y" },
                
                // CSS
                css_basics: { id: "css_basics", name: "CSS Dasar & Styling", domain: "programming", prerequisites: ["html_structure"], recommendedLesson: "materi.html#css", practiceQuiz: "quiz.html?category=programming&topic=css" },
                css_layout_flex: { id: "css_layout_flex", name: "CSS Flexbox", domain: "programming", prerequisites: ["css_basics"], recommendedLesson: "materi.html#css", practiceQuiz: "quiz.html?category=programming&topic=css_flex" },
                css_layout_grid: { id: "css_layout_grid", name: "CSS Grid", domain: "programming", prerequisites: ["css_basics"], recommendedLesson: "materi.html#css", practiceQuiz: "quiz.html?category=programming&topic=css_grid" },
                css_responsive: { id: "css_responsive", name: "Responsive Design & Media Queries", domain: "programming", prerequisites: ["css_layout_flex", "css_layout_grid"], recommendedLesson: "materi.html#css", practiceQuiz: "quiz.html?category=programming&topic=css_responsive" },
                
                // JavaScript Core
                js_variables: { id: "js_variables", name: "Variabel & Tipe Data", domain: "programming", prerequisites: [], recommendedLesson: "materi.html#js-basics", practiceQuiz: "quiz.html?category=programming&topic=js_variables" },
                js_conditions: { id: "js_conditions", name: "Kondisi & Logika", domain: "programming", prerequisites: ["js_variables"], recommendedLesson: "materi.html#js-basics", practiceQuiz: "quiz.html?category=programming&topic=js_conditions" },
                js_loops: { id: "js_loops", name: "Perulangan (Loops)", domain: "programming", prerequisites: ["js_variables"], recommendedLesson: "materi.html#js-basics", practiceQuiz: "quiz.html?category=programming&topic=js_loops" },
                js_functions: { id: "js_functions", name: "Fungsi & Scope", domain: "programming", prerequisites: ["js_conditions", "js_loops"], recommendedLesson: "materi.html#js-basics", practiceQuiz: "quiz.html?category=programming&topic=js_functions" },
                js_arrays: { id: "js_arrays", name: "Manipulasi Array", domain: "programming", prerequisites: ["js_functions"], recommendedLesson: "materi.html#js-arrays", practiceQuiz: "quiz.html?category=programming&topic=js_arrays" },
                js_objects: { id: "js_objects", name: "Objek JavaScript", domain: "programming", prerequisites: ["js_arrays"], recommendedLesson: "materi.html#js-arrays", practiceQuiz: "quiz.html?category=programming&topic=js_objects" },
                js_error_handling: { id: "js_error_handling", name: "Error Handling & Debugging", domain: "programming", prerequisites: ["js_functions"], recommendedLesson: "materi.html#js", practiceQuiz: "quiz.html?category=programming&topic=js_error" },
                
                // JavaScript Web API
                js_dom: { id: "js_dom", name: "Manipulasi DOM", domain: "programming", prerequisites: ["html_structure", "js_objects"], recommendedLesson: "materi.html#javascript-dom", practiceQuiz: "quiz.html?category=programming&topic=js_dom" },
                js_events: { id: "js_events", name: "Event Listener & Handling", domain: "programming", prerequisites: ["js_dom"], recommendedLesson: "materi.html#javascript-dom", practiceQuiz: "quiz.html?category=programming&topic=js_events" },
                js_async: { id: "js_async", name: "Asynchronous & Promises", domain: "programming", prerequisites: ["js_events"], recommendedLesson: "materi.html#javascript-dom", practiceQuiz: "quiz.html?category=programming&topic=js_async" },
                js_fetch: { id: "js_fetch", name: "Fetch API & Network", domain: "programming", prerequisites: ["js_async"], recommendedLesson: "materi.html#javascript-dom", practiceQuiz: "quiz.html?category=programming&topic=js_fetch" },
                
                logic_algorithms: { id: "logic_algorithms", name: "Algoritma Dasar", domain: "programming", prerequisites: ["js_loops"], recommendedLesson: "materi.html#algoritma", practiceQuiz: "quiz.html?category=programming&topic=algo" }
            }
        },
        technology: {
            id: "technology",
            title: "Teknologi, Database & Desain",
            icon: "fa-database",
            accent: "#168f76",
            skills: {
                db_sql_basics: { id: "db_sql_basics", name: "SQL Dasar", domain: "technology", prerequisites: [], recommendedLesson: "materi.html#sql-query", practiceQuiz: "quiz.html?category=database" },
                db_sql_joins: { id: "db_sql_joins", name: "SQL JOIN & Relasi", domain: "technology", prerequisites: ["db_sql_basics"], recommendedLesson: "materi.html#sql-query", practiceQuiz: "quiz.html?category=database" },
                backend_api: { id: "backend_api", name: "REST API Design", domain: "technology", prerequisites: ["js_fetch", "db_sql_basics"], recommendedLesson: "materi.html#http-rest", practiceQuiz: "quiz.html?category=backend" },
                backend_auth: { id: "backend_auth", name: "Autentikasi & Keamanan", domain: "technology", prerequisites: ["backend_api"], recommendedLesson: "materi.html#http-rest", practiceQuiz: "quiz.html?category=backend" },
                ui_design_fundamentals: { id: "ui_design_fundamentals", name: "Fundamental UI Design", domain: "technology", prerequisites: [], recommendedLesson: "materi.html#visual-system", practiceQuiz: "quiz.html?category=design" },
                ux_research: { id: "ux_research", name: "UX Research & Usability", domain: "technology", prerequisites: ["ui_design_fundamentals"], recommendedLesson: "materi.html#visual-system", practiceQuiz: "quiz.html?category=design" }
            }
        },
        tka: {
            id: "tka",
            title: "Tes Kemampuan Akademik (TKA / SNBT)",
            icon: "fa-graduation-cap",
            accent: "#dd7b28",
            skills: {
                snbt_numerasi_dasar: { id: "snbt_numerasi_dasar", name: "Aritmatika & Aljabar", domain: "tka", prerequisites: [], recommendedLesson: "snbt.html#numerasi", practiceQuiz: "tka-quiz.html?subtest=numerasi" },
                snbt_numerasi_lanjut: { id: "snbt_numerasi_lanjut", name: "Analisis Data & Geometri", domain: "tka", prerequisites: ["snbt_numerasi_dasar"], recommendedLesson: "snbt.html#numerasi", practiceQuiz: "tka-quiz.html?subtest=numerasi" },
                snbt_literasi_id: { id: "snbt_literasi_id", name: "Literasi Bahasa Indonesia", domain: "tka", prerequisites: [], recommendedLesson: "snbt.html#literasi_indonesia", practiceQuiz: "tka-quiz.html?subtest=literasi_indonesia" },
                snbt_literasi_en: { id: "snbt_literasi_en", name: "Literasi Bahasa Inggris", domain: "tka", prerequisites: ["snbt_literasi_id"], recommendedLesson: "snbt.html#literasi_inggris", practiceQuiz: "tka-quiz.html?subtest=literasi_inggris" },
                snbt_penalaran_umum: { id: "snbt_penalaran_umum", name: "Penalaran Umum (Logika)", domain: "tka", prerequisites: [], recommendedLesson: "snbt.html#penalaran_umum", practiceQuiz: "tka-quiz.html?subtest=penalaran_umum" },
                snbt_penalaran_kognitif: { id: "snbt_penalaran_kognitif", name: "Potensi Kognitif", domain: "tka", prerequisites: ["snbt_penalaran_umum"], recommendedLesson: "snbt.html#potensi_kognitif", practiceQuiz: "tka-quiz.html?subtest=potensi_kognitif" }
            }
        },
        language_culture: {
            id: "language_culture",
            title: "Bahasa & Budaya Nusantara",
            icon: "fa-map-location-dot",
            accent: "#e11d48",
            skills: {
                culture_vocab: { id: "culture_vocab", name: "Kosakata Daerah", domain: "language_culture", prerequisites: [], recommendedLesson: "bahasa-daerah.html", practiceQuiz: "latihan-bahasa.html" },
                culture_pronunciation: { id: "culture_pronunciation", name: "Pelafalan & Intonasi", domain: "language_culture", prerequisites: ["culture_vocab"], recommendedLesson: "bahasa-daerah.html", practiceQuiz: "latihan-bahasa.html" },
                culture_grammar: { id: "culture_grammar", name: "Tata Bahasa Daerah", domain: "language_culture", prerequisites: ["culture_vocab"], recommendedLesson: "bahasa-daerah.html", practiceQuiz: "quiz-budaya.html" },
                culture_tradition: { id: "culture_tradition", name: "Sejarah & Tradisi", domain: "language_culture", prerequisites: [], recommendedLesson: "library.html", practiceQuiz: "quiz-budaya.html" },
                culture_wisdom: { id: "culture_wisdom", name: "Kearifan Lokal & Peribahasa", domain: "language_culture", prerequisites: ["culture_tradition"], recommendedLesson: "library.html", practiceQuiz: "quiz-budaya.html" }
            }
        }
    });

    const SKILLS_REGISTRY = {};
    Object.values(DOMAIN_MODEL).forEach(domain => {
        Object.entries(domain.skills).forEach(([skillId, skillObj]) => {
            SKILLS_REGISTRY[skillId] = skillObj;
        });
    });

    const MASTERY_TIERS = Object.freeze([
        { min: 0, max: 20, level: "Beginner", label: "Pemula", badge: "🌱", color: "#6b7280" },
        { min: 21, max: 40, level: "Developing", label: "Berkembang", badge: "🌿", color: "#3b82f6" },
        { min: 41, max: 60, level: "Intermediate", label: "Menengah", badge: "🌲", color: "#eab308" },
        { min: 61, max: 80, level: "Proficient", label: "Mahir", badge: "⭐", color: "#10b981" },
        { min: 81, max: 100, level: "Mastered", label: "Menguasai", badge: "👑", color: "#8b5cf6" }
    ]);

    function getTierForScore(score) {
        const valid = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
        return MASTERY_TIERS.find(t => valid >= t.min && valid <= t.max) || MASTERY_TIERS[0];
    }

    function mapCategoryToSkill(category, topic = "") {
        const cat = String(category || "").toLowerCase();
        const top = String(topic || "").toLowerCase();
        
        // Match Granular Skills
        if (cat === "programming" || cat === "web") {
            if (top.includes("html")) {
                if (top.includes("form")) return "html_forms";
                if (top.includes("a11y") || top.includes("semant")) return "html_a11y";
                return "html_structure";
            }
            if (top.includes("css")) {
                if (top.includes("flex")) return "css_layout_flex";
                if (top.includes("grid")) return "css_layout_grid";
                if (top.includes("responsive") || top.includes("media")) return "css_responsive";
                return "css_basics";
            }
            if (top.includes("js") || top.includes("javascript")) {
                if (top.includes("var") || top.includes("tipe")) return "js_variables";
                if (top.includes("cond") || top.includes("if")) return "js_conditions";
                if (top.includes("loop") || top.includes("perulangan")) return "js_loops";
                if (top.includes("func")) return "js_functions";
                if (top.includes("array")) return "js_arrays";
                if (top.includes("obj")) return "js_objects";
                if (top.includes("err")) return "js_error_handling";
                if (top.includes("dom")) return "js_dom";
                if (top.includes("event")) return "js_events";
                if (top.includes("async") || top.includes("promise")) return "js_async";
                if (top.includes("fetch") || top.includes("api")) return "js_fetch";
                return "js_variables";
            }
            if (top.includes("algo") || top.includes("search") || top.includes("sort")) return "logic_algorithms";
            return "js_variables";
        }
        if (cat === "database" || cat === "sql") {
            if (top.includes("join") || top.includes("relasi")) return "db_sql_joins";
            return "db_sql_basics";
        }
        if (cat === "design" || cat === "ux" || cat === "ui") {
            if (top.includes("research") || top.includes("usability")) return "ux_research";
            return "ui_design_fundamentals";
        }
        if (cat === "backend" || cat === "api") {
            if (top.includes("auth") || top.includes("sec")) return "backend_auth";
            return "backend_api";
        }
        if (cat === "snbt" || cat === "tka") {
            if (top.includes("num") || top.includes("mtk")) {
                if (top.includes("lanjut") || top.includes("analisis")) return "snbt_numerasi_lanjut";
                return "snbt_numerasi_dasar";
            }
            if (top.includes("ing") || top.includes("eng")) return "snbt_literasi_en";
            if (top.includes("logis") || top.includes("nalar") || top.includes("umum")) return "snbt_penalaran_umum";
            if (top.includes("kognitif") || top.includes("potensi")) return "snbt_penalaran_kognitif";
            return "snbt_literasi_id";
        }
        if (cat === "bahasa" || cat === "budaya" || cat === "culture") {
            if (top.includes("aksara") || top.includes("tata") || top.includes("gram")) return "culture_grammar";
            if (top.includes("pelafalan") || top.includes("pronun") || top.includes("suara")) return "culture_pronunciation";
            if (top.includes("sejarah") || top.includes("tradisi")) return "culture_tradition";
            if (top.includes("kearifan") || top.includes("peribahasa")) return "culture_wisdom";
            return "culture_vocab";
        }
        return "js_variables";
    }

    function getActivityMetadata(activityOrId) {
        let act = activityOrId;
        if (typeof activityOrId === "string") act = { id: activityOrId };
        
        const skillId = act.skill || mapCategoryToSkill(act.category || act.topic || "", act.topic || act.id || "");
        const skillObj = SKILLS_REGISTRY[skillId] || SKILLS_REGISTRY["js_variables"];
        let difficultyNum = 1;
        const diffStr = String(act.difficulty || "").toLowerCase();
        if (diffStr === "medium" || diffStr === "2") difficultyNum = 2;
        if (diffStr === "hard" || diffStr === "3") difficultyNum = 3;
        
        return {
            id: act.id || `act_${Date.now()}`,
            topic: act.topic || skillObj.name,
            skill: skillObj.id,
            skillName: skillObj.name,
            domain: skillObj.domain,
            difficulty: difficultyNum,
            difficultyLabel: difficultyNum === 3 ? "Hard" : (difficultyNum === 2 ? "Medium" : "Easy"),
            estimatedDuration: act.estimatedDuration || (difficultyNum * 2 + 1),
            prerequisites: skillObj.prerequisites || []
        };
    }

    // -------------------------------------------------------------
    // 4. RATIONAL MULTI-FACTOR MASTERY CALCULATION
    // -------------------------------------------------------------
    function calculateSkillMastery(skillId, attemptsHistory = [], nowMs = Date.now()) {
        const skillObj = SKILLS_REGISTRY[skillId];
        if (!skillObj) {
            return { skillId, score: 0, tier: MASTERY_TIERS[0], attemptsCount: 0, streak: 0, lastAttemptAt: null, dueForReview: false };
        }

        const skillAttempts = (attemptsHistory || []).filter(a => {
            const mapped = mapCategoryToSkill(a.category, a.topic) || a.skill || getActivityMetadata(a).skill;
            return mapped === skillId || a.skill === skillId || getActivityMetadata(a).skill === skillId;
        });
        if (skillAttempts.length === 0) {
            return { skillId, skillName: skillObj.name, domain: skillObj.domain, score: 0, tier: MASTERY_TIERS[0], attemptsCount: 0, correctCount: 0, streak: 0, lastAttemptAt: null, dueForReview: false, consecutiveFailures: 0 };
        }

        skillAttempts.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
        
        let totalWeightedScore = 0;
        let totalWeightedMax = 0;
        let currentStreak = 0;
        let consecutiveFailures = 0;
        let hasConceptError = false;

        skillAttempts.forEach((att, idx) => {
            const isCorrect = Boolean(att.correct || att.isCorrect || Number(att.score) >= 70);
            const difficulty = Number(att.difficulty) || (att.difficultyStr === "hard" ? 3 : (att.difficultyStr === "medium" ? 2 : 1));
            const diffWeight = difficulty === 3 ? 2.0 : (difficulty === 2 ? 1.5 : 1.0);
            
            const timestampMs = new Date(att.timestamp || nowMs).getTime();
            const daysOld = Math.max(0, (nowMs - timestampMs) / (1000 * 60 * 60 * 24));
            const recencyWeight = Math.exp(-0.03 * daysOld); // 14-day half-life roughly
            
            // Retries & Trend Weight: More recent attempts matter slightly more intrinsically, 
            // but excessive retries diminish maximum possible gain.
            const retries = Math.max(0, Number(att.retries || att.attemptNumber - 1 || 0));
            const retryMultiplier = 1.0 / (1 + 0.35 * retries);
            const hintMultiplier = att.usedHint ? 0.85 : 1.0;

            const errorType = String(att.errorType || "").toLowerCase();
            if (errorType === "concept") hasConceptError = true;

            const maxPossible = diffWeight * recencyWeight;
            const earned = isCorrect ? (diffWeight * recencyWeight * retryMultiplier * hintMultiplier) : 0;
            
            // Penalty for concept errors
            totalWeightedScore += (errorType === "concept" && !isCorrect) ? (earned - 0.2) : earned; 
            totalWeightedMax += maxPossible;
            
            if (isCorrect) { currentStreak++; consecutiveFailures = 0; }
            else { currentStreak = 0; consecutiveFailures++; }
        });

        // Exponential Moving Average / Weighted Ratio
        let baseRatio = totalWeightedMax > 0 ? Math.max(0, totalWeightedScore / totalWeightedMax) : 0;
        
        // Confidence scale based on number of attempts
        const sampleConfidence = Math.min(1.0, 0.35 + 0.22 * skillAttempts.length);
        
        // Consistency streak bonus
        const streakBonus = Math.min(0.15, currentStreak * 0.03);
        let finalScoreRatio = Math.min(1.0, (baseRatio * sampleConfidence) + streakBonus);
        
        if (hasConceptError) {
            finalScoreRatio = Math.max(0, finalScoreRatio - 0.1); // 10% penalty for unresolved concept errors
        }

        let rawScore = Math.round(finalScoreRatio * 100);

        // Review calculation
        const lastAttemptMs = new Date(skillAttempts[skillAttempts.length - 1].timestamp || nowMs).getTime();
        const daysSinceLast = Math.max(0, (nowMs - lastAttemptMs) / (1000 * 60 * 60 * 24));
        
        let intervalDays = 1;
        if (rawScore >= 81) intervalDays = 30;
        else if (rawScore >= 61) intervalDays = 14;
        else if (rawScore >= 41) intervalDays = 7;
        else if (rawScore >= 21) intervalDays = 3;

        let effectiveScore = rawScore;
        if (daysSinceLast > 14 && rawScore > 0) {
            const decayFactor = Math.max(0.65, Math.exp(-0.015 * (daysSinceLast - 14)));
            effectiveScore = Math.max(20, Math.round(rawScore * decayFactor));
        }

        const dueForReview = (daysSinceLast >= intervalDays || daysSinceLast >= 14) && effectiveScore > 0;
        const tier = getTierForScore(effectiveScore);

        return {
            skillId, skillName: skillObj.name, domain: skillObj.domain, 
            score: effectiveScore, rawScore, tier,
            attemptsCount: skillAttempts.length,
            correctCount: skillAttempts.filter(a => a.correct || a.isCorrect || Number(a.score) >= 70).length,
            streak: currentStreak, consecutiveFailures,
            lastAttemptAt: skillAttempts[skillAttempts.length - 1].timestamp || null,
            daysSinceLast: Math.round(daysSinceLast * 10) / 10,
            intervalDays, dueForReview, hasConceptError
        };
    }

    function isPrerequisiteMet(skillId, masteryMap) {
        const skillObj = SKILLS_REGISTRY[skillId];
        if (!skillObj || !Array.isArray(skillObj.prerequisites) || skillObj.prerequisites.length === 0) {
            return { met: true, missingPrereqs: [] };
        }
        const missing = [];
        skillObj.prerequisites.forEach(prereqId => {
            const prereqMastery = masteryMap[prereqId]?.score || 0;
            if (prereqMastery < 40) {
                missing.push({ id: prereqId, name: SKILLS_REGISTRY[prereqId]?.name || prereqId, currentScore: prereqMastery });
            }
        });
        return { met: missing.length === 0, missingPrereqs: missing };
    }

    function generateRecommendations(attemptsHistory = [], recommendationHistory = [], nowMs = Date.now()) {
        const masteryMap = {};
        let totalAttemptsAcrossAll = 0;
        Object.keys(SKILLS_REGISTRY).forEach(skillId => {
            const m = calculateSkillMastery(skillId, attemptsHistory, nowMs);
            masteryMap[skillId] = m;
            totalAttemptsAcrossAll += m.attemptsCount;
        });

        if (totalAttemptsAcrossAll === 0) {
            const coldStartSkills = ["html_structure", "js_variables", "snbt_numerasi_dasar", "culture_vocab"];
            const coldStartList = coldStartSkills.map(sId => {
                const sk = SKILLS_REGISTRY[sId];
                return { id: sId, skillName: sk.name, domain: sk.domain, type: "cold_start", lessonUrl: sk.recommendedLesson, practiceUrl: sk.practiceQuiz, explanation: `Mulai dengan ${sk.name} untuk membangun dasar.` };
            });
            return {
                isColdStart: true, recommendedNext: coldStartList, continue: [], needsPractice: [], readyForChallenge: [], reviewDue: [], recentlyMastered: [], remedialTrigger: null, masterySummary: masteryMap, explanation: "Sesi Diagnosis Awal: Mulai latihan pertama Anda."
            };
        }

        const recommendedNext = [];
        const continueItems = [];
        const needsPractice = [];
        const readyForChallenge = [];
        const reviewDue = [];
        const recentlyMastered = [];
        let remedialTrigger = null;

        const sortedAttempts = [...attemptsHistory].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        const recentSkillIds = [...new Set(sortedAttempts.map(a => getActivityMetadata(a).skill))];
        recentSkillIds.slice(0, 3).forEach(sId => {
            const m = masteryMap[sId];
            const sk = SKILLS_REGISTRY[sId];
            if (m && sk && m.score > 0 && m.score < 81) {
                continueItems.push({ id: sId, skillName: sk.name, domain: sk.domain, type: "continue", score: m.score, tier: m.tier, lessonUrl: sk.recommendedLesson, practiceUrl: sk.practiceQuiz, explanation: `Lanjutkan pembelajaran ${sk.name} (${m.score}%).` });
            }
        });

        Object.values(masteryMap).forEach(m => {
            const sk = SKILLS_REGISTRY[m.skillId];
            if (!sk) return;
            
            if (m.consecutiveFailures >= 2 && !remedialTrigger) {
                remedialTrigger = { id: m.skillId, skillName: sk.name, domain: sk.domain, type: "remedial", lessonUrl: sk.recommendedLesson, explanation: `Terdeteksi kesulitan pada ${sk.name}. Disarankan membaca ulang materi.` };
            }
            if (m.dueForReview) reviewDue.push({ id: m.skillId, skillName: sk.name, domain: sk.domain, type: "review", score: m.score, tier: m.tier, lessonUrl: sk.recommendedLesson, practiceUrl: sk.practiceQuiz, explanation: `Waktunya mengulang ${sk.name} (Spaced Repetition).` });
            if (m.score > 0 && m.score <= 60 && !m.dueForReview) needsPractice.push({ id: m.skillId, skillName: sk.name, domain: sk.domain, type: "practice", score: m.score, tier: m.tier, lessonUrl: sk.recommendedLesson, practiceUrl: sk.practiceQuiz, explanation: `Perbanyak latihan pada ${sk.name} untuk meningkatkan penguasaan.` });
            if (m.score >= 61 && m.score <= 80 && !m.dueForReview) readyForChallenge.push({ id: m.skillId, skillName: sk.name, domain: sk.domain, type: "challenge", score: m.score, tier: m.tier, lessonUrl: sk.recommendedLesson, practiceUrl: sk.practiceQuiz + "&difficulty=hard", explanation: `Anda sudah mahir di ${sk.name}. Coba latihan yang lebih sulit!` });
            if (m.score >= 81 && m.daysSinceLast <= 3) recentlyMastered.push({ id: m.skillId, skillName: sk.name, domain: sk.domain, type: "mastered", score: m.score, tier: m.tier, explanation: `Luar biasa! Anda baru saja menguasai ${sk.name}.` });
            
            if (m.score < 40) {
                const prereqCheck = isPrerequisiteMet(m.skillId, masteryMap);
                if (prereqCheck.met && !continueItems.find(c => c.id === m.skillId)) recommendedNext.push({ id: m.skillId, skillName: sk.name, domain: sk.domain, type: "next", score: m.score, tier: m.tier, lessonUrl: sk.recommendedLesson, practiceUrl: sk.practiceQuiz, explanation: `Langkah selanjutnya: Pelajari ${sk.name}.` });
            }
        });

        return {
            isColdStart: false,
            recommendedNext: recommendedNext.sort((a,b) => b.score - a.score).slice(0,3),
            continue: continueItems,
            needsPractice: needsPractice.sort((a,b) => a.score - b.score).slice(0,3),
            readyForChallenge: readyForChallenge.sort((a,b) => b.score - a.score).slice(0,2),
            reviewDue: reviewDue.sort((a,b) => a.score - b.score).slice(0,3),
            recentlyMastered: recentlyMastered.slice(0,3),
            remedialTrigger,
            masterySummary: masteryMap,
            explanation: "Sistem adaptif merekomendasikan jalur optimal berdasarkan performa Anda."
        };
    }

    return Object.freeze({
        DOMAIN_MODEL, SKILLS_REGISTRY, MASTERY_TIERS,
        getActivityMetadata, mapCategoryToSkill,
        calculateSkillMastery, generateRecommendations, isPrerequisiteMet
    });
}));
