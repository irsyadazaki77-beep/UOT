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

test("1. Award XP: lifetimeXp bertambah dan tidak pernah berkurang", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    assert.equal(engine.getLifetimeXp(), 0);
    assert.equal(engine.getPlayerLevel(), 1);

    const res1 = engine.awardXp(50, "Membaca Modul");
    assert.equal(res1.awarded, true);
    assert.equal(res1.lifetimeXp, 50);
    assert.equal(engine.getLifetimeXp(), 50);

    // Negative / invalid amounts are rejected without decreasing lifetimeXp
    const resNegative = engine.awardXp(-20, "Negative XP");
    assert.equal(resNegative.awarded, false);
    assert.equal(engine.getLifetimeXp(), 50);

    const resZero = engine.awardXp(0);
    assert.equal(resZero.awarded, false);
    assert.equal(engine.getLifetimeXp(), 50);
});

test("2. Level Up: Formula level tunggal dan akurat", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Level 1 -> Level 2 butuh 100 XP
    const res1 = engine.awardXp(99);
    assert.equal(res1.level, 1);
    assert.equal(res1.leveledUp, false);
    assert.equal(engine.getLevelProgress().percentage, 99);

    const res2 = engine.awardXp(1);
    assert.equal(res2.level, 2);
    assert.equal(res2.leveledUp, true);
    assert.equal(res2.currentLevelXp, 0);
    assert.equal(engine.getLevelProgress().xpNeededForNext, 200);
});

test("3. Multiple Level Up: Penambahan XP besar menaikkan multi-level secara deterministik", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Level 1: 0..99 (100 xp)
    // Level 2: 100..299 (200 xp)
    // Level 3: 300..599 (300 xp)
    // Level 4: 600..999 (400 xp)
    // Level 5: 1000..1499 (500 xp)
    const res = engine.awardXp(1050, "Mega Bonus");
    assert.equal(res.level, 5);
    assert.equal(res.leveledUp, true);
    assert.equal(res.previousLevel, 1);
    assert.equal(res.newLevel, 5);
    assert.equal(res.currentLevelXp, 50); // 1050 - 1000 = 50
    assert.equal(engine.getLevelProgress().xpNeededForNext, 500);
});

test("4. Spend Coins: Shop hanya memakai coins, lifetimeXp tidak berkurang", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Give 200 XP -> grants bonus coins (100 coins)
    engine.awardXp(200);
    const initialXp = engine.getLifetimeXp();
    assert.equal(initialXp, 200);

    // Add extra coins
    engine.awardCoins(150);
    const coinsBefore = engine.getCoins();

    // Purchase avatar with 100 coins
    const purchase = engine.spendCoins(100, "🧙‍♂️", "avatar");
    assert.equal(purchase.success, true);
    assert.equal(purchase.remainingCoins, coinsBefore - 100);
    assert.equal(engine.getLifetimeXp(), initialXp); // Rule 1 & 12: XP untouched!
    assert.ok(engine.getGameState().inventory.includes("🧙‍♂️"));
    assert.equal(engine.getGameState().equippedItems.avatar, "🧙‍♂️");

    // Attempting to buy when coins are insufficient fails gracefully
    const overspend = engine.spendCoins(99999, "👑", "avatar");
    assert.equal(overspend.success, false);
    assert.equal(overspend.error, "INSUFFICIENT_COINS");
    assert.equal(engine.getLifetimeXp(), initialXp);
});

test("5. Achievement XP: Buka pencapaian benar-benar memberikan XP & Coins", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const initialXp = engine.getLifetimeXp();
    const achResult = engine.unlockAchievement("first_step"); // first_step = +50 XP, +25 Coins

    assert.equal(achResult.unlocked, true);
    assert.equal(achResult.xpAwarded, 50);
    assert.equal(engine.getLifetimeXp(), initialXp + 50);
    assert.ok(engine.getGameState().achievements.includes("first_step"));

    // Re-unlocking the same achievement returns alreadyUnlocked and does NOT grant duplicate XP
    const repeat = engine.unlockAchievement("first_step");
    assert.equal(repeat.unlocked, false);
    assert.equal(repeat.alreadyUnlocked, true);
    assert.equal(engine.getLifetimeXp(), initialXp + 50);
});

