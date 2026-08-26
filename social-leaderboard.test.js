const assert = require('assert');
const { dbInstance, SERVER_REWARDS } = require('./server-db');

console.log('=== MEMULAI TEST SUITE: SOCIAL LEARNING & REAL LEADERBOARD (FASE 14) ===\n');

// Helper to clear database state before testing
function resetTestDatabase() {
    dbInstance.users.clear();
    dbInstance.progress.clear();
    dbInstance.sessions.clear();
}

// 1. TEST REAL LEADERBOARD & PERIOD BOUNDARIES
(() => {
    console.log('[Test 1] Real Leaderboard & Timestamped Event Boundaries...');
    resetTestDatabase();

    const u1 = 'usr_test_alpha';
    const u2 = 'usr_test_beta';

    const p1 = dbInstance.getUserProgress(u1);
    const p2 = dbInstance.getUserProgress(u2);

    p1.profile.username = 'AlphaCoder';
    p1.settings.displayName = 'Alpha Coder';

    p2.profile.username = 'BetaDev';
    p2.settings.displayName = 'Beta Dev';

    // Current event for Alpha
    dbInstance.processActivityEvent(u1, {
        eventId: 'evt_alpha_1',
        eventType: 'quiz_complete',
        payload: { quizId: 'q1', score: 100, completionTimeSeconds: 45 }
    });

    // Old event for Alpha (30 days ago)
    const oldTimestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    p1.xpLedger.push({
        eventId: 'evt_alpha_old',
        eventType: 'lesson_complete',
        xp: 200,
        coins: 100,
        timestamp: oldTimestamp,
        reason: 'Legacy Lesson'
    });
    p1.lifetimeXp += 200;

    // Current event for Beta
    dbInstance.processActivityEvent(u2, {
        eventId: 'evt_beta_1',
        eventType: 'project_complete',
        payload: { projectId: 'proj1', isComplete: true }
    });

    // Test Weekly Leaderboard
    const weeklyLb = dbInstance.getLeaderboard({ period: 'weekly', currentUserId: u1 });
    assert.strictEqual(weeklyLb.ok, true, 'Weekly leaderboard harus ok');
    assert.strictEqual(weeklyLb.entries.length, 2, 'Harus ada 2 user di leaderboard');

    // Alpha current XP = 75 (Quiz Perfect reward)
    // Beta current XP = 120 (Project Complete reward)
    // Beta should be rank 1 in weekly, Alpha rank 2
    assert.strictEqual(weeklyLb.entries[0].userId, u2, 'BetaDev harus rank 1 di weekly');
    assert.strictEqual(weeklyLb.entries[0].rank, 1);
    assert.strictEqual(weeklyLb.entries[0].xp, 120);

    assert.strictEqual(weeklyLb.entries[1].userId, u1, 'AlphaCoder harus rank 2 di weekly');
    assert.strictEqual(weeklyLb.entries[1].rank, 2);
    assert.strictEqual(weeklyLb.entries[1].xp, 75);

    // Test All Time Leaderboard
    const allTimeLb = dbInstance.getLeaderboard({ period: 'all_time', currentUserId: u1 });
    assert.strictEqual(allTimeLb.ok, true);
    // Alpha lifetimeXp = 75 + 200 = 275. Beta lifetimeXp = 120.
    // Alpha should be rank 1 in all_time
    assert.strictEqual(allTimeLb.entries[0].userId, u1, 'AlphaCoder harus rank 1 di all_time');
    assert.strictEqual(allTimeLb.entries[0].xp, 275);

    console.log('✓ Test 1 Berhasil: Weekly vs All Time leaderboard dihitung dari event timestamp aktual.\n');
})();

// 2. TEST PAGINATION & USER RANK CALCULATION
(() => {
    console.log('[Test 2] Leaderboard Pagination & Caller Rank...');
    resetTestDatabase();

    // Create 25 test users
    for (let i = 1; i <= 25; i++) {
        const uid = `usr_page_${i}`;
        const p = dbInstance.getUserProgress(uid);
        p.profile.username = `User_${i}`;
        p.settings.displayName = `User ${i}`;
        p.lifetimeXp = i * 10;
        p.xpLedger.push({
            eventId: `evt_p_${i}`,
            eventType: 'sandbox_run',
            xp: i * 10,
            coins: 5,
            timestamp: new Date().toISOString(),
            reason: 'Sandbox'
        });
    }

    // Page 1 with limit 10
    const page1 = dbInstance.getLeaderboard({ period: 'weekly', page: 1, limit: 10, currentUserId: 'usr_page_5' });
    assert.strictEqual(page1.entries.length, 10, 'Page 1 harus berisi 10 item');
    assert.strictEqual(page1.totalCount, 25, 'Total user harus 25');
    assert.strictEqual(page1.totalPages, 3, 'Total pages harus 3');
    assert.strictEqual(page1.entries[0].userId, 'usr_page_25', 'User 25 dengan XP tertinggi harus rank 1');
    assert.strictEqual(page1.userRank.rank, 21, 'User 5 dengan 50 XP harus rank 21');

    // Page 2
    const page2 = dbInstance.getLeaderboard({ period: 'weekly', page: 2, limit: 10, currentUserId: 'usr_page_5' });
    assert.strictEqual(page2.entries.length, 10);
    assert.strictEqual(page2.entries[0].userId, 'usr_page_15');

    console.log('✓ Test 2 Berhasil: Pagination dan caller rank terbukti presisi.\n');
})();

