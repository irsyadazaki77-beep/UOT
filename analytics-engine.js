/**
 * UNIVERSE OF TECH — CENTRALIZED PRODUCT ANALYTICS & OBSERVABILITY ENGINE
 * FASE 15: Privacy-Conscious Telemetry, Funnels, Error Tracking, Web Vitals, Feature Flags & Health
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ANALYTICS_DIR = path.join(__dirname, 'data');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'uot_analytics_store.json');
const MAX_EVENT_RETENTION = 10000;
const MAX_ERROR_RETENTION = 1000;
const MAX_VITALS_RETENTION = 2000;

const SENSITIVE_KEYS = new Set([
    'password', 'pass', 'pwd', 'token', 'authtoken', 'bearer',
    'secret', 'creditcard', 'card', 'cvv', 'ssn', 'authorization',
    'privatekey', 'apikey', 'csrf', 'inputval', 'secretcode'
]);

class AnalyticsObservabilityEngine {
    constructor() {
        this.events = [];
        this.errors = [];
        this.vitals = [];
        this.featureFlags = {
            adaptive_quiz_mode: {
                key: 'adaptive_quiz_mode',
                enabled: true,
                fallback: false,
                description: 'Penyesuaian tingkat kesulitan kuis otomatis berbasis performa'
            },
            social_leaderboard_v2: {
                key: 'social_leaderboard_v2',
                enabled: true,
                fallback: true,
                description: 'Papan peringkat sosial real-time dan tantangan mingguan'
            },
            dark_theme_default: {
                key: 'dark_theme_default',
                enabled: false,
                fallback: false,
                description: 'Penggunaan mode gelap sebagai tema standar'
            },
            interactive_sandbox_v2: {
                key: 'interactive_sandbox_v2',
                enabled: true,
                fallback: false,
                description: 'Lingkungan eksekusi kode interaktif versi 2'
            }
        };
        this.experiments = {
            onboarding_flow_v2: {
                key: 'onboarding_flow_v2',
                active: true,
                variants: ['control', 'guided_tour'],
                weights: [50, 50],
                description: 'Uji A/B alur orientasi awal pengguna baru'
            }
        };
        this.loadFromDisk();
    }

    loadFromDisk() {
        try {
            if (!fs.existsSync(ANALYTICS_DIR)) {
                fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
            }
            if (fs.existsSync(ANALYTICS_FILE)) {
                const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                this.events = Array.isArray(parsed.events) ? parsed.events : [];
                this.errors = Array.isArray(parsed.errors) ? parsed.errors : [];
                this.vitals = Array.isArray(parsed.vitals) ? parsed.vitals : [];
                if (parsed.featureFlags && typeof parsed.featureFlags === 'object') {
                    this.featureFlags = { ...this.featureFlags, ...parsed.featureFlags };
                }
            }
        } catch (err) {
            console.error('[AnalyticsEngine] Load Error:', err.message);
            this.events = [];
            this.errors = [];
            this.vitals = [];
        }
    }

    saveToDisk() {
        try {
            if (!fs.existsSync(ANALYTICS_DIR)) {
                fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
            }
            const payload = {
                events: this.events.slice(-MAX_EVENT_RETENTION),
                errors: this.errors.slice(-MAX_ERROR_RETENTION),
                vitals: this.vitals.slice(-MAX_VITALS_RETENTION),
                featureFlags: this.featureFlags,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(payload, null, 2), 'utf8');
        } catch (err) {
            console.error('[AnalyticsEngine] Save Error:', err.message);
        }
    }

    /**
     * Privacy-Conscious Data Sanitization
     */
    scrubSensitiveData(data) {
        if (!data || typeof data !== 'object') return data;

        if (Array.isArray(data)) {
            return data.map(item => this.scrubSensitiveData(item));
        }

        const scrubbed = {};
        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();
            if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('pass') || lowerKey.includes('secret') || lowerKey.includes('token')) {
                scrubbed[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null) {
                scrubbed[key] = this.scrubSensitiveData(value);
            } else if (typeof value === 'string' && (value.includes('Bearer ') || value.includes('Basic '))) {
                scrubbed[key] = '[REDACTED_HEADER]';
            } else {
                scrubbed[key] = value;
            }
        }
        return scrubbed;
    }

    /**
     * Record Telemetry Event
     */
    recordEvent({ event, timestamp, sessionId, userId, properties = {}, userConsent = true }) {
        if (!event || typeof event !== 'string') return { ok: false, error: 'INVALID_EVENT' };

        const sanitizedProps = this.scrubSensitiveData(properties || {});

        // Privacy: Anonymize or drop user identifier if consent disabled
        let effectiveUserId = userId || 'anon_usr';
        if (!userConsent) {
            effectiveUserId = 'anon_' + crypto.createHash('sha256').update(effectiveUserId).digest('hex').substring(0, 10);
        }

        const record = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            event: event.trim(),
            timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
            sessionId: sessionId || `sess_${Date.now()}`,
            userId: effectiveUserId,
            properties: sanitizedProps
        };

        this.events.push(record);
        if (this.events.length > MAX_EVENT_RETENTION) {
            this.events.shift();
        }

        this.saveToDisk();
        return { ok: true, eventId: record.id };
    }

    /**
     * Record Error Telemetry
     */
    recordError({ errorType = 'uncaught_error', message = '', stack = '', route = '', userAgent = '', sessionId = '', userId = '' }) {
        const sanitizedMsg = typeof message === 'string' ? message.substring(0, 500) : 'Unknown Error';
        const sanitizedStack = typeof stack === 'string' ? stack.substring(0, 1000) : '';

        // Scrub sensitive paths or values from error message
        const cleanMsg = this.scrubSensitiveData({ message: sanitizedMsg }).message;

        const record = {
            id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            errorType,
            message: cleanMsg,
            stack: sanitizedStack,
            route: route || '/',
            userAgent: (userAgent || '').substring(0, 200),
            sessionId: sessionId || 'sess_unknown',
            userId: userId || 'anon_usr',
            timestamp: new Date().toISOString()
        };

        this.errors.push(record);
        if (this.errors.length > MAX_ERROR_RETENTION) {
            this.errors.shift();
        }

        this.saveToDisk();
        return { ok: true, errorId: record.id };
    }

    /**
     * Record Web Vitals Performance Telemetry
     */
    recordVitals({ metric, value, rating = 'good', page = '/', deviceType = 'desktop', sessionId = '' }) {
        if (!metric || value === undefined) return { ok: false, error: 'INVALID_METRIC' };

        const record = {
            id: `vit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            metric: metric.toUpperCase(), // LCP, CLS, INP, FID
            value: Number(value) || 0,
            rating: ['good', 'needs-improvement', 'poor'].includes(rating) ? rating : 'good',
            page,
            deviceType: deviceType.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
            sessionId: sessionId || 'sess_unknown',
            timestamp: new Date().toISOString()
        };

        this.vitals.push(record);
        if (this.vitals.length > MAX_VITALS_RETENTION) {
            this.vitals.shift();
        }

        this.saveToDisk();
        return { ok: true, vitalsId: record.id };
    }

    /**
     * Main 7-Step Conversion Funnel Metrics
     * 1. Landing -> 2. Login -> 3. Learning Path -> 4. First Lesson -> 5. First Quiz -> 6. First Completion -> 7. Return Visit
     */
    getFunnelMetrics() {
        if (this.events.length === 0) {
            return {
                hasData: false,
                message: 'No data yet',
                steps: [
                    { step: '1. Landing Page', name: 'landing', count: 0, conversionRate: 0 },
                    { step: '2. Login / Auth', name: 'login', count: 0, conversionRate: 0 },
                    { step: '3. Learning Path View', name: 'path', count: 0, conversionRate: 0 },
                    { step: '4. First Lesson Started', name: 'first_lesson', count: 0, conversionRate: 0 },
                    { step: '5. First Quiz Started', name: 'first_quiz', count: 0, conversionRate: 0 },
                    { step: '6. First Activity Completed', name: 'first_completion', count: 0, conversionRate: 0 },
                    { step: '7. Return Visit', name: 'return_visit', count: 0, conversionRate: 0 }
                ]
            };
        }

        const userSessions = new Map(); // userId -> set of events
        const userDates = new Map();    // userId -> set of distinct YYYY-MM-DD dates

        for (const evt of this.events) {
            const uid = evt.userId || 'anon_usr';
            if (!userSessions.has(uid)) userSessions.set(uid, new Set());
            userSessions.get(uid).add(evt.event);

            const dateStr = evt.timestamp ? evt.timestamp.substring(0, 10) : new Date().toISOString().substring(0, 10);
            if (!userDates.has(uid)) userDates.set(uid, new Set());
            userDates.get(uid).add(dateStr);
        }

        let step1Landing = 0;
        let step2Login = 0;
        let step3Path = 0;
        let step4FirstLesson = 0;
        let step5FirstQuiz = 0;
        let step6Completion = 0;
        let step7ReturnVisit = 0;

        for (const [uid, evtSet] of userSessions.entries()) {
            // Step 1: Landing (or session started)
            const hasLanding = evtSet.has('landing_viewed') || evtSet.has('session_started');
            if (hasLanding) step1Landing++;

            // Step 2: Login
            const hasLogin = evtSet.has('login_completed') || evtSet.has('auth_success');
            if (hasLanding && hasLogin) step2Login++;

            // Step 3: Learning Path
            const hasPath = evtSet.has('learning_path_viewed') || evtSet.has('view_path');
            if (hasLanding && hasPath) step3Path++;

            // Step 4: First Lesson
            const hasLesson = evtSet.has('lesson_started') || evtSet.has('read_lesson');
            if (hasLanding && hasLesson) step4FirstLesson++;

            // Step 5: First Quiz
            const hasQuiz = evtSet.has('quiz_started') || evtSet.has('quiz_completed');
            if (hasLanding && hasQuiz) step5FirstQuiz++;

            // Step 6: First Completion
            const hasCompletion = evtSet.has('lesson_completed') || evtSet.has('quiz_completed') || evtSet.has('project_completed');
            if (hasLanding && hasCompletion) step6Completion++;

            // Step 7: Return Visit (visited on >= 2 distinct days or multiple distinct sessions)
            const dates = userDates.get(uid);
            if (hasLanding && dates && dates.size >= 2) step7ReturnVisit++;
        }

        const base = Math.max(1, step1Landing);
        const steps = [
            { step: '1. Landing Page', name: 'landing', count: step1Landing, conversionRate: 100 },
            { step: '2. Login / Auth', name: 'login', count: step2Login, conversionRate: Math.round((step2Login / base) * 100) },
            { step: '3. Learning Path View', name: 'path', count: step3Path, conversionRate: Math.round((step3Path / base) * 100) },
            { step: '4. First Lesson Started', name: 'first_lesson', count: step4FirstLesson, conversionRate: Math.round((step4FirstLesson / base) * 100) },
            { step: '5. First Quiz Started', name: 'first_quiz', count: step5FirstQuiz, conversionRate: Math.round((step5FirstQuiz / base) * 100) },
            { step: '6. First Activity Completed', name: 'first_completion', count: step6Completion, conversionRate: Math.round((step6Completion / base) * 100) },
            { step: '7. Return Visit', name: 'return_visit', count: step7ReturnVisit, conversionRate: Math.round((step7ReturnVisit / base) * 100) }
        ];

        return {
            hasData: true,
            totalUniqueUsers: userSessions.size,
            steps
        };
    }

    /**
     * Learning Metrics: Completion Rate, Quiz Accuracy, Popular Lessons, Drop-Offs
     */
    getLearningMetrics() {
        if (this.events.length === 0) {
            return {
                hasData: false,
                message: 'No data yet',
                completionRate: 0,
                quizAccuracy: 0,
                avgTimeOnActivitySeconds: 0,
                popularLessons: [],
                popularQuizzes: [],
                retention: { dau: 0, wau: 0 }
            };
        }

        const lessonStarts = new Map();
        const lessonCompletes = new Map();
        const quizAnswers = { correct: 0, total: 0 };
        const activityTimes = [];

        const now = Date.now();
        const todayStr = new Date().toISOString().substring(0, 10);
        const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString().substring(0, 10);

        const activeToday = new Set();
        const activeWeekly = new Set();

        for (const evt of this.events) {
            const uid = evt.userId || 'anon_usr';
            const dateStr = evt.timestamp ? evt.timestamp.substring(0, 10) : todayStr;

            if (dateStr === todayStr) activeToday.add(uid);
            if (dateStr >= sevenDaysAgo) activeWeekly.add(uid);

            if (evt.event === 'lesson_started') {
                const lid = evt.properties?.lessonId || 'general_lesson';
                lessonStarts.set(lid, (lessonStarts.get(lid) || 0) + 1);
            } else if (evt.event === 'lesson_completed') {
                const lid = evt.properties?.lessonId || 'general_lesson';
                lessonCompletes.set(lid, (lessonCompletes.get(lid) || 0) + 1);
                if (evt.properties?.timeSpentSeconds) {
                    activityTimes.push(Number(evt.properties.timeSpentSeconds));
                }
            } else if (evt.event === 'question_answered') {
                quizAnswers.total++;
                if (evt.properties?.isCorrect) quizAnswers.correct++;
            } else if (evt.event === 'quiz_completed') {
                if (evt.properties?.timeSpentSeconds) {
                    activityTimes.push(Number(evt.properties.timeSpentSeconds));
                }
            }
        }

        let totalStarts = 0;
        let totalCompletes = 0;
        for (const count of lessonStarts.values()) totalStarts += count;
        for (const count of lessonCompletes.values()) totalCompletes += count;

        const completionRate = totalStarts > 0 ? Math.round((totalCompletes / totalStarts) * 100) : 0;
        const quizAccuracy = quizAnswers.total > 0 ? Math.round((quizAnswers.correct / quizAnswers.total) * 100) : 0;
        const avgTimeOnActivitySeconds = activityTimes.length > 0
            ? Math.round(activityTimes.reduce((a, b) => a + b, 0) / activityTimes.length)
            : 0;

        const popularLessons = [...lessonStarts.entries()].map(([id, starts]) => ({
            lessonId: id,
            starts,
            completes: lessonCompletes.get(id) || 0,
            completionRate: Math.round(((lessonCompletes.get(id) || 0) / Math.max(1, starts)) * 100)
        })).sort((a, b) => b.starts - a.starts).slice(0, 5);

        return {
            hasData: true,
            completionRate,
            quizAccuracy,
            avgTimeOnActivitySeconds,
            popularLessons,
            retention: {
                dau: activeToday.size,
                wau: activeWeekly.size
            }
        };
    }

    /**
     * Content Review Flagging — Detects questions or topics with > 70% failure rate
     */
    getDifficultContentFlags() {
        const itemStats = new Map(); // itemId -> { attempts, failures }

        for (const evt of this.events) {
            if (evt.event === 'question_answered' && evt.properties?.questionId) {
                const qid = evt.properties.questionId;
                if (!itemStats.has(qid)) itemStats.set(qid, { attempts: 0, failures: 0, topic: evt.properties.topic || 'General' });
                const st = itemStats.get(qid);
                st.attempts++;
                if (!evt.properties.isCorrect) st.failures++;
            }
        }

        const flagged = [];
        for (const [qid, st] of itemStats.entries()) {
            if (st.attempts >= 3) {
                const failureRate = Math.round((st.failures / st.attempts) * 100);
                if (failureRate >= 70) {
                    flagged.push({
                        questionId: qid,
                        topic: st.topic,
                        attempts: st.attempts,
                        failures: st.failures,
                        failureRate,
                        reason: `Tingkat Kegagalan Tinggi (${failureRate}% dari ${st.attempts} percobaan)`
                    });
                }
            }
        }

        flagged.sort((a, b) => b.failureRate - a.failureRate);

        return {
            hasData: flagged.length > 0,
            flaggedCount: flagged.length,
            items: flagged
        };
    }

    /**
     * Error Telemetry Summary
     */
    getErrorTelemetrySummary() {
        if (this.errors.length === 0) {
            return {
                hasData: false,
                message: 'No data yet',
                totalErrors: 0,
                byType: {},
                recentErrors: []
            };
        }

        const byType = {};
        for (const err of this.errors) {
            const type = err.errorType || 'unknown';
            byType[type] = (byType[type] || 0) + 1;
        }

        return {
            hasData: true,
            totalErrors: this.errors.length,
            byType,
            recentErrors: this.errors.slice(-10).reverse().map(e => ({
                id: e.id,
                errorType: e.errorType,
                message: e.message,
                route: e.route,
                timestamp: e.timestamp
            }))
        };
    }

    /**
     * Web Vitals Performance Telemetry Summary
     */
    getPerformanceTelemetrySummary() {
        if (this.vitals.length === 0) {
            return {
                hasData: false,
                message: 'No data yet',
                averages: { LCP: 0, CLS: 0, INP: 0 },
                ratings: { good: 0, needsImprovement: 0, poor: 0 }
            };
        }

        const metricValues = { LCP: [], CLS: [], INP: [] };
        const ratings = { good: 0, needsImprovement: 0, poor: 0 };

        for (const v of this.vitals) {
            if (metricValues[v.metric]) {
                metricValues[v.metric].push(v.value);
            }
            if (v.rating === 'good') ratings.good++;
            else if (v.rating === 'needs-improvement') ratings.needsImprovement++;
            else if (v.rating === 'poor') ratings.poor++;
        }

        const calcAvg = arr => arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;

        return {
            hasData: true,
            averages: {
                LCP: calcAvg(metricValues.LCP),
                CLS: calcAvg(metricValues.CLS),
                INP: calcAvg(metricValues.INP)
            },
            ratings,
            totalRecorded: this.vitals.length
        };
    }

    /**
     * Feature Flags & A/B Experiment Evaluator
     */
    getFeatureFlagsForUser(userId = 'anon_usr', sessionId = 'sess_default') {
        const evaluated = {};

        for (const [key, config] of Object.entries(this.featureFlags)) {
            evaluated[key] = {
                enabled: config.enabled ?? config.fallback,
                fallbackUsed: !config.enabled
            };
        }

        // A/B Experiment Deterministic Bucketing
        const userHash = crypto.createHash('md5').update(`${userId}_${sessionId}`).digest('hex');
        const hashNum = parseInt(userHash.substring(0, 4), 16) % 100;

        const evaluatedExperiments = {};
        for (const [expKey, expConfig] of Object.entries(this.experiments)) {
            if (!expConfig.active) {
                evaluatedExperiments[expKey] = 'control';
            } else {
                const variantIndex = hashNum < expConfig.weights[0] ? 0 : 1;
                evaluatedExperiments[expKey] = expConfig.variants[variantIndex] || 'control';
            }
        }

        return {
            flags: evaluated,
            experiments: evaluatedExperiments
        };
    }

    updateFeatureFlag(key, { enabled }) {
        if (!this.featureFlags[key]) {
            this.featureFlags[key] = {
                key,
                enabled: Boolean(enabled),
                fallback: false,
                description: 'Custom feature flag'
            };
        } else {
            this.featureFlags[key].enabled = Boolean(enabled);
        }
        this.saveToDisk();
        return { ok: true, flag: this.featureFlags[key] };
    }
}

const analyticsEngineInstance = new AnalyticsObservabilityEngine();
module.exports = analyticsEngineInstance;
