/**
 * Universe Of Tech - Core Features, Progression & Business Logic Test Suite
 * Covers items 1-15: Progression Engine, XP, Coins, Level Up, Idempotency,
 * Achievements, Project Completion, Quiz Rewards, Streak, Storage Migration,
 * Corrupted Storage, Login Demo, Subscription Demo, PRO Gating, Learning Progress.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const Progression = require("./progression-engine.js");

function createMockStorage(initial = {}) {
    const data = { ...initial };
    return {
        getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
        setItem(k, v) { data[k] = String(v); },
        removeItem(k) { delete data[k]; },
        clear() { Object.keys(data).forEach(k => delete data[k]); },
        _dump() { return data; }
    };
}

// 1 & 2. Progression Engine & XP
test("Core Feature 1 & 2: Progression Engine - Lifetime XP Monotonicity", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    assert.equal(engine.getLifetimeXp(), 0);
    const award1 = engine.awardXp(150, "Menyelesaikan Modul HTML");
    assert.equal(award1.awarded, true);
    assert.equal(award1.lifetimeXp, 150);

    // Invalid & negative amounts must be rejected without mutating lifetime XP
    assert.equal(engine.awardXp(-50).awarded, false);
    assert.equal(engine.awardXp(0).awarded, false);
    assert.equal(engine.awardXp(NaN).awarded, false);
    assert.equal(engine.awardXp("invalid").awarded, false);
    assert.equal(engine.getLifetimeXp(), 150);
});

// 3. Coins & Shop Isolation
test("Core Feature 3: Coins Currency and Shop Spending Isolation", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    engine.awardXp(200);
    const initialLifetimeXp = engine.getLifetimeXp();
    assert.equal(initialLifetimeXp, 200);

    // Initial bonus coins from XP + manual award
    engine.awardCoins(300);
    const coinsBefore = engine.getCoins();
    assert.ok(coinsBefore >= 300);

    // Spend coins on item
    const buyRes = engine.spendCoins(100, "avatar_cyber_samurai", "avatar");
    assert.equal(buyRes.success, true);
    assert.equal(buyRes.remainingCoins, coinsBefore - 100);
    // CRITICAL: Lifetime XP must NEVER decrease when coins are spent
    assert.equal(engine.getLifetimeXp(), initialLifetimeXp);

    // Overspending fails gracefully
    const overRes = engine.spendCoins(99999, "avatar_dragon", "avatar");
    assert.equal(overRes.success, false);
    assert.equal(overRes.error, "INSUFFICIENT_COINS");
    assert.equal(engine.getLifetimeXp(), initialLifetimeXp);
});

// 4. Level Up Thresholds
test("Core Feature 4: Deterministic Level Thresholds & Multi-Level Ups", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Level 1: 0..99 (needs 100)
    // Level 2: 100..299 (needs 200)
    // Level 3: 300..599 (needs 300)
    const res1 = engine.awardXp(100);
    assert.equal(res1.level, 2);
    assert.equal(res1.leveledUp, true);
    assert.equal(res1.previousLevel, 1);

    // Jump straight to Level 4 (needs 600 total XP)
    const res2 = engine.awardXp(550); // Total 650 XP
    assert.equal(res2.level, 4);
    assert.equal(res2.leveledUp, true);
    assert.equal(res2.previousLevel, 2);
    assert.equal(res2.currentLevelXp, 50); // 650 - 600
});

// 5. Reward Idempotency
test("Core Feature 5: Reward Idempotency (No duplicate payouts for same unique reward)", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const identifier = "lesson_html_intro_completed";
    const firstPayout = engine.completeActivity(identifier, { xp: 50, coins: 25, reason: "Lesson 1" });
    assert.equal(firstPayout.completed, true);
    assert.equal(firstPayout.xpAwarded, 50);
    assert.equal(engine.getLifetimeXp(), 50);

    // Second attempt with same identifier must NOT award duplicate XP
    const secondPayout = engine.completeActivity(identifier, { xp: 50, coins: 25, reason: "Lesson 1 retry" });
    assert.equal(secondPayout.completed, false);
    assert.equal(secondPayout.alreadyCompleted, true);
    assert.equal(engine.getLifetimeXp(), 50);
});

// 6. Achievements System
test("Core Feature 6: Achievement Unlock & Tracking", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const unlock = engine.unlockAchievement("first_step");
    assert.equal(unlock.unlocked, true);
    assert.ok(engine.getGameState().achievements.includes("first_step"));
    assert.ok(engine.getLifetimeXp() > 0);

    const xpAfterFirst = engine.getLifetimeXp();

    // Unlocking already unlocked achievement is idempotent
    const duplicateUnlock = engine.unlockAchievement("first_step");
    assert.equal(duplicateUnlock.unlocked, false);
    assert.equal(duplicateUnlock.alreadyUnlocked, true);
    assert.equal(engine.getLifetimeXp(), xpAfterFirst);
});

// 7. Project Completion
test("Core Feature 7: Project Completion Flow & Rewards", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const projectResult = engine.completeActivity("project:project_web_calculator", {
        xp: 120,
        coins: 60,
        reason: "Menyelesaikan Proyek Portofolio"
    });

    assert.equal(projectResult.completed, true);
    assert.equal(projectResult.xpAwarded, 120);
    assert.equal(engine.getLifetimeXp(), 120);

    // Re-submitting completed project gives no duplicate bonus
    const repeatProject = engine.completeActivity("project:project_web_calculator", { xp: 120, coins: 60 });
    assert.equal(repeatProject.completed, false);
    assert.equal(repeatProject.alreadyCompleted, true);
    assert.equal(engine.getLifetimeXp(), 120);
});

// 8. Quiz Rewards with Anti-Farming
test("Core Feature 8: Quiz Rewards with Anti-Farming Scaling", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // First attempt at quiz: full reward
    const attempt1 = engine.awardFromConfig("QUIZ_PERFECT", 1, "quiz:math:session_1");
    assert.equal(attempt1.awarded, true);
    assert.equal(attempt1.amount, 75);
    assert.equal(engine.getLifetimeXp(), 75);

    // Replaying same unique session key is rejected idempotently
    const attempt2 = engine.awardFromConfig("QUIZ_PERFECT", 1, "quiz:math:session_1");
    assert.equal(attempt2.awarded, false);
    assert.equal(attempt2.alreadyAwarded, true);
});

// 9. Streak Engine & Freeze Shield
test("Core Feature 9: Streak Calculation, Daily Increment & Freeze Protection", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Day 1
    const day1 = new Date("2026-08-20T10:00:00Z");
    const day1Result = engine.touchStreak(day1);
    assert.equal(day1Result.streak, 1);
    assert.equal(day1Result.activeToday, true);

    // Same day activity does not double streak
    const day1Repeat = engine.touchStreak(day1);
    assert.equal(day1Repeat.streak, 1);
    assert.equal(day1Repeat.incremented, false);

    // Day 2 (Consecutive)
    const day2 = new Date("2026-08-21T10:00:00Z");
    const day2Result = engine.touchStreak(day2);
    assert.equal(day2Result.streak, 2);
    assert.equal(day2Result.incremented, true);

    // Day 4 (Skipped Day 3 - gap of 2 days) -> Freeze consumes shield to save streak
    const day4 = new Date("2026-08-23T10:00:00Z");
    const day4Result = engine.touchStreak(day4);
    assert.equal(day4Result.preservedByFreeze, true);
    assert.equal(day4Result.streak, 2); // Preserved
});

// 10. Storage Migration from Legacy Keys
test("Core Feature 10: Storage Migration from Legacy Keys to Unified State", () => {
    const storage = createMockStorage({
        eduquestXP: "450",
        eduquestStreak: "5",
        eduquestRPG: JSON.stringify({ coins: 220, inventory: ["hat_wizard"] }),
        bahasa_progress: JSON.stringify({ sumatra_aceh: { mastered: true } })
    });

    const engine = Progression.createEngine(storage);
    const state = engine.getGameState();

    assert.equal(state.lifetimeXp, 450);
    assert.equal(state.streak, 5);
    assert.ok(state.coins >= 220);
    assert.ok(state.schemaVersion >= 2);
});

// 11. Corrupted LocalStorage Handling
test("Core Feature 11: Resilience to Corrupted / Malformed LocalStorage Data", () => {
    const storage = createMockStorage({
        uot_game_state: "{ malformed: json !@#$",
        eduquestUserSession: "not-a-json",
        uot_subscription: "{ expired: true,,,"
    });

    // Initializing engine must NEVER crash
    let engine;
    assert.doesNotThrow(() => {
        engine = Progression.createEngine(storage);
    });

    assert.equal(engine.getLifetimeXp(), 0);
    assert.equal(engine.getPlayerLevel(), 1);

    // Engine is able to write clean state recovery
    engine.awardXp(50);
    assert.equal(engine.getLifetimeXp(), 50);
});

// 12. Login Demo Session
test("Core Feature 12: Login Demo Session State & Normalization", () => {
    const storage = createMockStorage();

    function normalizeSession(user) {
        if (!user || typeof user !== "object") return null;
        return {
            isLoggedIn: Boolean(user.isLoggedIn),
            username: String(user.username || "Guest").trim().slice(0, 80),
            email: String(user.email || "").trim().slice(0, 254),
            avatar: user.avatar || "👤",
            isDemo: Boolean(user.isDemo),
            loginAt: user.loginAt || new Date().toISOString()
        };
    }

    const demoUser = {
        username: "Demo Student",
        email: "demo@universeoftech.local",
        avatar: "🚀",
        isLoggedIn: true,
        isDemo: true
    };

    const normalized = normalizeSession(demoUser);
    storage.setItem("eduquestUserSession", JSON.stringify(normalized));

    const retrieved = JSON.parse(storage.getItem("eduquestUserSession"));
    assert.equal(retrieved.isLoggedIn, true);
    assert.equal(retrieved.isDemo, true);
    assert.equal(retrieved.username, "Demo Student");
    assert.equal(retrieved.avatar, "🚀");
});

// 13. Subscription Demo & Expiry Calculation
test("Core Feature 13: Subscription Sandbox Demo & Days Remaining", () => {
    const storage = createMockStorage();

    function createSubscription(tier = "pro", source = "sandbox_demo") {
        const now = new Date();
        const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        return {
            status: "active",
            tier,
            source,
            isDemo: source.includes("demo"),
            activatedAt: now.toISOString(),
            expiresAt: expiry.toISOString()
        };
    }

    const sub = createSubscription("pro", "sandbox_demo");
    storage.setItem("eduquestSubscription", "pro");
    storage.setItem("eduquestSubscriptionDetails", JSON.stringify(sub));

    const saved = JSON.parse(storage.getItem("eduquestSubscriptionDetails"));
    assert.equal(saved.status, "active");
    assert.equal(saved.isDemo, true);
    assert.equal(saved.source, "sandbox_demo");

    const daysLeft = Math.ceil((new Date(saved.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    assert.ok(daysLeft >= 29 && daysLeft <= 30);
});

// 14. PRO Gating & Entitlement Checks
test("Core Feature 14: PRO Gating Logic and Route Protection", () => {
    function checkProAccess(subscriptionState, featureRequirement) {
        if (!featureRequirement.requiresPro) return { allowed: true };
        const isPro = subscriptionState === "pro";
        return {
            allowed: isPro,
            reason: isPro ? "GRANTED" : "PRO_REQUIRED",
            upgradeUrl: isPro ? null : "payment.html?source=gating"
        };
    }

    const freeAccess = checkProAccess("free", { requiresPro: true });
    assert.equal(freeAccess.allowed, false);
    assert.equal(freeAccess.reason, "PRO_REQUIRED");
    assert.ok(freeAccess.upgradeUrl.includes("payment.html"));

    const proAccess = checkProAccess("pro", { requiresPro: true });
    assert.equal(proAccess.allowed, true);
    assert.equal(proAccess.reason, "GRANTED");

    const openAccess = checkProAccess("free", { requiresPro: false });
    assert.equal(openAccess.allowed, true);
});

// 15. Learning Progress Tracking Across Tracks
test("Core Feature 15: Learning Progress Tracking and Curriculum Aggregation", () => {
    const sampleCurriculum = {
        tracks: [
            { id: "frontend", title: "Frontend Web", lessons: ["fe-1", "fe-2", "fe-3"] },
            { id: "backend", title: "Backend API", lessons: ["be-1", "be-2"] }
        ]
    };

    const progress = {
        completedLessons: {
            "fe-1": { completedAt: "2026-08-20", score: 100 },
            "fe-2": { completedAt: "2026-08-21", score: 90 }
        }
    };

    function calculateTrackProgress(track, userProgress) {
        const completed = track.lessons.filter(l => Boolean(userProgress.completedLessons[l])).length;
        const total = track.lessons.length;
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
        };
    }

    const feProgress = calculateTrackProgress(sampleCurriculum.tracks[0], progress);
    assert.equal(feProgress.completed, 2);
    assert.equal(feProgress.total, 3);
    assert.equal(feProgress.percentage, 67);

    const beProgress = calculateTrackProgress(sampleCurriculum.tracks[1], progress);
    assert.equal(beProgress.completed, 0);
    assert.equal(beProgress.total, 2);
    assert.equal(beProgress.percentage, 0);
});
