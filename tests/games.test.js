/**
 * Universe of Tech - Mini Games & Challenge Suite Smoke Tests
 * FASE 4 - Validation & Automated Verification
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const GameCore = require("../public/games/game-core.js");
const MatchingModule = require("../public/games/matching-game.js");
const CultureHuntModule = require("../public/games/culture-hunt.js");
const PronunciationModule = require("../public/games/pronunciation-game.js");
const AudioGameModule = require("../public/games/audio-game.js");
const SyntaxScrambleModule = require("../public/games/syntax-scramble.js");

function createMockStorage() {
    const store = new Map();
    return {
        getItem(k) { return store.has(k) ? store.get(k) : null; },
        setItem(k, v) { store.set(k, String(v)); },
        removeItem(k) { store.delete(k); },
        clear() { store.clear(); }
    };
}

test("1. GameCore: Anti-farming and Replay Scaling", () => {
    const storage = createMockStorage();
    const engine = GameCore.createEngine({ storage });

    // First clear ever
    const res1 = engine.finishGame({
        gameId: "test_matching",
        title: "Test Match",
        difficulty: "normal",
        score: 100,
        maxScore: 100,
        accuracy: 1.0,
        durationSeconds: 30
    });

    assert.equal(res1.passed, true);
    assert.equal(res1.isFirstClearEver, true);
    assert.equal(res1.rewardType, "first_clear_ever");
    assert.ok(res1.xpEarned >= 50, "First clear should award full XP + first-time bonus");

    // Replay on same day with lower/same score
    const res2 = engine.finishGame({
        gameId: "test_matching",
        title: "Test Match",
        difficulty: "normal",
        score: 90,
        maxScore: 100,
        accuracy: 0.9,
        durationSeconds: 32
    });

    assert.equal(res2.passed, true);
    assert.equal(res2.isFirstClearEver, false);
    assert.equal(res2.isFirstClearToday, false);
    assert.equal(res2.rewardType, "practice_replay");
    assert.ok(res2.xpEarned < res1.xpEarned, "Replay should give diminished XP to prevent farming");

    // Failed game (accuracy below threshold or 0 score) gives NO XP
    const resFail = engine.finishGame({
        gameId: "test_matching_hard",
        title: "Test Match Hard",
        difficulty: "hard",
        score: 0,
        maxScore: 100,
        accuracy: 0.2,
        durationSeconds: 10
    });

    assert.equal(resFail.passed, false);
    assert.equal(resFail.xpEarned, 0);
    assert.equal(resFail.coinsEarned, 0);
});

test("2. GameCore: Difficulty Multipliers", () => {
    assert.equal(GameCore.DIFFICULTY.easy.multiplier, 1.0);
    assert.equal(GameCore.DIFFICULTY.normal.multiplier, 1.5);
    assert.equal(GameCore.DIFFICULTY.hard.multiplier, 2.2);
    assert.ok(GameCore.DIFFICULTY.easy.timeMultiplier > GameCore.DIFFICULTY.hard.timeMultiplier);
});

test("3. MatchingGame: Mechanics, Combos, and Completion", () => {
    const storage = createMockStorage();
    const gameEngine = GameCore.createEngine({ storage });
    const game = MatchingModule.createGame({ gameCoreEngine: gameEngine });

    const state = game.start("html", "easy");
    assert.equal(state.status, "playing");
    assert.equal(state.totalPairs, 4);
    assert.equal(state.cards.length, 8);

    // Select first card
    const firstSelect = game.selectCard(0);
    assert.equal(firstSelect.success, true);
    assert.equal(firstSelect.action, "SELECTED_FIRST");

    // Find its matching counterpart
    const targetPairId = state.cards[0].pairId;
    const matchIdx = state.cards.findIndex((c, i) => i !== 0 && c.pairId === targetPairId);
    assert.ok(matchIdx > 0);

    const secondSelect = game.selectCard(matchIdx);
    assert.equal(secondSelect.success, true);
    assert.equal(secondSelect.match, true);
    assert.equal(game.state.matchedPairIds.size, 1);
    assert.equal(game.state.combo, 1);

    // Test hint
    const hintUsed = game.useHint();
    assert.equal(hintUsed, true);
    assert.equal(game.state.hintsUsed, 1);

    game.stopTimer();
});

test("4. CultureHuntGame: Clue Deductions and Scoring", () => {
    const storage = createMockStorage();
    const gameEngine = GameCore.createEngine({ storage });
    const game = CultureHuntModule.createGame({ gameCoreEngine: gameEngine });

    const state = game.start("nusantara", "easy");
    assert.equal(state.status, "playing");
    assert.equal(state.totalClues, 3);

    const current = game.getCurrentClue();
    assert.ok(current);
    assert.ok(current.riddle);

    // Submit correct answer
    const ansRes = game.submitAnswer(current.title);
    assert.equal(ansRes.success, true);
    assert.equal(ansRes.correct, true);
    assert.equal(game.state.correctCount, 1);

    game.stopTimer();
});

test("5. PronunciationGame: Web Speech & Fallback Mode", () => {
    const storage = createMockStorage();
    const gameEngine = GameCore.createEngine({ storage });
    const game = PronunciationModule.createGame({ gameCoreEngine: gameEngine });

    const state = game.start("jawa", "normal");
    assert.equal(state.status, "playing");
    assert.ok(state.items.length >= 3);

    // Fallback answer submission
    const current = game.getCurrentItem();
    game.submitFallbackAnswer(current.phrase);

    assert.equal(game.state.correctCount, 1);
    assert.ok(game.state.lastResult.passed);

    game.stopTimer();
});

test("6. AudioGame: Listening Comprehension & Transcript Toggle", () => {
    const storage = createMockStorage();
    const gameEngine = GameCore.createEngine({ storage });
    const game = AudioGameModule.createGame({ gameCoreEngine: gameEngine });

    const state = game.start("nusantara_listening", "normal");
    assert.equal(state.status, "playing");

    // Toggle transcript
    assert.equal(game.state.showTranscript, false);
    game.toggleTranscript();
    assert.equal(game.state.showTranscript, true);

    const current = game.getCurrentItem();
    const ans = game.submitAnswer(current.shuffledCorrectIndex);
    assert.equal(ans.correct, true);

    game.stopTimer();
});

test("7. SyntaxScrambleGame: Code Sequencing and Verification", () => {
    const storage = createMockStorage();
    const gameEngine = GameCore.createEngine({ storage });
    const game = SyntaxScrambleModule.createGame({ gameCoreEngine: gameEngine });

    const state = game.start("css_center", "normal");
    assert.equal(state.status, "playing");
    assert.ok(state.items.length >= 4);

    // Sort items to correct order
    game.state.items.sort((a, b) => a.originalIndex - b.originalIndex);

    // Check order
    game.checkOrder();
    assert.equal(game.state.status, "completed");

    game.stopTimer();
});
