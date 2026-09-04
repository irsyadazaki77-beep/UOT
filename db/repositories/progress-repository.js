/**
 * UNIVERSE OF TECH - PROGRESS REPOSITORY
 * FASE 19: Server-Verified Progression, Authoritative Catalog, Reward Ledger & Anti-Cheat
 */

const AdaptiveLearningEngine = require('../../public/adaptive-learning-engine');
const { contentCatalog } = require('../content-catalog');
const { RewardLedger } = require('../reward-ledger');
const { REWARD_POLICY } = require('../reward-policy');

const SERVER_REWARDS = Object.freeze({
    READ_LESSON: { xp: 15, coins: 8, reason: "Membaca Bagian Materi" },
    COMPLETE_CHAPTER: { xp: 50, coins: 25, reason: "Menyelesaikan Bab Materi" },
    QUIZ_PASSED: { xp: 40, coins: 20, reason: "Menyelesaikan Kuis (Lulus)" },
    QUIZ_PERFECT: { xp: 75, coins: 40, reason: "Skor Sempurna Kuis (100%)" },
    SANDBOX_RUN: { xp: 15, coins: 8, reason: "Eksperimen Kode di Sandbox" },
    SANDBOX_CHALLENGE: { xp: 60, coins: 30, reason: "Menyelesaikan Lab Tantangan" },
    PROJECT_STEP: { xp: 25, coins: 12, reason: "Menyelesaikan Langkah Proyek" },
    PROJECT_COMPLETE: { xp: 120, coins: 60, reason: "Menyelesaikan Proyek Portofolio" },
    DAILY_MISSION: { xp: 40, coins: 20, reason: "Menyelesaikan Misi Harian" },
    DAILY_ALL_CLEAR: { xp: 80, coins: 40, reason: "Semua Misi Harian Selesai" }
});

const ACHIEVEMENTS_CATALOG = Object.freeze([
    { id: "first_step", title: "First Step Coder", xp: 50, coins: 25 },
    { id: "drill_champion", title: "Drill Champion", xp: 75, coins: 35 },
    { id: "sandbox_pioneer", title: "Sandbox Pioneer", xp: 100, coins: 50 },
    { id: "language_polyglot", title: "Language Polyglot", xp: 150, coins: 75 },
    { id: "snbt_warrior", title: "SNBT Conqueror", xp: 200, coins: 100 },
    { id: "project_master", title: "Portfolio Architect", xp: 200, coins: 100 },
    { id: "streak_master", title: "Consistent Coder", xp: 150, coins: 75 }
]);

const WEEKLY_CHALLENGES_CATALOG = Object.freeze([
    {
        id: "ch_lessons_3",
        title: "Kuasai 3 Materi",
        description: "Selesaikan 3 bagian materi pembelajaran minggu ini.",
        metric: "lessons",
        target: 3,
        rewardXp: 100,
        rewardCoins: 50
    },
    {
        id: "ch_quiz_10",
        title: "Prajurit Kuis",
        description: "Selesaikan 10 sesi kuis atau soal latihan minggu ini.",
        metric: "quizzes",
        target: 10,
        rewardXp: 120,
        rewardCoins: 60
    },
    {
        id: "ch_streak_5",
        title: "Konsistensi 5 Hari",
        description: "Jaga streak belajar minimal 5 hari berturut-turut.",
        metric: "streak",
        target: 5,
        rewardXp: 150,
        rewardCoins: 75
    },
    {
        id: "ch_project_1",
        title: "Portfolio Builder",
        description: "Selesaikan 1 proyek portofolio.",
        metric: "projects",
        target: 1,
        rewardXp: 200,
        rewardCoins: 100
    }
]);

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
                percentage
            };
        }
        accumulated += neededForNext;
        level++;
    }
}

