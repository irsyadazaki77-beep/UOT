const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../public/latihan-bahasa-engine.js");

const cards = [
  { placeId: "jawa", card: { id: "a", word: "Sugeng", translation: "Halo" } },
  { placeId: "bali", card: { id: "b", word: "Rahajeng", translation: "Halo juga" } },
  { placeId: "aceh", card: { id: "c", word: "Seulamat", translation: "Selamat" } }
];

test("review menentukan interval dan menaikkan penguasaan", () => {
  const profile = engine.emptyProfile();
  const key = engine.cardKey("jawa", cards[0].card);
  const state = engine.applyReview(profile, key, "good", 1000);
  assert.equal(state.level, 1);
  assert.equal(state.dueAt, 1000 + engine.DAY);
  assert.equal(state.correct, 1);
});

test("kartu gagal kembali ke antrean lebih cepat", () => {
  const profile = engine.emptyProfile();
  const key = engine.cardKey("jawa", cards[0].card);
  engine.applyReview(profile, key, "easy", 1000);
  const state = engine.applyReview(profile, key, "again", 2000);
  assert.equal(state.level, 1);
  assert.equal(state.dueAt, 2000 + 600000);
  assert.equal(state.lapses, 1);
});

test("antrean memprioritaskan review jatuh tempo dan membatasi sepuluh kartu", () => {
  const profile = engine.emptyProfile();
  profile.cards[engine.cardKey("bali", cards[1].card)] = { attempts: 1, correct: 1, level: 1, dueAt: 1 };
  const queue = engine.buildQueue(profile, cards, 5000, 10);
  assert.equal(queue[0].placeId, "bali");
  assert.ok(queue.length <= 10);
});

test("migrasi membawa favorit dan mastery lama", () => {
  const profile = engine.migrate({ cardProgress: { starred: ["jawa:Sugeng"], mastered: ["bali:Rahajeng"] }, level: 2, xp: 44 }, cards);
  assert.deepEqual(profile.favorites, ["jawa:a"]);
  assert.equal(profile.cards["bali:b"].level, 5);
    assert.equal(profile.xp, 44);
});

test("profil rusak tidak dipakai dan profil v2 dibersihkan", () => {
    assert.equal(engine.cleanProfile({ version: 2, cards: null, favorites: [] }), null);
    const profile = engine.cleanProfile({ version: 2, cards: {}, favorites: ["jawa:a", "jawa:a", 7], daily: null });
    assert.deepEqual(profile.favorites, ["jawa:a"]);
    assert.deepEqual(profile.daily, {});
});