test("6. Project XP: Penyelesaian proyek benar-benar memberikan XP", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const initialXp = engine.getLifetimeXp();
    const projectReward = engine.completeActivity("project:html-basics", {
        xp: 100,
        coins: 50,
        reason: "Selesai Proyek HTML Basics",
        achievementId: "project_master"
    });

    assert.equal(projectReward.completed, true);
    assert.equal(projectReward.xpAwarded, 100);
    // 100 XP from project + 200 XP from project_master achievement = 300 XP
    assert.equal(engine.getLifetimeXp(), initialXp + 100 + 200);
    assert.ok(engine.getGameState().completedRewards["project:html-basics"]);
    assert.ok(engine.getGameState().achievements.includes("project_master"));
});

test("7. Duplicate Rewards: Reward dengan identifier bersifat idempotent", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const res1 = engine.awardXp(100, "Selesaikan Kuis Web", "quiz:web-101:passed");
    assert.equal(res1.awarded, true);
    assert.equal(res1.lifetimeXp, 100);

    // Simulate page reload or repeat click
    const res2 = engine.awardXp(100, "Selesaikan Kuis Web", "quiz:web-101:passed");
    assert.equal(res2.awarded, false);
    assert.equal(res2.alreadyAwarded, true);
    assert.equal(res2.lifetimeXp, 100); // XP remains 100!
});

test("8. Migration Legacy: Membaca dan menggabungkan data dari eduquestRPG, eduquestXP, eduquestLmsProgress, bahasa_progress", () => {
    const legacyStorage = createMockStorage({
        eduquestRPG: JSON.stringify({
            level: 3,
            xp: 150,
            totalXp: 450,
            coins: 300,
            streak: 4,
            achievements: ["drill_champion"],
            unlockedAvatars: ["👨‍💻", "🤖"],
            activeAvatar: "🤖"
        }),
        eduquestXP: "500",
        eduquestStreak: "7",
        eduquestLmsProgress: JSON.stringify({
            xp: 200,
            unlockedBadges: ["sandbox_hacker"]
        }),
        bahasa_progress: JSON.stringify({
            bonusXP: 50,
            explored: ["p1", "p2"],
            mastered: ["p1"],
            quizDone: 2,
            streak: 5
        })
    });

    const engine = Progression.createEngine(legacyStorage);
    const state = engine.getGameState();

    // Combined XP should pick highest non-destructive total (>= 500)
    assert.ok(state.lifetimeXp >= 500);
    assert.equal(state.streak, 7); // Highest streak picked
    assert.ok(state.achievements.includes("drill_champion"));
    assert.ok(state.achievements.includes("sandbox_hacker"));
    assert.ok(state.inventory.includes("🤖"));
    assert.equal(state.equippedItems.avatar, "🤖");
    assert.ok(state.coins >= 250);

    // Verify backward-compatibility sync
    const syncedRpg = JSON.parse(legacyStorage.getItem("eduquestRPG"));
    assert.equal(syncedRpg.totalXp, state.lifetimeXp);
    assert.equal(syncedRpg.activeAvatar, "🤖");
});

test("9. Corrupted Storage: Menangani data rusak / non-JSON tanpa crash", () => {
    const corruptedStorage = createMockStorage({
        uot_game_state: "{corrupted json !!!",
        eduquestRPG: "{also bad json"
    });

    const engine = Progression.createEngine(corruptedStorage);
    const state = engine.getGameState();

    assert.equal(state.schemaVersion, 2);
    assert.equal(state.level, 1);
    assert.equal(state.lifetimeXp, 0);
    assert.ok(Array.isArray(state.inventory));
    assert.equal(state.inventory[0], "👨‍💻");

    // Can immediately award XP and function normally
    const award = engine.awardXp(50);
    assert.equal(award.awarded, true);
    assert.equal(engine.getLifetimeXp(), 50);
});

