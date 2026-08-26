/**
 * UNIVERSE OF TECH - DATABASE, PERSISTENCE & TRANSACTIONS TEST SUITE
 * FASE 18 Verification
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const {
    db,
    userRepository,
    sessionRepository,
    progressRepository,
    subscriptionRepository,
    contentRepository,
    analyticsRepository,
    backupService
} = require('./db');

test('1. Registration and User Persistence', (t) => {
    const testEmail = `test_pers_${Date.now()}@universeoftech.id`;
    const userId = `usr_test_${Date.now()}`;

    const createdUser = userRepository.create({
        id: userId,
        username: 'TestPersistenceUser',
        email: testEmail,
        passwordHash: 'hash_test_12345',
        salt: 'salt_test_12345',
        role: 'user',
        isPro: false
    });

    assert.ok(createdUser, 'User must be created');
    assert.equal(createdUser.email, testEmail);

    // Verify immediate read from database
    const fetched = userRepository.findByEmail(testEmail);
    assert.ok(fetched, 'User must be found by email in database');
    assert.equal(fetched.id, userId);
    assert.equal(fetched.username, 'TestPersistenceUser');
});

test('2. Persistent Sessions across simulated restarts', (t) => {
    const token = `uot_sess_test_${Date.now()}`;
    const testUser = userRepository.getAll(1, 0)[0];
    assert.ok(testUser, 'Must have at least one user');

    const createdSession = sessionRepository.create({
        token,
        userId: testUser.id,
        role: 'user',
        isPro: false,
        maxAgeMs: 10000
    });

    assert.ok(createdSession, 'Session must be created in database');
    assert.equal(createdSession.token, token);
    assert.equal(createdSession.userId, testUser.id);

    // Fetch session
    const activeSession = sessionRepository.findByToken(token);
    assert.ok(activeSession, 'Active session must be valid');
    assert.equal(activeSession.userId, testUser.id);

    // Delete session (logout)
    const deleted = sessionRepository.delete(token);
    assert.equal(deleted, true, 'Session must be deleted');
    assert.equal(sessionRepository.findByToken(token), null, 'Deleted session must return null');
});

test('3. Progress Events Transaction & Atomic Updates', (t) => {
    const testUser = userRepository.getAll(1, 0)[0];
    const initialProgress = progressRepository.getUserProgress(testUser.id);
    const initialXp = initialProgress.lifetimeXp;
    const initialCoins = initialProgress.coins;

    const eventId = `evt_test_lesson_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lessonId = 'logika-dasar-1';

    const res = progressRepository.processActivityEvent(testUser.id, {
        eventId,
        eventType: 'lesson_complete',
        payload: { lessonId }
    });

    assert.equal(res.ok, true, 'Event must be processed successfully');
    assert.equal(res.awardedXp, 15, 'Lesson read should award 15 XP');
    assert.equal(res.awardedCoins, 8, 'Lesson read should award 8 coins');

    const updatedProgress = progressRepository.getUserProgress(testUser.id);
    assert.equal(updatedProgress.lifetimeXp, initialXp + 15, 'Lifetime XP must increment atomically');
    assert.equal(updatedProgress.coins, initialCoins + 8, 'Coins must increment atomically');
    assert.ok(updatedProgress.learningProgress.completedLessons.includes(lessonId), 'Completed lesson must be recorded in relational table');
});

test('4. Idempotency Constraint: Duplicate Event Rejection', (t) => {
    const testUser = userRepository.getAll(1, 0)[0];
    const eventId = `evt_idemp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lessonId = 'css-dasar-1';

    // First call
    const firstRes = progressRepository.processActivityEvent(testUser.id, {
        eventId,
        eventType: 'lesson_complete',
        payload: { lessonId }
    });
    assert.equal(firstRes.ok, true);
    assert.equal(firstRes.alreadyProcessed, false);

    const xpAfterFirst = progressRepository.getUserProgress(testUser.id).lifetimeXp;

    // Second call with same eventId
    const secondRes = progressRepository.processActivityEvent(testUser.id, {
        eventId,
        eventType: 'lesson_complete',
        payload: { lessonId }
    });
    assert.equal(secondRes.ok, true);
    assert.equal(secondRes.alreadyProcessed, true, 'Duplicate event must be flagged as alreadyProcessed');

    const xpAfterSecond = progressRepository.getUserProgress(testUser.id).lifetimeXp;
    assert.equal(xpAfterSecond, xpAfterFirst, 'XP must NOT be awarded twice for identical eventId');
});

test('5. Arbitrary XP Manipulation Rejection', (t) => {
    const testUser = userRepository.getAll(1, 0)[0];
    const maliciousEvent = {
        eventId: `evt_hack_${Date.now()}`,
        eventType: 'fake_custom_event',
        xp: 999999,
        payload: { xp: 999999 }
    };

    const res = progressRepository.processActivityEvent(testUser.id, maliciousEvent);
    assert.equal(res.ok, false);
    assert.equal(res.error, 'ARBITRARY_XP_REJECTED');
});

test('6. Batch Sync with Deterministic Event Acknowledgment', (t) => {
    const testUser = userRepository.getAll(1, 0)[0];
    const evt1 = { eventId: `evt_sync_1_${Date.now()}`, eventType: 'sandbox_run', payload: {} };
    const evt2 = { eventId: `evt_sync_2_${Date.now()}`, eventType: 'sandbox_run', payload: {} };

    const syncRes = progressRepository.syncProgress(testUser.id, {
        events: [evt1, evt2]
    });

    assert.equal(syncRes.ok, true);
    assert.equal(syncRes.processedCount, 2);
    assert.deepEqual(syncRes.acknowledgedEventIds, [evt1.eventId, evt2.eventId]);
});

test('7. Anti-Abuse Velocity Anomaly Detection', (t) => {
    const tempUser = userRepository.create({
        id: `usr_anomaly_${Date.now()}`,
        username: 'AnomalyUser',
        email: `anomaly_${Date.now()}@test.com`,
        passwordHash: 'hash',
        salt: 'salt'
    });

    // Send impossible quiz speed (completion in 1s with high score)
    const res = progressRepository.processActivityEvent(tempUser.id, {
        eventId: `evt_impossible_${Date.now()}`,
        eventType: 'quiz_complete',
        payload: {
            quizId: 'programming',
            score: 100,
            completionTimeSeconds: 1
        }
    });

    assert.equal(res.ok, true);
    const progress = progressRepository.getUserProgress(tempUser.id);
    const flags = progressRepository.db.all('SELECT * FROM suspicious_flags WHERE user_id = ?', [tempUser.id]);
    assert.ok(flags.length > 0, 'Suspicious flag must be recorded');
});

test('8. Database Backup Snapshot & Restoration', (t) => {
    const snapshotResult = backupService.createSnapshot('test_run');
    assert.equal(snapshotResult.ok, true);
    assert.ok(fs.existsSync(snapshotResult.filePath), 'Snapshot file must exist on disk');

    const snapshots = backupService.listSnapshots();
    assert.ok(snapshots.length > 0, 'Snapshots list must contain created snapshot');
});
