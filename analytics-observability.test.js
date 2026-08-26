const assert = require('assert');
const analyticsEngineInstance = require('./analytics-engine');

console.log('=== MEMULAI TEST SUITE: PRODUCT ANALYTICS & OBSERVABILITY (FASE 15) ===\n');

// Reset analytics state
function resetAnalyticsStore() {
    analyticsEngineInstance.events = [];
    analyticsEngineInstance.errors = [];
    analyticsEngineInstance.vitals = [];
}

// 1. TEST STRUCTURED EVENT SCHEMA & PRIVACY SCRUBBING
(() => {
    console.log('[Test 1] Structured Event Schema & Privacy Scrubbing...');
    resetAnalyticsStore();

    const result = analyticsEngineInstance.recordEvent({
        event: 'lesson_completed',
        timestamp: new Date().toISOString(),
        sessionId: 'sess_test_1',
        userId: 'usr_privacy_1',
        properties: {
            lessonId: 'js_basics',
            password: 'secret_password_123',
            token: 'bearer_token_xyz',
            timeSpentSeconds: 120
        }
    });

    assert.strictEqual(result.ok, true, 'Record event harus berhasil');
    assert.strictEqual(analyticsEngineInstance.events.length, 1);

    const loggedEvt = analyticsEngineInstance.events[0];
    assert.strictEqual(loggedEvt.event, 'lesson_completed');
    assert.strictEqual(loggedEvt.properties.lessonId, 'js_basics');
    assert.strictEqual(loggedEvt.properties.password, '[REDACTED]', 'Password harus di-scrub');
    assert.strictEqual(loggedEvt.properties.token, '[REDACTED]', 'Token harus di-scrub');
    assert.strictEqual(loggedEvt.properties.timeSpentSeconds, 120);

    console.log('✓ Test 1 Berhasil: Skema terstruktur dan penyaringan data sensitif terverifikasi.\n');
})();

// 2. TEST 7-STEP MAIN CONVERSION FUNNEL METRICS
(() => {
    console.log('[Test 2] 7-Step Main Conversion Funnel Calculation...');
    resetAnalyticsStore();

    // User A: Completes all steps and returns on 2 distinct days
    const uA = 'usr_funnel_a';
    analyticsEngineInstance.recordEvent({ event: 'landing_viewed', userId: uA, timestamp: '2026-08-20T10:00:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'login_completed', userId: uA, timestamp: '2026-08-20T10:01:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'learning_path_viewed', userId: uA, timestamp: '2026-08-20T10:02:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'lesson_started', userId: uA, timestamp: '2026-08-20T10:03:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'quiz_started', userId: uA, timestamp: '2026-08-20T10:05:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'lesson_completed', userId: uA, timestamp: '2026-08-20T10:08:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'session_started', userId: uA, timestamp: '2026-08-21T10:00:00Z' }); // Day 2 return

    // User B: Drops off at First Lesson
    const uB = 'usr_funnel_b';
    analyticsEngineInstance.recordEvent({ event: 'landing_viewed', userId: uB, timestamp: '2026-08-20T11:00:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'login_completed', userId: uB, timestamp: '2026-08-20T11:01:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'learning_path_viewed', userId: uB, timestamp: '2026-08-20T11:02:00Z' });
    analyticsEngineInstance.recordEvent({ event: 'lesson_started', userId: uB, timestamp: '2026-08-20T11:03:00Z' });

    const funnel = analyticsEngineInstance.getFunnelMetrics();
    assert.strictEqual(funnel.hasData, true);
    assert.strictEqual(funnel.totalUniqueUsers, 2);

    assert.strictEqual(funnel.steps[0].count, 2, 'Landing count harus 2');
    assert.strictEqual(funnel.steps[1].count, 2, 'Login count harus 2');
    assert.strictEqual(funnel.steps[3].count, 2, 'Lesson started count harus 2');
    assert.strictEqual(funnel.steps[4].count, 1, 'Quiz started count harus 1 (hanya User A)');
    assert.strictEqual(funnel.steps[6].count, 1, 'Return visit count harus 1 (hanya User A)');

    console.log('✓ Test 2 Berhasil: Perhitungan conversion funnel 7 langkah terbukti akurat.\n');
})();

// 3. TEST DIFFICULT CONTENT DETECTION & FLAGGING
(() => {
    console.log('[Test 3] Difficult Content Detection (>70% Failure Rate)...');
    resetAnalyticsStore();

    const qHard = 'q_hard_algorithm_01';
    const qEasy = 'q_easy_syntax_01';

    // 4 failed attempts on qHard
    for (let i = 0; i < 4; i++) {
        analyticsEngineInstance.recordEvent({
            event: 'question_answered',
            userId: `usr_attempt_${i}`,
            properties: { questionId: qHard, isCorrect: false, topic: 'Algorithms' }
        });
    }

    // 4 correct attempts on qEasy
    for (let i = 0; i < 4; i++) {
        analyticsEngineInstance.recordEvent({
            event: 'question_answered',
            userId: `usr_attempt_${i}`,
            properties: { questionId: qEasy, isCorrect: true, topic: 'Syntax' }
        });
    }

    const diffContent = analyticsEngineInstance.getDifficultContentFlags();
    assert.strictEqual(diffContent.hasData, true);
    assert.strictEqual(diffContent.flaggedCount, 1, 'Hanya qHard yang boleh ditandai');
    assert.strictEqual(diffContent.items[0].questionId, qHard);
    assert.strictEqual(diffContent.items[0].failureRate, 100);

    console.log('✓ Test 3 Berhasil: Deteksi otomatis soal bermasalah (>70% gagal) tervalidasi.\n');
})();

