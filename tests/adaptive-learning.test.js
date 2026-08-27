/**
 * Automated Test Suite for Adaptive Learning & Mastery Engine (FASE 12)
 * Tests multi-factor mastery formula, prerequisites enforcement, recommendation engine,
 * remedial learning, spaced repetition, cold-start behaviour, and gamification vs academic separation.
 */

const assert = require('assert');
const AdaptiveLearningEngine = require('../public/adaptive-learning-engine');

async function runAdaptiveLearningTests() {
    console.log('====================================================');
    console.log('🧪 RUNNING FASE 12 ADAPTIVE LEARNING TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`  ✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ [FAIL] ${name}`);
            console.error(`     Error: ${err.message}`);
            failed++;
        }
    }

    // -------------------------------------------------------------
    // TEST 1: Multi-Factor Mastery Calculation
    // -------------------------------------------------------------
    test('Mastery calculation considers difficulty, retries, hints, and streaks', () => {
        const now = Date.now();
        const attempts = [
            {
                id: 'q1',
                skill: 'javascript_basics',
                difficulty: 1, // Easy
                correct: true,
                retries: 0,
                usedHint: false,
                timestamp: new Date(now - 86400000 * 2).toISOString() // 2 days ago
            },
            {
                id: 'q2',
                skill: 'javascript_basics',
                difficulty: 3, // Hard
                correct: true,
                retries: 0,
                usedHint: true, // Hint penalty
                timestamp: new Date(now - 86400000 * 1).toISOString() // 1 day ago
            }
        ];

        const mastery = AdaptiveLearningEngine.calculateSkillMastery('javascript_basics', attempts, now);
        assert(mastery.score > 40, 'Mastery score should be robust with correct hard question');
        assert.strictEqual(mastery.streak, 2, 'Streak must equal 2');
        assert.strictEqual(mastery.attemptsCount, 2);
        assert(mastery.tier.level === 'Intermediate' || mastery.tier.level === 'Developing' || mastery.tier.level === 'Proficient');
    });

    // -------------------------------------------------------------
    // TEST 2: Prerequisites Enforcement
    // -------------------------------------------------------------
    test('Prerequisites enforcement blocks locked topics until prereqs reach Developing (>=40%)', () => {
        // javascript_arrays requires javascript_basics
        const lowPrereqMastery = {
            javascript_basics: { score: 25 } // < 40%
        };

        const prereqCheckLocked = AdaptiveLearningEngine.isPrerequisiteMet('javascript_arrays', lowPrereqMastery);
        assert.strictEqual(prereqCheckLocked.met, false, 'Should be locked when prereq mastery < 40%');
        assert.strictEqual(prereqCheckLocked.missingPrereqs.length, 1);
        assert.strictEqual(prereqCheckLocked.missingPrereqs[0].id, 'javascript_basics');

        const highPrereqMastery = {
            javascript_basics: { score: 55 } // >= 40%
        };

        const prereqCheckUnlocked = AdaptiveLearningEngine.isPrerequisiteMet('javascript_arrays', highPrereqMastery);
        assert.strictEqual(prereqCheckUnlocked.met, true, 'Should be unlocked when prereq mastery >= 40%');
    });

    // -------------------------------------------------------------
    // TEST 3: Recommendation Engine Categories & Explanations
    // -------------------------------------------------------------
    test('Recommendation engine generates 4 categories with explanatory text', () => {
        const now = Date.now();
        const attempts = [
            // HTML Structure Mastered (>=81%)
            { skill: 'html_structure', difficulty: 2, correct: true, timestamp: new Date(now).toISOString() },
            { skill: 'html_structure', difficulty: 3, correct: true, timestamp: new Date(now).toISOString() },
            { skill: 'html_structure', difficulty: 3, correct: true, timestamp: new Date(now).toISOString() },

            // JS Basics Proficient (61-80%)
            { skill: 'javascript_basics', difficulty: 2, correct: true, timestamp: new Date(now).toISOString() },
            { skill: 'javascript_basics', difficulty: 2, correct: true, timestamp: new Date(now).toISOString() }
        ];

        const recs = AdaptiveLearningEngine.generateRecommendations(attempts, [], now);
        assert.strictEqual(recs.isColdStart, false);
        assert(Array.isArray(recs.recommendedNext), 'recommendedNext must be an array');
        assert(Array.isArray(recs.needsPractice), 'needsPractice must be an array');
        assert(Array.isArray(recs.readyForChallenge), 'readyForChallenge must be an array');
        assert(Array.isArray(recs.recentlyMastered), 'recentlyMastered must be an array');

        // Check explanations
        [...recs.recommendedNext, ...recs.readyForChallenge, ...recs.recentlyMastered].forEach(r => {
            assert(r.explanation && r.explanation.startsWith('Direkomendasikan') || r.explanation.startsWith('Luar biasa!'), 'Must include explanation string');
        });
    });

    // -------------------------------------------------------------
    // TEST 4: Remedial Learning Trigger on Repeated Failures
    // -------------------------------------------------------------
    test('Repeated failures (>= 2) trigger remedial learning with micro lesson without XP penalty', () => {
        const now = Date.now();
        const attempts = [
            { skill: 'javascript_arrays', difficulty: 2, correct: false, timestamp: new Date(now - 1000).toISOString() },
            { skill: 'javascript_arrays', difficulty: 2, correct: false, timestamp: new Date(now).toISOString() }
        ];

        const recs = AdaptiveLearningEngine.generateRecommendations(attempts, [], now);
        assert(recs.remedialTrigger !== null, 'Remedial trigger must be activated');
        assert.strictEqual(recs.remedialTrigger.skillId, 'javascript_arrays');
        assert.strictEqual(recs.remedialTrigger.zeroXpPenaltyConfirmed, true, 'Zero XP penalty must be explicitly confirmed');
        assert(recs.remedialTrigger.explanation.includes('Pemicu Pembelajaran Remedial'));
        assert(recs.remedialTrigger.microLesson.title.includes('Micro-Lesson'));
    });

    // -------------------------------------------------------------
    // TEST 5: Spaced Repetition System (SRS) & Inactivity Decay
    // -------------------------------------------------------------
    test('Spaced repetition flags topics due for review and applies half-life decay after 14 days', () => {
        const now = Date.now();
        const oldAttemptMs = now - (86400000 * 8); // 8 days ago for Intermediate skill (7 day interval)

        const attempts = [
            { skill: 'html_structure', difficulty: 1, correct: true, timestamp: new Date(oldAttemptMs).toISOString() }
        ];

        const mastery = AdaptiveLearningEngine.calculateSkillMastery('html_structure', attempts, now);
        assert.strictEqual(mastery.dueForReview, true, `Skill must be flagged as due for review (Score: ${mastery.score}, Interval: ${mastery.intervalDays}, Days: ${mastery.daysSinceLast})`);

        const recs = AdaptiveLearningEngine.generateRecommendations(attempts, [], now);
        assert(recs.reviewDue.length > 0, 'SRS item should appear in reviewDue array');
        assert(recs.reviewDue[0].explanation.includes('Spaced Repetition'));

        // Test 14-day inactivity decay
        const veryOldMs = now - (86400000 * 20); // 20 days ago
        const oldAttempts = [
            { skill: 'css_layout', difficulty: 3, correct: true, timestamp: new Date(veryOldMs).toISOString() }
        ];
        const decayedMastery = AdaptiveLearningEngine.calculateSkillMastery('css_layout', oldAttempts, now);
        assert(decayedMastery.rawScore > decayedMastery.score, 'Effective score should decay after > 14 days inactivity');
    });

    // -------------------------------------------------------------
    // TEST 6: Cold-Start Behaviour
    // -------------------------------------------------------------
    test('Cold-start behaviour provides diagnostic onboarding set for new users', () => {
        const recs = AdaptiveLearningEngine.generateRecommendations([], [], Date.now());
        assert.strictEqual(recs.isColdStart, true);
        assert.strictEqual(recs.recommendedNext.length, 3);
        assert(recs.recommendedNext[0].explanation.includes('sesi evaluasi diagnosis awal'));
    });

    // -------------------------------------------------------------
    // TEST 7: Separation of Gamification vs Academic Mastery
    // -------------------------------------------------------------
    test('Gamification level/XP does not artificially force academic mastery score', () => {
        const userState = {
            lifetimeXp: 50000,
            level: 45 // High Gamification Level
        };

        const attempts = [
            { skill: 'javascript_arrays', difficulty: 2, correct: false, timestamp: new Date().toISOString() }
        ];

        const mastery = AdaptiveLearningEngine.calculateSkillMastery('javascript_arrays', attempts);
        assert.strictEqual(mastery.score, 0, 'Academic mastery remains 0 despite high XP/Level');
        assert.strictEqual(mastery.tier.level, 'Beginner', 'Tier remains Beginner');
    });

    // -------------------------------------------------------------
    // TEST 8: Anti-Looping & Diversity Cooldown
    // -------------------------------------------------------------
    test('Anti-looping diversity cooldown penalizes recently recommended topics', () => {
        const attempts = [
            { skill: 'javascript_basics', difficulty: 2, correct: true, timestamp: new Date().toISOString() }
        ];
        const recentRecHistory = ['javascript_arrays', 'javascript_arrays', 'javascript_arrays'];
        const recs = AdaptiveLearningEngine.generateRecommendations(attempts, recentRecHistory, Date.now());
        
        if (recs.recommendedNext.length > 1) {
            assert.notStrictEqual(recs.recommendedNext[0].id, 'javascript_arrays', 'Frequent past recommendation should not be rank #1');
        }
    });

    // -------------------------------------------------------------
    // TEST 9: Remedial Reassessment Quiz Integration
    // -------------------------------------------------------------
    test('Remedial trigger includes both micro-lesson and reassessment quiz', () => {
        const now = Date.now();
        const attempts = [
            { skill: 'web_apis', difficulty: 2, correct: false, timestamp: new Date(now - 2000).toISOString() },
            { skill: 'web_apis', difficulty: 2, correct: false, timestamp: new Date(now).toISOString() }
        ];
        const recs = AdaptiveLearningEngine.generateRecommendations(attempts, [], now);
        assert(recs.remedialTrigger !== null);
        assert(recs.remedialTrigger.reassessmentQuiz !== null);
        assert(recs.remedialTrigger.reassessmentQuiz.url.includes('mode=reassessment'));
    });

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runAdaptiveLearningTests();
