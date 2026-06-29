(() => {
    "use strict";

    const SESSION_KEY = "eduquestQuizSession";
    const ACTIVE_KEY = "eduquestQuizActiveState";
    const LAST_KEY = "eduquestLastSession";
    const BEST_KEY = "eduquestBestScore";
    const BOOKMARK_KEY = "eduquestBookmarks";
    const core = window.QuizNation;

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
        cheatWarnings: 0,
        timeLeft: 0,
        initialTime: 0,
        timerId: null,
        running: false,
        usedHint: false,
        usedFifty: false,
        bookmarks: [],
        exiting: false,
        reviewOpen: false,
        lastRenderedIndex: -1
    };

    const els = {};
    let toastTimer = null;
    let confirmResolver = null;
    let confirmTrigger = null;

    function readJson(storage, key, fallback) {
        return core?.storage.read(storage, key, fallback) ?? fallback;
    }

    function writeJson(storage, key, value) {
        return core?.storage.write(storage, key, value) ?? false;
    }

    function formatTime(seconds) {
        const safe = Math.max(0, Number(seconds) || 0);
        const minutes = Math.floor(safe / 60);
        const rest = String(safe % 60).padStart(2, "0");
        return `${minutes}:${rest}`;
    }

    function showToast(message) {
        window.clearTimeout(toastTimer);
        els.toast.textContent = message;
        els.toast.classList.add("show");
        toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
    }

    function cacheElements() {
        [
            "sessionCategory", "sessionDifficulty", "sessionMode", "soundButton", "themeButton", "toolsButton", "exitButton",
            "headerAnswered", "headerAccuracy", "sessionInsight", "insightAnswered", "insightUnanswered", "insightFlagged",
            "insightAccuracy", "insightBestStreak", "confidenceControls",
            "focusProgress", "progressBar", "questionCounter", "questionTopic", "questionText", "answerList",
            "answerFeedback", "focusSidebar", "timerCard", "timerValue", "correctStat", "wrongStat",
            "flaggedStat", "streakStat", "questionNavigator", "closeNavigator", "navigatorButton", "hintButton",
            "fiftyButton", "bookmarkButton", "flagButton", "skipButton", "nextButton", "resultOverlay",
            "resultScore", "resultTitle", "resultMessage", "resultCorrect", "resultWrong", "resultStreak",
            "resultXp", "resultInsight", "reviewResultButton", "retrySessionButton", "resultBackLink", "focusToast",
            "commandPalette", "closeCommandPalette", "reviewDrawer", "closeReviewDrawer", "reviewSummary", "reviewList",
            "confirmOverlay", "confirmTitle", "confirmMessage", "confirmCancelButton", "confirmAcceptButton", "questionStage"
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
        state.bookmarks = core.sanitize.bookmarks(readJson(localStorage, BOOKMARK_KEY, []));

        const saved = readJson(sessionStorage, ACTIVE_KEY, null);
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
            state.correct = state.selected.filter((answer) => answer?.isCorrect).length;
            state.wrong = state.selected.filter((answer) => answer && !answer.isCorrect).length;
            state.streak = Math.min(length, Math.max(0, Number(saved.streak) || 0));
            state.bestStreak = Math.min(length, Math.max(0, Number(saved.bestStreak) || 0));
            state.helpUsed = Math.min(length * 2, Math.max(0, Number(saved.helpUsed) || 0));
            state.cheatWarnings = Math.max(0, Number(saved.cheatWarnings) || 0);
            state.timeLeft = Math.min(state.initialTime, Math.max(0, Number(saved.timeLeft) || 0));
            state.initialTime = Math.max(30, Number(saved.initialTime) || state.initialTime);
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
        if (!state.payload) return;
        writeJson(sessionStorage, ACTIVE_KEY, {
            sessionId: state.payload.sessionId,
            createdAt: state.payload.createdAt,
            running: state.running,
            current: state.current,
            selected: state.selected,
            visited: state.visited,
            flagged: state.flagged,
            confidence: state.confidence,
            correct: state.correct,
            wrong: state.wrong,
            streak: state.streak,
            bestStreak: state.bestStreak,
            helpUsed: state.helpUsed,
            cheatWarnings: state.cheatWarnings,
            timeLeft: state.timeLeft,
            initialTime: state.initialTime
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
        state.usedHint = false;
        state.usedFifty = false;
        const saved = state.selected[state.current];

        els.questionCounter.textContent = `Soal ${state.current + 1}/${state.questions.length}`;
        els.questionTopic.textContent = state.payload.source === "lms"
            ? `${state.payload.lms.moduleTitle} • ${state.payload.config.difficultyLabel}`
            : `${state.payload.config.categoryLabel} • ${state.payload.config.difficultyLabel}`;
        els.questionText.textContent = question.question;
        els.answerList.replaceChildren();
        els.answerFeedback.classList.remove("show");
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
            if (saved) {
                button.disabled = true;
                if (index === question.shuffledCorrect) button.classList.add("is-correct");
                if (answer.text === saved.selectedText && !saved.isCorrect) button.classList.add("is-wrong");
            }
            els.answerList.appendChild(button);
        });

        if (saved) {
            core.dom.setContent(els.answerFeedback, saved.isCorrect ? "Benar." : "Belum tepat.", saved.explanation);
            els.answerFeedback.classList.add("show");
        }

        const practice = state.payload.config.mode === "practice";
        els.hintButton.disabled = !practice || Boolean(saved);
        els.fiftyButton.disabled = !practice || Boolean(saved);
        els.bookmarkButton.disabled = isBookmarked(question);
        els.bookmarkButton.textContent = isBookmarked(question) ? "Tersimpan" : "Simpan";
        els.flagButton.textContent = state.flagged[state.current] ? "Batal Ragu" : "Ragu";
        els.skipButton.disabled = !hasUnanswered();
        els.nextButton.textContent = !hasUnanswered() ? "Selesaikan" : state.current === state.questions.length - 1 ? "Cari Soal Kosong" : "Berikutnya";

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

        // Trigger animation if transitioning to a different question index
        if (state.lastRenderedIndex !== -1 && state.lastRenderedIndex !== state.current && els.questionStage && !isQuestionTransitioning) {
            isQuestionTransitioning = true;
            els.questionStage.classList.add("question-fade-out");
            setTimeout(() => {
                updateQuestionDOM(question);
                state.lastRenderedIndex = state.current;
                els.questionStage.classList.remove("question-fade-out");
                els.questionStage.classList.add("question-fade-in");
                // force reflow
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

        if (window.QuizNationPro) {
            const answeredCount = state.selected.filter(Boolean).length || 1;
            window.QuizNationPro.recordAttempt({
                questionId: question.id,
                question: question.question,
                topic: question.category,
                difficulty: question.difficulty,
                source: state.payload?.source || "quiz-session",
                sessionId: state.payload?.sessionId,
                selected: selectedAnswer.text,
                correctAnswer: correctAnswer.text,
                isCorrect,
                durationMs: Math.round(((state.initialTime - state.timeLeft) * 1000) / answeredCount),
                hintUsed: Boolean(state.helpUsed),
                explanation: question.explanation,
                answers: question.shuffledAnswers.map(answer => answer.text)
            });
        }

        if (isCorrect) {
            state.correct += 1;
            state.streak += 1;
            state.bestStreak = Math.max(state.bestStreak, state.streak);
            playSound("success");
        } else {
            state.wrong += 1;
            state.streak = 0;
            playSound("laser");
        }
        renderQuestion();
    }

    function updateProgress() {
        const answered = state.selected.filter(Boolean).length;
        const percent = Math.round((answered / state.questions.length) * 100);
        els.progressBar.style.width = `${percent}%`;
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
            button.setAttribute("aria-label", `Buka soal ${index + 1}`);
            if (index === state.current) button.classList.add("current");
            if (state.selected[index]) {
                button.classList.add("answered");
                if (!state.selected[index].isCorrect) button.classList.add("wrong");
            }
            if (state.flagged[index]) button.classList.add("flagged");
            if (state.confidence[index] === "sure") button.classList.add("sure");
            if (state.confidence[index] === "review") button.classList.add("review-confidence");
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
        state.usedHint = true;
        state.helpUsed += 1;
        els.hintButton.disabled = true;
        core.dom.setContent(els.answerFeedback, "Hint:", state.questions[state.current].hint);
        els.answerFeedback.classList.add("show");
        saveActiveState();
    }

    function useFifty() {
        if (els.fiftyButton.disabled) return;
        const question = state.questions[state.current];
        const wrongIndexes = question.shuffledAnswers
            .map((answer, index) => index)
            .filter((index) => index !== question.shuffledCorrect)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        wrongIndexes.forEach((index) => {
            els.answerList.querySelector(`[data-index="${index}"]`)?.classList.add("hidden-choice");
        });
        state.usedFifty = true;
        state.helpUsed += 1;
        els.fiftyButton.disabled = true;
        saveActiveState();
    }

    function bookmarkQuestion() {
        const question = state.questions[state.current];
        if (isBookmarked(question)) return;
        state.bookmarks.unshift({
            id: question.id,
            question: question.question,
            category: question.category,
            difficulty: question.difficulty,
            hint: question.hint,
            explanation: question.explanation
        });
        state.bookmarks = state.bookmarks.slice(0, 20);
        writeJson(localStorage, BOOKMARK_KEY, state.bookmarks);
        els.bookmarkButton.disabled = true;
        els.bookmarkButton.textContent = "Tersimpan";
        showToast("Soal disimpan.");
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

    function openCommandPalette() {
        if (!els.commandPalette) return;
        els.commandPalette.hidden = false;
        els.toolsButton?.setAttribute("aria-expanded", "true");
        document.body.classList.add("dialog-open");
    }

    function closeCommandPalette() {
        if (!els.commandPalette || els.commandPalette.hidden) return;
        els.commandPalette.hidden = true;
        els.toolsButton?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("dialog-open");
        els.toolsButton?.focus?.();
    }

    function runCommand(command) {
        closeCommandPalette();
        if (command === "empty") {
            const next = findNextUnanswered();
            if (next === -1) {
                showToast("Semua soal sudah dijawab.");
                return;
            }
            state.current = next;
            renderQuestion();
        } else if (command === "hint") {
            showHint();
        } else if (command === "flag") {
            toggleFlag();
        } else if (command === "bookmark") {
            bookmarkQuestion();
        } else if (command === "theme") {
            toggleTheme();
        } else if (command === "sound") {
            toggleSound();
        }
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
        state.questions.forEach((question, index) => {
            const answer = state.selected[index];
            const item = document.createElement("button");
            item.type = "button";
            item.className = "review-answer-item";
            item.classList.add(answer ? answer.isCorrect ? "correct" : "wrong" : "empty");
            item.innerHTML = `
                <span class="review-answer-number">${index + 1}</span>
                <span class="review-answer-copy">
                    <strong>${answer ? answer.isCorrect ? "Benar" : "Belum tepat" : "Kosong"}</strong>
                    <small>${question.question}</small>
                </span>
                <span class="review-answer-meta">${state.confidence[index] === "sure" ? "Yakin" : state.flagged[index] ? "Ragu" : question.difficulty}</span>
            `;
            item.addEventListener("click", () => {
                state.current = index;
                renderQuestion();
                closeReviewDrawer();
            });
            els.reviewList.appendChild(item);
        });
    }

    function openReviewDrawer() {
        if (!els.reviewDrawer) return;
        renderReviewDrawer();
        els.reviewDrawer.hidden = false;
        state.reviewOpen = true;
        document.body.classList.add("dialog-open");
    }

    function closeReviewDrawer() {
        if (!els.reviewDrawer || els.reviewDrawer.hidden) return;
        els.reviewDrawer.hidden = true;
        state.reviewOpen = false;
        document.body.classList.remove("dialog-open");
    }

    function skipQuestion() {
        const next = findNextUnanswered();
        if (next === -1) {
            finishQuiz();
            return;
        }
        state.current = next;
        renderQuestion();
    }

    function nextQuestion() {
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
        els.timerValue.textContent = formatTime(state.timeLeft);
        els.timerCard.classList.toggle("warning", state.timeLeft <= 30);
        if (!state.running) return;
        if (state.timeLeft <= 0) {
            finishQuiz();
            return;
        }
        state.timeLeft -= 1;
        if (state.timeLeft % 5 === 0) saveActiveState();
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
        const xp = isLms
            ? score > 0 ? (score * 2) + (isPassed ? 50 : 0) : 0
            : state.correct * 20;

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
            focusWarnings: state.cheatWarnings,
            answers: state.selected.filter(Boolean)
        };

        const firstCompletion = core.rewards.markAwarded(state.payload.sessionId);
        if (isLms) {
            saveLmsResult(score);
        }
        if (firstCompletion) {
            if (!isLms) {
                writeJson(localStorage, LAST_KEY, session);
                const best = Math.max(score, Number(localStorage.getItem(BEST_KEY) || 0));
                localStorage.setItem(BEST_KEY, String(Math.min(100, Math.max(0, best))));
            }

            try {
                if (!isLms) {
                    const currentXp = Math.max(0, Number(localStorage.getItem("eduquestXP") || 8960)) + xp;
                    const currentStreak = Math.max(0, Number(localStorage.getItem("eduquestStreak") || 12)) + (score >= 70 ? 1 : 0);
                    localStorage.setItem("eduquestXP", String(currentXp));
                    localStorage.setItem("eduquestStreak", String(currentStreak));
                    localStorage.setItem("eduquestLevel", String(Math.floor(currentXp / 700) + 1));
                    localStorage.setItem("lastSyncedSessionDate", session.date);
                }
                if (xp > 0 && typeof loadRPG === "function" && typeof addXp === "function") {
                    loadRPG();
                    addXp(xp);
                }
            } catch (error) {
                console.warn("Sinkronisasi XP gagal:", error);
            }
        }

        core.storage.remove(sessionStorage, ACTIVE_KEY);
        els.progressBar.style.width = "100%";
        els.focusProgress.setAttribute("aria-valuenow", "100");
        els.resultScore.textContent = `${score}%`;
        els.resultTitle.textContent = isLms
            ? isPassed ? "Selamat, langkah LMS ini berhasil diselesaikan." : "Belum mencapai batas kelulusan LMS."
            : score >= 75 ? "Kerja bagus, ritmemu sudah kuat." : "Sesi selesai, peta belajarmu makin jelas.";
        els.resultMessage.textContent = isLms
            ? isPassed
                ? `Kamu meraih ${score}% dan melewati batas kelulusan ${passThreshold}%. Progres modul sudah diperbarui.`
                : `Skor ${score}%. Kamu memerlukan minimal ${passThreshold}% untuk menandai langkah ini selesai.`
            : buildSummary(score);
        renderResultInsight();
        els.resultCorrect.textContent = state.correct;
        els.resultWrong.textContent = missed;
        els.resultStreak.textContent = state.bestStreak;
        els.resultXp.textContent = firstCompletion ? `+${xp}` : "Tersimpan";
        configureResultActions(isLms);
        renderReviewDrawer();
        els.resultOverlay.hidden = false;
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
            ? `Fokus berikutnya: ulangi kategori ${weakest.category} (${weakest.accuracy}%). Kosong: ${stats.unanswered}, bantuan dipakai: ${state.helpUsed}, focus warning: ${state.cheatWarnings}.`
            : `Jawab beberapa soal untuk membuka rekomendasi belajar adaptif. Kosong: ${stats.unanswered}, bantuan dipakai: ${state.helpUsed}.`;
        els.resultInsight.textContent = message;
    }

    function saveLmsResult(score) {
        const progress = core.sanitize.lmsProgress(readJson(localStorage, "eduquestLmsProgress", {
            completedLectures: [],
            quizScores: {},
            unlockedBadges: [],
            userName: "Developer Indonesia"
        }));
        const lms = state.payload.lms;
        const scoreKey = `${lms.trackId}_${lms.moduleId}_${lms.quizType}`;
        progress.quizScores[scoreKey] = Math.max(score, Number(progress.quizScores[scoreKey] || 0));
        writeJson(localStorage, "eduquestLmsProgress", progress);
    }

    function getLmsReturnUrl() {
        const lms = state.payload.lms;
        if (!lms) return "quiz.html";
        return `learning-path.html?lmsReturn=1&track=${encodeURIComponent(lms.trackId)}&module=${lms.moduleIndex}&step=${encodeURIComponent(lms.quizType)}`;
    }

    function configureResultActions(isLms) {
        if (!isLms) {
            els.reviewResultButton.textContent = "Review Jawaban";
            els.resultBackLink.href = "quiz.html";
            els.resultBackLink.textContent = "Kembali";
            return;
        }
        const returnUrl = getLmsReturnUrl();
        els.reviewResultButton.textContent = "Review Jawaban";
        els.resultBackLink.href = returnUrl;
        els.resultBackLink.textContent = "Jalur Belajar";
    }

    function openNavigator() {
        els.focusSidebar.classList.add("open");
    }

    function closeNavigator() {
        els.focusSidebar.classList.remove("open");
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

    function handleChallengeVisibility() {
        if (state.exiting || !state.running || state.payload.source !== "lms" || state.payload.config?.mode !== "challenge") return;
        if (document.visibilityState !== "hidden") return;
        state.cheatWarnings += 1;
        saveActiveState();
        playSound("alarm");
        window.setTimeout(() => {
            showToast(`Pengingat fokus ${state.cheatWarnings}: sesi tetap berjalan dan perpindahan tab dicatat.`);
        }, 0);
    }

    function requestConfirmation({ title, message, acceptLabel }) {
        if (!els.confirmOverlay) return Promise.resolve(false);
        if (confirmResolver) confirmResolver(false);
        confirmTrigger = document.activeElement;
        els.confirmTitle.textContent = title;
        els.confirmMessage.textContent = message;
        els.confirmAcceptButton.textContent = acceptLabel;
        els.confirmOverlay.hidden = false;
        document.body.classList.add("dialog-open");
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
        document.body.classList.remove("dialog-open");
        confirmTrigger?.focus?.();
        resolve(accepted);
    }

    function initTheme() {
        const saved = localStorage.getItem("eduquest_theme") || "dark";
        const light = saved === "light";
        document.body.classList.toggle("light-session", light);
        els.themeButton.textContent = light ? "Gelap" : "Terang";
        els.themeButton.setAttribute("aria-pressed", String(!light));
        els.themeButton.setAttribute("aria-label", light ? "Aktifkan tema gelap" : "Aktifkan tema terang");
    }

    function toggleTheme() {
        const light = document.body.classList.toggle("light-session");
        localStorage.setItem("eduquest_theme", light ? "light" : "dark");
        initTheme();
    }

    function initSound() {
        soundEnabled = localStorage.getItem("eduquest_sound") !== "off";
        els.soundButton.textContent = soundEnabled ? "Suara On" : "Suara Off";
        els.soundButton.setAttribute("aria-pressed", String(soundEnabled));
        els.soundButton.setAttribute("aria-label", soundEnabled ? "Nonaktifkan suara" : "Aktifkan suara");
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        localStorage.setItem("eduquest_sound", soundEnabled ? "on" : "off");
        initSound();
        if (soundEnabled) playSound("click");
    }

    function bindEvents() {
        els.exitButton.addEventListener("click", confirmExit);
        document.getElementById("exitLink").addEventListener("click", (event) => {
            event.preventDefault();
            confirmExit();
        });
        els.soundButton.addEventListener("click", toggleSound);
        els.themeButton.addEventListener("click", toggleTheme);
        els.toolsButton?.addEventListener("click", openCommandPalette);
        els.closeCommandPalette?.addEventListener("click", closeCommandPalette);
        els.commandPalette?.addEventListener("click", (event) => {
            if (event.target === els.commandPalette) closeCommandPalette();
            const commandButton = event.target.closest("[data-command]");
            if (commandButton) runCommand(commandButton.dataset.command);
        });
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
            core.storage.remove(sessionStorage, ACTIVE_KEY);
            window.location.reload();
        });
        els.reviewResultButton.addEventListener("click", openReviewDrawer);

        document.addEventListener("keydown", (event) => {
            if (!els.confirmOverlay.hidden) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeConfirmation(false);
                } else if (event.key === "Tab") {
                    const focusables = [els.confirmCancelButton, els.confirmAcceptButton];
                    const current = focusables.indexOf(document.activeElement);
                    const next = event.shiftKey
                        ? (current - 1 + focusables.length) % focusables.length
                        : (current + 1) % focusables.length;
                    event.preventDefault();
                    focusables[next].focus();
                }
                return;
            }
            if (event.key === "Escape") {
                if (els.commandPalette && !els.commandPalette.hidden) {
                    event.preventDefault();
                    closeCommandPalette();
                    return;
                }
                if (els.reviewDrawer && !els.reviewDrawer.hidden) {
                    event.preventDefault();
                    closeReviewDrawer();
                    return;
                }
            }
            if (event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                openCommandPalette();
                return;
            }
            if (!state.running || event.altKey || event.ctrlKey || event.metaKey) return;
            if (/^[1-4]$/.test(event.key)) {
                const option = els.answerList.querySelector(`[data-index="${Number(event.key) - 1}"]:not(:disabled):not(.hidden-choice)`);
                option?.click();
            } else if (event.key === "ArrowRight") {
                nextQuestion();
            } else if (event.key.toLowerCase() === "h" && !els.hintButton.disabled) {
                showHint();
            } else if (event.key.toLowerCase() === "f") {
                toggleFlag();
            }
        });

        window.addEventListener("beforeunload", saveActiveState);
        document.addEventListener("visibilitychange", handleChallengeVisibility);
    }

    function init() {
        cacheElements();
        if (!restoreSession()) {
            document.getElementById("focusRoom").innerHTML = `
                <section class="session-empty-state">
                    <img src="logo.png" alt="" aria-hidden="true">
                    <span class="result-kicker">Session expired</span>
                    <h1>Sesi quiz belum tersedia.</h1>
                    <p>Kamu akan diarahkan kembali ke katalog quiz untuk memulai sesi baru.</p>
                    <a class="action-button primary" href="quiz.html">Kembali ke Quiz</a>
                </section>
            `;
            window.setTimeout(() => window.location.replace("quiz.html"), 1800);
            return;
        }
        initTheme();
        initSound();
        bindEvents();
        els.sessionCategory.textContent = state.payload.config.categoryLabel;
        els.sessionDifficulty.textContent = state.payload.config.difficultyLabel;
        els.sessionMode.textContent = state.payload.config.modeLabel;
        if (state.payload.source === "lms") {
            document.body.classList.add("lms-session");
            document.title = `${state.payload.lms.moduleTitle} - LMS Focus Room`;
            document.querySelector(".focus-brand span").textContent = "LMS Focus Room";
        }
        state.running = true;
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