function getISOWeekKey(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function getStartOfMonth(date = new Date()) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

class ProgressRepository {
    constructor(dbAdapter) {
        this.db = dbAdapter;
        this.rewardLedger = new RewardLedger(this.db);
    }

    async getUserProgress(userId) {
        if (!userId) return null;

        // Check if progress row exists
        let row = await this.db.getAsync('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
        if (!row) {
            await this._initUserProgress(userId);
            row = await this.db.getAsync('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
        }

        return this._assembleFullProgress(userId, row);
    }

    async _initUserProgress(userId) {
        let userRow = await this.db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
        const now = new Date().toISOString();
        if (!userRow) {
            await this.db.runAsync(`
                INSERT INTO users (id, username, email, password_hash, salt, role, is_pro, created_at, updated_at)
                VALUES (?, ?, ?, 'auto', 'auto', 'user', 0, ?, ?)
                ON CONFLICT (id) DO NOTHING
            `, [userId, userId, `${userId}@auto.local`, now, now]);
            userRow = await this.db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
        }

        const defaultSettings = {
            theme: "light",
            soundEnabled: true,
            studyMode: "balanced",
            dailyGoal: 30,
            language: "id",
            reducedMotion: false,
            publicProfile: true,
            analytics: true,
            showOnLeaderboard: true,
            displayName: userRow?.username || "Pengguna Universe",
            privateProfile: false
        };

        const defaultBests = {
            bestWeeklyXp: 0,
            bestStreak: 0,
            highestQuizScore: 0,
            fastestQuizCompletionSeconds: null
        };

        await this.db.runAsync(`
            INSERT INTO user_progress (
                user_id, lifetime_xp, level, coins, streak, last_active_date, streak_freeze_count,
                equipped_avatar, equipped_theme, equipped_accent, flagged,
                settings_json, personal_bests_json, created_at, updated_at
            ) VALUES (?, 0, 1, 50, 0, NULL, 0, '👨‍💻', 'ocean', 'ocean', 0, ?, ?, ?, ?)
            ON CONFLICT (user_id) DO NOTHING
        `, [
            userId,
            JSON.stringify(defaultSettings),
            JSON.stringify(defaultBests),
            now,
            now
        ]);

        await this.db.runAsync(`
            INSERT INTO user_inventory (user_id, item_id, unlocked_at)
            VALUES (?, '👨‍💻', ?)
            ON CONFLICT (user_id, item_id) DO NOTHING
        `, [userId, now]);
    }

    async _assembleFullProgress(userId, row) {
        const userRow = await this.db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
        const completedLessonsRows = await this.db.allAsync('SELECT lesson_id FROM user_completed_lessons WHERE user_id = ?', [userId]);
        const completedLessons = completedLessonsRows.map(r => r.lesson_id);

        const achievementsRows = await this.db.allAsync('SELECT achievement_id FROM achievements WHERE user_id = ?', [userId]);
        const achievementsList = achievementsRows.map(r => r.achievement_id);

        const inventoryRows = await this.db.allAsync('SELECT item_id FROM user_inventory WHERE user_id = ?', [userId]);
        const inventoryList = inventoryRows.map(r => r.item_id);

        // Quiz history map
        const quizRows = await this.db.allAsync('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at ASC', [userId]);
        const quizHistory = {};
        for (const q of quizRows) {
            if (!quizHistory[q.quiz_id]) {
                quizHistory[q.quiz_id] = { attempts: 0, bestScore: 0, passed: false, lastScore: 0 };
            }
            quizHistory[q.quiz_id].attempts++;
            quizHistory[q.quiz_id].lastScore = q.score;
            if (q.score > quizHistory[q.quiz_id].bestScore) {
                quizHistory[q.quiz_id].bestScore = q.score;
            }
            if (q.is_passed) quizHistory[q.quiz_id].passed = true;
        }

        // Project progress map
        const projectRows = await this.db.allAsync('SELECT * FROM projects_progress WHERE user_id = ?', [userId]);
        const projectProgress = {};
        for (const pr of projectRows) {
            projectProgress[pr.project_id] = {
                currentStep: pr.current_step,
                completedSteps: JSON.parse(pr.completed_steps_json || '[]'),
                isCompleted: !!pr.is_completed,
                updatedAt: pr.updated_at
            };
        }

        // Processed events ledger (last 100 for fast idempotency cache & metrics)
        const eventRows = await this.db.allAsync('SELECT * FROM progress_events WHERE user_id = ? ORDER BY server_timestamp DESC LIMIT 100', [userId]);
        const processedEvents = {};
        const xpLedger = [];
        for (const ev of eventRows) {
            processedEvents[ev.event_id] = {
                eventType: ev.event_type,
                timestamp: ev.server_timestamp,
                xpAwarded: ev.xp_awarded,
                coinsAwarded: ev.coins_awarded,
                result: JSON.parse(ev.result_json || '{}')
            };
            if (ev.xp_awarded > 0) {
                xpLedger.push({
                    eventId: ev.event_id,
                    eventType: ev.event_type,
                    xp: ev.xp_awarded,
                    coins: ev.coins_awarded,
                    reason: ev.reason,
                    timestamp: ev.server_timestamp
                });
            }
        }

        // Social relationships
        const followingRows = await this.db.allAsync('SELECT following_id FROM followers WHERE follower_id = ?', [userId]);
        const following = followingRows.map(r => r.following_id);
        const followersRows = await this.db.allAsync('SELECT follower_id FROM followers WHERE following_id = ?', [userId]);
        const followers = followersRows.map(r => r.follower_id);

        // Notifications
        const notificationRows = await this.db.allAsync('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
        const notifications = notificationRows.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: !!n.is_read,
            createdAt: n.created_at,
            data: JSON.parse(n.data_json || '{}')
        }));

        // Friend Challenges
        const challengeRows = await this.db.allAsync('SELECT * FROM challenges WHERE creator_id = ? OR target_id = ? ORDER BY created_at DESC LIMIT 20', [userId, userId]);
        const challenges = challengeRows.map(c => ({
            id: c.id,
            creatorId: c.creator_id,
            targetId: c.target_id,
            challengeType: c.challenge_type,
            targetGoal: c.target_goal,
            creatorProgress: c.creator_progress,
            targetProgress: c.target_progress,
            status: c.status,
            winnerId: c.winner_id,
            createdAt: c.created_at,
            updatedAt: c.updated_at
        }));

        // Suspicious flags
        const suspiciousFlagRows = await this.db.allAsync('SELECT * FROM suspicious_flags WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        const suspiciousFlags = suspiciousFlagRows.map(s => ({
            id: s.id,
            reason: s.reason,
            eventId: s.event_id,
            timestamp: s.created_at
        }));

        const settings = JSON.parse(row.settings_json || '{}');
        const personalBests = JSON.parse(row.personal_bests_json || '{}');
        const dailyMissions = JSON.parse(row.daily_missions_json || '{}');
        const weeklyMissions = JSON.parse(row.weekly_missions_json || '{}');
        const challengeProgress = JSON.parse(row.challenge_progress_json || '{}');
        const recommendationHistory = JSON.parse(row.recommendation_history_json || '[]');

        // Build full attempt history for adaptive learning
        const attemptHistory = quizRows.map(q => {
            let answers = null;
            try { if (q.answers_json) answers = JSON.parse(q.answers_json); } catch (e) {}
            let meta = null;
            try { if (q.metadata_json) meta = JSON.parse(q.metadata_json); } catch (e) {}
            const skillId = q.skill || (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.getActivityMetadata === 'function' ? AdaptiveLearningEngine.getActivityMetadata(q.quiz_id).skill : 'javascript_basics');
            return {
                id: q.id,
                quizId: q.quiz_id,
                skill: skillId,
                topic: q.topic || q.quiz_id,
                difficulty: Number(q.difficulty) || 1,
                score: q.score,
                correct: !!q.is_passed,
                isCorrect: !!q.is_passed,
                isPassed: !!q.is_passed,
                isPerfect: !!q.is_perfect,
                timeSpentSeconds: q.time_spent_seconds,
                attemptNumber: q.attempt_number,
                usedHint: (q.hint_count || 0) > 0,
                hintCount: q.hint_count || 0,
                answers,
                metadata: meta,
                timestamp: q.created_at
            };
        });

        let mastery = {};
        let recommendations = null;
        if (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.generateRecommendations === 'function') {
            try {
                recommendations = AdaptiveLearningEngine.generateRecommendations(attemptHistory, recommendationHistory);
                mastery = recommendations.masterySummary || {};
            } catch (err) {
                console.warn('[ProgressRepository] Error generating recommendations:', err);
            }
        }

        const levelMetrics = calculateLevelMetrics(row.lifetime_xp);

        return {
            userId,
            schemaVersion: 6,
            profile: {
                username: userRow?.username || settings.displayName || "Pengguna Universe",
                email: userRow?.email || "",
                avatar: row.equipped_avatar || "👨‍💻",
                title: levelMetrics.level >= 10 ? "Arch-Magus Coder" : levelMetrics.level >= 5 ? "Cyber Warrior" : "Script Kiddie",
                role: userRow?.role || "user",
                isPro: !!userRow?.is_pro
            },
            lifetimeXp: row.lifetime_xp,
            level: levelMetrics.level,
            coins: row.coins,
            streak: row.streak,
            lastActiveDate: row.last_active_date,
            streakFreezeCount: row.streak_freeze_count,
            achievements: achievementsList,
            inventory: inventoryList.length ? inventoryList : ["👨‍💻"],
            equippedItems: {
                avatar: row.equipped_avatar || "👨‍💻",
                theme: row.equipped_theme || "ocean",
                accent: row.equipped_accent || "ocean"
            },
            learningProgress: {
                completedLessons,
                chapterProgress: {}
            },
            quizHistory,
            projectProgress,
            missionProgress: {
                daily: dailyMissions,
                weekly: weeklyMissions
            },
            settings,
            attemptHistory,
            mastery,
            recommendations,
            recommendationHistory,
            processedEvents,
            xpLedger,
            flagged: !!(row.flagged || (suspiciousFlags && suspiciousFlags.length > 0)),
            suspiciousFlags,
            following,
            followers,
            personalBests: {
                bestWeeklyXp: personalBests.bestWeeklyXp || 0,
                bestStreak: personalBests.bestStreak || 0,
                highestQuizScore: personalBests.highestQuizScore || 0,
                fastestQuizCompletionSeconds: personalBests.fastestQuizCompletionSeconds || null
            },
            challengeProgress: {
                weekKey: challengeProgress.weekKey || null,
                claims: challengeProgress.claims || {}
            },
            friendChallenges: challenges,
            notifications,
            updatedAt: row.updated_at
        };
    }

    /**
     * Process Activity Event within an ACID SQL transaction with server-authoritative verification,
     * Content Catalog validation, score evaluation, duplicate reward prevention, and immutable ledger recording.
     */
    async processActivityEvent(userId, event) {
        if (!userId || !event || typeof event !== 'object') {
            return { ok: false, error: "INVALID_REQUEST", message: "Event payload tidak valid." };
        }

        const { eventId, eventType, clientTimestamp, payload = {} } = event;

        if (!eventId || typeof eventId !== 'string') {
            return { ok: false, error: "MISSING_EVENT_ID", message: "Event harus memiliki eventId unik." };
        }

        // STRICT CHECK: Reject arbitrary XP submissions
        if ('xp' in event || ('xp' in payload && !['quiz_complete', 'achievement_unlock', 'sandbox_run', 'lesson_complete', 'project_complete', 'project_step', 'daily_mission_claim'].includes(eventType))) {
            return {
                ok: false,
                error: "ARBITRARY_XP_REJECTED",
                message: "Submisi XP arbitrary ditolak oleh server. Gunakan event terverifikasi."
            };
        }

        // Check if event already exists in database (Idempotency)
        const existingEvent = await this.db.getAsync('SELECT * FROM progress_events WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (existingEvent) {
            const currentProgress = await this.getUserProgress(userId);
            return {
                ok: true,
                alreadyProcessed: true,
                eventId,
                result: JSON.parse(existingEvent.result_json || '{}'),
                progress: this.sanitizeProgressForResponse(currentProgress)
            };
        }

        // Execute processing inside ACID SQL transaction
        return this.db.transactionAsync(async (tx) => {
            const getFn = (sql, params) => tx.getAsync ? tx.getAsync(sql, params) : Promise.resolve(tx.get(sql, params));
            const runFn = (sql, params) => tx.runAsync ? tx.runAsync(sql, params) : Promise.resolve(tx.run(sql, params));

            // Ensure user progress row exists
            let progressRow = await getFn('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
            if (!progressRow) {
                await this._initUserProgress(userId);
                progressRow = await getFn('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
            }

            const now = new Date();
            const eventTime = (event.timestamp || event.clientTimestamp) ? new Date(event.timestamp || event.clientTimestamp) : now;
            const serverTimestamp = isNaN(eventTime.getTime()) ? now.toISOString() : eventTime.toISOString();
            const todayStr = (isNaN(eventTime.getTime()) ? now : eventTime).toISOString().split('T')[0];

            // Anti-abuse velocity checks
            const recent10sXpRow = await getFn(`
                SELECT COALESCE(SUM(xp_awarded), 0) as totalXp
                FROM progress_events
                WHERE user_id = ? AND server_timestamp >= ?
            `, [userId, new Date(now.getTime() - 10000).toISOString()]);

            const recent1hXpRow = await getFn(`
                SELECT COALESCE(SUM(xp_awarded), 0) as totalXp
                FROM progress_events
                WHERE user_id = ? AND server_timestamp >= ?
            `, [userId, new Date(now.getTime() - 3600000).toISOString()]);

            if (recent10sXpRow && recent10sXpRow.totalXp > 500) {
                await runFn('UPDATE user_progress SET flagged = 1 WHERE user_id = ?', [userId]);
                await runFn(`
                    INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `XP Spike Abnormal: Earnt ${recent10sXpRow.totalXp} XP in 10s (severity: high)`, eventId, serverTimestamp]);
            } else if (recent1hXpRow && recent1hXpRow.totalXp > 3000) {
                await runFn('UPDATE user_progress SET flagged = 1 WHERE user_id = ?', [userId]);
                await runFn(`
                    INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `XP Spike Abnormal: Earnt ${recent1hXpRow.totalXp} XP in 1h (severity: high)`, eventId, serverTimestamp]);
            }

            let ledgerResult = null;
            let actionResult = {};

            switch (eventType) {
                case 'lesson_complete':
                case 'read_lesson': {
                    const lessonId = String(payload.lessonId || payload.chapterId || "").trim();
                    if (!lessonId) {
                        return { ok: false, error: "INVALID_PAYLOAD", message: "lessonId diperlukan." };
                    }

                    // 1. Authoritative Content Catalog Verification
                    if (!contentCatalog.isValidLesson(lessonId)) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, lessonId, "Invalid Lesson ID", serverTimestamp);
                        await runFn(`
                            INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `Materi tidak terdaftar di katalog: ${lessonId} (severity: medium)`, eventId, serverTimestamp]);
                        return { ok: false, error: "INVALID_LESSON_ID", message: `Materi "${lessonId}" tidak ditemukan di katalog kurikulum resmi.` };
                    }

                    // 2. Check first completion vs replay
                    const existingLesson = await getFn('SELECT * FROM user_completed_lessons WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);
                    const isFirstCompletion = !existingLesson;

                    if (isFirstCompletion) {
                        await runFn('INSERT INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES (?, ?, ?)', [userId, lessonId, serverTimestamp]);
                    }

                    // 3. Process Reward Mutation via Ledger
                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'lesson_complete',
                        contentId: lessonId,
                        policyKey: 'READ_LESSON',
                        isFirstCompletion,
                        clientTimestamp,
                        serverTimestamp
                    });

                    actionResult = { lessonId, isNew: isFirstCompletion, isReplay: !isFirstCompletion };
                    break;
                }

                case 'chapter_complete': {
                    const chapterId = String(payload.chapterId || "").trim();
                    if (!chapterId) {
                        return { ok: false, error: "INVALID_PAYLOAD", message: "chapterId diperlukan." };
                    }

                    if (!contentCatalog.isValidLesson(chapterId)) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, chapterId, "Invalid Chapter ID", serverTimestamp);
                        return { ok: false, error: "INVALID_CHAPTER_ID", message: `Bab materi "${chapterId}" tidak ditemukan di katalog kurikulum resmi.` };
                    }

                    const existingChapter = await getFn('SELECT * FROM user_completed_lessons WHERE user_id = ? AND lesson_id = ?', [userId, chapterId]);
                    const isFirstCompletion = !existingChapter;

                    if (isFirstCompletion) {
                        await runFn('INSERT INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES (?, ?, ?)', [userId, chapterId, serverTimestamp]);
                    }

                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'chapter_complete',
                        contentId: chapterId,
                        policyKey: 'COMPLETE_CHAPTER',
                        isFirstCompletion,
                        clientTimestamp,
                        serverTimestamp
                    });

                    actionResult = { chapterId, isNew: isFirstCompletion };
                    break;
                }

                case 'quiz_complete': {
                    const quizId = String(payload.quizId || "").trim();
                    if (!quizId) {
                        return { ok: false, error: "INVALID_PAYLOAD", message: "quizId diperlukan." };
                    }

                    // 1. Authoritative Quiz ID Verification
                    if (!contentCatalog.isValidQuiz(quizId)) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, quizId, "Invalid Quiz ID", serverTimestamp);
                        await runFn(`
                            INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `Kuis tidak terdaftar di katalog: ${quizId} (severity: medium)`, eventId, serverTimestamp]);
                        return { ok: false, error: "INVALID_QUIZ_ID", message: `Kuis "${quizId}" tidak ditemukan di bank soal resmi.` };
                    }

                    // 2. Server-Authoritative Score Evaluation
                    const compTime = Number(payload.completionTimeSeconds) || 0;
                    const evaluation = contentCatalog.evaluateQuizSubmission(quizId, payload.answers, payload.score, compTime);

                    if (evaluation.tampered) {
                        await runFn(`
                            INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `Manipulasi Skor Kuis: Client klaim ${payload.score} vs Evaluasi Server ${evaluation.authoritativeScore} (severity: high)`, eventId, serverTimestamp]);
                        await runFn('UPDATE user_progress SET flagged = 1 WHERE user_id = ?', [userId]);
                    }

                    if (evaluation.isSuspiciousSpeed) {
                        await runFn(`
                            INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `Kecepatan Kuis Mencurigakan: Selesai ${quizId} dalam ${compTime}s (severity: high)`, eventId, serverTimestamp]);
                        await runFn('UPDATE user_progress SET flagged = 1 WHERE user_id = ?', [userId]);
                    }

                    const score = evaluation.authoritativeScore;
                    const isPassed = evaluation.isPassed;
                    const isPerfect = evaluation.isPerfect;

                    // 3. Attempt History & First Pass Detection
                    const prevAttempts = await getFn(`
                        SELECT COUNT(*) as count, MAX(is_passed) as hadPassed, MAX(is_perfect) as hadPerfect
                        FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?
                    `, [userId, quizId]);

                    const attemptNumber = (prevAttempts?.count || 0) + 1;
                    const isFirstPass = isPassed && !prevAttempts?.hadPassed;
                    const isFirstPerfect = isPerfect && !prevAttempts?.hadPerfect;

                    // Extract Adaptive Learning Metadata
                    const actMeta = (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.getActivityMetadata === 'function')
                        ? AdaptiveLearningEngine.getActivityMetadata(quizId)
                        : {};
                    const skillId = String(payload.skill || actMeta.skill || "javascript_basics").trim();
                    const topic = String(payload.topic || actMeta.topic || quizId).trim();
                    const difficulty = Number(payload.difficulty || actMeta.difficulty || 1);
                    const hintCount = Number(payload.hintCount !== undefined ? payload.hintCount : (payload.usedHint ? 1 : 0)) || 0;
                    const answersJson = payload.answers ? JSON.stringify(payload.answers) : null;
                    const metadataJson = payload.metadata ? JSON.stringify(payload.metadata) : null;

                    await runFn(`
                        INSERT INTO quiz_attempts (
                            id, user_id, quiz_id, score, is_passed, is_perfect, time_spent_seconds, attempt_number,
                            skill, topic, difficulty, answers_json, hint_count, metadata_json, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        userId,
                        quizId,
                        score,
                        isPassed ? 1 : 0,
                        isPerfect ? 1 : 0,
                        compTime,
                        attemptNumber,
                        skillId,
                        topic,
                        difficulty,
                        answersJson,
                        hintCount,
                        metadataJson,
                        serverTimestamp
                    ]);

                    // 4. Reward policy based on pass & perfection
                    if (isPerfect) {
                        ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                            userId,
                            eventId,
                            eventType: 'quiz_complete_perfect',
                            contentId: quizId,
                            policyKey: 'QUIZ_PERFECT',
                            isFirstCompletion: isFirstPerfect,
                            timeSpentSeconds: compTime,
                            clientTimestamp,
                            serverTimestamp
                        });
                    } else if (isPassed) {
                        ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                            userId,
                            eventId,
                            eventType: 'quiz_complete',
                            contentId: quizId,
                            policyKey: 'QUIZ_PASSED',
                            isFirstCompletion: isFirstPass,
                            timeSpentSeconds: compTime,
                            clientTimestamp,
                            serverTimestamp
                        });
                    } else {
                        // Did not pass: small attempt effort reward
                        ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                            userId,
                            eventId,
                            eventType: 'quiz_attempt',
                            contentId: quizId,
                            customReward: { xp: 5, coins: 2, reason: "Mencoba Latihan Kuis (Belum Lulus)" },
                            isFirstCompletion: false,
                            timeSpentSeconds: compTime,
                            clientTimestamp,
                            serverTimestamp
                        });
                    }

                    // Update personal bests
                    const pb = JSON.parse(progressRow.personal_bests_json || '{}');
                    if (score > (pb.highestQuizScore || 0)) {
                        pb.highestQuizScore = score;
                    }
                    if (compTime > 0 && (!pb.fastestQuizCompletionSeconds || compTime < pb.fastestQuizCompletionSeconds)) {
                        pb.fastestQuizCompletionSeconds = compTime;
                    }
                    await runFn('UPDATE user_progress SET personal_bests_json = ? WHERE user_id = ?', [JSON.stringify(pb), userId]);

                    actionResult = {
                        quizId,
                        score,
                        isPassed,
                        isPerfect,
                        attemptNumber,
                        authoritativeScore: score,
                        serverEvaluated: true
                    };
                    break;
                }

                case 'project_step': {
                    const projectId = String(payload.projectId || "").trim();
                    const stepNumber = Number(payload.stepNumber || payload.step || 1);

                    if (!projectId) {
                        return { ok: false, error: "INVALID_PAYLOAD", message: "projectId diperlukan." };
                    }

                    if (!contentCatalog.isValidProject(projectId)) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, projectId, "Invalid Project ID", serverTimestamp);
                        return { ok: false, error: "INVALID_PROJECT_ID", message: `Proyek "${projectId}" tidak ditemukan di katalog resmi.` };
                    }

                    // Check if step number is valid
                    if (!contentCatalog.isValidProjectStep(projectId, stepNumber)) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, `${projectId}:${stepNumber}`, "Invalid Step Number", serverTimestamp);
                        return { ok: false, error: "INVALID_STEP_NUMBER", message: `Langkah ${stepNumber} tidak valid untuk proyek "${projectId}".` };
                    }

                    // Check if step was already completed by this user
                    const existingStep = await getFn('SELECT * FROM user_completed_steps WHERE user_id = ? AND project_id = ? AND step_number = ?', [userId, projectId, stepNumber]);
                    const isFirstStep = !existingStep;

                    if (isFirstStep) {
                        await runFn('INSERT INTO user_completed_steps (user_id, project_id, step_number, completed_at) VALUES (?, ?, ?, ?)', [userId, projectId, stepNumber, serverTimestamp]);
                    }

                    // Update projects_progress completed steps
                    const currentProj = await getFn('SELECT completed_steps_json FROM projects_progress WHERE user_id = ? AND project_id = ?', [userId, projectId]);
                    let stepArray = [];
                    try {
                        stepArray = currentProj ? JSON.parse(currentProj.completed_steps_json || '[]') : [];
                    } catch (_) {}
                    if (!stepArray.includes(stepNumber)) {
                        stepArray.push(stepNumber);
                    }

                    await runFn(`
                        INSERT INTO projects_progress (user_id, project_id, current_step, completed_steps_json, is_completed, created_at, updated_at)
                        VALUES (?, ?, ?, ?, 0, ?, ?)
                        ON CONFLICT(user_id, project_id) DO UPDATE SET
                            current_step = MAX(current_step, excluded.current_step),
                            completed_steps_json = excluded.completed_steps_json,
                            updated_at = excluded.updated_at
                    `, [userId, projectId, stepNumber, JSON.stringify(stepArray), serverTimestamp, serverTimestamp]);

                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'project_step',
                        contentId: `${projectId}:step${stepNumber}`,
                        policyKey: 'PROJECT_STEP',
                        isFirstCompletion: isFirstStep,
                        clientTimestamp,
                        serverTimestamp
                    });

                    actionResult = { projectId, stepNumber, isFirstStep };
                    break;
                }

                case 'project_complete': {
                    const projectId = String(payload.projectId || "").trim();
                    if (!projectId) {
                        return { ok: false, error: "INVALID_PAYLOAD", message: "projectId diperlukan." };
                    }

                    // 1. Authoritative Project ID Verification
                    if (!contentCatalog.isValidProject(projectId)) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, projectId, "Invalid Project ID", serverTimestamp);
                        await runFn(`
                            INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `Proyek tidak terdaftar di katalog: ${projectId} (severity: medium)`, eventId, serverTimestamp]);
                        return { ok: false, error: "INVALID_PROJECT_ID", message: `Proyek "${projectId}" tidak ditemukan di katalog resmi.` };
                    }

                    // 2. Check if project was already completed before (CRITICAL: Reward given strictly ONCE)
                    const existingProject = await getFn('SELECT is_completed FROM projects_progress WHERE user_id = ? AND project_id = ?', [userId, projectId]);
                    const wasAlreadyCompleted = !!(existingProject && existingProject.is_completed === 1);
                    const isFirstCompletion = !wasAlreadyCompleted;

                    await runFn(`
                        INSERT INTO projects_progress (user_id, project_id, current_step, completed_steps_json, is_completed, created_at, updated_at)
                        VALUES (?, ?, 10, ?, 1, ?, ?)
                        ON CONFLICT(user_id, project_id) DO UPDATE SET
                            is_completed = 1,
                            updated_at = excluded.updated_at
                    `, [userId, projectId, JSON.stringify([1, 2, 3, 4, 5]), serverTimestamp, serverTimestamp]);

                    // 3. Process Reward Mutation (oneTimeOnly = true in policy ensures replay = 0 XP)
                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'project_complete',
                        contentId: projectId,
                        policyKey: 'PROJECT_COMPLETE',
                        isFirstCompletion,
                        clientTimestamp,
                        serverTimestamp
                    });

                    actionResult = { projectId, isCompleted: true, isFirstCompletion, wasAlreadyCompleted };
                    break;
                }

                case 'achievement_unlock': {
                    const achievementId = String(payload.achievementId || "").trim();
                    if (!achievementId) {
                        return { ok: false, error: "INVALID_PAYLOAD", message: "achievementId diperlukan." };
                    }

                    // 1. Check if already unlocked in database
                    const existingAch = await getFn('SELECT * FROM achievements WHERE user_id = ? AND achievement_id = ?', [userId, achievementId]);
                    if (existingAch) {
                        return {
                            ok: true,
                            alreadyProcessed: true,
                            eventId,
                            awardedXp: 0,
                            awardedCoins: 0,
                            reason: "Pencapaian sudah dibuka sebelumnya.",
                            result: { achievementId, alreadyUnlocked: true },
                            progress: this.sanitizeProgressForResponse(await this.getUserProgress(userId))
                        };
                    }

                    // 2. Server-Authoritative Verification of Achievement Condition
                    const eligibility = contentCatalog.verifyAchievementEligibility(userId, achievementId, tx);
                    if (!eligibility.eligible) {
                        await this.rewardLedger.recordRejectedTransaction(tx, userId, eventId, eventType, achievementId, `Criteria not met: ${eligibility.reason}`, serverTimestamp);
                        await runFn(`
                            INSERT INTO suspicious_flags (id, user_id, reason, event_id, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        `, [`flag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, `Klaim achievement tidak terverifikasi: ${achievementId} (${eligibility.reason}) (severity: medium)`, eventId, serverTimestamp]);
                        return {
                            ok: false,
                            error: "ACHIEVEMENT_CRITERIA_NOT_MET",
                            message: eligibility.reason || "Kriteria pencapaian belum terpenuhi."
                        };
                    }

                    // 3. Unlock and award
                    const ach = eligibility.achievement;
                    await runFn('INSERT INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)', [userId, achievementId, serverTimestamp]);

                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'achievement_unlock',
                        contentId: achievementId,
                        customReward: { xp: ach.xp, coins: ach.coins, reason: `Pencapaian Terbuka: ${ach.title}` },
                        isFirstCompletion: true,
                        clientTimestamp,
                        serverTimestamp
                    });

                    actionResult = { achievementId, unlocked: true };
                    break;
                }

                case 'sandbox_run': {
                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'sandbox_run',
                        contentId: 'sandbox',
                        policyKey: 'SANDBOX_RUN',
                        isFirstCompletion: true,
                        clientTimestamp,
                        serverTimestamp
                    });
                    actionResult = { sandboxSuccess: true };
                    break;
                }

                case 'sandbox_challenge': {
                    const challengeId = String(payload.challengeId || "lab").trim();
                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'sandbox_challenge',
                        contentId: challengeId,
                        policyKey: 'SANDBOX_CHALLENGE',
                        isFirstCompletion: true,
                        clientTimestamp,
                        serverTimestamp
                    });
                    actionResult = { challengeId, challengeSuccess: true };
                    break;
                }

                case 'daily_mission_claim': {
                    const missionId = String(payload.missionId || "daily_all").trim();
                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType: 'daily_mission_claim',
                        contentId: `${missionId}:${todayStr}`,
                        policyKey: 'DAILY_MISSION',
                        isFirstCompletion: true,
                        clientTimestamp,
                        serverTimestamp
                    });
                    actionResult = { missionId, claimed: true };
                    break;
                }

                default: {
                    ledgerResult = await this.rewardLedger.processRewardMutation(tx, {
                        userId,
                        eventId,
                        eventType,
                        customReward: { xp: 5, coins: 2, reason: "Aktivitas Pembelajaran" },
                        isFirstCompletion: false,
                        clientTimestamp,
                        serverTimestamp
                    });
                    actionResult = { generic: true };
                    break;
                }
            }

            const awardedXp = ledgerResult ? ledgerResult.awardedXp : 0;
            const awardedCoins = ledgerResult ? ledgerResult.awardedCoins : 0;
            const reason = ledgerResult ? ledgerResult.reason : "Aktivitas Pembelajaran";

            // Streak calculation
            let newStreak = progressRow.streak;
            let lastDate = progressRow.last_active_date;
            if (!lastDate) {
                newStreak = 1;
                lastDate = todayStr;
            } else if (lastDate !== todayStr) {
                const prev = new Date(lastDate);
                const curr = new Date(todayStr);
                const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    if (progressRow.streak_freeze_count > 0) {
                        await runFn('UPDATE user_progress SET streak_freeze_count = streak_freeze_count - 1 WHERE user_id = ?', [userId]);
                    } else {
                        newStreak = 1;
                    }
                }
                lastDate = todayStr;
            }

            // Update user_progress totals (monotonic Lifetime XP invariant ensured by ledgerResult)
            const nextLifetimeXp = ledgerResult ? ledgerResult.balanceXpAfter : (progressRow.lifetime_xp + awardedXp);
            const nextCoins = ledgerResult ? ledgerResult.balanceCoinsAfter : (progressRow.coins + awardedCoins);
            const nextMetrics = calculateLevelMetrics(nextLifetimeXp);

            await runFn(`
                UPDATE user_progress SET
                    lifetime_xp = ?,
                    level = ?,
                    coins = ?,
                    streak = ?,
                    last_active_date = ?,
                    updated_at = ?
                WHERE user_id = ?
            `, [
                nextLifetimeXp,
                nextMetrics.level,
                nextCoins,
                newStreak,
                lastDate,
                serverTimestamp,
                userId
            ]);

            // Record Event in progress_events Ledger
            await runFn(`
                INSERT INTO progress_events (
                    event_id, user_id, event_type, client_timestamp, server_timestamp,
                    xp_awarded, coins_awarded, reason, payload_json, result_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                eventId,
                userId,
                eventType,
                clientTimestamp || null,
                serverTimestamp,
                awardedXp,
                awardedCoins,
                reason,
                JSON.stringify(payload),
                JSON.stringify({ ...actionResult, awardedXp, awardedCoins, newLevel: nextMetrics.level, ledgerStatus: ledgerResult?.status })
            ]);

            // Assemble and return updated progress
            const updatedRow = await getFn('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
            const updatedProgress = await this._assembleFullProgress(userId, updatedRow);

            return {
                ok: true,
                alreadyProcessed: false,
                eventId,
                awardedXp,
                awardedCoins,
                reason,
                ledgerStatus: ledgerResult?.status || 'APPLIED',
                rewardGiven: {
                    xp: awardedXp,
                    coins: awardedCoins,
                    reason
                },
                result: {
                    ...actionResult,
                    awardedXp,
                    awardedCoins,
                    newLevel: nextMetrics.level,
                    ledgerStatus: ledgerResult?.status || 'APPLIED'
                },
                progress: this.sanitizeProgressForResponse(updatedProgress)
            };
        });
    }

    /**
     * Batch Synchronization with Deterministic Event Acknowledgment (FASE 18 requirement)
     */
    async syncProgress(userId, { events = [], legacyData = null }) {
        if (!userId) return { ok: false, error: "INVALID_USER" };

        const results = [];
        const acknowledgedEventIds = [];
        const now = new Date().toISOString();

        await this.db.transactionAsync(async (tx) => {
            const getFn = (sql, params) => tx.getAsync ? tx.getAsync(sql, params) : Promise.resolve(tx.get(sql, params));
            const runFn = (sql, params) => tx.runAsync ? tx.runAsync(sql, params) : Promise.resolve(tx.run(sql, params));

            // 1. Process queued events in strict sequence
            if (Array.isArray(events) && events.length > 0) {
                for (const evt of events) {
                    if (!evt || !evt.eventId) continue;
                    const res = await this.processActivityEvent(userId, evt);
                    results.push({ eventId: evt.eventId, ok: res.ok, result: res.result, alreadyProcessed: !!res.alreadyProcessed });
                    if (res.ok) {
                        acknowledgedEventIds.push(evt.eventId);
                    }
                }
            }

            // 2. Deterministic conflict resolution for legacy data migration
            if (legacyData && typeof legacyData === 'object') {
                let curRow = await getFn('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
                if (!curRow) {
                    await this._initUserProgress(userId);
                    curRow = await getFn('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
                }

                if (curRow) {
                    const legacyXp = Number(legacyData.lifetimeXp) || 0;
                    const legacyCoins = Number(legacyData.coins) || 0;
                    const maxLifetimeXp = Math.max(curRow.lifetime_xp, legacyXp);
                    const mergedCoins = Math.max(curRow.coins, legacyCoins);
                    const metrics = calculateLevelMetrics(maxLifetimeXp);

                    await runFn(`
                        UPDATE user_progress SET
                            lifetime_xp = ?,
                            level = ?,
                            coins = ?,
                            updated_at = ?
                        WHERE user_id = ?
                    `, [maxLifetimeXp, metrics.level, mergedCoins, now, userId]);
                }

                // Union achievements
                if (Array.isArray(legacyData.achievements)) {
                    for (const ach of legacyData.achievements) {
                        if (ach) {
                            await runFn('INSERT INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?) ON CONFLICT (user_id, achievement_id) DO NOTHING', [userId, String(ach), now]);
                        }
                    }
                }

                // Union inventory
                if (Array.isArray(legacyData.inventory)) {
                    for (const item of legacyData.inventory) {
                        if (item) {
                            await runFn('INSERT INTO user_inventory (user_id, item_id, unlocked_at) VALUES (?, ?, ?) ON CONFLICT (user_id, item_id) DO NOTHING', [userId, String(item), now]);
                        }
                    }
                }

                // Union completedLessons
                if (Array.isArray(legacyData.completedLessons)) {
                    for (const les of legacyData.completedLessons) {
                        if (les) {
                            await runFn('INSERT INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES (?, ?, ?) ON CONFLICT (user_id, lesson_id) DO NOTHING', [userId, String(les), now]);
                        }
                    }
                }

                // Merge quizHistory
                if (legacyData.quizHistory && typeof legacyData.quizHistory === 'object') {
                    for (const [quizId, qData] of Object.entries(legacyData.quizHistory)) {
                        const score = Number(qData.bestScore || qData.score || 0);
                        const isPassed = score >= 70 ? 1 : 0;
                        const isPerfect = score === 100 ? 1 : 0;
                        await runFn(`
                            INSERT INTO quiz_attempts (id, user_id, quiz_id, score, is_passed, is_perfect, time_spent_seconds, attempt_number, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)
                        `, [`att_mig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, quizId, score, isPassed, isPerfect, now]);
                    }
                }
            }
        });

        const fullProgress = await this.getUserProgress(userId);
        return {
            ok: true,
            acknowledgedEventIds,
            processedCount: results.length,
            eventsProcessedCount: results.length,
            events: results,
            progress: this.sanitizeProgressForResponse(fullProgress)
        };
    }

    async updateSettings(userId, patch = {}) {
        if (!userId || !patch || typeof patch !== 'object') {
            return { ok: false, error: "INVALID_PATCH" };
        }
        const current = await this.getUserProgress(userId);
        if (!current) return { ok: false, error: "USER_NOT_FOUND" };

        const newSettings = { ...current.settings, ...patch };
        await this.db.runAsync('UPDATE user_progress SET settings_json = ?, updated_at = ? WHERE user_id = ?', [
            JSON.stringify(newSettings),
            new Date().toISOString(),
            userId
        ]);

        const updatedProgress = await this.getUserProgress(userId);
        return {
            ok: true,
            settings: newSettings,
            progress: this.sanitizeProgressForResponse(updatedProgress)
        };
    }

    async equipItem(userId, { avatar, theme, accent }) {
        if (!userId) return { ok: false, error: "INVALID_USER" };
        const progress = await this.getUserProgress(userId);
        if (!progress) return { ok: false, error: "USER_NOT_FOUND" };

        if (avatar && !progress.inventory.includes(avatar)) {
            return { ok: false, error: "ITEM_NOT_OWNED", message: "Item belum dimiliki di inventory." };
        }

        const updates = [];
        const params = [];

        if (avatar && progress.inventory.includes(avatar)) {
            updates.push('equipped_avatar = ?');
            params.push(avatar);
        }
        if (theme) {
            updates.push('equipped_theme = ?');
            params.push(theme);
        }
        if (accent) {
            updates.push('equipped_accent = ?');
            params.push(accent);
        }

        if (updates.length > 0) {
            updates.push('updated_at = ?');
            params.push(new Date().toISOString());
            params.push(userId);
            await this.db.runAsync(`UPDATE user_progress SET ${updates.join(', ')} WHERE user_id = ?`, params);
        }

        const updated = await this.getUserProgress(userId);
        return {
            ok: true,
            equippedItems: updated.equippedItems,
            progress: this.sanitizeProgressForResponse(updated)
        };
    }

    async getLeaderboard({ period = "weekly", page = 1, limit = 50, offset = 0, cohort = "global", currentUserId = null }) {
        const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
        const safePage = Math.max(1, Number(page) || 1);
        const calcOffset = offset !== undefined && offset !== 0 ? Number(offset) : (safePage - 1) * safeLimit;

        // Fetch all active, non-flagged users and progress
        const users = await this.db.allAsync(`
            SELECT
                p.user_id, p.lifetime_xp, p.level, p.streak, p.equipped_avatar,
                p.settings_json, u.username
            FROM user_progress p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.flagged = 0
        `);

        // Get followed list if friends cohort
        let friendsSet = new Set();
        if (cohort === 'friends' || cohort === 'following') {
            if (currentUserId) {
                friendsSet.add(currentUserId);
                const follows = await this.db.allAsync('SELECT following_id FROM followers WHERE follower_id = ?', [currentUserId]);
                for (const f of follows) friendsSet.add(f.following_id);
            }
        }

        const now = Date.now();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Calculate XP per user according to period
        const calculated = [];
        for (const u of users) {
            const settings = JSON.parse(u.settings_json || '{}');
            if (settings.showOnLeaderboard === false) {
                continue; // User opted out of public leaderboard
            }

            if ((cohort === 'friends' || cohort === 'following') && !friendsSet.has(u.user_id)) {
                continue; // Not in friends cohort
            }

            let xp = u.lifetime_xp;
            if (period === 'weekly') {
                const row = await this.db.getAsync(`
                    SELECT SUM(xp_awarded) as period_xp
                    FROM progress_events
                    WHERE user_id = ? AND server_timestamp >= ?
                `, [u.user_id, oneWeekAgo]);
                xp = row && row.period_xp !== null ? Number(row.period_xp) : 0;
            } else if (period === 'monthly') {
                const row = await this.db.getAsync(`
                    SELECT SUM(xp_awarded) as period_xp
                    FROM progress_events
                    WHERE user_id = ? AND server_timestamp >= ?
                `, [u.user_id, oneMonthAgo]);
                xp = row && row.period_xp !== null ? Number(row.period_xp) : 0;
            }

            calculated.push({
                userId: u.user_id,
                username: settings.displayName || u.username || "Pengguna Universe",
                avatar: u.equipped_avatar || "👨‍💻",
                xp: xp,
                periodXp: xp,
                lifetimeXp: u.lifetime_xp,
                level: u.level,
                streak: u.streak,
                isCurrentUser: currentUserId === u.user_id
            });
        }

        // Sort descending by XP
        calculated.sort((a, b) => b.xp - a.xp || b.lifetimeXp - a.lifetimeXp);

        // Assign ranks
        calculated.forEach((entry, idx) => {
            entry.rank = idx + 1;
        });

        const totalCount = calculated.length;
        const totalPages = Math.ceil(totalCount / safeLimit) || 1;
        const pagedEntries = calculated.slice(calcOffset, calcOffset + safeLimit);
        const callerRankObj = currentUserId ? calculated.find(e => e.userId === currentUserId) : null;

        return {
            ok: true,
            period,
            cohort,
            page: safePage,
            limit: safeLimit,
            totalPages,
            totalCount,
            entries: pagedEntries,
            userRank: callerRankObj ? { rank: callerRankObj.rank, xp: callerRankObj.xp, userId: callerRankObj.userId } : null,
            callerRank: callerRankObj ? callerRankObj.rank : null
        };
    }

    async getSocialProfile(targetUserId, currentUserId) {
        if (!targetUserId) return { ok: false, error: "INVALID_USER" };
        const progress = await this.getUserProgress(targetUserId);
        if (!progress) return { ok: false, error: "USER_NOT_FOUND" };

        const isFollowingRow = currentUserId ? await this.db.getAsync('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?', [currentUserId, targetUserId]) : null;
        const isFollowing = !!isFollowingRow;
        const isPrivate = !!progress.settings.privateProfile && targetUserId !== currentUserId;

        if (isPrivate) {
            return {
                ok: true,
                isPrivate: true,
                userId: targetUserId,
                username: progress.settings.displayName || progress.profile.username || "Pengguna Universe",
                avatar: progress.equippedItems?.avatar || "👨‍💻",
                level: progress.level,
                streak: progress.streak,
                isFollowing
            };
        }

        return {
            ok: true,
            isPrivate: false,
            userId: targetUserId,
            username: progress.settings.displayName || progress.profile.username || "Pengguna Universe",
            avatar: progress.equippedItems?.avatar || "👨‍💻",
            level: progress.level,
            streak: progress.streak,
            achievementsShowcase: progress.achievements.slice(0, 5),
            isFollowing
        };
    }

    async followUser(currentUserId, targetUserId) {
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
            return { ok: false, error: "INVALID_TARGET", message: "Target follow tidak valid." };
        }
        await this.db.runAsync('INSERT INTO followers (follower_id, following_id, created_at) VALUES (?, ?, ?) ON CONFLICT (follower_id, following_id) DO NOTHING', [
            currentUserId, targetUserId, new Date().toISOString()
        ]);
        return { ok: true, following: true, isFollowing: true };
    }

    async unfollowUser(currentUserId, targetUserId) {
        if (!currentUserId || !targetUserId) return { ok: false, error: "INVALID_TARGET" };
        await this.db.runAsync('DELETE FROM followers WHERE follower_id = ? AND following_id = ?', [currentUserId, targetUserId]);
        return { ok: true, following: false, isFollowing: false };
    }

    async getChallenges(userId) {
        if (!userId) return { ok: false, error: "INVALID_USER" };
        const progress = await this.getUserProgress(userId);
        const completedLessonsCount = progress.learningProgress?.completedLessons?.length || 0;
        const quizzesCount = Object.keys(progress.quizHistory || {}).length;
        const claims = progress.challengeProgress?.claims || {};

        const challenges = [
            {
                id: 'ch_lessons_3',
                title: 'Belajar 3 Materi',
                description: 'Selesaikan 3 modul pembelajaran baru',
                target: 3,
                current: Math.min(3, completedLessonsCount),
                isCompleted: completedLessonsCount >= 3,
                isClaimed: !!claims['ch_lessons_3'],
                reward: { xp: 100, coins: 50 }
            },
            {
                id: 'ch_quiz_2',
                title: 'Latihan 2 Kuis',
                description: 'Kerjakan dan selesaikan 2 kuis latihan',
                target: 2,
                current: Math.min(2, quizzesCount),
                isCompleted: quizzesCount >= 2,
                isClaimed: !!claims['ch_quiz_2'],
                reward: { xp: 150, coins: 75 }
            }
        ];

        return {
            ok: true,
            challenges
        };
    }

    async claimChallengeReward(currentUserId, challengeId) {
        const progress = await this.getUserProgress(currentUserId);
        const claims = progress.challengeProgress?.claims || {};
        if (claims[challengeId]) {
            return { ok: false, error: "ALREADY_CLAIMED", message: "Hadiah tantangan ini sudah diklaim." };
        }

        const challengeCatalog = {
            'ch_lessons_3': { xp: 100, coins: 50 },
            'ch_quiz_2': { xp: 150, coins: 75 }
        };
        const reward = challengeCatalog[challengeId] || { xp: 50, coins: 25 };

        claims[challengeId] = { claimedAt: new Date().toISOString() };
        await this.db.runAsync('UPDATE user_progress SET challenge_progress_json = ? WHERE user_id = ?', [
            JSON.stringify({ ...progress.challengeProgress, claims }),
            currentUserId
        ]);

        const curRow = await this.db.getAsync('SELECT lifetime_xp, coins, level FROM user_progress WHERE user_id = ?', [currentUserId]);
        const nextXp = (curRow?.lifetime_xp || 0) + reward.xp;
        const nextCoins = (curRow?.coins || 0) + reward.coins;
        const nextMetrics = calculateLevelMetrics(nextXp);

        await this.db.runAsync(`
            UPDATE user_progress SET
                lifetime_xp = ?,
                coins = ?,
                level = ?,
                updated_at = ?
            WHERE user_id = ?
        `, [nextXp, nextCoins, nextMetrics.level, new Date().toISOString(), currentUserId]);

        const evtId = `evt_claim_${challengeId}_${Date.now()}`;
        await this.db.runAsync(`
            INSERT INTO progress_events (
                event_id, user_id, event_type, client_timestamp, server_timestamp,
                xp_awarded, coins_awarded, reason, payload_json, result_json
            ) VALUES (?, ?, 'challenge_claim', ?, ?, ?, ?, 'Klaim Tantangan Mingguan', ?, ?)
        `, [
            evtId,
            currentUserId,
            new Date().toISOString(),
            new Date().toISOString(),
            reward.xp,
            reward.coins,
            JSON.stringify({ challengeId }),
            JSON.stringify({ reward })
        ]);

        const updatedProgress = await this.getUserProgress(currentUserId);
        return {
            ok: true,
            rewardGiven: {
                xp: reward.xp,
                coins: reward.coins
            },
            progress: updatedProgress
        };
    }

    async createFriendChallenge(currentUserId, targetUserId, { challengeType = 'lessons', targetGoal = 3 }) {
        const id = `fch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const now = new Date().toISOString();
        await this.db.runAsync(`
            INSERT INTO challenges (id, creator_id, target_id, challenge_type, target_goal, creator_progress, target_progress, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, 0, 'pending', ?, ?)
        `, [id, currentUserId, targetUserId, challengeType, targetGoal, now, now]);

        return { ok: true, challengeId: id };
    }

    async acceptFriendChallenge(currentUserId, challengeId) {
        const challenge = await this.db.getAsync('SELECT * FROM challenges WHERE id = ?', [challengeId]);
        if (!challenge || challenge.target_id !== currentUserId) {
            return { ok: false, error: "CHALLENGE_NOT_FOUND" };
        }
        await this.db.runAsync('UPDATE challenges SET status = "active", updated_at = ? WHERE id = ?', [
            new Date().toISOString(),
            challengeId
        ]);
        return { ok: true, status: 'active' };
    }

    async addNotification(userId, { type, title, message, data = {} }) {
        if (!userId || !type || !title) return { ok: false, error: "INVALID_NOTIFICATION" };

        const userExists = await this.db.getAsync('SELECT 1 FROM users WHERE id = ?', [userId]);
        if (!userExists) {
            const now = new Date().toISOString();
            await this.db.runAsync(`
                INSERT INTO users (id, username, email, password_hash, salt, role, is_pro, created_at, updated_at)
                VALUES (?, ?, ?, 'auto', 'auto', 'user', 0, ?, ?)
                ON CONFLICT (id) DO NOTHING
            `, [userId, userId, `${userId}@auto.local`, now, now]);
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const existing = await this.db.getAsync(`
            SELECT id FROM notifications
            WHERE user_id = ? AND type = ? AND title = ? AND created_at >= ?
        `, [userId, type, title, oneHourAgo]);

        if (existing) {
            return { ok: true, duplicated: true, id: existing.id };
        }

        const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        await this.db.runAsync(`
            INSERT INTO notifications (id, user_id, type, title, message, is_read, data_json, created_at)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        `, [id, userId, type, title, message || "", JSON.stringify(data), now]);

        return { ok: true, id };
    }

    async getNotifications(userId) {
        if (!userId) return { ok: false, error: "INVALID_USER" };
        const rows = await this.db.allAsync('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return {
            ok: true,
            notifications: rows.map(r => ({
                id: r.id,
                type: r.type,
                title: r.title,
                message: r.message,
                isRead: Boolean(r.is_read),
                data: JSON.parse(r.data_json || '{}'),
                createdAt: r.created_at
            }))
        };
    }

    async markNotificationsRead(currentUserId) {
        await this.db.runAsync('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [currentUserId]);
        return { ok: true };
    }

    async getNotificationSummary(userId) {
        const row = await this.db.getAsync('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId]);
        return { unreadCount: row ? row.count : 0 };
    }

    async getLearningState(userId) {
        const row = await this.db.getAsync('SELECT state_json FROM learning_state WHERE user_id = ?', [userId]);
        return row ? JSON.parse(row.state_json) : null;
    }

    async saveLearningState(userId, state) {
        const now = new Date().toISOString();
        await this.db.runAsync(`
            INSERT INTO learning_state (user_id, state_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                state_json = excluded.state_json,
                updated_at = excluded.updated_at
        `, [userId, JSON.stringify(state), now]);
        return { ok: true };
    }

    async getUserMastery(userId, nowMs = Date.now()) {
        const quizRows = await this.db.allAsync('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at ASC', [userId]);
        const attemptHistory = quizRows.map(q => {
            let answers = null;
            try { if (q.answers_json) answers = JSON.parse(q.answers_json); } catch (e) {}
            let meta = null;
            try { if (q.metadata_json) meta = JSON.parse(q.metadata_json); } catch (e) {}
            const actMeta = (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.getActivityMetadata === 'function') ? AdaptiveLearningEngine.getActivityMetadata(q.quiz_id) : null;
            const skillId = q.skill || (actMeta && !actMeta.unmapped ? actMeta.skill : null);
            const isUnmapped = !skillId || Boolean(actMeta && actMeta.unmapped);
            return {
                id: q.id,
                quizId: q.quiz_id,
                skill: skillId,
                unmapped: isUnmapped,
                topic: q.topic || q.quiz_id,
                difficulty: Number(q.difficulty) || 1,
                score: q.score,
                correct: !!q.is_passed,
                isCorrect: !!q.is_passed,
                isPassed: !!q.is_passed,
                isPerfect: !!q.is_perfect,
                timeSpentSeconds: q.time_spent_seconds,
                attemptNumber: q.attempt_number,
                usedHint: (q.hint_count || 0) > 0,
                hintCount: q.hint_count || 0,
                answers,
                metadata: meta,
                timestamp: q.created_at
            };
        });

        if (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.SKILLS_REGISTRY === 'object') {
            const masteryMap = {};
            Object.keys(AdaptiveLearningEngine.SKILLS_REGISTRY).forEach(skillId => {
                masteryMap[skillId] = AdaptiveLearningEngine.calculateSkillMastery(skillId, attemptHistory, nowMs);
            });
            return masteryMap;
        }
        return {};
    }

    async getUserRecommendations(userId, options = {}, nowMs = Date.now()) {
        const row = await this.db.getAsync('SELECT recommendation_history_json FROM user_progress WHERE user_id = ?', [userId]);
        const recommendationHistory = JSON.parse(row?.recommendation_history_json || '[]');
        const quizRows = await this.db.allAsync('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at ASC', [userId]);
        const attemptHistory = quizRows.map(q => {
            let answers = null;
            try { if (q.answers_json) answers = JSON.parse(q.answers_json); } catch (e) {}
            let meta = null;
            try { if (q.metadata_json) meta = JSON.parse(q.metadata_json); } catch (e) {}
            const actMeta = (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.getActivityMetadata === 'function') ? AdaptiveLearningEngine.getActivityMetadata(q.quiz_id) : null;
            const skillId = q.skill || (actMeta && !actMeta.unmapped ? actMeta.skill : null);
            const isUnmapped = !skillId || Boolean(actMeta && actMeta.unmapped);
            return {
                id: q.id,
                quizId: q.quiz_id,
                skill: skillId,
                unmapped: isUnmapped,
                topic: q.topic || q.quiz_id,
                difficulty: Number(q.difficulty) || 1,
                score: q.score,
                correct: !!q.is_passed,
                isCorrect: !!q.is_passed,
                isPassed: !!q.is_passed,
                isPerfect: !!q.is_perfect,
                timeSpentSeconds: q.time_spent_seconds,
                attemptNumber: q.attempt_number,
                usedHint: (q.hint_count || 0) > 0,
                hintCount: q.hint_count || 0,
                answers,
                metadata: meta,
                timestamp: q.created_at
            };
        });

        if (AdaptiveLearningEngine && typeof AdaptiveLearningEngine.generateRecommendations === 'function') {
            return AdaptiveLearningEngine.generateRecommendations(attemptHistory, recommendationHistory, nowMs);
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
            masterySummary: {}
        };
    }

    async recordRecommendationInteraction(userId, interactionType, recommendationId, metadata = {}) {
        if (!userId || !recommendationId) {
            return { ok: false, error: "INVALID_PARAMS" };
        }
        const row = await this.db.getAsync('SELECT recommendation_history_json FROM user_progress WHERE user_id = ?', [userId]);
        if (!row) return { ok: false, error: "USER_NOT_FOUND" };

        const history = JSON.parse(row.recommendation_history_json || '[]');
        history.push(recommendationId);
        const trimmed = history.slice(-30);
        await this.db.runAsync('UPDATE user_progress SET recommendation_history_json = ?, updated_at = ? WHERE user_id = ?', [
            JSON.stringify(trimmed),
            new Date().toISOString(),
            userId
        ]);

        return { ok: true, interactionType, recommendationId, historyLength: trimmed.length };
    }

    sanitizeProgressForResponse(progress) {
        if (!progress) return null;
        const sanitized = { ...progress };
        delete sanitized.suspiciousFlags;
        return sanitized;
    }
}

module.exports = {
    ProgressRepository,
    SERVER_REWARDS,
    ACHIEVEMENTS_CATALOG,
    WEEKLY_CHALLENGES_CATALOG,
    calculateLevelMetrics
};
