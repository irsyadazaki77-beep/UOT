const test = require("node:test");
const assert = require("node:assert/strict");
const hub = require("../public/snbt-dashboard.js");

test("bank soal mencakup 21 soal SNBT dan 12 latihan TKA", () => {
    assert.equal(hub.QUESTIONS.filter(item => item.track === "snbt").length, 21);
    assert.equal(hub.QUESTIONS.filter(item => item.track === "tka").length, 12);
    assert.equal(new Set(hub.QUESTIONS.map(item => item.id)).size, hub.QUESTIONS.length);
});

test("setiap soal mengikuti skema terpadu", () => {
    const required = ["id", "track", "subject", "topic", "difficulty", "prompt", "choices", "correctIndexes", "explanation", "estimatedSeconds"];
    hub.QUESTIONS.forEach(question => {
        required.forEach(key => assert.ok(Object.hasOwn(question, key), `${question.id} tidak memiliki ${key}`));
        assert.ok(question.choices.length >= 2);
        assert.ok(question.correctIndexes.length >= 1);
        question.correctIndexes.forEach(index => assert.ok(index >= 0 && index < question.choices.length));
    });
});

test("penilaian tunggal dan kompleks harus tepat", () => {
    const single = hub.QUESTIONS.find(item => item.id === "snbt-pu-1");
    const complex = hub.QUESTIONS.find(item => item.id === "snbt-pm-3");
    assert.equal(hub.gradeAnswer(single, [2]), true);
    assert.equal(hub.gradeAnswer(single, [1]), false);
    assert.equal(hub.gradeAnswer(complex, [2, 0, 1]), true);
    assert.equal(hub.gradeAnswer(complex, [0, 1]), false);
    assert.equal(hub.gradeAnswer(complex, [0, 1, 2, 2]), true);
});

test("migrasi memindahkan snbt_stats lama ke TKA tanpa mencampur SNBT", () => {
    const state = hub.freshState();
    hub.applyLegacy(state, { done: 10, correct: 7, bySubject: { matematika: { done: 4, correct: 3 } } }, ["tka-mat-1", "asing", "tka-mat-1"], { targetPtn: "Universitas Papua", targetProdi: "Teknik", studyWeeks: 8, firstElective: "Fisika", secondElective: "Kimia" });
    assert.equal(state.tracks.tka.stats.done, 10);
    assert.equal(state.tracks.tka.stats.correct, 7);
    assert.equal(state.tracks.snbt.stats.done, 0);
    assert.deepEqual(state.tracks.tka.bookmarks, ["tka-mat-1"]);
    assert.equal(state.tracks.tka.planner.university, "Universitas Papua");
    assert.equal(state.migratedLegacy, true);
});

test("normalisasi membatasi data rusak dan membuang ID asing", () => {
    const track = hub.normalizeTrack({ stats: { done: -3, correct: 900 }, bookmarks: ["snbt-pu-1", "asing"], planner: { weeks: 999, weeklyGoal: -10, firstElective: "Tidak Ada" }, weekly: { stamp: "lama", count: -2 } });
    assert.equal(track.stats.done, 0);
    assert.equal(track.stats.correct, 0);
    assert.deepEqual(track.bookmarks, ["snbt-pu-1"]);
    assert.equal(track.planner.weeks, 24);
    assert.equal(track.planner.weeklyGoal, 5);
    assert.equal(track.planner.firstElective, hub.ELECTIVES[0]);
    assert.equal(track.weekly.count, 0);
});

test("validasi impor menolak versi dan bentuk tak dikenal", () => {
    const valid = { app: "universe-of-tech-exam-hub", version: 2, state: hub.freshState() };
    assert.equal(hub.validateImportPayload(valid), true);
    assert.equal(hub.validateImportPayload({ ...valid, version: 1 }), false);
    assert.equal(hub.validateImportPayload({ app: valid.app, version: 2, state: {} }), false);
});