// 3. TEST PRIVACY CONTROLS & EXCLUSION OF SENSITIVE DATA
(() => {
    console.log('[Test 3] Privacy Controls & Sensitive Data Protection...');
    resetTestDatabase();

    const u1 = 'usr_public';
    const u2 = 'usr_hidden';
    const u3 = 'usr_private';

    const p1 = dbInstance.getUserProgress(u1);
    const p2 = dbInstance.getUserProgress(u2);
    const p3 = dbInstance.getUserProgress(u3);

    p1.profile.email = 'public@example.com';
    p2.profile.email = 'secret_hidden@example.com';
    p3.profile.email = 'secret_private@example.com';

    p2.settings.showOnLeaderboard = false; // Opt-out from leaderboard
    p3.settings.privateProfile = true;      // Private social profile

    dbInstance.processActivityEvent(u1, { eventId: 'e1', eventType: 'sandbox_run' });
    dbInstance.processActivityEvent(u2, { eventId: 'e2', eventType: 'sandbox_run' });
    dbInstance.processActivityEvent(u3, { eventId: 'e3', eventType: 'sandbox_run' });

    // Leaderboard test
    const lb = dbInstance.getLeaderboard({ period: 'weekly', currentUserId: u1 });
    const userIdsInLb = lb.entries.map(e => e.userId);
    assert.strictEqual(userIdsInLb.includes(u1), true, 'Public user harus masuk leaderboard');
    assert.strictEqual(userIdsInLb.includes(u2), false, 'Hidden user tidak boleh muncul di leaderboard');

    // Ensure NO email in leaderboard items
    lb.entries.forEach(entry => {
        assert.strictEqual(entry.email, undefined, 'Email tidak boleh ada di leaderboard');
        assert.strictEqual(entry.passwordHash, undefined, 'Password hash tidak boleh ada di leaderboard');
    });

    // Social Profile test for private user
    const privateProf = dbInstance.getSocialProfile(u3, u1);
    assert.strictEqual(privateProf.ok, true);
    assert.strictEqual(privateProf.isPrivate, true, 'Profile harus bertanda private');
    assert.strictEqual(privateProf.achievementsShowcase, undefined, 'Private profile tidak boleh mengekspos achievements');
    assert.strictEqual(privateProf.email, undefined, 'Email tidak boleh diekspos di social profile');

    console.log('✓ Test 3 Berhasil: Privacy controls & perlindungan data sensitif tervalidasi.\n');
})();

// 4. TEST FRIEND / FOLLOW SYSTEM & FRIENDS COHORT
(() => {
    console.log('[Test 4] Friend/Follow System & Cohort Filtering...');
    resetTestDatabase();

    const u1 = 'usr_f1';
    const u2 = 'usr_f2';
    const u3 = 'usr_stranger';

    dbInstance.getUserProgress(u1);
    dbInstance.getUserProgress(u2);
    dbInstance.getUserProgress(u3);

    // Follow u2
    const followRes = dbInstance.followUser(u1, u2);
    assert.strictEqual(followRes.ok, true);
    assert.strictEqual(followRes.isFollowing, true);

    // Check friends profile for u1
    const p1Social = dbInstance.getSocialProfile(u2, u1);
    assert.strictEqual(p1Social.isFollowing, true);

    // Friend cohort leaderboard for u1
    dbInstance.processActivityEvent(u1, { eventId: 'e1', eventType: 'sandbox_run' });
    dbInstance.processActivityEvent(u2, { eventId: 'e2', eventType: 'sandbox_run' });
    dbInstance.processActivityEvent(u3, { eventId: 'e3', eventType: 'sandbox_run' });

    const friendsLb = dbInstance.getLeaderboard({ cohort: 'friends', currentUserId: u1 });
    const friendIdsInLb = friendsLb.entries.map(e => e.userId);
    assert.strictEqual(friendIdsInLb.includes(u1), true, 'Diri sendiri harus masuk friends leaderboard');
    assert.strictEqual(friendIdsInLb.includes(u2), true, 'Teman yang diikuti harus masuk');
    assert.strictEqual(friendIdsInLb.includes(u3), false, 'Stranger tidak boleh masuk friends leaderboard');

    console.log('✓ Test 4 Berhasil: Friend follow & cohort leaderboard tervalidasi.\n');
})();

