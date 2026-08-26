const test = require('node:test');
const assert = require('node:assert/strict');
const ActivityService = require('./activity-service.js');
const ProgressionEngine = require('./progression-engine.js');
const SyncEngine = require('./sync-engine.js');

test('System Integration: ActivityService single pipeline and event bus', async (t) => {
    // Setup mock global environment for Node.js test environment
    const store = new Map();
    global.localStorage = {
        getItem: (key) => store.get(key) || null,
        setItem: (key, val) => store.set(key, String(val)),
        removeItem: (key) => store.delete(key),
        clear: () => store.clear()
    };

    const mockEvents = [];
    global.window = {
        localStorage: global.localStorage,
        Progression: ProgressionEngine,
        ProgressionEngine: ProgressionEngine,
        SyncEngine: SyncEngine,
        UOTAnalytics: {
            trackEvent: (evt, props) => mockEvents.push({ type: 'analytics_event', evt, props }),
            trackLesson: (act, id, props) => mockEvents.push({ type: 'analytics_lesson', act, id, props }),
            trackQuiz: (act, id, props) => mockEvents.push({ type: 'analytics_quiz', act, id, props })
        },
        dispatchEvent: (e) => {
            mockEvents.push({ type: 'window_event', eventName: e.type, detail: e.detail });
        }
    };

    await t.test('1. recordLesson routes through single pipeline', () => {
        const result = ActivityService.recordLesson('lesson_html_01', {
            title: 'Dasar HTML Semantik',
            xp: 25,
            trackId: 'programming'
        });

        assert.equal(result.ok, true);
        assert.equal(result.activityType, 'lesson_complete');
        assert.ok(result.feedback);
        assert.ok(result.feedback.xpAwarded >= 25);

        // Check event queueing
        const pendingEvents = SyncEngine.getQueue();
        assert.ok(pendingEvents.length > 0);
        const lastEvent = pendingEvents[pendingEvents.length - 1];
        assert.equal(lastEvent.eventType, 'lesson_complete');
        assert.equal(lastEvent.payload.lessonId, 'lesson_html_01');
    });

    await t.test('2. recordQuiz routes through single pipeline and awards XP', () => {
        const result = ActivityService.recordQuiz('quiz_css_grid', 100, {
            title: 'Kuis CSS Grid',
            correctCount: 5,
            totalQuestions: 5
        });

        assert.equal(result.ok, true);
        assert.equal(result.activityType, 'quiz_complete');
        assert.ok(result.feedback.xpAwarded > 0);

        const pendingEvents = SyncEngine.getQueue();
        const quizEvent = pendingEvents.find(e => e.payload.quizId === 'quiz_css_grid');
        assert.ok(quizEvent);
        assert.equal(quizEvent.eventType, 'quiz_complete');
        assert.equal(quizEvent.payload.score, 100);
    });

    await t.test('3. recordProject routes through single pipeline', () => {
        const result = ActivityService.recordProject('proj_portfolio', {
            title: 'Web Portofolio',
            xp: 150,
            coins: 75
        });

        assert.equal(result.ok, true);
        assert.equal(result.activityType, 'project_complete');
        assert.ok(result.feedback.xpAwarded >= 150);

        const pendingEvents = SyncEngine.getQueue();
        const projectEvent = pendingEvents.find(e => e.payload.projectId === 'proj_portfolio');
        assert.ok(projectEvent);
        assert.equal(projectEvent.eventType, 'project_complete');
    });

    await t.test('4. recordGame routes through single pipeline', () => {
        const result = ActivityService.recordGame('game_syntax_scramble', 85, {
            title: 'Syntax Scramble',
            difficulty: 'medium',
            xp: 30,
            coins: 15
        });

        assert.equal(result.ok, true);
        assert.equal(result.activityType, 'game_complete');

        const pendingEvents = SyncEngine.getQueue();
        const gameEvent = pendingEvents.find(e => e.payload.gameId === 'game_syntax_scramble');
        assert.ok(gameEvent);
        assert.equal(gameEvent.eventType, 'game_complete');
    });

    await t.test('5. recordSandboxRun routes through single pipeline', () => {
        const result = ActivityService.recordSandboxRun({
            codeLength: 120,
            language: 'javascript'
        });

        assert.equal(result.ok, true);
        assert.equal(result.activityType, 'sandbox_run');

        const pendingEvents = SyncEngine.getQueue();
        const sandboxEvent = pendingEvents.find(e => e.eventType === 'sandbox_run');
        assert.ok(sandboxEvent);
    });

    await t.test('6. Event Bus listener receives uot:activity and uot:progress emissions', () => {
        let receivedActivity = null;
        const unsubscribe = ActivityService.subscribe('uot:activity', (detail) => {
            receivedActivity = detail;
        });

        ActivityService.recordLesson('lesson_test_bus', {
            title: 'Bus Event Test',
            xp: 20
        });

        assert.ok(receivedActivity);
        assert.equal(receivedActivity.type, 'lesson_complete');
        assert.equal(receivedActivity.payload.lessonId, 'lesson_test_bus');

        unsubscribe();
    });
});
