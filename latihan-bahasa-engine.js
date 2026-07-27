(function (root, factory) {
    const api = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    root.BahasaPractice = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
    const VERSION = 2;
    const KEY = "bahasaPractice.v2";
    const DAY = 86400000;
    const INTERVALS = [0, 1, 3, 7, 14, 30, 60];

    const slug = value => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const cardKey = (placeId, card) => `${placeId}:${card.id || slug(card.word)}`;
    const emptyProfile = () => ({ version: VERSION, cards: {}, favorites: [], xp: 0, level: 1, streak: 0, daily: {}, lastSession: null, updatedAt: Date.now() });
    const cleanProfile = value => {
        if (!value || value.version !== VERSION || !value.cards || typeof value.cards !== "object" || !Array.isArray(value.favorites)) return null;
        return {
            ...emptyProfile(), ...value,
            cards: value.cards && typeof value.cards === "object" ? value.cards : {},
            favorites: [...new Set(value.favorites.filter(value => typeof value === "string"))],
            daily: value.daily && typeof value.daily === "object" ? value.daily : {}
        };
    };

    function migrate(legacy, allCards) {
        const profile = emptyProfile();
        const oldProgress = legacy.cardProgress || {};
        const byLegacyKey = new Map(allCards.map(item => [`${item.placeId}:${item.card.word}`, item]));
        (oldProgress.starred || []).forEach(oldKey => {
            const item = byLegacyKey.get(oldKey);
            if (item) profile.favorites.push(cardKey(item.placeId, item.card));
        });
        (oldProgress.mastered || []).forEach(oldKey => {
            const item = byLegacyKey.get(oldKey);
            if (item) profile.cards[cardKey(item.placeId, item.card)] = { level: 5, attempts: 1, correct: 1, dueAt: Date.now(), lastReviewedAt: Date.now() };
        });
        profile.level = Number(legacy.level) || 1;
        profile.xp = Number(legacy.xp) || 0;
        profile.streak = Number(legacy.streak) || 0;
        profile.daily = legacy.daily || {};
        return profile;
    }

    function getState(profile, key) {
        return { level: 0, attempts: 0, correct: 0, dueAt: 0, lastReviewedAt: 0, lapses: 0, ...(profile.cards[key] || {}) };
    }

    function applyReview(profile, key, rating, now = Date.now()) {
        const state = getState(profile, key);
        const correct = rating === "good" || rating === "easy";
        let level = state.level;
        let dueAt = now;
        if (rating === "again") { level = Math.max(0, level - 1); dueAt = now + 10 * 60000; }
        if (rating === "hard") { level = Math.max(0, level); dueAt = now + DAY; }
        if (rating === "good") { level = Math.min(6, level + 1); dueAt = now + INTERVALS[level] * DAY; }
        if (rating === "easy") { level = Math.min(6, level + 2); dueAt = now + INTERVALS[level] * DAY; }
        profile.cards[key] = { ...state, level, dueAt, lastReviewedAt: now, attempts: state.attempts + 1, correct: state.correct + (correct ? 1 : 0), lapses: state.lapses + (rating === "again" ? 1 : 0) };
        profile.xp += correct ? (rating === "easy" ? 12 : 8) : 2;
        profile.updatedAt = now;
        return profile.cards[key];
    }

    function buildQueue(profile, cards, now = Date.now(), limit = 10) {
        const unique = new Map(cards.map(item => [cardKey(item.placeId, item.card), item]));
        const values = Array.from(unique.values()).map(item => ({ ...item, key: cardKey(item.placeId, item.card), state: getState(profile, cardKey(item.placeId, item.card)) }));
        const byDue = values.filter(x => x.state.attempts && x.state.dueAt <= now).sort((a, b) => a.state.dueAt - b.state.dueAt);
        const weak = values.filter(x => x.state.attempts >= 2 && x.state.correct / x.state.attempts < .7 && !byDue.includes(x)).sort((a, b) => (a.state.correct / a.state.attempts) - (b.state.correct / b.state.attempts));
        const fresh = values.filter(x => !x.state.attempts && !byDue.includes(x) && !weak.includes(x));
        return [...byDue, ...weak, ...fresh].slice(0, limit);
    }

    function distractors(cards, answer, count = 3) {
        return [...new Set(cards.map(card => card.translation).filter(value => value && value !== answer))].sort(() => Math.random() - .5).slice(0, count);
    }

    return { VERSION, KEY, DAY, cardKey, emptyProfile, cleanProfile, migrate, getState, applyReview, buildQueue, distractors };
});