// ==========================================
// FASE 3: GAMEPLAY LOOP & PROGRESSION ENGINE TESTS
// ==========================================

test("10. Streak System: Berdasarkan tanggal lokal, tidak bertambah ganda pada hari yang sama", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // First activity on day 1
    const day1 = "2026-03-01";
    const s1 = engine.touchStreak(day1);
    assert.equal(s1.streak, 1);
    assert.equal(s1.activeToday, true);
    assert.equal(s1.incremented, true);

    // Second activity on same day -> streak stays 1, incremented is false
    const s1_again = engine.touchStreak(day1);
    assert.equal(s1_again.streak, 1);
    assert.equal(s1_again.incremented, false);

    // Activity on next consecutive day -> streak becomes 2
    const day2 = "2026-03-02";
    const s2 = engine.touchStreak(day2);
    assert.equal(s2.streak, 2);
    assert.equal(s2.incremented, true);

    // Disable streak freeze to test pure reset
    engine.state.streakFreeze = 0;
    engine.persist();

    // Activity after skipping 2 days (e.g. 2026-03-05) without streak freeze -> reset to 1
    const day5 = "2026-03-05";
    const s5 = engine.touchStreak(day5);
    assert.equal(s5.streak, 1);
    assert.equal(s5.reset, true);
});

test("11. Streak Freeze: Melindungi streak saat melewatkan 1 hari jika memiliki shield freeze", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Build streak to 3
    engine.touchStreak("2026-03-01");
    engine.touchStreak("2026-03-02");
    engine.touchStreak("2026-03-03");
    assert.equal(engine.getGameState().streak, 3);

    // Give 1 streak freeze shield
    engine.state.streakFreeze = 1;
    engine.persist();

    // Miss day 4, active on day 5 (diff = 2)
    const s5 = engine.touchStreak("2026-03-05");
    assert.equal(s5.preservedByFreeze, true);
    assert.equal(s5.streak, 3);
    assert.equal(engine.getGameState().streakFreeze, 0); // consumed 1 freeze
});

test("12. Daily & Weekly Missions: Progress bertambah dan dapat diklaim hanya sekali", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    // Trigger materi activity
    const act = engine.recordActivity("materi", {
        id: "intro-html",
        title: "Pengenalan HTML",
        count: 1,
        showSummary: false
    });

    assert.ok(act.xpEarned > 0);
    const state = engine.getGameState();
    const dailyMissions = state.dailyMissions;
    assert.ok(dailyMissions);
    assert.equal(dailyMissions.missions.daily_read_lesson.progress, 1);
    assert.equal(dailyMissions.missions.daily_read_lesson.completed, true);

    // Claim daily mission reward
    const claimRes = engine.claimDailyMission("daily_read_lesson");
    assert.equal(claimRes.claimed, true);
    assert.ok(claimRes.xpAwarded > 0);
    assert.ok(claimRes.coinsAwarded > 0);
    assert.equal(engine.getGameState().dailyMissions.missions.daily_read_lesson.claimed, true);

    // Attempt claiming again -> rejected
    const claimAgain = engine.claimDailyMission("daily_read_lesson");
    assert.equal(claimAgain.claimed, false);
    assert.equal(claimAgain.error, "ALREADY_CLAIMED");
});

test("13. Dynamic Next Objective: Menghasilkan objektif terarah berdasarkan progress nyata", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const obj = engine.getNextObjective();
    assert.ok(obj);
    assert.ok(obj.title);
    assert.ok(obj.actionUrl);
    assert.ok(obj.xpReward > 0);
    assert.ok(["materi", "quiz", "project", "practice"].includes(obj.type));
});

test("14. Mastery Summary: Mengkalkulasi status mastery materi & modul", () => {
    const storage = createMockStorage();
    const engine = Progression.createEngine(storage);

    const mastery = engine.getMasterySummary();
    assert.ok(mastery);
    assert.ok(typeof mastery.totalLessons === "number");
    assert.ok(typeof mastery.mastered === "number");
    assert.ok(typeof mastery.masteryPercentage === "number");
});