// 5. TEST LEARNING CHALLENGE SYSTEM & AUTHORITATIVE REWARDS
(() => {
    console.log('[Test 5] Weekly Learning Challenges & Centralized Reward Engine...');
    resetTestDatabase();

    const uid = 'usr_challenger';
    const p = dbInstance.getUserProgress(uid);

    // Complete 3 lessons
    dbInstance.processActivityEvent(uid, { eventId: 'l1', eventType: 'lesson_complete', payload: { lessonId: 'les_1' } });
    dbInstance.processActivityEvent(uid, { eventId: 'l2', eventType: 'lesson_complete', payload: { lessonId: 'les_2' } });
    dbInstance.processActivityEvent(uid, { eventId: 'l3', eventType: 'lesson_complete', payload: { lessonId: 'les_3' } });

    // Check challenges status
    const chall = dbInstance.getChallenges(uid);
    assert.strictEqual(chall.ok, true);

    const lessonCh = chall.challenges.find(c => c.id === 'ch_lessons_3');
    assert.notStrictEqual(lessonCh, undefined);
    assert.strictEqual(lessonCh.current, 3, 'Progress materi harus 3');
    assert.strictEqual(lessonCh.isCompleted, true, 'Tantangan materi harus selesai');
    assert.strictEqual(lessonCh.isClaimed, false, 'Belum diklaim');

    // Claim challenge reward
    const claimRes = dbInstance.claimChallengeReward(uid, 'ch_lessons_3');
    assert.strictEqual(claimRes.ok, true);
    assert.strictEqual(claimRes.rewardGiven.xp, 100);
    assert.strictEqual(claimRes.rewardGiven.coins, 50);

    // Double claim rejection
    const claimAgain = dbInstance.claimChallengeReward(uid, 'ch_lessons_3');
    assert.strictEqual(claimAgain.ok, false);
    assert.strictEqual(claimAgain.error, 'ALREADY_CLAIMED');

    console.log('✓ Test 5 Berhasil: Learning challenges & klaim klausal terverifikasi.\n');
})();

// 6. TEST ANTI-ABUSE ANOMALY DETECTION & FLAGGING
(() => {
    console.log('[Test 6] Anti-Abuse Anomaly Detection & Flagging...');
    resetTestDatabase();

    const uid = 'usr_cheater';
    const p = dbInstance.getUserProgress(uid);

    // 1. Impossible quiz completion time (< 3s with high score)
    const quizRes = dbInstance.processActivityEvent(uid, {
        eventId: 'q_speedrun_1',
        eventType: 'quiz_complete',
        payload: { quizId: 'q_fast', score: 100, completionTimeSeconds: 1 }
    });
    assert.strictEqual(quizRes.ok, true, 'Event tetap diproses tanpa kencang-kencang crash');
    assert.strictEqual(p.flagged, true, 'User harus di-flag karena completion time 1 detik');
    assert.strictEqual(p.suspiciousFlags.length, 1);

    // Flagged user should be excluded from public leaderboard
    const lb = dbInstance.getLeaderboard({ period: 'weekly', currentUserId: uid });
    const isCheaterInLb = lb.entries.some(e => e.userId === uid);
    assert.strictEqual(isCheaterInLb, false, 'User ter-flag tidak boleh muncul di leaderboard publik');

    console.log('✓ Test 6 Berhasil: Detection anomalies & non-banning flag safety tervalidasi.\n');
})();

// 7. TEST PERSONAL BESTS TRACKING
(() => {
    console.log('[Test 7] Personal Bests Tracking...');
    resetTestDatabase();

    const uid = 'usr_best';
    dbInstance.processActivityEvent(uid, {
        eventId: 'q1',
        eventType: 'quiz_complete',
        payload: { quizId: 'q_test', score: 85, completionTimeSeconds: 20 }
    });

    dbInstance.processActivityEvent(uid, {
        eventId: 'q2',
        eventType: 'quiz_complete',
        payload: { quizId: 'q_test_2', score: 95, completionTimeSeconds: 12 }
    });

    const p = dbInstance.getUserProgress(uid);
    assert.strictEqual(p.personalBests.highestQuizScore, 95);
    assert.strictEqual(p.personalBests.fastestQuizCompletionSeconds, 12);

    console.log('✓ Test 7 Berhasil: Personal bests tercatat dengan teliti.\n');
})();

// 8. TEST NON-SPAM NOTIFICATIONS
(() => {
    console.log('[Test 8] Non-Spam Notification System...');
    resetTestDatabase();

    const uid = 'usr_notif';

    dbInstance.addNotification(uid, { type: 'rank_milestone', title: 'Top 10', message: 'Kamu masuk Top 10!' });
    dbInstance.addNotification(uid, { type: 'rank_milestone', title: 'Top 10', message: 'Kamu masuk Top 10!' }); // Duplicate within 1h

    const notifs = dbInstance.getNotifications(uid);
    assert.strictEqual(notifs.ok, true);
    assert.strictEqual(notifs.notifications.length, 1, 'Notifikasi duplikat harus di-deduplikasi');

    console.log('✓ Test 8 Berhasil: Non-spam notification system tervalidasi.\n');
})();

console.log('================================================================');
console.log('ALL FASE 14 SOCIAL LEARNING & LEADERBOARD TESTS PASSED (8/8)!');
console.log('================================================================');
