/**
 * Automated Test Suite for Cloud Save, User Data Sync & Backend Architecture (FASE 11)
 * Exercises server database, API endpoints, event processors, idempotency, conflict resolution,
 * arbitrary XP rejection, and sync engine queue logic.
 */

const assert = require('assert');
const { dbInstance, SERVER_REWARDS, ACHIEVEMENTS_CATALOG } = require('../src/server-db');

async function runCloudSyncTests() {
    console.log('====================================================');
    console.log('🧪 RUNNING FASE 11 CLOUD SAVE & SYNC TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

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

    const testUserId = `usr_test_${Date.now()}`;

    // -------------------------------------------------------------
    // TEST 1: Server Default Progress Creation
    // -------------------------------------------------------------
    await test('Server creates default Schema progress document for new user', async () => {
        const p = await dbInstance.getUserProgress(testUserId);
        assert.strictEqual(p.userId, testUserId);
        assert.strictEqual(p.schemaVersion >= 5, true);
        assert.strictEqual(p.level, 1);
        assert.strictEqual(p.lifetimeXp, 0);
        assert.strictEqual(p.coins, 50);
        assert.deepStrictEqual(p.achievements, []);
    });

    // -------------------------------------------------------------
    // TEST 2: Process Valid Event (Lesson Complete)
    // -------------------------------------------------------------
    await test('Server processes valid lesson_complete event and awards exact rewards', async () => {
        const event = {
            eventId: `evt_lesson_${Date.now()}`,
            eventType: 'lesson_complete',
            clientTimestamp: new Date().toISOString(),
            payload: { lessonId: 'web-html-semantik' }
        };

        const res = await dbInstance.processActivityEvent(testUserId, event);
        assert.strictEqual(res.ok, true);
        assert.strictEqual(res.rewardGiven.xp, SERVER_REWARDS.READ_LESSON.xp);
        assert.strictEqual(res.rewardGiven.coins, SERVER_REWARDS.READ_LESSON.coins);

        const updated = await dbInstance.getUserProgress(testUserId);
        assert.strictEqual(updated.lifetimeXp, SERVER_REWARDS.READ_LESSON.xp);
        assert.strictEqual(updated.coins, 50 + SERVER_REWARDS.READ_LESSON.coins);
        assert(updated.learningProgress.completedLessons.includes('web-html-semantik'));
    });

    // -------------------------------------------------------------
    // TEST 3: Duplicate Event (Idempotency)
    // -------------------------------------------------------------
    await test('Duplicate event with same eventId returns alreadyProcessed without double-awarding XP', async () => {
        const eventId = `evt_dup_${Date.now()}`;
        const event = {
            eventId,
            eventType: 'quiz_complete',
            clientTimestamp: new Date().toISOString(),
            payload: { quizId: 'html_basics_quiz', score: 100 }
        };

        // First attempt
        const res1 = await dbInstance.processActivityEvent(testUserId, event);
        assert.strictEqual(res1.ok, true);
        assert.strictEqual(res1.alreadyProcessed, false);
        const xpAfterFirst = (await dbInstance.getUserProgress(testUserId)).lifetimeXp;

        // Second attempt with exact same eventId
        const res2 = await dbInstance.processActivityEvent(testUserId, event);
        assert.strictEqual(res2.ok, true);
        assert.strictEqual(res2.alreadyProcessed, true);

        const xpAfterSecond = (await dbInstance.getUserProgress(testUserId)).lifetimeXp;
        assert.strictEqual(xpAfterFirst, xpAfterSecond, 'XP must remain unchanged on duplicate event replay');
    });

    // -------------------------------------------------------------
    // TEST 4: Rejection of Arbitrary XP Submissions
    // -------------------------------------------------------------
    await test('Server rejects arbitrary XP payload attempting cheat manipulation', async () => {
        const cheatEvent = {
            eventId: `evt_cheat_${Date.now()}`,
            eventType: 'custom_hack',
            xp: 999999,
            payload: { xp: 999999 }
        };

        const res = await dbInstance.processActivityEvent(testUserId, cheatEvent);
        assert.strictEqual(res.ok, false);
        assert.strictEqual(res.error, 'ARBITRARY_XP_REJECTED');
    });

    // -------------------------------------------------------------
    // TEST 5: Batch Sync Processing
    // -------------------------------------------------------------
    await test('Batch sync processes multiple queued events in order', async () => {
        const syncUserId = `usr_batch_${Date.now()}`;

        const events = [
            {
                eventId: `evt_b1_${Date.now()}`,
                eventType: 'lesson_complete',
                payload: { lessonId: 'css-flexbox' }
            },
            {
                eventId: `evt_b2_${Date.now()}`,
                eventType: 'quiz_complete',
                payload: { quizId: 'css_flexbox_quiz', score: 85 }
            }
        ];

        const syncRes = await dbInstance.syncProgress(syncUserId, { events });
        assert.strictEqual(syncRes.ok, true);
        assert.strictEqual(syncRes.eventsProcessedCount, 2);

        const progress = await dbInstance.getUserProgress(syncUserId);
        assert(progress.learningProgress.completedLessons.includes('css-flexbox'));
        assert.strictEqual(progress.quizHistory['css_flexbox_quiz'].bestScore, 85);
    });

    // -------------------------------------------------------------
    // TEST 6: Conflict Resolution & One-time Legacy Migration
    // -------------------------------------------------------------
    await test('Domain-specific conflict resolution correctly merges legacy local data', async () => {
        const migUserId = `usr_mig_${Date.now()}`;

        // Initialize server state
        await dbInstance.processActivityEvent(migUserId, {
            eventId: `evt_m1_${Date.now()}`,
            eventType: 'achievement_unlock',
            payload: { achievementId: 'first_step' }
        });

        const legacyData = {
            lifetimeXp: 350, // Higher than server
            coins: 120,
            achievements: ['first_step', 'drill_champion'],
            inventory: ['👨‍💻', '🧙‍♂️'],
            quizHistory: {
                'html_basics_quiz': { bestScore: 90 }
            },
            completedLessons: ['web-css-flexbox']
        };

        const res = await dbInstance.syncProgress(migUserId, { events: [], legacyData });
        assert.strictEqual(res.ok, true);

        const merged = await dbInstance.getUserProgress(migUserId);
        assert.strictEqual(merged.lifetimeXp, 350, 'Lifetime XP takes max');
        assert(merged.achievements.includes('first_step') && merged.achievements.includes('drill_champion'), 'Achievements form union');
        assert(merged.inventory.includes('👨‍💻') && merged.inventory.includes('🧙‍♂️'), 'Inventory forms union');
        assert.strictEqual(merged.quizHistory['html_basics_quiz'].bestScore, 90, 'Quiz score preserved');
    });

    // -------------------------------------------------------------
    // TEST 7: Settings Update and Inventory Equip
    // -------------------------------------------------------------
    await test('Settings patch and inventory equipping validate ownership and update state', async () => {
        const user = `usr_equip_${Date.now()}`;
        await dbInstance.getUserProgress(user);

        // Update settings
        const settingsRes = await dbInstance.updateSettings(user, { soundEnabled: false, theme: 'dark' });
        assert.strictEqual(settingsRes.ok, true);
        assert.strictEqual(settingsRes.settings.soundEnabled, false);

        // Equip unowned item fails
        const equipFail = await dbInstance.equipItem(user, { avatar: '🐉' });
        assert.strictEqual(equipFail.ok, false);
        assert.strictEqual(equipFail.error, 'ITEM_NOT_OWNED');

        // Equip owned default item succeeds
        const equipSuccess = await dbInstance.equipItem(user, { avatar: '👨‍💻' });
        assert.strictEqual(equipSuccess.ok, true);
        assert.strictEqual(equipSuccess.equippedItems.avatar, '👨‍💻');
    });

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runCloudSyncTests();