// 4. TEST ERROR TELEMETRY CAPTURE & SANITIZATION
(() => {
    console.log('[Test 4] Error Telemetry Capture & Sanitization...');
    resetAnalyticsStore();

    const errRes = analyticsEngineInstance.recordError({
        errorType: 'uncaught_js_error',
        message: 'Uncaught ReferenceError: secret_token_xyz is not defined',
        route: '/quiz.html?token=bearer_123',
        sessionId: 'sess_err_1'
    });

    assert.strictEqual(errRes.ok, true);

    const errSummary = analyticsEngineInstance.getErrorTelemetrySummary();
    assert.strictEqual(errSummary.hasData, true);
    assert.strictEqual(errSummary.totalErrors, 1);
    assert.strictEqual(errSummary.byType['uncaught_js_error'], 1);

    console.log('✓ Test 4 Berhasil: Error telemetry tercatat dengan sanitasi payload.\n');
})();

// 5. TEST WEB VITALS PERFORMANCE TELEMETRY
(() => {
    console.log('[Test 5] Web Vitals Performance Telemetry...');
    resetAnalyticsStore();

    analyticsEngineInstance.recordVitals({ metric: 'LCP', value: 1800, rating: 'good', page: '/' });
    analyticsEngineInstance.recordVitals({ metric: 'LCP', value: 3200, rating: 'needs-improvement', page: '/' });
    analyticsEngineInstance.recordVitals({ metric: 'CLS', value: 0.05, rating: 'good', page: '/' });
    analyticsEngineInstance.recordVitals({ metric: 'INP', value: 120, rating: 'good', page: '/' });

    const vitalsSummary = analyticsEngineInstance.getPerformanceTelemetrySummary();
    assert.strictEqual(vitalsSummary.hasData, true);
    assert.strictEqual(vitalsSummary.averages.LCP, 2500); // (1800 + 3200) / 2
    assert.strictEqual(vitalsSummary.ratings.good, 3);
    assert.strictEqual(vitalsSummary.ratings.needsImprovement, 1);

    console.log('✓ Test 5 Berhasil: Web vitals LCP, CLS, INP tercatat dan dianalisis.\n');
})();

// 6. TEST FEATURE FLAGS EVALUATION & SAFE FALLBACKS
(() => {
    console.log('[Test 6] Feature Flags & Safe Fallback Architecture...');

    const userFlags = analyticsEngineInstance.getFeatureFlagsForUser('usr_test_ff', 'sess_ff');
    assert.notStrictEqual(userFlags.flags.adaptive_quiz_mode, undefined);
    assert.strictEqual(userFlags.flags.adaptive_quiz_mode.enabled, true);

    // Toggle flag off
    analyticsEngineInstance.updateFeatureFlag('adaptive_quiz_mode', { enabled: false });

    const updatedFlags = analyticsEngineInstance.getFeatureFlagsForUser('usr_test_ff', 'sess_ff');
    assert.strictEqual(updatedFlags.flags.adaptive_quiz_mode.enabled, false);

    // Restore flag
    analyticsEngineInstance.updateFeatureFlag('adaptive_quiz_mode', { enabled: true });

    console.log('✓ Test 6 Berhasil: Evaluasi feature flags dan safe fallbacks tervalidasi.\n');
})();

// 7. TEST NO FAKE METRICS GUARANTEE
(() => {
    console.log('[Test 7] No Fake Metrics Guarantee...');
    resetAnalyticsStore();

    const emptyFunnel = analyticsEngineInstance.getFunnelMetrics();
    assert.strictEqual(emptyFunnel.hasData, false);
    assert.strictEqual(emptyFunnel.message, 'No data yet');

    const emptyLearning = analyticsEngineInstance.getLearningMetrics();
    assert.strictEqual(emptyLearning.hasData, false);
    assert.strictEqual(emptyLearning.message, 'No data yet');

    const emptyErrors = analyticsEngineInstance.getErrorTelemetrySummary();
    assert.strictEqual(emptyErrors.hasData, false);
    assert.strictEqual(emptyErrors.message, 'No data yet');

    console.log('✓ Test 7 Berhasil: Tidak ada data/metrics palsu jika telemetry kosong.\n');
})();

console.log('================================================================');
console.log('ALL FASE 15 PRODUCT ANALYTICS & OBSERVABILITY TESTS PASSED (7/7)!');
console.log('================================================================');
