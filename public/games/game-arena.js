/**
 * Universe of Tech - Interactive Game Arena Controller
 * FASE 4 - Seamless UI Mounting & Multi-Game Orchestration
 */

(function () {
    "use strict";

    const GameCore = window.GameCore;
    const MatchingModule = window.MatchingModule;
    const CultureHuntModule = window.CultureHuntModule;
    const PronunciationModule = window.PronunciationModule;
    const AudioGameModule = window.AudioGameModule;
    const SyntaxScrambleModule = window.SyntaxScrambleModule;

    let activeTab = "matching";
    let activeDifficulty = "normal";
    let activeTopic = "html";
    let activeGameInstance = null;

    function $(id) {
        return document.getElementById(id);
    }

    function initArena() {
        bindTabs();
        bindDifficulty();
        updateTopicOptions();
        loadAndStartGame();
    }

    function bindTabs() {
        const tabs = document.querySelectorAll(".game-tab-btn");
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                activeTab = tab.dataset.game;
                updateTopicOptions();
                loadAndStartGame();
            });
        });
    }

    function bindDifficulty() {
        const btns = document.querySelectorAll(".diff-btn");
        btns.forEach(btn => {
            btn.addEventListener("click", () => {
                btns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeDifficulty = btn.dataset.diff;
                loadAndStartGame();
            });
        });

        const topicSelect = $("topicSelect");
        if (topicSelect) {
            topicSelect.addEventListener("change", () => {
                activeTopic = topicSelect.value;
                loadAndStartGame();
            });
        }
    }

    function updateTopicOptions() {
        const select = $("topicSelect");
        if (!select) return;

        let options = [];
        if (activeTab === "matching") {
            options = [
                { val: "html", text: "HTML & Semantik Web" },
                { val: "css", text: "CSS Modern & Tata Letak" },
                { val: "javascript", text: "JavaScript & Async" },
                { val: "database", text: "Database & SQL" },
                { val: "jawa", text: "Bahasa Jawa & Unggah-Ungguh" },
                { val: "sunda", text: "Bahasa Sunda" },
                { val: "minang", text: "Bahasa Minangkabau" },
                { val: "bali", text: "Bahasa Bali" }
            ];
        } else if (activeTab === "hunt") {
            options = [
                { val: "nusantara", text: "Petualangan Budaya Nusantara" },
                { val: "tech_history", text: "Jejak Pelopor Teknologi & Web" }
            ];
        } else if (activeTab === "voice") {
            options = [
                { val: "jawa", text: "Pelafalan Bahasa Jawa" },
                { val: "sunda", text: "Pelafalan Bahasa Sunda" },
                { val: "minang", text: "Pelafalan Bahasa Minang" },
                { val: "tech_terms", text: "Pelafalan Istilah Teknologi" }
            ];
        } else if (activeTab === "audio") {
            options = [
                { val: "nusantara_listening", text: "Simak Bahasa Daerah Nusantara" },
                { val: "tech_listening", text: "Simak Arsitektur Sistem Web" }
            ];
        } else if (activeTab === "syntax") {
            options = [
                { val: "js_async", text: "JavaScript: Async / Await Fetch" },
                { val: "css_center", text: "CSS: Flexbox Center" },
                { val: "sql_query", text: "SQL: Urutan Klausa Query" },
                { val: "binary_search", text: "Algoritma: Binary Search" }
            ];
        }

        select.innerHTML = options.map(o => `<option value="${o.val}">${o.text}</option>`).join("");
        activeTopic = options[0].val;
    }

    function loadAndStartGame() {
        const stage = $("gameStage");
        if (!stage) return;

        if (activeGameInstance && typeof activeGameInstance.stopTimer === "function") {
            activeGameInstance.stopTimer();
        }

        if (activeTab === "matching") {
            activeGameInstance = MatchingModule.createGame({
                category: activeTopic,
                difficulty: activeDifficulty,
                onStateChange: renderMatchingUI,
                onFinish: renderResultScreen
            });
            activeGameInstance.start(activeTopic, activeDifficulty);
        } else if (activeTab === "hunt") {
            activeGameInstance = CultureHuntModule.createGame({
                category: activeTopic,
                difficulty: activeDifficulty,
                onStateChange: renderHuntUI,
                onFinish: renderResultScreen
            });
            activeGameInstance.start(activeTopic, activeDifficulty);
        } else if (activeTab === "voice") {
            activeGameInstance = PronunciationModule.createGame({
                category: activeTopic,
                difficulty: activeDifficulty,
                onStateChange: renderVoiceUI,
                onFinish: renderResultScreen
            });
            activeGameInstance.start(activeTopic, activeDifficulty);
        } else if (activeTab === "audio") {
            activeGameInstance = AudioGameModule.createGame({
                category: activeTopic,
                difficulty: activeDifficulty,
                onStateChange: renderAudioUI,
                onFinish: renderResultScreen
            });
            activeGameInstance.start(activeTopic, activeDifficulty);
        } else if (activeTab === "syntax") {
            activeGameInstance = SyntaxScrambleModule.createGame({
                puzzleId: activeTopic,
                difficulty: activeDifficulty,
                onStateChange: renderSyntaxUI,
                onFinish: renderResultScreen
            });
            activeGameInstance.start(activeTopic, activeDifficulty);
        }

        updateStatsHUD();
    }

    function updateStatsHUD() {
        if (!activeGameInstance) return;
        const state = activeGameInstance.getState();
        $("hudScore").textContent = state.score || 0;
        $("hudTimer").textContent = `${state.timeRemaining || 0}s`;
        const rec = GameCore.engine.getGameRecord(`${activeTab}_${activeTopic}`, activeDifficulty);
        $("hudBest").textContent = rec.bestScore || 0;
    }

    // ==========================================
    // Render Matching UI
    // ==========================================
    function renderMatchingUI(state) {
        if (state.isFinished) return;
        updateStatsHUD();
        const stage = $("gameStage");

        const cardsHTML = state.cards.map((card, idx) => {
            const isSelected = state.selectedCardIndex === idx;
            const isMatched = card.matched;
            const isHinted = card.hinted;
            let cls = "match-tile-btn";
            if (isSelected) cls += " selected";
            if (isMatched) cls += " matched";
            if (isHinted) cls += " hinted";

            return `
                <button class="${cls}" data-idx="${idx}" ${isMatched ? "disabled" : ""} aria-label="${card.text}">
                    ${card.text}
                </button>
            `;
        }).join("");

        stage.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <strong>${state.title} (${state.matchedCount}/${state.totalPairs} Pasangan)</strong>
                <button class="diff-btn" id="btnHint" ${state.hintsLeft <= 0 ? "disabled" : ""}>
                    <i class="fa-solid fa-lightbulb"></i> Bantuan (${state.hintsLeft})
                </button>
            </div>
            <div class="matching-grid-board">
                ${cardsHTML}
            </div>
        `;

        stage.querySelectorAll(".match-tile-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.idx, 10);
                activeGameInstance.selectCard(idx);
            });
        });

        const hintBtn = $("btnHint");
        if (hintBtn) {
            hintBtn.addEventListener("click", () => activeGameInstance.useHint());
        }
    }

    // ==========================================
    // Render Culture & Tech Hunt UI
    // ==========================================
    function renderHuntUI(state) {
        if (state.isFinished) return;
        updateStatsHUD();
        const stage = $("gameStage");
        const current = state.currentClue;
        if (!current) return;

        const optionsHTML = current.shuffledOptions.map(opt => {
            let cls = "clue-option-btn";
            let disabled = state.answeredCurrent ? "disabled" : "";
            if (state.answeredCurrent) {
                if (opt.toLowerCase() === current.title.toLowerCase()) cls += " correct";
                else if (opt === state.selectedOption) cls += " wrong";
            }
            return `<button class="${cls}" ${disabled} data-opt="${opt}">${opt}</button>`;
        }).join("");

        stage.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span class="stat-label">Petunjuk ${state.progress}</span>
                <button class="diff-btn" id="btnHint" ${state.hintsLeft <= 0 || state.isHintActive ? "disabled" : ""}>
                    <i class="fa-solid fa-lightbulb"></i> Petunjuk (${state.hintsLeft})
                </button>
            </div>
            <div class="clue-riddle-card">
                <span class="clue-riddle-badge"><i class="fa-solid fa-compass"></i> Lokasi / Kategori: ${current.region}</span>
                <div class="clue-riddle-text">"${current.riddle}"</div>
                ${state.isHintActive ? `<div class="clue-hint-box"><i class="fa-solid fa-circle-info"></i> <strong>Bantuan:</strong> ${current.hint}</div>` : ""}
            </div>
            <div class="clue-options-grid">
                ${optionsHTML}
            </div>
            ${state.answeredCurrent ? `
                <div style="margin-top:20px; text-align:right;">
                    <button class="game-tab-btn active" id="btnNextClue">
                        Lanjut <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            ` : ""}
        `;

        stage.querySelectorAll(".clue-option-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                activeGameInstance.submitAnswer(btn.dataset.opt);
            });
        });

        const hintBtn = $("btnHint");
        if (hintBtn) {
            hintBtn.addEventListener("click", () => activeGameInstance.useHint());
        }

        const nextBtn = $("btnNextClue");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => activeGameInstance.nextClue());
        }
    }

    // ==========================================
    // Render Voice & Pronunciation UI
    // ==========================================
    function renderVoiceUI(state) {
        if (state.isFinished) return;
        updateStatsHUD();
        const stage = $("gameStage");
        const item = state.currentItem;
        if (!item) return;

        stage.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span class="stat-label">Kata ${state.progress}</span>
                <button class="diff-btn" id="btnToggleMode">
                    <i class="fa-solid fa-sliders"></i> ${state.fallbackMode ? "Mode Suara" : "Mode Pilihan Teks"}
                </button>
            </div>
            <div class="voice-hero-card">
                <div class="voice-phrase-display">${item.phrase}</div>
                <div class="voice-phonetic-text">/${item.phonetic}/</div>
                <div class="voice-meaning-text">${item.meaning} &bull; <em>${item.context}</em></div>
            </div>
            <div class="voice-actions-row">
                <button class="voice-listen-btn" id="btnVoiceListen">
                    <i class="fa-solid fa-volume-high"></i> Dengarkan Contoh
                </button>
                ${!state.fallbackMode ? `
                    <button class="voice-record-btn ${state.isRecording ? "recording" : ""}" id="btnVoiceRecord" aria-label="Rekam Suara">
                        <i class="fa-solid ${state.isRecording ? "fa-stop" : "fa-microphone"}"></i>
                    </button>
                ` : ""}
            </div>
            ${state.fallbackMode ? `
                <div style="margin-top:12px;">
                    <div style="font-size:14px; color:var(--game-muted); margin-bottom:8px; text-align:center;">
                        Pilih pelafalan yang sesuai dengan contoh suara:
                    </div>
                    <div class="clue-options-grid">
                        ${item.options.map(opt => `<button class="clue-option-btn fallback-opt-btn" data-opt="${opt}">${opt}</button>`).join("")}
                    </div>
                </div>
            ` : ""}
            ${state.lastResult ? `
                <div class="clue-hint-box" style="margin-top:16px; text-align:center;">
                    <strong>${state.lastResult.feedback || state.lastResult.text}</strong>
                </div>
                <div style="margin-top:16px; text-align:center;">
                    <button class="game-tab-btn active" id="btnNextVoice">Lanjut <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            ` : ""}
        `;

        $("btnVoiceListen")?.addEventListener("click", () => activeGameInstance.playAudioDemo());
        $("btnToggleMode")?.addEventListener("click", () => activeGameInstance.toggleFallbackMode());

        const recordBtn = $("btnVoiceRecord");
        if (recordBtn) {
            recordBtn.addEventListener("click", () => {
                if (state.isRecording) activeGameInstance.stopVoiceRecognition();
                else activeGameInstance.startVoiceRecognition();
            });
        }

        stage.querySelectorAll(".fallback-opt-btn").forEach(btn => {
            btn.addEventListener("click", () => activeGameInstance.submitFallbackAnswer(btn.dataset.opt));
        });

        $("btnNextVoice")?.addEventListener("click", () => activeGameInstance.nextItem());
    }

    // ==========================================
    // Render Audio Listening UI
    // ==========================================
    function renderAudioUI(state) {
        if (state.isFinished) return;
        updateStatsHUD();
        const stage = $("gameStage");
        const item = state.currentItem;
        if (!item) return;

        const optionsHTML = item.shuffledOptions.map((opt, idx) => {
            let cls = "clue-option-btn";
            let disabled = state.answeredCurrent ? "disabled" : "";
            if (state.answeredCurrent) {
                if (idx === item.shuffledCorrectIndex) cls += " correct";
                else if (idx === state.selectedOptionIndex) cls += " wrong";
            }
            return `<button class="${cls}" ${disabled} data-idx="${idx}">${opt}</button>`;
        }).join("");

        stage.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span class="stat-label">Soal Audio ${state.progress}</span>
                <button class="diff-btn" id="btnToggleTranscript">
                    <i class="fa-solid fa-closed-captioning"></i> ${state.showTranscript ? "Sembunyikan Transkrip" : "Transkrip Aksesibilitas"}
                </button>
            </div>
            <div style="text-align:center; padding:20px; background:var(--game-surface-soft); border-radius:var(--game-radius); margin-bottom:16px;">
                <button class="voice-record-btn" id="btnPlayAudio" style="margin:0 auto 12px; background:var(--game-accent);">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
                <div style="font-weight:700; font-size:14px; color:var(--game-text);">
                    ${state.maxReplays < 90 ? `Putar Ulang (${state.replaysRemaining} tersisa)` : "Putar Audio"}
                </div>
            </div>
            ${state.showTranscript ? `
                <div class="clue-hint-box" style="margin-bottom:16px;">
                    <i class="fa-solid fa-universal-access"></i> <strong>Transkrip:</strong> ${item.transcript}
                </div>
            ` : ""}
            <div style="font-size:16px; font-weight:700; margin-bottom:14px;">${item.question}</div>
            <div class="clue-options-grid">
                ${optionsHTML}
            </div>
            ${state.answeredCurrent ? `
                <div style="margin-top:20px; text-align:right;">
                    <button class="game-tab-btn active" id="btnNextAudio">
                        Lanjut <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            ` : ""}
        `;

        $("btnPlayAudio")?.addEventListener("click", () => activeGameInstance.playCurrentAudio());
        $("btnToggleTranscript")?.addEventListener("click", () => activeGameInstance.toggleTranscript());

        stage.querySelectorAll(".clue-option-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.idx, 10);
                activeGameInstance.submitAnswer(idx);
            });
        });

        $("btnNextAudio")?.addEventListener("click", () => activeGameInstance.nextItem());
    }

    // ==========================================
    // Render Syntax Scramble UI
    // ==========================================
    function renderSyntaxUI(state) {
        if (state.isFinished) return;
        updateStatsHUD();
        const stage = $("gameStage");

        const linesHTML = state.items.map((item, idx) => {
            const isSelected = state.selectedIndex === idx;
            return `
                <div class="syntax-line-row ${isSelected ? "selected" : ""}" data-idx="${idx}">
                    <span style="font-weight:700; color:var(--game-muted); width:24px;">${idx + 1}.</span>
                    <span style="flex:1; white-space:pre-wrap;">${item.text}</span>
                    <div class="syntax-line-controls">
                        <button class="syntax-arrow-btn btn-up" data-idx="${idx}" ${idx === 0 ? "disabled" : ""} aria-label="Geser Naik">
                            <i class="fa-solid fa-arrow-up"></i>
                        </button>
                        <button class="syntax-arrow-btn btn-down" data-idx="${idx}" ${idx === state.items.length - 1 ? "disabled" : ""} aria-label="Geser Turun">
                            <i class="fa-solid fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        stage.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong>${state.title}</strong>
                <button class="diff-btn" id="btnHint" ${state.hintsLeft <= 0 ? "disabled" : ""}>
                    <i class="fa-solid fa-lightbulb"></i> Bantuan (${state.hintsLeft})
                </button>
            </div>
            <p style="font-size:14px; color:var(--game-muted); margin-bottom:12px;">${state.description}</p>
            <div class="syntax-lines-container">
                ${linesHTML}
            </div>
            ${state.validationResult && !state.validationResult.passed ? `
                <div class="clue-hint-box" style="margin-bottom:12px; background:rgba(220,38,38,0.12); color:var(--game-wrong);">
                    <i class="fa-solid fa-circle-exclamation"></i> ${state.validationResult.message}
                </div>
            ` : ""}
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button class="game-tab-btn active" id="btnCheckOrder">
                    <i class="fa-solid fa-check"></i> Periksa Urutan Kode
                </button>
            </div>
        `;

        stage.querySelectorAll(".syntax-arrow-btn.btn-up").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx, 10);
                activeGameInstance.moveItem(idx, idx - 1);
            });
        });

        stage.querySelectorAll(".syntax-arrow-btn.btn-down").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx, 10);
                activeGameInstance.moveItem(idx, idx + 1);
            });
        });

        stage.querySelectorAll(".syntax-line-row").forEach(row => {
            row.addEventListener("click", () => {
                const idx = parseInt(row.dataset.idx, 10);
                activeGameInstance.selectItem(idx);
            });
        });

        $("btnHint")?.addEventListener("click", () => activeGameInstance.useHint());
        $("btnCheckOrder")?.addEventListener("click", () => activeGameInstance.checkOrder());
    }

    // ==========================================
    // Render Results Screen
    // ==========================================
    function renderResultScreen(result) {
        updateStatsHUD();
        const stage = $("gameStage");
        if (!stage || !result) return;

        let starsHTML = "";
        for (let i = 1; i <= 3; i++) {
            starsHTML += `<i class="fa-solid fa-star" style="opacity:${i <= (result.stars || 0) ? 1 : 0.25}"></i>`;
        }

        let rewardBadgeText = "";
        if (result.rewardType === "first_clear_ever") rewardBadgeText = "Kemenangan Pertama! +Bonus XP Maksimal";
        else if (result.rewardType === "first_clear_today") rewardBadgeText = "Hadiah Harian Didapatkan";
        else if (result.rewardType === "high_score_bonus") rewardBadgeText = "Rekor Skor Baru! Bonus XP";
        else rewardBadgeText = "Latihan Selesai (Replay Scaled XP)";

        stage.innerHTML = `
            <div class="game-result-modal">
                <div class="result-stars-row">${starsHTML}</div>
                <div class="result-score-title">${result.score} Poin</div>
                <div class="result-badge-pill">${rewardBadgeText}</div>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; max-width:480px; margin:0 auto 24px;">
                    <div class="stat-box">
                        <span class="stat-label">Akurasi</span>
                        <span class="stat-value">${Math.round((result.accuracy || 0) * 100)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">XP Didapat</span>
                        <span class="stat-value">+${result.xpEarned || 0}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Koin</span>
                        <span class="stat-value">+${result.coinsEarned || 0}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:12px;">
                    <button class="game-tab-btn active" id="btnReplay">
                        <i class="fa-solid fa-rotate-right"></i> Main Lagi
                    </button>
                    <a href="index.html" class="game-tab-btn">
                        <i class="fa-solid fa-house"></i> Ke Beranda
                    </a>
                </div>
            </div>
        `;

        $("btnReplay")?.addEventListener("click", () => loadAndStartGame());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initArena);
    } else {
        initArena();
    }
})();
