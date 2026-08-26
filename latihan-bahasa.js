(function () {
    "use strict";
    const data = window.WonderfulData;
    const core = window.WonderfulCore || {};
    const engine = window.BahasaPractice;
    if (!data || !engine) return;

    const $ = id => document.getElementById(id);
    const el = new Proxy({}, { get: (_, key) => $(key) });
    const storage = core.storage || { get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }, set: (key, value) => localStorage.setItem(key, JSON.stringify(value)) };
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const normalise = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const toast = message => { el.liveFeedback.textContent = message; if (core.showToast) core.showToast(message); };

    let activePlace = null;
    let profile;
    let session = { queue: [], index: 0, correct: 0, attempts: 0, startedAt: null, finished: false };
    let currentMode = "flashcard";
    let flipped = false;
    let answerLocked = false;
    let selectedMatch = null;
    let recognition = null;

    const allCards = () => data.places.flatMap(place => (place.studyCards || place.cards || []).map((card, index) => ({ placeId: place.id, place, card: Array.isArray(card) ? { id: `legacy-${index}`, word: card[0], translation: card[1], context: card[2], category: "Kosakata", phonetic: "-", register: "Ragam lokal", culturalNote: place.fact, source: { label: "Koleksi lama", status: "review" } } : card })));
    const placeCards = () => allCards().filter(item => item.placeId === activePlace.id);
    const currentItem = () => session.finished ? null : (session.queue[session.index] || placeCards()[0] || allCards()[0]);
    const getKey = item => engine.cardKey(item.placeId, item.card);
    const isFavorite = item => profile.favorites.includes(getKey(item));

    function saveProfile() { profile.updatedAt = Date.now(); storage.set(engine.KEY, profile); }
    function loadProfile() {
        const stored = engine.cleanProfile(storage.get(engine.KEY, null));
        if (stored) return stored;
        const oldGlobal = core.getProgress ? core.getProgress() : {};
        return engine.migrate({
            cardProgress: storage.get("wonder_card_progress", { starred: [], mastered: [] }),
            level: storage.get("bahasa_user_level", 1), xp: storage.get("bahasa_user_xp", 0),
            streak: oldGlobal.streak || 0, daily: storage.get("bahasa_daily_quests", {})
        }, allCards());
    }
    function updateStreak() {
        const today = todayKey();
        const yesterday = new Date(Date.now() - engine.DAY).toISOString().slice(0, 10);
        if (profile.lastActiveDay === today) return;
        profile.streak = profile.lastActiveDay === yesterday ? (profile.streak || 0) + 1 : 1;
        profile.lastActiveDay = today;
    }
    function recordDailyOutcome(correct) {
        const date = todayKey();
        const daily = profile.daily[date] || { reviews: 0, correct: 0, completed: false };
        daily.reviews += 1;
        daily.correct += correct ? 1 : 0;
        daily.completed = daily.reviews >= 10;
        profile.daily[date] = daily;
    }
    function beginSession() {
        session = { queue: engine.buildQueue(profile, allCards(), Date.now(), 10), index: 0, correct: 0, attempts: 0, startedAt: Date.now(), finished: false };
        if (!session.queue.length) session.queue = placeCards().slice(0, 10);
        el.sessionSummary.hidden = true;
        toast("Sesi 10 kartu siap. Pilih penilaian paling jujur setelah melihat arti.");
        renderAll();
    }
    function completeCurrent(rating) {
        const item = currentItem();
        if (!item || session.finished) return;
        const state = engine.applyReview(profile, getKey(item), rating);
        const correct = rating === "good" || rating === "easy";
        session.attempts += 1;
        session.correct += correct ? 1 : 0;
        recordDailyOutcome(correct);
        updateStreak();
        saveProfile();
        advanceCurrent();
        return state;
    }
    function advanceCurrent() {
        if (session.finished) return;
        session.index += 1;
        flipped = false;
        answerLocked = false;
        if (session.index >= session.queue.length) finishSession();
        renderAll();
    }
    function finishSession() {
        session.finished = true;
        const accuracy = session.attempts ? Math.round(session.correct / session.attempts * 100) : 0;
        profile.lastSession = { completedAt: Date.now(), attempts: session.attempts, correct: session.correct, accuracy, reviewed: session.queue.map(getKey) };
        saveProfile();
        if (typeof window !== "undefined" && window.ProgressionEngine) {
            if (typeof window.ProgressionEngine.recordActivity === "function") {
                window.ProgressionEngine.recordActivity("practice", {
                    id: `bahasa_session_${activePlace?.id || "general"}_${Date.now()}`,
                    title: `Latihan Bahasa Daerah: ${activePlace?.label || "Nusantara"}`,
                    count: session.attempts || 10,
                    missionType: "practice",
                    configKey: "CULTURE_FLASHCARD_SESSION",
                    xp: 25,
                    coins: 15,
                    rewardId: `culture_session_${todayKey()}`,
                    showModal: true
                });
            } else {
                window.ProgressionEngine.awardXp(25, "Sesi latihan bahasa daerah selesai", "culture_flashcard_session");
            }
        }
        el.sessionSummary.hidden = false;
        el.sessionSummaryText.textContent = `${session.attempts} kartu diproses dengan akurasi ${accuracy}%. Kartu yang sulit akan kembali lebih cepat.`;
        toast("Sesi selesai. Progresmu sudah disimpan di perangkat ini.");
    }
    function toggleFavorite(item) {
        const key = getKey(item);
        profile.favorites = profile.favorites.includes(key) ? profile.favorites.filter(value => value !== key) : [...profile.favorites, key];
        saveProfile(); renderAll();
    }
    function setPlace(placeId) {
        activePlace = data.getPlaceById(placeId);
        const url = new URL(window.location.href); url.searchParams.set("id", activePlace.id); history.replaceState({}, "", url);
        el.detailLink.href = `daerah-detail.html?id=${encodeURIComponent(activePlace.id)}`;
        el.quizLink.href = `quiz-budaya.html?id=${encodeURIComponent(activePlace.id)}`;
        renderAll();
    }
    function renderRegionList() {
        const query = normalise(el.regionSearch.value);
        const filter = document.querySelector(".filter-chip.active")?.dataset.region || "Semua";
        const cards = allCards();
        const places = data.places.filter(place => {
            const own = cards.filter(item => item.placeId === place.id);
            const mastery = own.length ? own.filter(item => engine.getState(profile, getKey(item)).level >= 5).length / own.length : 0;
            if (query && !normalise(place.label).includes(query)) return false;
            if (filter === "progress") return mastery > 0 && mastery < 1;
            if (filter === "complete") return mastery === 1 && own.length > 0;
            return true;
        });
        el.regionCount.textContent = `${data.places.length} daerah`;
        el.regionList.innerHTML = places.map(place => {
            const own = cards.filter(item => item.placeId === place.id);
            const mastered = own.filter(item => engine.getState(profile, getKey(item)).level >= 5).length;
            const pct = own.length ? Math.round(mastered / own.length * 100) : 0;
            return `<button class="region-item ${activePlace.id === place.id ? "active" : ""}" type="button" data-place="${place.id}"><span class="region-item-top"><i class="region-mark">${place.mark}</i>${place.label}</span><small>${mastered}/${own.length} kartu dikuasai / ${pct}%</small><span class="progress-track"><i style="width:${pct}%"></i></span></button>`;
        }).join("") || '<p class="empty-state">Daerah tidak ditemukan.</p>';
        el.regionList.querySelectorAll("[data-place]").forEach(button => button.addEventListener("click", () => setPlace(button.dataset.place)));
    }
    function renderOverview() {
        const queue = engine.buildQueue(profile, allCards(), Date.now(), 10);
        const due = queue.filter(item => engine.getState(profile, getKey(item)).attempts).length;
        const fresh = queue.length - due;
        const done = session.finished ? session.queue.length : session.index;
        const target = session.queue.length || 10;
        el.todayProgress.textContent = `${done} / ${target}`;
        el.todayDescription.textContent = session.finished ? "Sesi selesai. Ulangi sedikit lagi jika kamu masih punya waktu." : due ? "Mulai dari kartu yang perlu kamu ingat kembali." : "Awali dengan kartu baru dalam sesi kecil yang terarah.";
        el.todayBar.style.width = `${Math.min(100, done / target * 100)}%`;
        el.dueCount.textContent = due; el.newCount.textContent = fresh;
        el.activePlaceTitle.textContent = activePlace.label; el.activePlaceRegion.textContent = activePlace.region; el.activePlaceMark.textContent = activePlace.mark; el.activePlaceSummary.textContent = activePlace.summary;
        const level = Math.floor((profile.xp || 0) / 120) + 1;
        el.levelLabel.textContent = level; el.xpLabel.textContent = `${profile.xp || 0} XP`; el.streakLabel.textContent = `${profile.streak || 0} hari`;
        el.accuracyLabel.textContent = session.attempts ? `${Math.round(session.correct / session.attempts * 100)}%` : "-";
        el.sessionLabel.textContent = session.attempts ? `${session.correct}/${session.attempts} jawaban benar` : "Belum ada jawaban";
        const item = currentItem();
        el.recommendationLabel.textContent = item ? item.card.word : "Semua selesai";
        el.recommendationMeta.textContent = item ? `${item.place.label} / ${item.card.category}` : "Nikmati jeda, lalu kembali lagi nanti.";
        const placeFavorite = (profile.favoritePlaces || []).includes(activePlace.id);
        el.favoritePlace.innerHTML = `<i class="fa-${placeFavorite ? "solid" : "regular"} fa-heart"></i>`;
        el.favoritePlace.setAttribute("aria-label", placeFavorite ? "Hapus daerah dari favorit" : "Tandai daerah sebagai favorit");
    }
    function renderFlashcard() {
        const item = currentItem();
        if (!item) { el.flashcardCard.disabled = true; document.querySelectorAll("[data-rating]").forEach(button => button.disabled = true); return; }
        const card = item.card; const state = engine.getState(profile, getKey(item));
        el.cardPosition.textContent = session.finished ? "Sesi telah selesai" : `Kartu ${Math.min(session.index + 1, session.queue.length || 1)} dari ${session.queue.length || 1}`;
        el.sessionBar.style.width = `${session.queue.length ? session.index / session.queue.length * 100 : 0}%`;
        el.flashcardCard.classList.toggle("flipped", flipped);
        el.cardCategory.textContent = card.category || "Kosakata"; el.cardWord.textContent = card.word; el.cardPhonetic.textContent = card.phonetic || "-";
        el.cardRegister.textContent = card.register || "Ragam lokal"; el.cardTranslation.textContent = card.translation; el.cardContext.textContent = card.context || "Tidak ada konteks tambahan."; el.cardCulture.textContent = card.culturalNote || "";
        el.favoriteCard.innerHTML = `<i class="fa-${isFavorite(item) ? "solid" : "regular"} fa-star"></i> ${isFavorite(item) ? "Tersimpan" : "Simpan"}`;
        const disabled = session.finished; el.flashcardCard.disabled = disabled; document.querySelectorAll("[data-rating]").forEach(button => button.disabled = disabled);
        if (state.attempts) el.cardCategory.textContent += ` / tingkat ${state.level}/6`;
    }
    function renderQuiz() {
        const item = currentItem(); if (!item) return; const card = item.card;
        el.quizCount.textContent = `Kartu ${Math.min(session.index + 1, session.queue.length || 1)}`;
        el.quizPrompt.textContent = `Apa arti "${card.word}"?`;
        const options = [card.translation, ...engine.distractors(allCards().map(x => x.card), card.translation)].sort(() => Math.random() - .5);
        el.quizAnswers.innerHTML = options.map(option => `<button class="answer-option" type="button" data-answer="${encodeURIComponent(option)}">${option}</button>`).join("");
        el.quizFeedback.textContent = "Pilih jawaban yang paling tepat."; el.quizNext.hidden = true; answerLocked = false;
        el.quizAnswers.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
            if (answerLocked) return; answerLocked = true;
            const chosen = decodeURIComponent(button.dataset.answer); const correct = chosen === card.translation;
            el.quizAnswers.querySelectorAll("button").forEach(option => { option.disabled = true; if (decodeURIComponent(option.dataset.answer) === card.translation) option.classList.add("correct"); });
            if (!correct) button.classList.add("wrong");
            el.quizFeedback.textContent = correct ? "Benar. Kartu ini akan muncul lebih jarang." : `Belum tepat. Jawabannya: ${card.translation}. Kartu ini akan segera diulang.`;
            engine.applyReview(profile, getKey(item), correct ? "good" : "again"); session.attempts++; session.correct += correct ? 1 : 0; recordDailyOutcome(correct); updateStreak(); saveProfile(); el.quizNext.hidden = false; renderOverview();
        }));
    }
    function renderWriting() { const item = currentItem(); if (!item) return; el.writingCategory.textContent = item.card.category || "Ketik arti"; el.writingPrompt.textContent = item.card.word; el.writingInput.value = ""; el.writingInput.disabled = false; el.writingCheck.disabled = false; el.writingFeedback.textContent = "Jawab dalam bahasa Indonesia."; el.writingNext.hidden = true; answerLocked = false; }
    function checkWriting() { const item = currentItem(); if (!item || answerLocked) return; answerLocked = true; const correct = normalise(el.writingInput.value) === normalise(item.card.translation); el.writingInput.disabled = true; el.writingCheck.disabled = true; el.writingFeedback.textContent = correct ? "Benar. Bagus sekali!" : `Jawaban yang diharapkan: ${item.card.translation}.`; engine.applyReview(profile, getKey(item), correct ? "good" : "again"); session.attempts++; session.correct += correct ? 1 : 0; recordDailyOutcome(correct); updateStreak(); saveProfile(); el.writingNext.hidden = false; renderOverview(); }
    function renderSpeaking() { const item = currentItem(); if (!item) return; el.speakingCategory.textContent = item.card.category || "Latihan pelafalan"; el.speakingPrompt.textContent = item.card.word; el.speakingPhonetic.textContent = item.card.phonetic || "-"; el.speakingFeedback.textContent = "Ucapkan kata lalu periksa hasil pengenalan suara."; el.speakingNext.hidden = true; }
    function speak(text) { if (!("speechSynthesis" in window)) return toast("Audio tidak tersedia pada perangkat ini."); window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "id-ID"; utterance.rate = .78; window.speechSynthesis.speak(utterance); }
    function startSpeaking() {
        const item = currentItem(); if (!item) return;
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) { el.speakingFeedback.textContent = "Pengenalan suara belum tersedia. Dengarkan contoh, lalu nilai sendiri sebagai sulit atau ingat di mode Belajar."; return; }
        if (recognition) recognition.abort(); recognition = new Recognition(); recognition.lang = "id-ID"; recognition.interimResults = false;
        recognition.onstart = () => { el.speakingFeedback.textContent = "Mendengarkan..."; };
        recognition.onerror = () => { el.speakingFeedback.textContent = "Suara belum dapat dikenali. Coba lagi atau gunakan mode Belajar."; };
        recognition.onresult = event => { const heard = event.results[0][0].transcript; const correct = normalise(heard).includes(normalise(item.card.word)) || normalise(item.card.word).includes(normalise(heard)); el.speakingFeedback.textContent = correct ? `Terdengar: "${heard}". Cocok!` : `Terdengar: "${heard}". Bandingkan kembali dengan contoh.`; engine.applyReview(profile, getKey(item), correct ? "good" : "hard"); session.attempts++; session.correct += correct ? 1 : 0; recordDailyOutcome(correct); updateStreak(); saveProfile(); el.speakingNext.hidden = false; renderOverview(); };
        recognition.start();
    }
    function renderMatch() {
        const choices = (session.queue.length ? session.queue : placeCards()).slice(session.index, session.index + 4); const items = choices.flatMap(item => [{ item, side: "word", text: item.card.word }, { item, side: "translation", text: item.card.translation }]).sort(() => Math.random() - .5);
        selectedMatch = null; el.matchScore.textContent = `0/${choices.length} pasangan`; el.matchFeedback.textContent = "Pilih kata lalu artinya.";
        el.matchBoard.innerHTML = items.map((entry, index) => `<button class="match-card" type="button" data-index="${index}" data-key="${encodeURIComponent(getKey(entry.item))}" data-side="${entry.side}">${entry.text}</button>`).join("");
        let pairs = 0;
        el.matchBoard.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
            if (button.classList.contains("matched")) return;
            if (!selectedMatch) { selectedMatch = button; button.classList.add("selected"); return; }
            const first = selectedMatch; selectedMatch = null; first.classList.remove("selected");
            const match = first.dataset.key === button.dataset.key && first.dataset.side !== button.dataset.side;
            if (!match) { el.matchFeedback.textContent = "Belum cocok, coba pasangan lain."; return; }
            first.classList.add("matched"); button.classList.add("matched"); pairs++; const item = choices.find(value => getKey(value) === decodeURIComponent(button.dataset.key)); if (item) engine.applyReview(profile, getKey(item), "good"); session.attempts++; session.correct++; recordDailyOutcome(true); updateStreak(); saveProfile(); el.matchScore.textContent = `${pairs}/${choices.length} pasangan`; el.matchFeedback.textContent = pairs === choices.length ? "Semua pasangan tepat. Progres sudah diperbarui." : "Tepat! Lanjutkan."; renderOverview();
        }));
    }
    function renderDictionary() { const query = normalise(el.cardSearch.value); const cards = placeCards().filter(item => !query || normalise(`${item.card.word} ${item.card.translation} ${item.card.context}`).includes(query)); el.dictionaryList.innerHTML = cards.map(item => { const state = engine.getState(profile, getKey(item)); return `<article class="dictionary-card"><div class="dictionary-meta"><span>${item.card.category}</span><button type="button" data-speak="${encodeURIComponent(item.card.word)}" aria-label="Dengar ${item.card.word}"><i class="fa-solid fa-volume-high"></i></button></div><h3>${item.card.word}</h3><p>${item.card.translation}</p><p>${item.card.context || ""}</p><div class="dictionary-meta"><span>Tingkat ${state.level}/6</span><span>${item.card.source?.status === "review" ? "Perlu peninjauan" : item.card.source?.label || ""}</span></div></article>`; }).join("") || '<p class="empty-state">Kartu tidak ditemukan.</p>'; el.dictionaryList.querySelectorAll("[data-speak]").forEach(button => button.addEventListener("click", () => speak(decodeURIComponent(button.dataset.speak)))); }
    function showMode(mode) { currentMode = mode; document.querySelectorAll(".mode-tab").forEach(tab => { const active = tab.dataset.mode === mode; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", String(active)); }); document.querySelectorAll(".mode-panel").forEach(panel => { const active = panel.id === `view-${mode}`; panel.hidden = !active; panel.classList.toggle("active", active); }); if (mode === "quiz") renderQuiz(); if (mode === "writing") renderWriting(); if (mode === "speaking") renderSpeaking(); if (mode === "match") renderMatch(); }
    function renderAll() { renderOverview(); renderRegionList(); renderFlashcard(); renderDictionary(); if (currentMode === "quiz") renderQuiz(); if (currentMode === "writing") renderWriting(); if (currentMode === "speaking") renderSpeaking(); if (currentMode === "match") renderMatch(); }
    function attachEvents() {
        el.startSession.addEventListener("click", beginSession); el.restartSession.addEventListener("click", beginSession); el.hearRecommendation.addEventListener("click", () => { const item = currentItem(); if (item) speak(item.card.word); });
        el.flashcardCard.addEventListener("click", () => { flipped = !flipped; renderFlashcard(); }); el.speakCard.addEventListener("click", () => { const item = currentItem(); if (item) speak(item.card.word); }); el.favoriteCard.addEventListener("click", () => toggleFavorite(currentItem())); document.querySelectorAll("[data-rating]").forEach(button => button.addEventListener("click", () => completeCurrent(button.dataset.rating)));
        document.querySelectorAll(".mode-tab").forEach(tab => tab.addEventListener("click", () => showMode(tab.dataset.mode)));
        el.quizListen.addEventListener("click", () => { const item = currentItem(); if (item) speak(item.card.word); }); el.quizNext.addEventListener("click", advanceCurrent);
        el.writingCheck.addEventListener("click", checkWriting); el.writingInput.addEventListener("keydown", event => { if (event.key === "Enter") checkWriting(); }); el.writingNext.addEventListener("click", advanceCurrent);
        el.speakingStart.addEventListener("click", startSpeaking); el.speakingListen.addEventListener("click", () => { const item = currentItem(); if (item) speak(item.card.word); }); el.speakingNext.addEventListener("click", advanceCurrent); el.matchReset.addEventListener("click", renderMatch);
        el.regionSearch.addEventListener("input", renderRegionList); el.cardSearch.addEventListener("input", renderDictionary); document.querySelectorAll(".filter-chip").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("active")); button.classList.add("active"); renderRegionList(); }));
        el.favoritePlace.addEventListener("click", () => { const places = profile.favoritePlaces || []; profile.favoritePlaces = places.includes(activePlace.id) ? places.filter(id => id !== activePlace.id) : [...places, activePlace.id]; saveProfile(); renderOverview(); });
        el.themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            const isDark = document.body.classList.contains("dark-theme");
            localStorage.setItem("eduquest_theme", isDark ? "dark" : "light");
            localStorage.setItem("bahasaPractice.theme", isDark ? "dark" : "light");
        });
        document.addEventListener("keydown", event => { if (!event.target.closest(".mode-tab")) return; const tabs = Array.from(document.querySelectorAll(".mode-tab")); const index = tabs.findIndex(tab => tab.dataset.mode === currentMode); if (event.key === "ArrowRight") { event.preventDefault(); showMode(tabs[(index + 1) % tabs.length].dataset.mode); tabs[(index + 1) % tabs.length].focus(); } if (event.key === "ArrowLeft") { event.preventDefault(); showMode(tabs[(index - 1 + tabs.length) % tabs.length].dataset.mode); tabs[(index - 1 + tabs.length) % tabs.length].focus(); } });
    }
    document.addEventListener("DOMContentLoaded", () => {
        profile = loadProfile();
        const savedTheme = localStorage.getItem("eduquest_theme") || localStorage.getItem("bahasaPractice.theme");
        if (savedTheme === "dark") document.body.classList.add("dark-theme");
        activePlace = data.getPlaceById(new URLSearchParams(location.search).get("id"));
        attachEvents();
        beginSession();
        saveProfile();
    });
})();
