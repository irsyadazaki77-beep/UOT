/**
 * Universe Of Tech (UOT) - Adaptive Learning & Mastery Engine (FASE 12)
 * Domain Models, Multi-Factor Mastery Calculations, Recommendation Engine,
 * Prerequisites Enforcement, Spaced Repetition, Remedial Workflows, Cold-Start Handler.
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
    // 1. SKILL & DOMAIN MODEL HIERARCHY
    // -------------------------------------------------------------
    const DOMAIN_MODEL = Object.freeze({
        programming: {
            id: "programming",
            title: "Pemrograman & Web",
            icon: "fa-code",
            accent: "#6558f5",
            skills: {
                html_structure: {
                    id: "html_structure",
                    name: "HTML Semantik & Aksesibilitas",
                    domain: "programming",
                    prerequisites: [],
                    description: "Struktur dokumen web, elemen semantik, metadata, dan aksesibilitas form.",
                    recommendedLesson: "materi.html#html-a11y",
                    practiceQuiz: "quiz.html?category=programming&topic=html"
                },
                css_layout: {
                    id: "css_layout",
                    name: "CSS Layout & Responsive UI",
                    domain: "programming",
                    prerequisites: ["html_structure"],
                    description: "Flexbox, CSS Grid, media queries, mobile-first design, dan tokens.",
                    recommendedLesson: "materi.html#css-responsive",
                    practiceQuiz: "quiz.html?category=programming&topic=css"
                },
                javascript_basics: {
                    id: "javascript_basics",
                    name: "Logika & Variabel JavaScript",
                    domain: "programming",
                    prerequisites: ["html_structure"],
                    description: "Tipe data, variabel, percabangan, perulangan, dan fungsi murni.",
                    recommendedLesson: "materi.html#js-basics",
                    practiceQuiz: "quiz.html?category=programming&topic=js"
                },
                javascript_arrays: {
                    id: "javascript_arrays",
                    name: "Array & Manipulasi Data JS",
                    domain: "programming",
                    prerequisites: ["javascript_basics"],
                    description: "Array iteration, map/filter/reduce, objek, dan pencarian data.",
                    recommendedLesson: "materi.html#js-arrays",
                    practiceQuiz: "quiz.html?category=programming&topic=arrays"
                },
                web_apis: {
                    id: "web_apis",
                    name: "DOM & Asynchronous Fetch API",
                    domain: "programming",
                    prerequisites: ["javascript_basics", "javascript_arrays"],
                    description: "Manipulasi DOM, event handling, Promises, async/await, dan REST fetch.",
                    recommendedLesson: "materi.html#javascript-dom",
                    practiceQuiz: "quiz.html?category=web&topic=dom"
                },
                logic_algorithms: {
                    id: "logic_algorithms",
                    name: "Algoritma & Problem Solving",
                    domain: "programming",
                    prerequisites: ["javascript_basics"],
                    description: "Kompleksitas waktu, sorting, searching, dan rekursi dasar.",
                    recommendedLesson: "materi.html#algoritma",
                    practiceQuiz: "quiz.html?category=programming&topic=algo"
                }
            }
        },
        technology: {
            id: "technology",
            title: "Teknologi & Sistem",
            icon: "fa-database",
            accent: "#168f76",
            skills: {
                database_sql: {
                    id: "database_sql",
                    name: "Database Relasional & SQL",
                    domain: "technology",
                    prerequisites: ["logic_algorithms"],
                    description: "Desain skema, primary/foreign key, query JOIN, dan agregasi data.",
                    recommendedLesson: "materi.html#sql-query",
                    practiceQuiz: "quiz.html?category=database"
                },
                ui_ux_design: {
                    id: "ui_ux_design",
                    name: "UI/UX & Visual Design",
                    domain: "technology",
                    prerequisites: [],
                    description: "Hirarki visual, kontras warna, wireframing, dan usabilitas.",
                    recommendedLesson: "materi.html#visual-system",
                    practiceQuiz: "quiz.html?category=design"
                },
                system_architecture: {
                    id: "system_architecture",
                    name: "REST API & Server Architecture",
                    domain: "technology",
                    prerequisites: ["web_apis", "database_sql"],
                    description: "Routing server, autentikasi, validasi request, dan arsitektur.",
                    recommendedLesson: "materi.html#http-rest",
                    practiceQuiz: "quiz.html?category=backend"
                }
            }
        },
        tka: {
            id: "tka",
            title: "Tes Kemampuan Akademik (TKA / SNBT)",
            icon: "fa-graduation-cap",
            accent: "#dd7b28",
            skills: {
                numerasi: {
                    id: "numerasi",
                    name: "Penalaran Matematika & Kuantitatif",
                    domain: "tka",
                    prerequisites: [],
                    description: "Aritmatika, aljabar dasar, rasio, dan analisis grafik.",
                    recommendedLesson: "snbt.html#numerasi",
                    practiceQuiz: "tka-quiz.html?subtest=numerasi"
                },
                literasi_indonesia: {
                    id: "literasi_indonesia",
                    name: "Literasi Bahasa Indonesia",
                    domain: "tka",
                    prerequisites: [],
                    description: "Pemahaman bacaan, gagasan utama, kesimpulan, dan tata bahasa.",
                    recommendedLesson: "snbt.html#literasi_indonesia",
                    practiceQuiz: "tka-quiz.html?subtest=literasi_indonesia"
                },
                literasi_inggris: {
                    id: "literasi_inggris",
                    name: "Literasi Bahasa Inggris",
                    domain: "tka",
                    prerequisites: ["literasi_indonesia"],
                    description: "Reading comprehension, vocabulary in context, and inferencing.",
                    recommendedLesson: "snbt.html#literasi_inggris",
                    practiceQuiz: "tka-quiz.html?subtest=literasi_inggris"
                },
                reasoning_logis: {
                    id: "reasoning_logis",
                    name: "Penalaran Logis & Silogisme",
                    domain: "tka",
                    prerequisites: ["numerasi"],
                    description: "Penalaran analitis, silogisme, premis, dan logika simbolik.",
                    recommendedLesson: "snbt.html#reasoning_logis",
                    practiceQuiz: "tka-quiz.html?subtest=penalaran_umum"
                }
            }
        },
        language_culture: {
            id: "language_culture",
            title: "Bahasa & Kebudayaan",
            icon: "fa-earth-asia",
            accent: "#c54d89",
            skills: {
                kosakata_daerah: {
                    id: "kosakata_daerah",
                    name: "Kosakata Bahasa Daerah",
                    domain: "language_culture",
                    prerequisites: [],
                    description: "Sapaan, kata benda, dan percabangan kosakata lokal Nusantara.",
                    recommendedLesson: "bahasa-daerah.html",
                    practiceQuiz: "latihan-bahasa.html"
                },
                tata_bahasa: {
                    id: "tata_bahasa",
                    name: "Tata Bahasa & Aksara",
                    domain: "language_culture",
                    prerequisites: ["kosakata_daerah"],
                    description: "Tingkatan tutur, struktur kalimat, dan pola ungkapan.",
                    recommendedLesson: "bahasa-daerah.html",
                    practiceQuiz: "quiz-budaya.html"
                },
                peribahasa_budaya: {
                    id: "peribahasa_budaya",
                    name: "Peribahasa & Tradisi Nusantara",
                    domain: "language_culture",
                    prerequisites: ["tata_bahasa"],
                    description: "Kearifan lokal, ungkapan filosofis, dan cerita tradisi.",
                    recommendedLesson: "library.html",
                    practiceQuiz: "quiz-budaya.html"
                }
            }
        }
    });

    // Flat Skill Lookup Registry
    const SKILLS_REGISTRY = {};
    Object.values(DOMAIN_MODEL).forEach(domain => {
        Object.entries(domain.skills).forEach(([skillId, skillObj]) => {
            SKILLS_REGISTRY[skillId] = skillObj;
        });
    });

    // -------------------------------------------------------------
    // 2. MASTERY TIERS & THRESHOLDS
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 3. ACTIVITY METADATA ENRICHMENT
    // -------------------------------------------------------------
    function mapCategoryToSkill(category, topic = "") {
        const cat = String(category || "").toLowerCase();
        const top = String(topic || "").toLowerCase();

        if (cat === "programming" || cat === "web") {
            if (top.includes("html") || top.includes("a11y")) return "html_structure";
            if (top.includes("css") || top.includes("flex") || top.includes("grid")) return "css_layout";
            if (top.includes("array") || top.includes("object")) return "javascript_arrays";
            if (top.includes("dom") || top.includes("fetch") || top.includes("async")) return "web_apis";
            if (top.includes("algo") || top.includes("search") || top.includes("sort")) return "logic_algorithms";
            return "javascript_basics";
        }
        if (cat === "database" || cat === "sql") return "database_sql";
        if (cat === "design" || cat === "ux" || cat === "ui") return "ui_ux_design";
        if (cat === "backend" || cat === "api") return "system_architecture";
        if (cat === "snbt" || cat === "tka") {
            if (top.includes("num") || top.includes("mtk") || top.includes("kuantitatif")) return "numerasi";
            if (top.includes("ing") || top.includes("eng")) return "literasi_inggris";
            if (top.includes("logis") || top.includes("silogisme") || top.includes("penalaran")) return "reasoning_logis";
            return "literasi_indonesia";
        }
        if (cat === "bahasa" || cat === "budaya" || cat === "culture") {
            if (top.includes("aksara") || top.includes("tata")) return "tata_bahasa";
            if (top.includes("peribahasa") || top.includes("tradisi")) return "peribahasa_budaya";
            return "kosakata_daerah";
        }

        return "javascript_basics";
    }

    function getActivityMetadata(activityOrId) {
        let act = activityOrId;
        if (typeof activityOrId === "string") {
            act = { id: activityOrId };
        }

        const skillId = act.skill || mapCategoryToSkill(act.category || act.topic || "", act.topic || act.id || "");
        const skillObj = SKILLS_REGISTRY[skillId] || SKILLS_REGISTRY["javascript_basics"];

        let difficultyNum = 1; // 1 = Easy, 2 = Medium, 3 = Hard
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
            estimatedDuration: act.estimatedDuration || (difficultyNum * 2 + 1), // in minutes
            prerequisites: skillObj.prerequisites || []
        };
    }

    // -------------------------------------------------------------
    // 4. RATIONAL MULTI-FACTOR MASTERY CALCULATION
    // -------------------------------------------------------------
    /**
     * Calculates mastery score (0-100) taking into account:
     * - Difficulty weights (Easy = 1.0x, Medium = 1.5x, Hard = 2.0x)
     * - Recency time decay (exponential decay)
     * - Retries & attempts (diminishing returns on repeated attempts)
     * - Hint usage deduction (0.85x factor)
     * - Consistency streak bonus (up to +15% boost)
     * - Spaced Repetition due date check
     */
    function calculateSkillMastery(skillId, attemptsHistory = [], nowMs = Date.now()) {
        const skillObj = SKILLS_REGISTRY[skillId];
        if (!skillObj) {
            return {
                skillId,
                score: 0,
                tier: MASTERY_TIERS[0],
                attemptsCount: 0,
                streak: 0,
                lastAttemptAt: null,
                dueForReview: false
            };
        }

        const skillAttempts = (attemptsHistory || []).filter(a => {
            const meta = getActivityMetadata(a);
            return meta.skill === skillId;
        });

        if (skillAttempts.length === 0) {
            return {
                skillId,
                skillName: skillObj.name,
                domain: skillObj.domain,
                score: 0,
                tier: MASTERY_TIERS[0],
                attemptsCount: 0,
                correctCount: 0,
                streak: 0,
                lastAttemptAt: null,
                dueForReview: false,
                consecutiveFailures: 0
            };
        }

        // Sort attempts chronologically
        skillAttempts.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());

        let totalWeightedScore = 0;
        let totalWeightedMax = 0;
        let currentStreak = 0;
        let consecutiveFailures = 0;

        skillAttempts.forEach(att => {
            const isCorrect = Boolean(att.correct || att.isCorrect || Number(att.score) >= 70);
            const difficulty = Number(att.difficulty) || (att.difficultyStr === "hard" ? 3 : (att.difficultyStr === "medium" ? 2 : 1));

            // 1. Difficulty Weight Factor
            const diffWeight = difficulty === 3 ? 2.0 : (difficulty === 2 ? 1.5 : 1.0);

            // 2. Recency Exponential Decay (half-life of 14 days)
            const timestampMs = new Date(att.timestamp || nowMs).getTime();
            const daysOld = Math.max(0, (nowMs - timestampMs) / (1000 * 60 * 60 * 24));
            const recencyWeight = Math.exp(-0.03 * daysOld); // Smooth decay curve

            // 3. Retry Diminishing Returns
            const retries = Math.max(0, Number(att.retries || att.attemptNumber - 1 || 0));
            const retryMultiplier = 1.0 / (1 + 0.35 * retries);

            // 4. Hint Penalty Factor
            const hintMultiplier = att.usedHint ? 0.85 : 1.0;

            const maxPossible = diffWeight * recencyWeight;
            const earned = isCorrect ? (diffWeight * recencyWeight * retryMultiplier * hintMultiplier) : 0;

            totalWeightedScore += earned;
            totalWeightedMax += maxPossible;

            if (isCorrect) {
                currentStreak++;
                consecutiveFailures = 0;
            } else {
                currentStreak = 0;
                consecutiveFailures++;
            }
        });

        // Base Accuracy Ratio
        let baseRatio = totalWeightedMax > 0 ? (totalWeightedScore / totalWeightedMax) : 0;

        // Sample Size Confidence Scaling (Requires multiple attempts to reach full 100% Mastered)
        const sampleConfidence = Math.min(1.0, 0.35 + 0.22 * skillAttempts.length);

        // 5. Consistency & Streak Bonus (up to +15%)
        const streakBonus = Math.min(0.15, currentStreak * 0.03);
        let finalScoreRatio = Math.min(1.0, (baseRatio * sampleConfidence) + streakBonus);

        // Scale to 0 - 100
        const rawScore = Math.round(finalScoreRatio * 100);

        // 6. Spaced Repetition Due Date & Inactivity Decay
        const lastAttemptMs = new Date(skillAttempts[skillAttempts.length - 1].timestamp || nowMs).getTime();
        const daysSinceLast = Math.max(0, (nowMs - lastAttemptMs) / (1000 * 60 * 60 * 24));

        // Review Intervals based on Tier
        let intervalDays = 1;
        if (rawScore >= 81) intervalDays = 30; // Mastered
        else if (rawScore >= 61) intervalDays = 14; // Proficient
        else if (rawScore >= 41) intervalDays = 7; // Intermediate
        else if (rawScore >= 21) intervalDays = 3; // Developing

        // Inactivity decay: If inactive > 14 days, apply gentle decay to score
        let effectiveScore = rawScore;
        if (daysSinceLast > 14 && rawScore > 0) {
            const decayFactor = Math.max(0.65, Math.exp(-0.015 * (daysSinceLast - 14)));
            effectiveScore = Math.max(20, Math.round(rawScore * decayFactor));
        }

        const dueForReview = (daysSinceLast >= intervalDays || daysSinceLast >= 14) && effectiveScore > 0;
        const tier = getTierForScore(effectiveScore);

        return {
            skillId,
            skillName: skillObj.name,
            domain: skillObj.domain,
            score: effectiveScore,
            rawScore,
            tier,
            attemptsCount: skillAttempts.length,
            correctCount: skillAttempts.filter(a => a.correct || a.isCorrect || Number(a.score) >= 70).length,
            streak: currentStreak,
            consecutiveFailures,
            lastAttemptAt: skillAttempts[skillAttempts.length - 1].timestamp || null,
            daysSinceLast: Math.round(daysSinceLast * 10) / 10,
            intervalDays,
            dueForReview
        };
    }

    // -------------------------------------------------------------
    // 5. PREREQUISITES VERIFICATION
    // -------------------------------------------------------------
    /**
     * Checks whether all prerequisites for a skill are satisfied (mastery >= 40%).
     */
    function isPrerequisiteMet(skillId, masteryMap) {
        const skillObj = SKILLS_REGISTRY[skillId];
        if (!skillObj || !Array.isArray(skillObj.prerequisites) || skillObj.prerequisites.length === 0) {
            return { met: true, missingPrereqs: [] };
        }

        const missing = [];
        skillObj.prerequisites.forEach(prereqId => {
            const prereqMastery = masteryMap[prereqId]?.score || 0;
            if (prereqMastery < 40) { // Developing threshold
                missing.push({
                    id: prereqId,
                    name: SKILLS_REGISTRY[prereqId]?.name || prereqId,
                    currentScore: prereqMastery
                });
            }
        });

        return {
            met: missing.length === 0,
            missingPrereqs: missing
        };
    }

    // -------------------------------------------------------------
    // 6. ADAPTIVE RECOMMENDATION ENGINE
    // -------------------------------------------------------------
    /**
     * Generates structured recommendations categorized into:
     * - recommendedNext: Best logical next skills where prerequisites are met
     * - continue: Ongoing in-progress skills
     * - needsPractice: Skills with low score (<60%), recent errors, or SRS due
     * - readyForChallenge: Proficient skills (61-80%) ready for Hard difficulty/Projects
     * - reviewDue: Skills due for spaced repetition review
     * - recentlyMastered: Skills that achieved >= 81%
     * - remedialTrigger: Remedial workflow if consecutive failures >= 2
     * - coldStart: Cold-start onboarding set if 0 attempts recorded
     *
     * Includes human-readable "Direkomendasikan karena..." explanations.
     */
    function generateRecommendations(attemptsHistory = [], recommendationHistory = [], nowMs = Date.now()) {
        const masteryMap = {};
        let totalAttemptsAcrossAll = 0;

        Object.keys(SKILLS_REGISTRY).forEach(skillId => {
            const m = calculateSkillMastery(skillId, attemptsHistory, nowMs);
            masteryMap[skillId] = m;
            totalAttemptsAcrossAll += m.attemptsCount;
        });

        // 1. Cold-Start Behaviour Handler
        if (totalAttemptsAcrossAll === 0) {
            const coldStartSkills = ["html_structure", "numerasi", "kosakata_daerah"];
            const coldStartList = coldStartSkills.map(sId => {
                const sk = SKILLS_REGISTRY[sId];
                return {
                    id: sId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "cold_start",
                    lessonUrl: sk.recommendedLesson,
                    practiceUrl: sk.practiceQuiz,
                    explanation: `Direkomendasikan sebagai sesi evaluasi diagnosis awal untuk memetakan kemampuan dasar pada ${sk.name}.`
                };
            });

            return {
                isColdStart: true,
                recommendedNext: coldStartList,
                continue: [],
                needsPractice: [],
                readyForChallenge: [],
                reviewDue: [],
                recentlyMastered: [],
                remedialTrigger: null,
                masterySummary: masteryMap,
                explanation: "Sesi Diagnosis Awal: Pengguna baru belum memiliki data riwayat. Sistem menyiapkan latihan fondasi awal."
            };
        }

        const recommendedNext = [];
        const continueItems = [];
        const needsPractice = [];
        const readyForChallenge = [];
        const reviewDue = [];
        const recentlyMastered = [];
        let remedialTrigger = null;

        // History deduplication & frequency weighting
        const recentHistoryList = Array.isArray(recommendationHistory) ? recommendationHistory.slice(-20) : [];
        const historyFrequency = {};
        recentHistoryList.forEach(id => {
            historyFrequency[id] = (historyFrequency[id] || 0) + 1;
        });

        // Determine most recently active skill for 'continue' section
        const sortedAttempts = [...attemptsHistory].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        const recentSkillIds = [...new Set(sortedAttempts.map(a => getActivityMetadata(a).skill))];

        recentSkillIds.slice(0, 3).forEach(sId => {
            const m = masteryMap[sId];
            const sk = SKILLS_REGISTRY[sId];
            if (m && sk && m.score > 0 && m.score < 81) {
                continueItems.push({
                    id: sId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "continue",
                    score: m.score,
                    tier: m.tier,
                    lessonUrl: sk.recommendedLesson,
                    practiceUrl: sk.practiceQuiz,
                    explanation: `Lanjutkan progres belajar ${sk.name} yang sedang berjalan (Tingkat Pemahaman saat ini ${m.score}%).`
                });
            }
        });

        Object.values(masteryMap).forEach(m => {
            const sk = SKILLS_REGISTRY[m.skillId];
            if (!sk) return;

            // Check Remedial Trigger (Consecutive Failures >= 2)
            if (m.consecutiveFailures >= 2 && !remedialTrigger) {
                remedialTrigger = {
                    skillId: m.skillId,
                    skillName: sk.name,
                    domain: sk.domain,
                    consecutiveFailures: m.consecutiveFailures,
                    explanation: `Pemicu Pembelajaran Remedial: Terdeteksi ${m.consecutiveFailures} kesalahan berturut-turut pada ${sk.name}. Sistem merekomendasikan ulasan materi singkat sebelum evaluasi ulang.`,
                    microLesson: {
                        title: `Micro-Lesson: Fondasi & Kunci ${sk.name}`,
                        url: sk.recommendedLesson,
                        durationMinutes: 5,
                        estimatedTime: "5 menit"
                    },
                    reassessmentQuiz: {
                        title: `Kuis Reassessment: Evaluasi Ulang ${sk.name}`,
                        url: sk.practiceQuiz + (sk.practiceQuiz.includes("?") ? "&mode=reassessment" : "?mode=reassessment"),
                        questionsCount: 3,
                        description: "Kuis evaluasi ulang setelah membaca micro-lesson"
                    },
                    focusedPractice: {
                        title: `Sesi Latihan Terarah ${sk.name}`,
                        url: sk.practiceQuiz
                    },
                    zeroXpPenaltyConfirmed: true
                };
            }

            // Check Spaced Repetition Review Due
            if (m.dueForReview && m.score > 0) {
                reviewDue.push({
                    id: m.skillId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "review_due",
                    score: m.score,
                    tier: m.tier,
                    daysSinceLast: m.daysSinceLast,
                    intervalDays: m.intervalDays,
                    lessonUrl: sk.recommendedLesson,
                    practiceUrl: sk.practiceQuiz,
                    explanation: `Direkomendasikan oleh jadwal Spaced Repetition: ${m.daysSinceLast} hari sejak latihan terakhir ${sk.name} (Mastery ${m.score}%).`
                });
            }

            // Check Prerequisites
            const prereqStatus = isPrerequisiteMet(m.skillId, masteryMap);

            if (!prereqStatus.met) {
                // Do NOT recommend locked skills to recommendedNext.
                // Instead, ensure missing prerequisites are added to needsPractice if unstarted/low
                prereqStatus.missingPrereqs.forEach(miss => {
                    const prereqObj = SKILLS_REGISTRY[miss.id];
                    if (prereqObj && !needsPractice.some(n => n.id === miss.id)) {
                        needsPractice.push({
                            id: miss.id,
                            skillName: prereqObj.name,
                            domain: prereqObj.domain,
                            type: "prerequisite_remedial",
                            score: miss.currentScore,
                            tier: getTierForScore(miss.currentScore),
                            lessonUrl: prereqObj.recommendedLesson,
                            practiceUrl: prereqObj.practiceQuiz,
                            explanation: `Direkomendasikan karena merupakan prasyarat utama sebelum kamu dapat mempelajari ${sk.name} (Tingkat Pemahaman Prasyarat ${miss.currentScore}%).`
                        });
                    }
                });
                return; // Skip locked skill
            }

            // Categorize based on score & SRS
            if (m.score >= 81) {
                recentlyMastered.push({
                    id: m.skillId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "mastered",
                    score: m.score,
                    tier: m.tier,
                    explanation: `Luar biasa! Kamu telah menguasai ${sk.name} dengan skor penguasaan ${m.score}%.`
                });
            } else if (m.score >= 61) {
                readyForChallenge.push({
                    id: m.skillId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "challenge_ready",
                    score: m.score,
                    tier: m.tier,
                    lessonUrl: sk.recommendedLesson,
                    practiceUrl: sk.practiceQuiz,
                    explanation: `Direkomendasikan karena kamu sudah Mahir di ${sk.name} (Mastery ${m.score}%). Saatnya mengambil kuis tantangan tingkat sulit!`
                });
            } else if (m.consecutiveFailures > 0 || (m.score > 0 && m.score < 60)) {
                needsPractice.push({
                    id: m.skillId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "needs_practice",
                    score: m.score,
                    tier: m.tier,
                    dueForReview: m.dueForReview,
                    lessonUrl: sk.recommendedLesson,
                    practiceUrl: sk.practiceQuiz,
                    explanation: `Direkomendasikan karena skor ${sk.name} kamu ${m.score}% dan membutuhkan latihan tambahan untuk mencapai tingkat Mahir.`
                });
            } else if (m.score === 0) {
                // Logical Next Step for unstarted skills whose prereqs are met
                recommendedNext.push({
                    id: m.skillId,
                    skillName: sk.name,
                    domain: sk.domain,
                    type: "recommended_next",
                    score: 0,
                    tier: m.tier,
                    lessonUrl: sk.recommendedLesson,
                    practiceUrl: sk.practiceQuiz,
                    explanation: sk.prerequisites.length > 0
                        ? `Direkomendasikan karena prasyarat (${sk.prerequisites.map(p => SKILLS_REGISTRY[p]?.name).join(", ")}) sudah dipahami dan kamu siap melangkah ke ${sk.name}.`
                        : `Direkomendasikan sebagai modul baru berikutnya untuk memperluas wawasan ${sk.name}.`
                });
            }
        });

        // Diversity & Anti-Looping Sorting:
        // Sort recommendedNext prioritizing skills with lower recent appearance frequency,
        // and interleave across different domains.
        function applyDiversitySort(items) {
            return [...items].sort((a, b) => {
                const freqA = historyFrequency[a.id] || 0;
                const freqB = historyFrequency[b.id] || 0;
                if (freqA !== freqB) return freqA - freqB;
                return (a.domain || "").localeCompare(b.domain || "");
            });
        }

        const diversifiedNext = applyDiversitySort(recommendedNext);
        const diversifiedPractice = applyDiversitySort(needsPractice);

        return {
            isColdStart: false,
            recommendedNext: diversifiedNext.slice(0, 3),
            continue: continueItems.slice(0, 3),
            needsPractice: diversifiedPractice.slice(0, 3),
            readyForChallenge: readyForChallenge.slice(0, 3),
            reviewDue: reviewDue.slice(0, 3),
            recentlyMastered: recentlyMastered.slice(0, 3),
            remedialTrigger,
            masterySummary: masteryMap
        };
    }

    return Object.freeze({
        DOMAIN_MODEL,
        SKILLS_REGISTRY,
        MASTERY_TIERS,
        getTierForScore,
        getActivityMetadata,
        calculateSkillMastery,
        isPrerequisiteMet,
        generateRecommendations
    });
}));
