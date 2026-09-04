const assert = require('assert');
global.window = {};
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

const activities = [];
global.window.ProgressionEngine = {
    recordActivity: (type, options) => {
        global.lastProgressionActivity = { type, metadata: options };
        // We simulate saving it in ProgressionEngine
        activities.push({
            type,
            skill: options.skill,
            topic: options.topic,
            score: options.score !== undefined ? options.score : (options.accuracy || 100),
            errorType: options.errorType || "none",
            timestamp: new Date().toISOString()
        });
    },
    getGameState: () => ({ xp: 100, streak: 1, level: 1, activities })
};
global.ProgressionEngine = global.window.ProgressionEngine;

const listeners = {};
global.window.addEventListener = (evt, cb) => {
    if (!listeners[evt]) listeners[evt] = [];
    listeners[evt].push(cb);
};
global.window.dispatchEvent = (e) => {
    if (listeners[e.type]) {
        listeners[e.type].forEach(cb => cb(e));
    }
};
class CustomEvent {
    constructor(type, options) {
        this.type = type;
        this.detail = options ? options.detail : null;
    }
}
global.CustomEvent = CustomEvent;
global.window.CustomEvent = CustomEvent;

const AdaptiveEngine = require('../public/adaptive-learning-engine');
global.window.AdaptiveLearningEngine = AdaptiveEngine;
global.AdaptiveLearningEngine = AdaptiveEngine;
if (typeof AdaptiveEngine.init === "function") AdaptiveEngine.init();

const ActivityService = require('../public/activity-service');
global.window.ActivityService = ActivityService;
global.ActivityService = ActivityService;

const RecommendationService = require('../public/recommendation-service');
global.window.RecommendationService = RecommendationService;

async function runPipelineTest() {
    console.log('====================================================');
    console.log('🧪 RUNNING FASE 12 PIPELINE TEST SUITE (Activity -> Mastery -> Recommend)');
    console.log('====================================================\n');
    let passed = 0; let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  ✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ [FAIL] ${name}`);
            console.error(`     Error: ${err.message}`);
            failed++;
        }
    }

    await test('1. ActivityService sets proper metadata and defaults before delegating', async () => {
        ActivityService.recordQuiz("quiz-123", 80, {
            topic: "Variabel dan Tipe Data JavaScript"
        });
        console.log("Last progression:", global.lastProgressionActivity);
        
        
        const mastery = AdaptiveEngine.calculateSkillMastery("js_variables", global.window.ProgressionEngine.getGameState().activities);
        assert.ok(mastery.score > 0, 'Mastery score should be updated via ActivityService pipeline. Score: ' + mastery.score);
    });

    await test('2. ActivityService handles errors (concept vs careless)', async () => {
        ActivityService.recordQuiz("quiz-124", 50, {
            topic: "Fungsi Asynchronous",
            errorType: "concept"
        });
        const mastery = AdaptiveEngine.calculateSkillMastery("js_async", global.window.ProgressionEngine.getGameState().activities);
        assert.ok(mastery.score < 80, 'Mastery should be lower due to concept error');
        assert.equal(global.lastProgressionActivity.type, "quiz_complete");
    });
    
    await test('3. RecommendationService consumes mastery correctly', async () => {
        const recommendations = await RecommendationService.getRecommendations();
        assert.ok(recommendations.recommendedNext, 'Should recommend a next action');
        assert.ok(recommendations.masterySummary, 'Should return mastery summary');
        
        const summary = recommendations.masterySummary;
        assert.ok(summary['js_variables'] || summary['js_async'], 'Recorded skills should be in summary');
    });

    console.log(`\n====================================================`);
    console.log(`Result: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runPipelineTest().catch(err => {
    console.error("Pipeline test crashed:", err);
    process.exit(1);
});
