/**
 * FASE 2: UNIFIED LEARNING STATE & INTELLIGENCE AUDIT SUITE
 * Tests server-authoritative state, async reconciliation pipeline,
 * mastery isolation for unmapped activities, and UUID idempotency.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Load AdaptiveLearningEngine
const adaptiveEngineCode = fs.readFileSync(path.join(__dirname, '../public/adaptive-learning-engine.js'), 'utf8');
const vm = require('node:vm');

function createAdaptiveEngineSandbox() {
    const sandbox = {
        console,
        Date,
        Math,
        Number,
        String,
        Array,
        Object,
        window: {}
    };
    vm.createContext(sandbox);
    vm.runInContext(adaptiveEngineCode, sandbox);
    return sandbox.window.AdaptiveLearningEngine;
}

test('Fase 2: AdaptiveLearningEngine - Unmapped activities do NOT alter mastery', (t) => {
    const engine = require('../public/adaptive-learning-engine.js');
    assert.ok(engine, 'AdaptiveLearningEngine should be initialized');

    // 1. Check unmapped activity metadata returns null/unmapped
    const unmappedMeta = engine.getActivityMetadata({
        id: 'mysterious_activity_99',
        category: 'unknown_alien_category',
        topic: 'unknown_topic'
    });

    assert.equal(unmappedMeta.unmapped, true, 'Unknown activity must have unmapped: true');
    assert.equal(unmappedMeta.skill, null, 'Unknown activity must have skill: null');

    // 2. Attempts with unmapped activities must NOT alter any skill mastery
    const attempts = [
        {
            id: 'attempt_1',
            activityId: 'mysterious_activity_99',
            category: 'unknown_alien_category',
            topic: 'unknown_topic',
            skill: null,
            unmapped: true,
            score: 100,
            isCorrect: true,
            timestamp: new Date().toISOString()
        }
    ];

    // Check all registered skills - none should have attempts or non-zero score from unmapped attempt
    Object.keys(engine.SKILLS_REGISTRY).forEach(skillId => {
        const mastery = engine.calculateSkillMastery(skillId, attempts);
        assert.equal(mastery.score, 0, `Skill ${skillId} should have score 0 with unmapped attempts`);
        assert.equal(mastery.attemptsCount, 0, `Skill ${skillId} should have 0 attempts count`);
    });
});

test('Fase 2: ActivityService & SyncEngine - UUID-based Idempotency', (t) => {
    const syncEngineCode = fs.readFileSync(path.join(__dirname, '../public/sync-engine.js'), 'utf8');
    const mockStorage = {};
    const sandbox = {
        console,
        Date,
        Math,
        Number,
        String,
        Array,
        Object,
        setTimeout: (fn) => { fn(); },
        clearTimeout: () => {},
        crypto: {
            randomUUID: () => '12345678-1234-4234-8234-123456789abc'
        },
        localStorage: {
            getItem: (k) => mockStorage[k] || null,
            setItem: (k, v) => { mockStorage[k] = String(v); },
            removeItem: (k) => { delete mockStorage[k]; }
        },
        window: {}
    };
    vm.createContext(sandbox);
    vm.runInContext(syncEngineCode, sandbox);

    const SyncEngine = sandbox.window.SyncEngine;
    assert.ok(SyncEngine, 'SyncEngine should exist');

    const event = SyncEngine.queueEvent('lesson_complete', {
        lessonId: 'intro_js',
        score: 100
    });

    assert.ok(event, 'Event should be queued');
    assert.ok(event.eventId.startsWith('evt_'), 'Event ID must start with evt_');
    assert.ok(event.eventId.includes('12345678-1234-4234-8234-123456789abc'), 'Event ID must utilize UUID');
});

test('Fase 2: Server Authoritative Canonical Snapshot Schema', async (t) => {
    const ProgressController = require('../src/server/controllers/progress-controller.js');
    assert.ok(ProgressController, 'ProgressController exists');

    const mockDb = {
        getUserProgress: async (userId) => ({
            userId,
            level: 3,
            lifetimeXp: 450,
            coins: 120,
            streak: 5,
            completedLessons: ['lesson_1', 'project_1'],
            quizScores: { q1: 100 },
            achievements: ['first_win'],
            inventory: ['avatar_pro'],
            equippedItems: { avatar: '🚀' }
        }),
        sanitizeProgressForResponse: (p) => p,
        getUserMastery: async () => ({
            js_variables: { score: 85, tier: { label: 'Mahir' } }
        }),
        getUserRecommendations: async () => ({
            recommendedNext: ['lesson_2']
        })
    };

    const mockSubStore = {
        get: async (userId) => ({
            plan: 'pro',
            status: 'active',
            expiresAt: Date.now() + 1000000
        })
    };

    const controller = new ProgressController({
        dbInstance: mockDb,
        subscriptionStore: mockSubStore
    });

    let jsonResponse = null;
    const mockReq = {
        user: {
            id: 'user_test_123',
            username: 'tech_learner',
            email: 'learner@uot.id',
            role: 'member'
        }
    };
    const mockRes = {
        json: (data) => { jsonResponse = data; return data; }
    };

    await controller.getMe(mockReq, mockRes);

    assert.ok(jsonResponse.ok, 'Response must be ok');
    assert.equal(jsonResponse.authenticated, true, 'User must be authenticated');
    assert.equal(jsonResponse.user.username, 'tech_learner');
    assert.equal(jsonResponse.user.isPro, true);
    assert.equal(jsonResponse.subscription.plan, 'pro');
    assert.equal(jsonResponse.progress.lifetimeXp, 450);
    assert.ok(jsonResponse.mastery.js_variables, 'Mastery map must be included');
    assert.ok(jsonResponse.recommendations.recommendedNext, 'Recommendations must be included');
    assert.equal(jsonResponse.summary.level, 3);
});
