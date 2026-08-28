(() => {
    "use strict";

    const SESSION_KEY = "eduquestQuizSession";
    const ACTIVE_KEY = "eduquestQuizActiveState";
    const LAST_KEY = "eduquestLastSession";
    const BEST_KEY = "eduquestBestScore";
    const BOOKMARK_KEY = "eduquestBookmarks";
    const core = window.QuizNation;
    const localStore = getStorage("localStorage");
    const sessionStore = getStorage("sessionStorage");

    function getStorage(name) {
        try {
            return window[name];
        } catch {
            return null;
        }
    }

    const state = {
        payload: null,
        questions: [],
        current: 0,
        selected: [],
        visited: [],
        flagged: [],
        confidence: [],
        correct: 0,
        wrong: 0,
        streak: 0,
        bestStreak: 0,
        helpUsed: 0,
        timeLeft: 0,
        initialTime: 0,
        timerId: null,
        running: false,
        hintsUsed: [],
        fiftyRemoved: [],
        bookmarks: [],
        exiting: false,
        reviewOpen: false,
        lastRenderedIndex: -1,
        notes: [],
        soundEnabled: true,
        isPaused: false,
        reviewFilter: "all",
        lastTickAt: 0
    };

    function sfx(type) {
        if (!state.soundEnabled || typeof window.playSound !== "function") return;
        try { window.playSound(type); } catch (e) { /* ignore audio error */ }
    }

    const els = {};
    let toastTimer = null;
    let confirmResolver = null;
    let confirmTrigger = null;
    let reviewTrigger = null;
    let shortcutsTrigger = null;

    function isAnyOverlayOpen() {
        return Boolean(
            state.isPaused ||
            (els.resultOverlay && !els.resultOverlay.hidden) ||
            (els.confirmOverlay && !els.confirmOverlay.hidden) ||
            (els.reviewDrawer && !els.reviewDrawer.hidden) ||
            (els.shortcutsModal && !els.shortcutsModal.hidden)
        );
    }

    function syncAppAccessibility() {
        const overlayOpen = isAnyOverlayOpen();
        document.body.classList.toggle("dialog-open", overlayOpen);
        document.querySelectorAll(".focus-header, .focus-progress, .focus-layout, .focus-actions").forEach((element) => {
            element.toggleAttribute("inert", overlayOpen);
        });
        const confirmationOpen = Boolean(els.confirmOverlay && !els.confirmOverlay.hidden);
        const shortcutsOpen = Boolean(els.shortcutsModal && !els.shortcutsModal.hidden);
        const reviewOpen = Boolean(els.reviewDrawer && !els.reviewDrawer.hidden);
        els.resultOverlay?.toggleAttribute("inert", confirmationOpen || shortcutsOpen || reviewOpen || state.isPaused);
        els.reviewDrawer?.toggleAttribute("inert", confirmationOpen || shortcutsOpen || state.isPaused);
    }

    function readJson(storage, key, fallback) {
        return core?.storage.read(storage, key, fallback) ?? fallback;
    }

    function writeJson(storage, key, value) {
        return core?.storage.write(storage, key, value) ?? false;
    }

    function readText(storage, key, fallback = "") {
        try {
            return storage?.getItem(key) ?? fallback;
        } catch {
            return fallback;
        }
    }

    function writeText(storage, key, value) {
        try {
            storage?.setItem(key, String(value));
            return true;
        } catch {
            return false;
        }
    }

    function getFocusable(container) {
        if (!container) return [];
        return [...container.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
            .filter((element) => !element.hidden && element.getClientRects().length > 0);
    }

    function trapFocus(event, container) {
        const focusables = getFocusable(container);
        if (!focusables.length) return;
        const current = focusables.indexOf(document.activeElement);
        const next = event.shiftKey
            ? (current <= 0 ? focusables.length - 1 : current - 1)
            : (current === -1 || current === focusables.length - 1 ? 0 : current + 1);
        event.preventDefault();
        focusables[next].focus();
    }

    function formatTime(seconds) {
        const safe = Math.max(0, Number(seconds) || 0);
        const minutes = Math.floor(safe / 60);
        const rest = String(safe % 60).padStart(2, "0");
        return `${minutes}:${rest}`;
    }

    function showToast(message) {
        window.clearTimeout(toastTimer);
        els.toast.innerHTML = message;
        els.toast.classList.add("show");
        toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
    }

    function animateNumber(element, target, suffix = "") {
        if (!element) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target <= 0) {
            element.textContent = `${target}${suffix}`;
            return;
        }
        const duration = 750;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(target * easeProgress);
            element.textContent = `${currentVal}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    function cacheElements() {
        [
            "sessionCategory", "sessionDifficulty", "sessionMode", "themeButton", "exitButton",
            "headerAnswered", "headerAccuracy", "sessionInsight", "insightAnswered", "insightUnanswered", "insightFlagged",
            "insightAccuracy", "insightBestStreak", "confidenceControls",
            "focusProgress", "progressBar", "questionCounter", "questionTopic", "questionText", "answerList",
            "answerFeedback", "focusSidebar", "timerCard", "timerValue", "correctStat", "wrongStat",
            "flaggedStat", "streakStat", "questionNavigator", "closeNavigator", "navigatorButton", "hintButton",
            "fiftyButton", "bookmarkButton", "flagButton", "skipButton", "nextButton", "resultOverlay",
            "resultScore", "resultTitle", "resultMessage", "resultCorrect", "resultWrong", "resultStreak",
            "resultHelp", "resultInsight", "reviewResultButton", "retrySessionButton", "resultBackLink", "focusToast",
            "reviewDrawer", "closeReviewDrawer", "reviewSummary", "reviewList",
            "confirmOverlay", "confirmTitle", "confirmMessage", "confirmCancelButton", "confirmAcceptButton", "questionStage", "sidebarBackdrop",
            "shortcutsButton", "soundButton", "fullscreenButton", "pauseButton", "scratchpadButton", "comboBanner", "scratchpadDrawer",
            "clearScratchpad", "closeScratchpad", "scratchpadInput", "pauseOverlay", "resumeButton", "shortcutsModal",
            "closeShortcutsModal", "filterAll", "filterCorrect", "filterWrong", "filterFlagged"
        ].forEach((id) => {
            els[id.replace("focusToast", "toast")] = document.getElementById(id);
        });
    }

    function restoreSession() {
        const result = core?.sessions.read();
        if (!result?.ok) return false;
        const payload = result.value;
        state.payload = payload;
        state.questions = payload.questions;
        state.timeLeft = Number(payload.timeLimit) || payload.questions.length * 90;
        state.initialTime = state.timeLeft;
        state.selected = Array(state.questions.length).fill(null);
        state.visited = Array(state.questions.length).fill(false);
        state.flagged = Array(state.questions.length).fill(false);
        state.confidence = Array(state.questions.length).fill(null);
        state.hintsUsed = Array(state.questions.length).fill(false);
        state.fiftyRemoved = Array(state.questions.length).fill(null);
        state.notes = Array(state.questions.length).fill("");
        state.bookmarks = core.sanitize.bookmarks(readJson(localStore, BOOKMARK_KEY, []));

        const saved = readJson(sessionStore, ACTIVE_KEY, null);
        if (saved && saved.sessionId === payload.sessionId && saved.running) {
            const length = state.questions.length;
            state.current = Math.min(Math.max(0, Number(saved.current) || 0), length - 1);
            state.selected = Array.isArray(saved.selected) && saved.selected.length === length
                ? saved.selected.map((answer, index) => normalizeSavedAnswer(answer, state.questions[index]))
                : state.selected;
            state.visited = Array.isArray(saved.visited) && saved.visited.length === length ? saved.visited.map(Boolean) : state.visited;
            state.flagged = Array.isArray(saved.flagged) && saved.flagged.length === length ? saved.flagged.map(Boolean) : state.flagged;
            state.confidence = Array.isArray(saved.confidence) && saved.confidence.length === length
                ? saved.confidence.map(value => value === "sure" || value === "review" ? value : null)
                : state.confidence;
            state.hintsUsed = Array.isArray(saved.hintsUsed) && saved.hintsUsed.length === length
                ? saved.hintsUsed.map(Boolean)
                : state.hintsUsed;
            state.fiftyRemoved = Array.isArray(saved.fiftyRemoved) && saved.fiftyRemoved.length === length
                ? saved.fiftyRemoved.map((indexes, questionIndex) => Array.isArray(indexes)
                    ? indexes.map(Number).filter(index => Number.isInteger(index) && index >= 0 && index < state.questions[questionIndex].shuffledAnswers.length).slice(0, 2)
                    : null)
                : state.fiftyRemoved;
            state.correct = state.selected.filter((answer) => answer?.isCorrect).length;
            state.wrong = state.selected.filter((answer) => answer && !answer.isCorrect).length;
            state.streak = Math.min(length, Math.max(0, Number(saved.streak) || 0));
            state.bestStreak = Math.min(length, Math.max(0, Number(saved.bestStreak) || 0));
            state.helpUsed = Math.min(length * 2, Math.max(0, Number(saved.helpUsed) || 0));
            const restoredInitialTime = Number(saved.initialTime);
            state.initialTime = Number.isFinite(restoredInitialTime)
                ? Math.min(7200, Math.max(30, restoredInitialTime))
                : state.initialTime;
            const restoredTimeLeft = Number(saved.timeLeft);
            state.timeLeft = Number.isFinite(restoredTimeLeft)
                ? Math.min(state.initialTime, Math.max(0, restoredTimeLeft))
                : state.initialTime;
            state.notes = Array.isArray(saved.notes) && saved.notes.length === length ? saved.notes.map(String) : state.notes;
            state.soundEnabled = saved.soundEnabled !== undefined ? Boolean(saved.soundEnabled) : true;
        }
        return true;
    }

    function normalizeSavedAnswer(answer, question) {
        if (!answer || typeof answer !== "object" || !question) return null;
        const selectedIndex = question.shuffledAnswers.findIndex((item) => item.text === answer.selectedText);
        if (selectedIndex < 0) return null;
        const selectedAnswer = question.shuffledAnswers[selectedIndex];
        const correctAnswer = question.shuffledAnswers[question.shuffledCorrect];
        return {
            id: question.id,
            question: question.question,
            category: question.category,
            difficulty: question.difficulty,
            selectedText: selectedAnswer.text,
            correctText: correctAnswer.text,
            explanation: question.explanation,
            hint: question.hint,
            isCorrect: selectedIndex === question.shuffledCorrect
        };
    }

    function saveActiveState() {
        if (!state.payload || !state.running) return;
        writeJson(sessionStore, ACTIVE_KEY, {
            sessionId: state.payload.sessionId,
            createdAt: state.payload.createdAt,
            running: state.running,
            current: state.current,
            selected: state.selected,
            visited: state.visited,
            flagged: state.flagged,
            confidence: state.confidence,
            hintsUsed: state.hintsUsed,
            fiftyRemoved: state.fiftyRemoved,
            correct: state.correct,
            wrong: state.wrong,
            streak: state.streak,
            bestStreak: state.bestStreak,
            helpUsed: state.helpUsed,
            timeLeft: state.timeLeft,
            initialTime: state.initialTime,
            notes: state.notes,
            soundEnabled: state.soundEnabled
        });
    }

    function isBookmarked(question) {
        return state.bookmarks.some((item) => item.id === question.id);
    }

    function hasUnanswered() {
        return state.selected.some((answer) => !answer);
    }

    function findNextUnanswered(fromIndex = state.current) {
        for (let offset = 1; offset <= state.questions.length; offset += 1) {
            const index = (fromIndex + offset) % state.questions.length;
            if (!state.selected[index]) return index;
        }
        return -1;
    }

    function getSessionStats() {
        const total = Math.max(1, state.questions.length);
        const answered = state.selected.filter(Boolean).length;
        const correct = state.selected.filter(answer => answer?.isCorrect).length;
        const flagged = state.flagged.filter(Boolean).length;
        const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
        return {
            total,
            answered,
            unanswered: total - answered,
            flagged,
            accuracy,
            bestStreak: state.bestStreak
        };
    }

    function renderSessionInsight() {
        const stats = getSessionStats();
        if (els.headerAnswered) els.headerAnswered.textContent = `${stats.answered}/${stats.total} dijawab`;
        if (els.headerAccuracy) els.headerAccuracy.textContent = `${stats.accuracy}%`;
        if (els.insightAnswered) els.insightAnswered.textContent = stats.answered;
        if (els.insightUnanswered) els.insightUnanswered.textContent = stats.unanswered;
        if (els.insightFlagged) els.insightFlagged.textContent = stats.flagged;
        if (els.insightAccuracy) els.insightAccuracy.textContent = `${stats.accuracy}%`;
        if (els.insightBestStreak) els.insightBestStreak.textContent = `x${stats.bestStreak}`;
    }

    function renderConfidenceControls() {
        if (!els.confidenceControls) return;
        const currentConfidence = state.confidence[state.current];
        els.confidenceControls.querySelectorAll("[data-confidence]").forEach(button => {
            const active = button.dataset.confidence === currentConfidence;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function updateQuestionDOM(question) {
        state.visited[state.current] = true;
        const saved = state.selected[state.current];

        els.questionCounter.textContent = `Soal ${state.current + 1}/${state.questions.length}`;
        els.questionTopic.textContent = state.payload.source === "lms"
            ? `${state.payload.lms.moduleTitle} · ${state.payload.config.difficultyLabel}`
            : `${state.payload.config.categoryLabel} · ${state.payload.config.difficultyLabel}`;
        els.questionText.textContent = question.question;
        els.answerList.replaceChildren();
        els.answerFeedback.className = "answer-feedback";
        els.answerFeedback.replaceChildren();

        question.shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-choice";
            button.dataset.index = String(index);
            const key = document.createElement("span");
            const label = document.createElement("span");
            key.className = "answer-key";
            key.textContent = String.fromCharCode(65 + index);
            label.textContent = answer.text;
            button.append(key, label);
            button.setAttribute("aria-label", `Pilihan ${String.fromCharCode(65 + index)}: ${answer.text}`);
            button.addEventListener("click", () => chooseAnswer(index));
            button.addEventListener("mouseenter", () => sfx("hover"));
            if (saved) {
                button.disabled = true;
                if (index === question.shuffledCorrect) button.classList.add("is-correct");
                if (answer.text === saved.selectedText && !saved.isCorrect) button.classList.add("is-wrong");
            }
            els.answerList.appendChild(button);
        });

        if (!saved && Array.isArray(state.fiftyRemoved[state.current])) {
            state.fiftyRemoved[state.current].forEach(hideAnswerChoice);
        }

        if (saved) {
            const iconHtml = saved.isCorrect 
                ? '<i class="fa-solid fa-circle-check mint feedback-icon"></i> <strong>Jawaban Tepat!</strong> ' 
                : '<i class="fa-solid fa-circle-xmark red feedback-icon"></i> <strong>Belum Tepat.</strong> ';
            els.answerFeedback.innerHTML = `${iconHtml}<p class="feedback-detail">${saved.explanation || "Periksa kembali konsep materi terkait."}</p>`;
            els.answerFeedback.className = `answer-feedback show ${saved.isCorrect ? "feedback-correct" : "feedback-wrong"}`;
        }

        const practice = state.payload.config.mode === "practice";
        els.hintButton.disabled = !practice || Boolean(saved) || state.hintsUsed[state.current];
        els.fiftyButton.disabled = !practice || Boolean(saved) || Array.isArray(state.fiftyRemoved[state.current]);
        
        const bookmarked = isBookmarked(question);
        els.bookmarkButton.disabled = bookmarked;
        els.bookmarkButton.innerHTML = bookmarked 
            ? '<i class="fa-solid fa-bookmark mint"></i> Tersimpan' 
            : '<i class="fa-regular fa-bookmark"></i> Simpan';

        const flagged = state.flagged[state.current];
        els.flagButton.innerHTML = flagged 
            ? '<i class="fa-solid fa-flag yellow"></i> Batal Ragu' 
            : '<i class="fa-regular fa-flag"></i> Ragu <kbd>F</kbd>';

        els.skipButton.disabled = !hasUnanswered();
        els.nextButton.innerHTML = !hasUnanswered() 
            ? 'Selesaikan <i class="fa-solid fa-check"></i>' 
            : state.current === state.questions.length - 1 
                ? 'Cari Soal Kosong <i class="fa-solid fa-magnifying-glass"></i>' 
                : 'Berikutnya <i class="fa-solid fa-arrow-right"></i>';

        if (els.scratchpadInput) {
            els.scratchpadInput.value = state.notes[state.current] || "";
        }
        if (els.scratchpadButton) {
            const hasNote = Boolean(state.notes[state.current] && state.notes[state.current].trim());
            els.scratchpadButton.innerHTML = hasNote
                ? '<i class="fa-solid fa-pen-to-square mint"></i> Coretan <kbd>N</kbd>'
                : '<i class="fa-solid fa-pen-to-square"></i> Coretan <kbd>N</kbd>';
        }

        renderConfidenceControls();
        renderSessionInsight();
        updateProgress();
        renderNavigator();
        renderStats();
        saveActiveState();
    }

    let isQuestionTransitioning = false;
    function renderQuestion() {
        const question = state.questions[state.current];
        if (!question) return;

        if (state.lastRenderedIndex !== -1 && state.lastRenderedIndex !== state.current && els.questionStage && !isQuestionTransitioning) {
            isQuestionTransitioning = true;
            els.questionStage.classList.add("question-fade-out");
            setTimeout(() => {
                updateQuestionDOM(question);
                state.lastRenderedIndex = state.current;
                els.questionStage.classList.remove("question-fade-out");
                els.questionStage.classList.add("question-fade-in");
                els.questionStage.offsetHeight;
                requestAnimationFrame(() => {
                    els.questionStage.classList.remove("question-fade-in");
                    isQuestionTransitioning = false;
                });
            }, 150);
            return;
        }

        updateQuestionDOM(question);
        state.lastRenderedIndex = state.current;
    }

    function chooseAnswer(index) {
        if (!state.running || state.selected[state.current]) return;
        const question = state.questions[state.current];
        const selectedAnswer = question.shuffledAnswers[index];
        const correctAnswer = question.shuffledAnswers[question.shuffledCorrect];
        const isCorrect = index === question.shuffledCorrect;
        state.selected[state.current] = {
            id: question.id,
            question: question.question,
            category: question.category,
            difficulty: question.difficulty,
            selectedText: selectedAnswer.text,
            correctText: correctAnswer.text,
            explanation: question.explanation,
            hint: question.hint,
            isCorrect
        };

        if (isCorrect) {
            state.correct += 1;
            state.streak += 1;
            state.bestStreak = Math.max(state.bestStreak, state.streak);
            if (els.comboBanner && state.streak >= 3) {
                const icons = { 3: "🔥", 5: "⚡", 10: "👑" };
                const badge = icons[state.streak] || "🔥";
                els.comboBanner.innerHTML = `<span><i>${badge}</i> <strong>Combo x${state.streak} Beruntun!</strong> Ritme belajarmu luar biasa!</span> <span class="combo-points">+20 Poin Fokus</span>`;
                els.comboBanner.hidden = false;
            }
            sfx(state.streak >= 5 ? "complete" : state.streak >= 3 ? "streak" : "correct");
            if (state.streak === 3 || state.streak === 5 || state.streak === 10) {
                showToast(`<i class="fa-solid fa-fire orange"></i> Combo x${state.streak}! Pertahankan ritme yang bagus!`);
            }
        } else {
            state.wrong += 1;
            state.streak = 0;
            if (els.comboBanner) els.comboBanner.hidden = true;
            sfx("wrong");
        }
        renderQuestion();
    }

    function updateProgress() {
        const answered = state.selected.filter(Boolean).length;
        const percent = Math.round((answered / state.questions.length) * 100);
        els.progressBar.value = percent;
        els.focusProgress.setAttribute("aria-valuenow", String(percent));
    }

    function renderStats() {
        els.correctStat.textContent = state.correct;
        els.wrongStat.textContent = state.wrong;
        els.flaggedStat.textContent = state.flagged.filter(Boolean).length;
        els.streakStat.textContent = `x${state.streak}`;
    }

    function renderNavigator() {
        els.questionNavigator.replaceChildren();
        state.questions.forEach((question, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "question-jump";
            button.textContent = String(index + 1);
            const status = [];
            if (index === state.current) {
                button.classList.add("current");
                button.setAttribute("aria-current", "step");
                status.push("soal saat ini");
            }
            if (state.selected[index]) {
                button.classList.add("answered");
                status.push(state.selected[index].isCorrect ? "dijawab benar" : "dijawab belum tepat");
                if (!state.selected[index].isCorrect) button.classList.add("wrong");
            }
            if (state.flagged[index]) {
                button.classList.add("flagged");
                status.push("ditandai ragu");
            }
            if (state.confidence[index] === "sure") {
                button.classList.add("sure");
                status.push("yakin");
            }
            if (state.confidence[index] === "review") {
                button.classList.add("review-confidence");
                status.push("perlu review");
            }
            button.setAttribute("aria-label", `Buka soal ${index + 1}${status.length ? `, ${status.join(", ")}` : ", belum dijawab"}`);
            button.addEventListener("click", () => {
                state.current = index;
                renderQuestion();
                closeNavigator();
            });
            els.questionNavigator.appendChild(button);
        });
    }

    function showHint() {
        if (els.hintButton.disabled) return;
        sfx("click");
        state.hintsUsed[state.current] = true;
        state.helpUsed += 1;
        els.hintButton.disabled = true;
        els.answerFeedback.innerHTML = `<i class="fa-solid fa-lightbulb yellow feedback-icon"></i> <strong>Hint Eksklusif:</strong> <p class="feedback-detail">${state.questions[state.current].hint || "Analisis setiap pilihan dengan saksama."}</p>`;
        els.answerFeedback.className = "answer-feedback show feedback-hint";
        saveActiveState();
    }

    function useFifty() {
        if (els.fiftyButton.disabled) return;
        sfx("click");
        const question = state.questions[state.current];
        const wrongIndexes = question.shuffledAnswers
            .map((answer, index) => index)
            .filter((index) => index !== question.shuffledCorrect)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        wrongIndexes.forEach(hideAnswerChoice);
        state.fiftyRemoved[state.current] = wrongIndexes;
        state.helpUsed += 1;
        els.fiftyButton.disabled = true;
        showToast('<i class="fa-solid fa-wand-magic-sparkles mint"></i> 2 pilihan salah telah dihapus.');
        saveActiveState();
    }

    function hideAnswerChoice(index) {
        const option = els.answerList.querySelector(`[data-index="${index}"]`);
        if (!option) return;
        option.classList.add("hidden-choice");
        option.disabled = true;
        option.setAttribute("aria-hidden", "true");
    }

    function bookmarkQuestion() {
        const question = state.questions[state.current];
        if (isBookmarked(question)) return;
        sfx("click");
        state.bookmarks.unshift({
            id: question.id,
            question: question.question,
            category: question.category,
            difficulty: question.difficulty,
            hint: question.hint,
            explanation: question.explanation
        });
        state.bookmarks = state.bookmarks.slice(0, 20);
        writeJson(localStore, BOOKMARK_KEY, state.bookmarks);
        els.bookmarkButton.disabled = true;
        els.bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark mint"></i> Tersimpan';
        showToast('<i class="fa-solid fa-bookmark mint"></i> Soal disimpan.');
    }

    function setConfidence(value) {
        state.confidence[state.current] = state.confidence[state.current] === value ? null : value;
        if (value === "review" && state.confidence[state.current] === "review") {
            state.flagged[state.current] = true;
        }
        renderConfidenceControls();
        renderNavigator();
        renderSessionInsight();
        saveActiveState();
    }

    function toggleFlag() {
        state.flagged[state.current] = !state.flagged[state.current];
        if (state.flagged[state.current] && !state.confidence[state.current]) {
            state.confidence[state.current] = "review";
        }
        renderQuestion();
    }

    function renderReviewDrawer() {
        if (!els.reviewList || !els.reviewSummary) return;
        const stats = getSessionStats();
        els.reviewSummary.innerHTML = `
            <span><strong>${stats.answered}</strong> Terjawab</span>
            <span><strong>${stats.unanswered}</strong> Kosong</span>
            <span><strong>${state.wrong}</strong> Salah</span>
            <span><strong>${state.helpUsed}</strong> Bantuan</span>
        `;
        els.reviewList.replaceChildren();
        let countShown = 0;
        state.questions.forEach((question, index) => {
            const answer = state.selected[index];
            const isCorrect = answer?.isCorrect;
            const isWrongOrEmpty = !answer || !answer.isCorrect;
            const isFlagged = Boolean(state.flagged[index] || state.confidence[index] === "review");

            if (state.reviewFilter === "correct" && !isCorrect) return;
            if (state.reviewFilter === "wrong" && !isWrongOrEmpty) return;
            if (state.reviewFilter === "flagged" && !isFlagged) return;

            countShown += 1;
            const item = document.createElement("article");
            item.className = "review-answer-item";
            item.classList.add(answer ? answer.isCorrect ? "correct" : "wrong" : "empty");
            item.innerHTML = `
                <span class="review-answer-number">${index + 1}</span>
                <span class="review-answer-copy">
                    <strong>${answer ? answer.isCorrect ? '<i class="fa-solid fa-circle-check mint"></i> Benar' : '<i class="fa-solid fa-circle-xmark red"></i> Belum tepat' : '<i class="fa-regular fa-circle blue"></i> Kosong'}</strong>
                    <small>${question.question}</small>
                    <div class="review-answer-detail">
                        <span><i class="fa-solid fa-user"></i> <strong>Jawabanmu:</strong> ${answer?.selectedText || "Tidak dijawab"}</span>
                        <span><i class="fa-solid fa-key"></i> <strong>Kunci:</strong> ${question.shuffledAnswers[question.shuffledCorrect]?.text || "-"}</span>
                    </div>
                </span>
                <span class="review-answer-meta">${state.confidence[index] === "sure" ? "Yakin" : state.flagged[index] ? "Ragu" : question.difficulty}</span>
            `;
            els.reviewList.appendChild(item);
        });
        if (countShown === 0) {
            els.reviewList.innerHTML = '<p class="review-empty-message">Tidak ada soal dalam kategori filter ini.</p>';
        }
    }

    function setReviewFilter(filter) {
        state.reviewFilter = filter;
        document.querySelectorAll(".review-filter-tabs .filter-tab").forEach(tab => {
            const active = tab.dataset.filter === filter;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        sfx("click");
        renderReviewDrawer();
    }

    function openReviewDrawer() {
        if (!els.reviewDrawer) return;
        reviewTrigger = document.activeElement;
        renderReviewDrawer();
        els.reviewDrawer.hidden = false;
        state.reviewOpen = true;
        syncAppAccessibility();
        window.setTimeout(() => els.closeReviewDrawer?.focus(), 0);
    }

    function closeReviewDrawer() {
        if (!els.reviewDrawer || els.reviewDrawer.hidden) return;
        els.reviewDrawer.hidden = true;
        state.reviewOpen = false;
        syncAppAccessibility();
        reviewTrigger?.focus?.();
        reviewTrigger = null;
    }

    function skipQuestion() {
        sfx("click");
        const next = findNextUnanswered();
        if (next === -1) {
            finishQuiz();
            return;
        }
        state.current = next;
        renderQuestion();
    }

    function nextQuestion() {
        sfx("click");
        if (!hasUnanswered()) {
            finishQuiz();
            return;
        }
        if (state.current < state.questions.length - 1) {
            state.current += 1;
        } else {
            state.current = findNextUnanswered();
        }
        renderQuestion();
    }

    function tickTimer() {
        const now = Date.now();
        if (!state.running || state.isPaused) {
            state.lastTickAt = now;
            els.timerValue.textContent = formatTime(state.timeLeft);
            els.timerCard.classList.toggle("warning", state.timeLeft <= 30);
            return;
        }

        const previousTime = state.timeLeft;
        const elapsedSeconds = Math.max(0, Math.floor((now - state.lastTickAt) / 1000));
        if (elapsedSeconds > 0) {
            state.timeLeft = Math.max(0, state.timeLeft - elapsedSeconds);
            state.lastTickAt += elapsedSeconds * 1000;
        }

        els.timerValue.textContent = formatTime(state.timeLeft);
        els.timerCard.classList.toggle("warning", state.timeLeft <= 30);
        if (state.timeLeft <= 0) {
            sfx("timeup");
            finishQuiz();
            return;
        }
        if (previousTime > 10 && state.timeLeft <= 10) sfx("click");
        if (elapsedSeconds > 0 && Math.floor(previousTime / 5) !== Math.floor(state.timeLeft / 5)) {
            saveActiveState();
        }
    }

    function buildSummary(score) {
        if (score >= 90) return "Akurasi sangat kuat. Kamu siap menaikkan level kesulitan.";
        if (score >= 75) return "Hasil solid. Review beberapa celah agar konsistensimu naik.";
        if (score >= 60) return "Fondasi sudah terbentuk. Fokuskan latihan pada jawaban yang masih salah.";
        return "Gunakan hasil ini sebagai peta awal, lalu ulangi dengan mode Practice.";
    }

    function finishQuiz() {
        finishQuizWithStatus(false);
    }

    function finishQuizWithStatus() {
        if (!state.running) return;
        window.clearInterval(state.timerId);
        state.running = false;
        const total = state.questions.length;
        const unanswered = total - state.selected.filter(Boolean).length;
        const missed = state.wrong + unanswered;
        const score = Math.round((state.correct / total) * 100);
        const isLms = state.payload.source === "lms";
        const passThreshold = state.payload.lms?.passThreshold || 80;
        const isPassed = score >= passThreshold;
        const session = {
            date: new Date().toISOString(),
            score,
            sessionId: state.payload.sessionId,
            correct: state.correct,
            wrong: missed,
            answeredWrong: state.wrong,
            unanswered,
            total,
            mode: state.payload.config.mode,
            category: state.payload.config.category,
            difficulty: state.payload.config.difficulty,
            bestStreak: state.bestStreak,
            helpUsed: state.helpUsed,
            timeLeft: state.timeLeft,
            initialTime: state.initialTime,
            flagged: state.flagged.filter(Boolean).length,
            confidence: state.confidence,
            hintsUsed: state.hintsUsed,
            fiftyRemoved: state.fiftyRemoved,
            answers: state.selected.filter(Boolean)
        };

        if (isLms) {
            saveLmsResult(score);
        } else {
            writeJson(localStore, LAST_KEY, session);
            const best = Math.max(score, Number(readText(localStore, BEST_KEY, "0")) || 0);
            writeText(localStore, BEST_KEY, Math.min(100, Math.max(0, best)));
        }

        if (typeof window !== "undefined" && window.ProgressionEngine && typeof window.ProgressionEngine.recordActivity === "function") {
            try {
                window.ProgressionEngine.recordActivity("quiz", {
                    id: session.sessionId || `quiz_${Date.now()}`,
                    title: `Kuis: ${state.payload?.config?.categoryLabel || "Quiz"}`,
                    count: state.correct,
                    missionType: "answer_quiz",
                    configKey: isPassed ? "QUIZ_PASSED" : "QUIZ_ANSWER_CORRECT",
                    multiplier: isPassed ? 1 : 0.5,
                    rewardId: isPassed ? `quiz_session_${session.sessionId || Date.now()}` : null,
                    showModal: false
                });
            } catch (err) {
                console.warn("[QuizSession] ProgressionEngine record error:", err);
            }
        }

        core.storage.remove(sessionStore, ACTIVE_KEY);
        els.progressBar.value = 100;
        els.focusProgress.setAttribute("aria-valuenow", "100");

        animateNumber(els.resultScore, score, "%");
        animateNumber(els.resultCorrect, state.correct);
        animateNumber(els.resultWrong, missed);
        animateNumber(els.resultStreak, state.bestStreak);
        animateNumber(els.resultHelp, state.helpUsed);

        els.resultTitle.textContent = isLms
            ? isPassed ? "Selamat, langkah LMS ini berhasil diselesaikan." : "Belum mencapai batas kelulusan LMS."
            : score >= 75 ? "Kerja bagus, ritmemu sudah kuat." : "Sesi selesai, peta belajarmu makin jelas.";
        els.resultMessage.textContent = isLms
            ? isPassed
                ? `Kamu meraih ${score}% dan melewati batas kelulusan ${passThreshold}%. Progres modul sudah diperbarui.`
                : `Skor ${score}%. Kamu memerlukan minimal ${passThreshold}% untuk menandai langkah ini selesai.`
            : buildSummary(score);
        renderResultInsight();
        configureResultActions(isLms);
        renderReviewDrawer();
        els.resultOverlay.hidden = false;
        syncAppAccessibility();
        sfx(score >= 80 ? "complete" : "streak");
        window.setTimeout(() => els.reviewResultButton.focus(), 0);
    }

    function togglePause() {
        if (!state.running || !els.resultOverlay.hidden || !els.confirmOverlay.hidden) return;
        if (!state.isPaused) {
            tickTimer();
            if (!state.running) return;
            state.isPaused = true;
        } else {
            state.isPaused = false;
            state.lastTickAt = Date.now();
        }
        if (els.pauseOverlay) els.pauseOverlay.hidden = !state.isPaused;
        if (els.pauseButton) {
            els.pauseButton.innerHTML = state.isPaused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
            els.pauseButton.title = state.isPaused ? "Lanjutkan Sesi (Tekan P)" : "Jeda Sesi (Tekan P)";
            els.pauseButton.setAttribute("aria-label", state.isPaused ? "Lanjutkan waktu" : "Jeda waktu");
            els.pauseButton.setAttribute("aria-pressed", String(state.isPaused));
        }
        syncAppAccessibility();
        sfx("click");
        if (state.isPaused) {
            window.setTimeout(() => els.resumeButton?.focus(), 0);
        } else {
            els.pauseButton?.focus();
        }
    }

    function toggleScratchpad() {
        if (!els.scratchpadDrawer) return;
        const isHidden = els.scratchpadDrawer.hidden;
        els.scratchpadDrawer.hidden = !isHidden;
        sfx("click");
        if (!isHidden) {
            els.scratchpadButton?.focus();
        } else {
            els.scratchpadInput?.focus();
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        if (els.soundButton) {
            els.soundButton.innerHTML = state.soundEnabled 
                ? '<i class="fa-solid fa-volume-high"></i> <span>Suara</span>' 
                : '<i class="fa-solid fa-volume-xmark"></i> <span>Bisukan</span>';
            els.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
            els.soundButton.title = state.soundEnabled ? "Audio Suara" : "Suara Bisu";
        }
        if (state.soundEnabled) sfx("click");
        saveActiveState();
    }

    async function toggleFullscreen() {
        const elem = document.documentElement;
        const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        const enterFullscreen = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        try {
            if (!isFull) {
                if (!enterFullscreen) {
                    showToast('<i class="fa-solid fa-circle-info yellow"></i> Layar penuh tidak didukung browser ini.');
                    return;
                }
                await Promise.resolve(enterFullscreen.call(elem));
                showToast('<i class="fa-solid fa-expand mint"></i> Mode layar penuh diaktifkan.');
            } else {
                if (!exitFullscreen) {
                    showToast('<i class="fa-solid fa-circle-info yellow"></i> Layar penuh tidak dapat ditutup otomatis.');
                    return;
                }
                await Promise.resolve(exitFullscreen.call(document));
                showToast('<i class="fa-solid fa-compress yellow"></i> Keluar dari layar penuh.');
            }
            sfx("click");
        } catch {
            showToast('<i class="fa-solid fa-triangle-exclamation yellow"></i> Mode layar penuh ditolak oleh browser.');
        }
    }

    function syncFullscreenState() {
        if (!els.fullscreenButton) return;
        const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        els.fullscreenButton.classList.toggle("fullscreen-active", isFull);
        els.fullscreenButton.innerHTML = isFull
            ? '<i class="fa-solid fa-compress"></i> <span>Keluar Fullscreen</span>'
            : '<i class="fa-solid fa-expand"></i> <span>Layar Penuh</span>';
        els.fullscreenButton.setAttribute("aria-label", isFull ? "Keluar dari layar penuh" : "Aktifkan layar penuh");
    }

    function openShortcutsModal() {
        if (!els.shortcutsModal) return;
        shortcutsTrigger = document.activeElement;
        els.shortcutsModal.hidden = false;
        syncAppAccessibility();
        sfx("click");
        window.setTimeout(() => els.closeShortcutsModal?.focus(), 0);
    }

    function closeShortcutsModal() {
        if (!els.shortcutsModal || els.shortcutsModal.hidden) return;
        els.shortcutsModal.hidden = true;
        syncAppAccessibility();
        sfx("click");
        shortcutsTrigger?.focus?.();
        shortcutsTrigger = null;
    }

    function renderResultInsight() {
        const grouped = {};
        state.selected.filter(Boolean).forEach((answer) => {
            const key = answer.category || "all";
            grouped[key] ||= { correct: 0, total: 0 };
            grouped[key].total += 1;
            if (answer.isCorrect) grouped[key].correct += 1;
        });
        const weakest = Object.entries(grouped)
            .map(([category, data]) => ({ category, accuracy: Math.round((data.correct / data.total) * 100) }))
            .sort((a, b) => a.accuracy - b.accuracy)[0];
        const stats = getSessionStats();
        const message = weakest
            ? `Fokus berikutnya: ulangi kategori ${weakest.category} (${weakest.accuracy}%). Kosong: ${stats.unanswered}, bantuan dipakai: ${state.helpUsed}.`
            : `Jawab beberapa soal untuk membuka rekomendasi belajar adaptif. Kosong: ${stats.unanswered}, bantuan dipakai: ${state.helpUsed}.`;
        els.resultInsight.innerHTML = `<i class="fa-solid fa-bullseye mint result-insight-icon"></i> ${message}`;
    }

    function saveLmsResult(score) {
        const progress = core.sanitize.lmsProgress(readJson(localStore, "eduquestLmsProgress", {
            completedLectures: [],
            quizScores: {},
            unlockedBadges: [],
            userName: "Developer Indonesia"
        }));
        const lms = state.payload.lms;
        const scoreKey = `${lms.trackId}_${lms.moduleId}_${lms.quizType}`;
        progress.quizScores[scoreKey] = Math.max(score, Number(progress.quizScores[scoreKey] || 0));
        writeJson(localStore, "eduquestLmsProgress", progress);
    }

    function getLmsReturnUrl() {
        const lms = state.payload.lms;
        if (!lms) return "quiz.html";
        return `learning-path.html?lmsReturn=1&track=${encodeURIComponent(lms.trackId)}&module=${lms.moduleIndex}&step=${encodeURIComponent(lms.quizType)}`;
    }

    function configureResultActions(isLms) {
        if (!isLms) {
            els.reviewResultButton.innerHTML = '<i class="fa-solid fa-list-check"></i> Lihat Review';
            els.resultBackLink.href = "quiz.html";
            els.resultBackLink.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Kembali';
            return;
        }
        const returnUrl = getLmsReturnUrl();
        els.reviewResultButton.innerHTML = '<i class="fa-solid fa-list-check"></i> Lihat Review';
        els.resultBackLink.href = returnUrl;
        els.resultBackLink.innerHTML = '<i class="fa-solid fa-road"></i> Jalur Belajar';
    }

    function openNavigator() {
        els.focusSidebar.removeAttribute("inert");
        els.focusSidebar.setAttribute("aria-hidden", "false");
        els.focusSidebar.classList.add("open");
        if (els.sidebarBackdrop) {
            els.sidebarBackdrop.hidden = false;
            els.sidebarBackdrop.classList.add("open");
        }
        els.navigatorButton.setAttribute("aria-expanded", "true");
        document.body.classList.add("navigator-open");
        els.closeNavigator.focus({ preventScroll: true });
    }

    function closeNavigator() {
        const wasOpen = els.focusSidebar.classList.contains("open");
        els.focusSidebar.classList.remove("open");
        if (els.sidebarBackdrop) {
            els.sidebarBackdrop.classList.remove("open");
            els.sidebarBackdrop.hidden = true;
        }
        if (window.matchMedia("(max-width: 980px)").matches) {
            els.focusSidebar.setAttribute("inert", "");
            els.focusSidebar.setAttribute("aria-hidden", "true");
        }
        els.navigatorButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("navigator-open");
        if (wasOpen) els.navigatorButton.focus();
    }

    function syncNavigatorAccessibility() {
        if (window.matchMedia("(max-width: 980px)").matches) {
            if (!els.focusSidebar.classList.contains("open")) {
                els.focusSidebar.setAttribute("inert", "");
                els.focusSidebar.setAttribute("aria-hidden", "true");
                if (els.sidebarBackdrop) {
                    els.sidebarBackdrop.classList.remove("open");
                    els.sidebarBackdrop.hidden = true;
                }
            }
            return;
        }
        els.focusSidebar.classList.remove("open");
        if (els.sidebarBackdrop) {
            els.sidebarBackdrop.classList.remove("open");
            els.sidebarBackdrop.hidden = true;
        }
        els.focusSidebar.removeAttribute("inert");
        els.focusSidebar.setAttribute("aria-hidden", "false");
        els.navigatorButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("navigator-open");
    }

    async function confirmExit() {
        if (!state.running || await requestConfirmation({
            title: "Keluar dari Focus Room?",
            message: "Progres sesi saat ini akan tetap disimpan sementara agar dapat dilanjutkan.",
            acceptLabel: "Simpan & Keluar"
        })) {
            state.exiting = true;
            saveActiveState();
            window.location.href = state.payload.source === "lms" ? getLmsReturnUrl() : "quiz.html";
        }
    }

    function requestConfirmation({ title, message, acceptLabel }) {
        if (!els.confirmOverlay) return Promise.resolve(false);
        if (confirmResolver) confirmResolver(false);
        confirmTrigger = document.activeElement;
        els.confirmTitle.textContent = title;
        els.confirmMessage.textContent = message;
        els.confirmAcceptButton.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> ${acceptLabel}`;
        els.confirmOverlay.hidden = false;
        syncAppAccessibility();
        window.setTimeout(() => els.confirmCancelButton.focus(), 0);
        return new Promise((resolve) => {
            confirmResolver = resolve;
        });
    }

    function closeConfirmation(accepted) {
        if (!confirmResolver) return;
        const resolve = confirmResolver;
        confirmResolver = null;
        els.confirmOverlay.hidden = true;
        syncAppAccessibility();
        confirmTrigger?.focus?.();
        resolve(accepted);
    }

    function initTheme() {
        const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const saved = readText(localStore, "eduquest_theme", preferred);
        writeText(localStore, "eduquest_theme", saved);
        const light = saved === "light";
        document.body.classList.toggle("light-session", light);
        els.themeButton.innerHTML = light 
            ? '<i class="fa-solid fa-moon"></i> <span>Gelap</span>' 
            : '<i class="fa-solid fa-sun"></i> <span>Terang</span>';
        els.themeButton.setAttribute("aria-pressed", String(!light));
        els.themeButton.setAttribute("aria-label", light ? "Aktifkan tema gelap" : "Aktifkan tema terang");
    }

    function toggleTheme() {
        const light = document.body.classList.toggle("light-session");
        writeText(localStore, "eduquest_theme", light ? "light" : "dark");
        initTheme();
    }

    function bindEvents() {
        els.exitButton.addEventListener("click", confirmExit);
        document.getElementById("exitLink").addEventListener("click", (event) => {
            event.preventDefault();
            confirmExit();
        });
        els.themeButton.addEventListener("click", toggleTheme);
        els.confidenceControls?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-confidence]");
            if (button) setConfidence(button.dataset.confidence);
        });
        els.hintButton.addEventListener("click", showHint);
        els.fiftyButton.addEventListener("click", useFifty);
        els.bookmarkButton.addEventListener("click", bookmarkQuestion);
        els.flagButton.addEventListener("click", toggleFlag);
        els.skipButton.addEventListener("click", skipQuestion);
        els.nextButton.addEventListener("click", nextQuestion);
        els.navigatorButton.addEventListener("click", openNavigator);
        els.closeNavigator.addEventListener("click", closeNavigator);
        els.sidebarBackdrop?.addEventListener("click", closeNavigator);
        els.confirmCancelButton.addEventListener("click", () => closeConfirmation(false));
        els.confirmAcceptButton.addEventListener("click", () => closeConfirmation(true));
        els.confirmOverlay.addEventListener("click", (event) => {
            if (event.target === els.confirmOverlay) closeConfirmation(false);
        });
        els.closeReviewDrawer?.addEventListener("click", closeReviewDrawer);
        els.reviewDrawer?.addEventListener("click", (event) => {
            if (event.target === els.reviewDrawer) closeReviewDrawer();
        });
        els.retrySessionButton.addEventListener("click", () => {
            core.storage.remove(sessionStore, ACTIVE_KEY);
            window.location.reload();
        });
        els.reviewResultButton.addEventListener("click", openReviewDrawer);

        els.soundButton?.addEventListener("click", toggleSound);
        els.fullscreenButton?.addEventListener("click", toggleFullscreen);
        document.addEventListener("fullscreenchange", syncFullscreenState);
        document.addEventListener("webkitfullscreenchange", syncFullscreenState);
        document.addEventListener("mozfullscreenchange", syncFullscreenState);
        document.addEventListener("MSFullscreenChange", syncFullscreenState);
        els.pauseButton?.addEventListener("click", togglePause);
        els.resumeButton?.addEventListener("click", togglePause);
        els.scratchpadButton?.addEventListener("click", toggleScratchpad);
        els.clearScratchpad?.addEventListener("click", () => {
            if (els.scratchpadInput) els.scratchpadInput.value = "";
            state.notes[state.current] = "";
            saveActiveState();
            sfx("click");
            if (els.scratchpadButton) els.scratchpadButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Coretan <kbd>N</kbd>';
        });
        els.closeScratchpad?.addEventListener("click", () => {
            if (els.scratchpadDrawer) els.scratchpadDrawer.hidden = true;
            sfx("click");
        });
        els.scratchpadInput?.addEventListener("input", (event) => {
            state.notes[state.current] = event.target.value;
            saveActiveState();
            if (els.scratchpadButton) {
                const hasNote = Boolean(event.target.value.trim());
                els.scratchpadButton.innerHTML = hasNote
                    ? '<i class="fa-solid fa-pen-to-square mint"></i> Coretan <kbd>N</kbd>'
                    : '<i class="fa-solid fa-pen-to-square"></i> Coretan <kbd>N</kbd>';
            }
        });
        els.shortcutsButton?.addEventListener("click", openShortcutsModal);
        els.closeShortcutsModal?.addEventListener("click", closeShortcutsModal);
        els.shortcutsModal?.addEventListener("click", (event) => {
            if (event.target === els.shortcutsModal) closeShortcutsModal();
        });
        const reviewTabs = [els.filterAll, els.filterCorrect, els.filterWrong, els.filterFlagged].filter(Boolean);
        reviewTabs.forEach((tab, index) => {
            tab.addEventListener("click", () => setReviewFilter(tab.dataset.filter));
            tab.addEventListener("keydown", (event) => {
                let nextIndex = index;
                if (event.key === "ArrowRight") nextIndex = (index + 1) % reviewTabs.length;
                else if (event.key === "ArrowLeft") nextIndex = (index - 1 + reviewTabs.length) % reviewTabs.length;
                else if (event.key === "Home") nextIndex = 0;
                else if (event.key === "End") nextIndex = reviewTabs.length - 1;
                else return;
                event.preventDefault();
                const nextTab = reviewTabs[nextIndex];
                setReviewFilter(nextTab.dataset.filter);
                nextTab.focus();
            });
        });

        document.addEventListener("keydown", (event) => {
            if (!els.shortcutsModal?.hidden) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeShortcutsModal();
                } else if (event.key === "Tab") {
                    trapFocus(event, els.shortcutsModal);
                }
                return;
            }
            if (!els.confirmOverlay.hidden) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeConfirmation(false);
                } else if (event.key === "Tab") {
                    trapFocus(event, els.confirmOverlay);
                }
                return;
            }
            if (els.reviewDrawer && !els.reviewDrawer.hidden) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeReviewDrawer();
                } else if (event.key === "Tab") {
                    trapFocus(event, els.reviewDrawer);
                }
                return;
            }
            if (!els.resultOverlay.hidden) {
                if (event.key === "Tab") trapFocus(event, els.resultOverlay);
                return;
            }
            if (els.scratchpadDrawer && !els.scratchpadDrawer.hidden && event.key === "Escape") {
                event.preventDefault();
                els.scratchpadDrawer.hidden = true;
                els.scratchpadButton?.focus();
                return;
            }
            if (!els.pauseOverlay?.hidden) {
                if (event.key === "Tab") trapFocus(event, els.pauseOverlay);
                if (event.key.toLowerCase() === "p" || event.key === "Escape") {
                    event.preventDefault();
                    togglePause();
                }
                return;
            }
            if (event.key === "Escape") {
                if (els.focusSidebar.classList.contains("open")) {
                    event.preventDefault();
                    closeNavigator();
                    return;
                }
            }
            if (event.key === "Tab" && els.focusSidebar.classList.contains("open")) {
                trapFocus(event, els.focusSidebar);
                return;
            }
            if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
                if (event.key === "Escape") event.target.blur();
                return;
            }
            if (event.key === "F11" || (event.key.toLowerCase() === "l" && !event.altKey && !event.ctrlKey && !event.metaKey)) {
                event.preventDefault();
                toggleFullscreen();
                return;
            }
            if (event.key === "?" || (event.shiftKey && event.key === "/")) {
                event.preventDefault();
                openShortcutsModal();
                return;
            }
            if (event.key.toLowerCase() === "p") {
                event.preventDefault();
                togglePause();
                return;
            }
            if (!state.running || state.isPaused || event.altKey || event.ctrlKey || event.metaKey) return;
            if (/^[1-4]$/.test(event.key)) {
                const option = els.answerList.querySelector(`[data-index="${Number(event.key) - 1}"]:not(:disabled):not(.hidden-choice)`);
                option?.click();
            } else if (/^[a-dA-D]$/.test(event.key)) {
                const idx = event.key.toUpperCase().charCodeAt(0) - 65;
                const option = els.answerList.querySelector(`[data-index="${idx}"]:not(:disabled):not(.hidden-choice)`);
                option?.click();
            } else if (event.key === "ArrowRight") {
                nextQuestion();
            } else if (event.key.toLowerCase() === "h" && !els.hintButton.disabled) {
                showHint();
            } else if (event.key.toLowerCase() === "f") {
                toggleFlag();
            } else if (event.key.toLowerCase() === "s" && !els.bookmarkButton.disabled) {
                bookmarkQuestion();
            } else if (event.key.toLowerCase() === "n") {
                event.preventDefault();
                toggleScratchpad();
            }
        });

        window.addEventListener("beforeunload", saveActiveState);
        window.addEventListener("resize", syncNavigatorAccessibility, { passive: true });
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) tickTimer();
        });
    }

    function init() {
        cacheElements();
        if (!restoreSession()) {
            const focusRoom = document.getElementById("focusRoom");
        if (focusRoom) {
            focusRoom.innerHTML = `
                <section class="session-empty-state">
                    <img src="universe-of-tech-logo.jpg" alt="" aria-hidden="true">
                    <span class="result-kicker">Session expired</span>
                    <h1>Sesi quiz belum tersedia.</h1>
                    <p>Kamu akan diarahkan kembali ke katalog quiz untuk memulai sesi baru.</p>
                    <a class="action-button primary" href="quiz.html"><i class="fa-solid fa-arrow-left"></i> Kembali ke Quiz</a>
                </section>
            `;
        }
            window.setTimeout(() => window.location.replace("quiz.html"), 1800);
            return;
        }
        initTheme();
        if (els.soundButton) {
            els.soundButton.innerHTML = state.soundEnabled 
                ? '<i class="fa-solid fa-volume-high"></i> <span>Suara</span>' 
                : '<i class="fa-solid fa-volume-xmark"></i> <span>Bisukan</span>';
            els.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
            els.soundButton.title = state.soundEnabled ? "Audio Suara" : "Suara Bisu";
        }
        bindEvents();
        syncFullscreenState();
        syncNavigatorAccessibility();
        els.sessionCategory.textContent = state.payload.config.categoryLabel;
        els.sessionDifficulty.textContent = state.payload.config.difficultyLabel;
        els.sessionMode.textContent = state.payload.config.modeLabel;
        if (state.payload.source === "lms") {
            document.body.classList.add("lms-session");
            document.title = `${state.payload.lms.moduleTitle} - LMS Focus Room`;
            const fb = document.querySelector(".focus-brand span");
            if (fb) fb.textContent = "LMS Focus Room";
        }
        state.running = true;
        state.lastTickAt = Date.now();
        renderQuestion();
        tickTimer();
        state.timerId = window.setInterval(tickTimer, 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
