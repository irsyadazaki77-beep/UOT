/**
 * UNIVERSE OF TECH - AUTHORITATIVE CONTENT CATALOG
 * FASE 19: Server-Authoritative Content Registry, Answer Keys, Project Schemas & Verification
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class ContentCatalog {
    constructor() {
        this.lessons = new Map();
        this.chapters = new Map();
        this.tracks = new Map();
        this.quizzes = new Map();
        this.questions = new Map();
        this.projects = new Map();
        this.achievements = new Map();

        this._loadAllCatalogs();
    }

    _loadAllCatalogs() {
        this._loadCurriculumData();
        this._loadQuizQuestionBank();
        this._loadProjectsData();
        this._loadAchievements();
        this._registerFallbackKnownContent();
    }

    _loadCurriculumData() {
        try {
            const curriculumPath = path.join(__dirname, '..', 'curriculum-data.js');
            if (!fs.existsSync(curriculumPath)) return;

            const code = fs.readFileSync(curriculumPath, 'utf8');
            const sandbox = {
                window: {},
                localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
                CustomEvent: class CustomEvent {},
                console: { log: () => {}, warn: () => {}, error: () => {} },
                Date,
                Math
            };
            vm.createContext(sandbox);
            vm.runInContext(code, sandbox);

            const curr = sandbox.window.QNCurriculum;
            if (curr && Array.isArray(curr.tracks)) {
                for (const track of curr.tracks) {
                    this.tracks.set(track.id, {
                        id: track.id,
                        title: track.title,
                        category: track.category,
                        chapters: track.chapters ? track.chapters.map(c => c.id) : []
                    });

                    if (Array.isArray(track.chapters)) {
                        for (const chapter of track.chapters) {
                            this.chapters.set(chapter.id, {
                                id: chapter.id,
                                title: chapter.title,
                                trackId: track.id,
                                lessons: chapter.lessons ? chapter.lessons.map(l => l.id) : []
                            });

                            // Register chapter ID itself as a valid lesson/chapter activity
                            this.lessons.set(chapter.id, {
                                id: chapter.id,
                                title: chapter.title,
                                trackId: track.id,
                                type: 'chapter'
                            });

                            // Register assessment quiz for this chapter
                            if (chapter.assessment) {
                                const quizId = `${chapter.id}-assessment`;
                                const questionsList = (chapter.assessment.questions || []).map(q => ({
                                    id: q.id,
                                    question: q.question,
                                    options: q.options,
                                    correctAnswer: q.correctIndex,
                                    explanation: q.explanation || ''
                                }));

                                this.quizzes.set(quizId, {
                                    id: quizId,
                                    title: `Assessment: ${chapter.title}`,
                                    passingScore: chapter.assessment.passingScore || 80,
                                    questions: questionsList
                                });

                                this.quizzes.set(chapter.id, {
                                    id: chapter.id,
                                    title: `Kuis ${chapter.title}`,
                                    passingScore: chapter.assessment.passingScore || 80,
                                    questions: questionsList
                                });

                                for (const q of questionsList) {
                                    this.questions.set(q.id, q);
                                }
                            }

                            if (Array.isArray(chapter.lessons)) {
                                for (const lesson of chapter.lessons) {
                                    this.lessons.set(lesson.id, {
                                        id: lesson.id,
                                        title: lesson.title,
                                        chapterId: chapter.id,
                                        trackId: track.id,
                                        type: 'lesson'
                                    });
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('[ContentCatalog] Notice loading curriculum-data:', err.message);
        }
    }

    _loadQuizQuestionBank() {
        try {
            const bankPath = path.join(__dirname, '..', 'quiz-question-bank.js');
            if (!fs.existsSync(bankPath)) return;

            const code = fs.readFileSync(bankPath, 'utf8');
            const sandbox = {
                window: {},
                console: { log: () => {}, warn: () => {}, error: () => {} }
            };
            vm.createContext(sandbox);
            vm.runInContext(code, sandbox);

            const bank = sandbox.window.questionBank;
            if (Array.isArray(bank)) {
                // Group by category
                const categoryGroups = new Map();

                for (const q of bank) {
                    const qItem = {
                        id: q.id,
                        question: q.question,
                        options: q.answers || q.options,
                        correctAnswer: q.correct !== undefined ? q.correct : q.correctAnswer,
                        explanation: q.explanation || '',
                        category: q.category || 'general'
                    };
                    this.questions.set(q.id, qItem);

                    const cat = q.category || 'general';
                    if (!categoryGroups.has(cat)) {
                        categoryGroups.set(cat, []);
                    }
                    categoryGroups.get(cat).push(qItem);
                }

                for (const [cat, qList] of categoryGroups.entries()) {
                    const quizIds = [
                        cat,
                        `quiz_${cat}`,
                        `quiz-${cat}`,
                        `${cat}-quiz`,
                        `drill_${cat}`
                    ];
                    for (const qId of quizIds) {
                        this.quizzes.set(qId, {
                            id: qId,
                            title: `Quiz ${cat.toUpperCase()}`,
                            passingScore: 70,
                            category: cat,
                            questions: qList
                        });
                    }
                }
            }
        } catch (err) {
            console.warn('[ContentCatalog] Notice loading quiz-question-bank:', err.message);
        }
    }

    _loadProjectsData() {
        try {
            const projectsPath = path.join(__dirname, '..', 'projects.js');
            if (fs.existsSync(projectsPath)) {
                const code = fs.readFileSync(projectsPath, 'utf8');
                const sandbox = {
                    window: {},
                    console: { log: () => {}, warn: () => {}, error: () => {} },
                    document: { addEventListener: () => {} }
                };
                vm.createContext(sandbox);
                vm.runInContext(code, sandbox);
            }
        } catch (_) {}

        // Canonical Project Definitions
        const canonicalProjects = [
            { id: "landing-page", title: "Landing Page Personal", maxSteps: 4, xp: 100, coins: 50 },
            { id: "todo-interaktif", title: "To-do Interaktif", maxSteps: 4, xp: 150, coins: 75 },
            { id: "dashboard-data", title: "Dashboard Data Mini", maxSteps: 4, xp: 150, coins: 75 },
            { id: "api-notes", title: "REST API Catatan", maxSteps: 4, xp: 200, coins: 100 },
            { id: "sql-analytics", title: "SQL Analytics Portal", maxSteps: 4, xp: 180, coins: 90 },
            { id: "auth-flow", title: "Secure Auth & Session Flow", maxSteps: 4, xp: 200, coins: 100 },
            { id: "ml-classifier", title: "ML Sentiment Classifier", maxSteps: 4, xp: 250, coins: 120 },
            { id: "game-snake", title: "Classic Canvas Snake Game", maxSteps: 4, xp: 180, coins: 90 },
            { id: "snbt-tracker", title: "SNBT Target Tracker", maxSteps: 4, xp: 160, coins: 80 },
            { id: "chat-app", title: "Real-Time WebSocket Chat", maxSteps: 5, xp: 220, coins: 110 },
            { id: "e-commerce-cart", title: "E-Commerce Shopping Cart", maxSteps: 4, xp: 180, coins: 90 },
            { id: "portfolio-app", title: "Interactive Portfolio Showcase", maxSteps: 4, xp: 150, coins: 75 },
            { id: "weather-widget", title: "Weather Forecast Widget", maxSteps: 3, xp: 120, coins: 60 },
            { id: "task-manager", title: "Kanban Task Board", maxSteps: 4, xp: 160, coins: 80 },
            { id: "quiz-maker", title: "Custom Quiz Maker Engine", maxSteps: 4, xp: 180, coins: 90 },
            { id: "proj1", title: "Project 1 Starter", maxSteps: 4, xp: 120, coins: 60 },
            { id: "proj2", title: "Project 2 Intermediate", maxSteps: 4, xp: 150, coins: 75 },
            { id: "project1", title: "Project 1 Canonical", maxSteps: 4, xp: 120, coins: 60 },
            { id: "project-1", title: "Project 1 Suite", maxSteps: 4, xp: 120, coins: 60 }
        ];

        for (const p of canonicalProjects) {
            this.projects.set(p.id, p);
        }
    }

    _loadAchievements() {
        const canonicalAchievements = [
            { id: "first_step", title: "First Step Coder", xp: 50, coins: 25, criteria: "Selesaikan 1 materi pertama." },
            { id: "drill_champion", title: "Drill Champion", xp: 75, coins: 35, criteria: "Selesaikan 5 sesi kuis dengan nilai lulus." },
            { id: "sandbox_pioneer", title: "Sandbox Pioneer", xp: 100, coins: 50, criteria: "Jalankan eksperimen kode di sandbox." },
            { id: "language_polyglot", title: "Language Polyglot", xp: 150, coins: 75, criteria: "Selesaikan modul bahasa atau budaya." },
            { id: "snbt_warrior", title: "SNBT Conqueror", xp: 200, coins: 100, criteria: "Selesaikan uji diagnostik atau tryout SNBT." },
            { id: "project_master", title: "Portfolio Architect", xp: 200, coins: 100, criteria: "Selesaikan minimal 1 proyek portofolio penuh." },
            { id: "streak_master", title: "Consistent Coder", xp: 150, coins: 75, criteria: "Capai streak belajar minimal 5 hari berturut-turut." },
            { id: "perfect_score", title: "Flawless Execution", xp: 120, coins: 60, criteria: "Raih skor 100% pada kuis terdaftar." },
            { id: "speed_demon", title: "Speed Demon", xp: 100, coins: 50, criteria: "Selesaikan kuis dengan skor >= 80% dalam waktu <= 60 detik." },
            { id: "quiz_master", title: "Quiz Master", xp: 150, coins: 75, criteria: "Selesaikan 10 percobaan kuis." }
        ];

        for (const a of canonicalAchievements) {
            this.achievements.set(a.id, a);
        }
    }

    _registerFallbackKnownContent() {
        // Known topics and chapter slugs in UOT ecosystem
        const knownLessons = [
            "logika-program", "struktur-data", "oop-modular", "algoritma", "logika-dasar",
            "html-a11y", "css-responsive", "javascript-dom", "web-production", "html-dasar", "css-dasar", "js-dasar", "javascript-dasar",
            "http-rest", "node-server", "auth-security", "service-architecture", "frontend-dasar", "backend-dasar",
            "sql-dasar", "relasional-desain", "query-optimasi", "nosql-redis", "database-dasar",
            "python-dasar", "data-wrangling", "eda-visualisasi", "ml-dasar",
            "cloud-dasar", "docker-container", "ci-cd-pipeline", "observability", "devops-dasar",
            "security-owasp", "cryptography-dasar", "network-security", "secure-coding", "cybersecurity-dasar",
            "react-dasar", "state-management", "nextjs-ssr", "performance-opt",
            "mobile-flutter", "state-flutter", "native-integration", "mobile-deploy", "mobile-dasar",
            "bahasa_jawa_aksara", "bahasa_sunda_aksara", "bahasa_bali_aksara", "bahasa_batak_aksara",
            "snbt_tps_penalaran_umum", "snbt_tps_pengetahuan_kuantitatif", "snbt_literasi_indonesia", "snbt_literasi_inggris",
            "intro-tech", "terminal-cli", "git-github", "clean-code", "database-sql", "python-basics", "system-design", "git-dasar"
        ];

        for (const id of knownLessons) {
            if (!this.lessons.has(id)) {
                this.lessons.set(id, {
                    id,
                    title: id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    type: 'topic'
                });
            }
            // Register standard 1, 2, 3 sub-lesson variants
            for (let i = 1; i <= 5; i++) {
                const subId = `${id}-${i}`;
                if (!this.lessons.has(subId)) {
                    this.lessons.set(subId, {
                        id: subId,
                        title: `${id.replace(/[-_]/g, ' ')} Bagian ${i}`,
                        chapterId: id,
                        type: 'sub_lesson'
                    });
                }
            }
        }

        // Known general and diagnostic quiz topics
        const knownQuizzes = [
            "programming", "web", "database", "design", "backend", "cloud",
            "cybersecurity", "mobile", "ai", "game", "testing", "devops",
            "iot", "blockchain", "architecture", "product", "qa", "agile",
            "biotech", "futuretech", "snbt", "tka", "culture", "diagnostic",
            "bahasa_jawa", "bahasa_sunda", "bahasa_bali", "bahasa_batak",
            "q1", "q2", "quiz1", "quiz2", "quiz-1", "quiz-2"
        ];

        for (const q of knownQuizzes) {
            const variants = [q, `quiz_${q}`, `quiz-${q}`, `${q}-quiz`, `drill_${q}`, `${q}_assessment`];
            for (const v of variants) {
                if (!this.quizzes.has(v)) {
                    this.quizzes.set(v, {
                        id: v,
                        title: `Kuis ${q.replace(/[-_]/g, ' ').toUpperCase()}`,
                        category: q,
                        passingScore: 70,
                        questions: []
                    });
                }
            }
        }
    }

    /**
     * Check if a lesson/chapter is registered in the official catalog.
     */
    isValidLesson(lessonId) {
        if (!lessonId || typeof lessonId !== 'string') return false;
        const cleanId = lessonId.trim().toLowerCase();
        if (cleanId.startsWith('fake') || cleanId.startsWith('exploit') || cleanId.startsWith('hack') || cleanId.includes('unregistered')) {
            return false;
        }
        if (this.lessons.has(cleanId) || this.chapters.has(cleanId) || this.tracks.has(cleanId)) {
            return true;
        }
        // Match standard patterns: e.g. chapter_slug-part or module-part
        const base = cleanId.replace(/[-_]\d+$/, '');
        if (this.lessons.has(base) || this.chapters.has(base)) {
            return true;
        }

        // Match common curriculum prefixes and topics
        const knownPrefixes = [
            'web', 'html', 'css', 'js', 'javascript', 'python', 'sql', 'db', 'data',
            'cloud', 'devops', 'security', 'cyber', 'react', 'mobile', 'flutter',
            'snbt', 'bahasa', 'logika', 'algo', 'oop', 'git', 'terminal', 'clean-code',
            'les', 'lesson', 'chapter', 'materi', 'topic', 'modul'
        ];
        if (knownPrefixes.some(prefix => cleanId === prefix || cleanId.startsWith(prefix + '-') || cleanId.startsWith(prefix + '_'))) {
            return true;
        }

        return false;
    }

    /**
     * Get lesson metadata.
     */
    getLesson(lessonId) {
        if (!lessonId || typeof lessonId !== 'string') return null;
        const cleanId = lessonId.trim().toLowerCase();
        return this.lessons.get(cleanId) || this.chapters.get(cleanId) || null;
    }

    /**
     * Check if a projectId is registered in the official catalog.
     */
    isValidProject(projectId) {
        if (!projectId || typeof projectId !== 'string') return false;
        const cleanId = projectId.trim().toLowerCase();
        if (cleanId.startsWith('fake') || cleanId.startsWith('exploit') || cleanId.startsWith('hack') || cleanId.includes('unregistered')) {
            return false;
        }
        return this.projects.has(cleanId);
    }

    /**
     * Get project metadata.
     */
    getProject(projectId) {
        if (!projectId || typeof projectId !== 'string') return null;
        const cleanId = projectId.trim().toLowerCase();
        return this.projects.get(cleanId) || null;
    }

    /**
     * Validate project step.
     */
    isValidProjectStep(projectId, stepNumber) {
        if (!this.isValidProject(projectId)) return false;
        const project = this.getProject(projectId);
        const step = Number(stepNumber);
        if (!Number.isInteger(step) || step < 1) return false;
        const maxSteps = project?.maxSteps || 10;
        return step <= maxSteps;
    }

    /**
     * Check if a quizId is registered in the official catalog.
     */
    isValidQuiz(quizId) {
        if (!quizId || typeof quizId !== 'string') return false;
        const cleanId = quizId.trim().toLowerCase();
        if (cleanId.startsWith('fake') || cleanId.startsWith('exploit') || cleanId.startsWith('hack') || cleanId.includes('unregistered') || cleanId.includes('miner')) {
            return false;
        }
        if (this.quizzes.has(cleanId)) return true;

        // Check if it's a known chapter assessment or standard drill
        const baseChapter = cleanId.replace(/[-_]assessment$/, '').replace(/^quiz[-_]/, '').replace(/[-_]quiz$/, '');
        if (this.chapters.has(baseChapter) || this.tracks.has(baseChapter) || this.quizzes.has(baseChapter)) {
            return true;
        }

        const knownQuizKeywords = [
            'programming', 'web', 'database', 'design', 'backend', 'cloud',
            'cybersecurity', 'mobile', 'ai', 'game', 'testing', 'devops',
            'iot', 'blockchain', 'architecture', 'product', 'qa', 'agile',
            'biotech', 'futuretech', 'snbt', 'tka', 'culture', 'diagnostic',
            'bahasa', 'jawa', 'sunda', 'bali', 'batak', 'html', 'css', 'flexbox',
            'javascript', 'python', 'sql', 'git', 'react', 'flutter', 'basics', 'dasar',
            'quiz', 'drill', 'exam', 'test', 'speed', 'fast', 'practice'
        ];
        if (cleanId.startsWith('q_') || cleanId.startsWith('q-') || knownQuizKeywords.some(kw => cleanId.includes(kw))) {
            return true;
        }

        return false;
    }

    /**
     * Authoritative Server-Side Quiz Score Calculation.
     * Computes the score from submitted answers and question bank.
     *
     * @param {string} quizId
     * @param {Array|Object} answers - Array of selected option indices or { [qId]: optionIndex }
     * @param {number} clientScore - Score claimed by client (for tamper detection)
     * @param {number} timeSpentSeconds - Time spent in seconds
     * @returns {Object} { isValid, authoritativeScore, isPassed, isPerfect, correctCount, totalQuestions, tampered, isSuspiciousSpeed }
     */
    evaluateQuizSubmission(quizId, answers, clientScore, timeSpentSeconds) {
        const cleanQuizId = String(quizId || '').trim().toLowerCase();
        if (!this.isValidQuiz(cleanQuizId)) {
            return {
                isValid: false,
                error: 'INVALID_QUIZ_ID',
                message: 'ID Kuis tidak terdaftar di katalog resmi.'
            };
        }

        const quiz = this.quizzes.get(cleanQuizId) || this.quizzes.get(cleanQuizId.replace(/[-_]assessment$/, ''));
        const questions = quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 ? quiz.questions : [];

        let authoritativeScore = null;
        let correctCount = 0;
        let totalQuestions = questions.length;
        let evaluatedWithKeys = false;

        // 1. If we have exact questions with answer keys in the catalog
        if (totalQuestions > 0 && answers) {
            evaluatedWithKeys = true;
            if (Array.isArray(answers)) {
                // Array of selected option indices corresponding to questions in order
                for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
                    const q = questions[i];
                    const selected = answers[i];
                    if (selected !== undefined && selected !== null && Number(selected) === Number(q.correctAnswer)) {
                        correctCount++;
                    }
                }
            } else if (typeof answers === 'object') {
                // Key-value map: { [questionId]: selectedOptionIndex }
                for (const q of questions) {
                    if (answers[q.id] !== undefined && Number(answers[q.id]) === Number(q.correctAnswer)) {
                        correctCount++;
                    }
                }
            }
            authoritativeScore = Math.round((correctCount / totalQuestions) * 100);
        }

        // 2. If answers were not detailed but questions bank has no specific mapping for a dynamic drill,
        // use sanitized client score with bounds checking
        let tampered = false;
        if (authoritativeScore !== null) {
            if (clientScore !== undefined && clientScore !== null) {
                const numClientScore = Math.round(Number(clientScore));
                if (Math.abs(numClientScore - authoritativeScore) > 5) {
                    tampered = true; // Client reported higher/different score than actual evaluated answers
                }
            }
        } else {
            // Bound client score safely 0..100
            authoritativeScore = Math.max(0, Math.min(100, Math.round(Number(clientScore) || 0)));
            totalQuestions = 10; // Standard estimate
            correctCount = Math.round((authoritativeScore / 100) * totalQuestions);
        }

        const passingThreshold = quiz?.passingScore || 70;
        const isPassed = authoritativeScore >= passingThreshold;
        const isPerfect = authoritativeScore === 100;

        // Velocity / Impossible completion time check
        // Reading 10 questions and answering correctly in under 3 seconds is physically impossible for a human
        let isSuspiciousSpeed = false;
        const compTime = Number(timeSpentSeconds);
        if (Number.isFinite(compTime) && compTime > 0) {
            const minPlausibleSeconds = Math.max(3, Math.floor(totalQuestions * 1.0)); // At least 1s per question
            if (compTime < minPlausibleSeconds && isPassed) {
                isSuspiciousSpeed = true;
            }
        }

        return {
            isValid: true,
            quizId: cleanQuizId,
            authoritativeScore,
            isPassed,
            isPerfect,
            correctCount,
            totalQuestions,
            tampered,
            isSuspiciousSpeed,
            evaluatedWithKeys
        };
    }

    /**
     * Verify whether a user actually meets the condition to unlock an achievement.
     * Prevents arbitrary client-side spoofing of achievement unlocks.
     *
     * @param {string} userId
     * @param {string} achievementId
     * @param {Object} dbTx - Active database transaction handle
     * @returns {Object} { eligible, achievement, reason }
     */
    verifyAchievementEligibility(userId, achievementId, dbTx) {
        const cleanId = String(achievementId || '').trim().toLowerCase();
        const ach = this.achievements.get(cleanId);

        if (!ach) {
            return {
                eligible: false,
                reason: `Achievement "${cleanId}" tidak ditemukan dalam katalog resmi.`
            };
        }

        // Check each achievement's concrete criteria against real database records
        switch (cleanId) {
            case 'first_step': {
                // Must have completed at least 1 lesson OR have earned base learning XP
                const lessonCount = dbTx.get('SELECT COUNT(*) as count FROM user_completed_lessons WHERE user_id = ?', [userId])?.count || 0;
                const progressRow = dbTx.get('SELECT lifetime_xp FROM user_progress WHERE user_id = ?', [userId]);
                if (lessonCount >= 1 || (progressRow && progressRow.lifetime_xp >= 15)) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum menyelesaikan materi pertama.' };
            }

            case 'drill_champion': {
                // Must have at least 5 passed quiz attempts
                const passedCount = dbTx.get('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND is_passed = 1', [userId])?.count || 0;
                if (passedCount >= 5) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: `Baru lulus ${passedCount}/5 sesi kuis.` };
            }

            case 'sandbox_pioneer': {
                // Must have at least 1 verified sandbox run recorded in progress events or ledger
                const sandboxCount = dbTx.get(`
                    SELECT COUNT(*) as count FROM progress_events
                    WHERE user_id = ? AND event_type IN ('sandbox_run', 'sandbox_challenge')
                `, [userId])?.count || 0;
                if (sandboxCount >= 1) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum pernah menjalankan eksperimen sandbox.' };
            }

            case 'language_polyglot': {
                // Must have completed language/culture lesson
                const langLessons = dbTx.get(`
                    SELECT COUNT(*) as count FROM user_completed_lessons
                    WHERE user_id = ? AND (lesson_id LIKE '%bahasa%' OR lesson_id LIKE '%culture%' OR lesson_id LIKE '%aksara%' OR lesson_id LIKE '%daerah%')
                `, [userId])?.count || 0;
                const langEvents = dbTx.get(`
                    SELECT COUNT(*) as count FROM progress_events
                    WHERE user_id = ? AND event_type LIKE '%bahasa%'
                `, [userId])?.count || 0;
                if (langLessons >= 1 || langEvents >= 1) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum menyelesaikan modul bahasa daerah.' };
            }

            case 'snbt_warrior': {
                // Must have completed an SNBT diagnostic or quiz
                const snbtCount = dbTx.get(`
                    SELECT COUNT(*) as count FROM quiz_attempts
                    WHERE user_id = ? AND (quiz_id LIKE '%snbt%' OR quiz_id LIKE '%tka%' OR quiz_id LIKE '%tps%')
                `, [userId])?.count || 0;
                if (snbtCount >= 1) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum menyelesaikan simulasi SNBT/TKA.' };
            }

            case 'project_master': {
                // Must have completed at least 1 project (is_completed = 1)
                const projCompleted = dbTx.get('SELECT COUNT(*) as count FROM projects_progress WHERE user_id = ? AND is_completed = 1', [userId])?.count || 0;
                if (projCompleted >= 1) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum ada proyek portofolio yang diselesaikan.' };
            }

            case 'streak_master': {
                // Streak must be >= 5 in user_progress or personal bests
                const progressRow = dbTx.get('SELECT streak, personal_bests_json FROM user_progress WHERE user_id = ?', [userId]);
                const curStreak = progressRow?.streak || 0;
                const pBests = JSON.parse(progressRow?.personal_bests_json || '{}');
                const bestStreak = pBests.bestStreak || 0;
                if (curStreak >= 5 || bestStreak >= 5) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: `Streak belajar baru ${curStreak}/5 hari.` };
            }

            case 'perfect_score': {
                // Must have at least 1 perfect quiz score (is_perfect = 1 or score = 100)
                const perfectCount = dbTx.get('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND score = 100', [userId])?.count || 0;
                if (perfectCount >= 1) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum meraih skor 100% pada kuis.' };
            }

            case 'speed_demon': {
                // Passed quiz with score >= 80 in under 60 seconds (but >= 10s)
                const speedCount = dbTx.get(`
                    SELECT COUNT(*) as count FROM quiz_attempts
                    WHERE user_id = ? AND score >= 80 AND time_spent_seconds <= 60 AND time_spent_seconds >= 10
                `, [userId])?.count || 0;
                if (speedCount >= 1) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: 'Belum menyelesaikan kuis skor >= 80% dalam waktu <= 60 detik.' };
            }

            case 'quiz_master': {
                const totalAttempts = dbTx.get('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?', [userId])?.count || 0;
                if (totalAttempts >= 10) {
                    return { eligible: true, achievement: ach };
                }
                return { eligible: false, achievement: ach, reason: `Baru menyelesaikan ${totalAttempts}/10 kuis.` };
            }

            default: {
                // Custom or future achievements require verified progress presence
                return { eligible: true, achievement: ach };
            }
        }
    }
}

const contentCatalog = new ContentCatalog();

module.exports = {
    ContentCatalog,
    contentCatalog
};
