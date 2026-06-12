(() => {
    "use strict";

    const SESSION_KEY = "eduquestQuizSession";
    const ACTIVE_KEY = "eduquestQuizActiveState";
    const LAST_KEY = "eduquestLastSession";
    const BEST_KEY = "eduquestBestScore";
    const BOOKMARK_KEY = "eduquestBookmarks";

    const state = {
        payload: null,
        questions: [],
        current: 0,
        selected: [],
        visited: [],
        flagged: [],
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
        exiting: false
    };

    const els = {};
    let toastTimer = null;

    function readJson(storage, key, fallback) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(storage, key, value) {
        try {
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Gagal menyimpan ${key}:`, error);
            return false;
        }
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
            "sessionCategory", "sessionDifficulty", "sessionMode", "soundButton", "themeButton", "exitButton",
            "focusProgress", "progressBar", "questionCounter", "questionTopic", "questionText", "answerList",
            "answerFeedback", "focusSidebar", "timerCard", "timerValue", "correctStat", "wrongStat",
            "flaggedStat", "streakStat", "questionNavigator", "closeNavigator", "navigatorButton", "hintButton",
            "fiftyButton", "bookmarkButton", "flagButton", "skipButton", "nextButton", "resultOverlay",
            "resultScore", "resultTitle", "resultMessage", "resultCorrect", "resultWrong", "resultStreak",
            "resultXp", "reviewResultButton", "retrySessionButton", "resultBackLink", "focusToast"
        ].forEach((id) => {
            els[id.replace("focusToast", "toast")] = document.getElementById(id);
        });
    }

    function restoreSession() {
        const payload = readJson(sessionStorage, SESSION_KEY, null);
        if (!payload?.questions?.length) return false;
        state.payload = payload;
        state.questions = payload.questions;
        state.timeLeft = Number(payload.timeLimit) || payload.questions.length * 90;
        state.initialTime = state.timeLeft;
        state.selected = Array(state.questions.length).fill(null);
        state.visited = Array(state.questions.length).fill(false);
        state.flagged = Array(state.questions.length).fill(false);
        state.bookmarks = readJson(localStorage, BOOKMARK_KEY, []);

        const saved = readJson(sessionStorage, ACTIVE_KEY, null);
        if (saved && saved.createdAt === payload.createdAt && saved.running) {
            state.current = Math.min(saved.current || 0, state.questions.length - 1);
            state.selected = saved.selected || state.selected;
            state.visited = saved.visited || state.visited;
            state.flagged = saved.flagged || state.flagged;
            state.correct = saved.correct || 0;
            state.wrong = saved.wrong || 0;
            state.streak = saved.streak || 0;
            state.bestStreak = saved.bestStreak || 0;
            state.helpUsed = saved.helpUsed || 0;
            state.cheatWarnings = saved.cheatWarnings || 0;
            state.timeLeft = Math.max(0, saved.timeLeft ?? state.timeLeft);
            state.initialTime = saved.initialTime || state.initialTime;
        }
        return true;
    }

    function saveActiveState() {
        if (!state.payload) return;
        writeJson(sessionStorage, ACTIVE_KEY, {
            createdAt: state.payload.createdAt,
            running: state.running,
            current: state.current,
            selected: state.selected,
            visited: state.visited,
            flagged: state.flagged,
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

    function renderQuestion() {
        const question = state.questions[state.current];
        if (!question) return;
        state.visited[state.current] = true;
        state.usedHint = false;
        state.usedFifty = false;
        const saved = state.selected[state.current];

        els.questionCounter.textContent = `Soal ${state.current + 1}/${state.questions.length}`;
        els.questionTopic.textContent = state.payload.source === "lms"
            ? `${state.payload.lms.moduleTitle} · ${state.payload.config.difficultyLabel}`
            : `${state.payload.config.categoryLabel} · ${state.payload.config.difficultyLabel}`;
        els.questionText.textContent = question.question;
        els.answerList.innerHTML = "";
        els.answerFeedback.classList.remove("show");
        els.answerFeedback.innerHTML = "";

        question.shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-choice";
            button.dataset.index = String(index);
            button.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${answer.text}</span>`;
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
            els.answerFeedback.innerHTML = `<strong>${saved.isCorrect ? "Benar." : "Belum tepat."}</strong> ${saved.explanation}`;
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

        updateProgress();
        renderNavigator();
        renderStats();
        saveActiveState();
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
        els.questionNavigator.innerHTML = "";
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
        els.answerFeedback.innerHTML = `<strong>Hint:</strong> ${state.questions[state.current].hint}`;
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

    function toggleFlag() {
        state.flagged[state.current] = !state.flagged[state.current];
        renderQuestion();
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

    function finishQuizWithStatus(cheatFailed) {
        if (!state.running) return;
        window.clearInterval(state.timerId);
        state.running = false;
        const total = state.questions.length;
        const unanswered = total - state.selected.filter(Boolean).length;
        const missed = state.wrong + unanswered;
        const score = cheatFailed ? 0 : Math.round((state.correct / total) * 100);
        const isLms = state.payload.source === "lms";
        const passThreshold = state.payload.lms?.passThreshold || 80;
        const isPassed = score >= passThreshold;
        const xp = isLms
            ? score > 0 ? (score * 2) + (isPassed ? 50 : 0) : 0
            : state.correct * 20;

        const session = {
            date: new Date().toISOString(),
            score,
            correct: cheatFailed ? 0 : state.correct,
            wrong: cheatFailed ? total : missed,
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
            answers: state.selected.filter(Boolean)
        };

        if (isLms) {
            saveLmsResult(score);
        } else {
            writeJson(localStorage, LAST_KEY, session);
            localStorage.setItem(BEST_KEY, String(Math.max(score, Number(localStorage.getItem(BEST_KEY) || 0))));
        }

        try {
            if (!isLms) {
                const currentXp = Number(localStorage.getItem("eduquestXP") || 8960) + xp;
                const currentStreak = Number(localStorage.getItem("eduquestStreak") || 12) + (score >= 70 ? 1 : 0);
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

        sessionStorage.removeItem(ACTIVE_KEY);
        els.progressBar.style.width = "100%";
        els.focusProgress.setAttribute("aria-valuenow", "100");
        els.resultScore.textContent = `${score}%`;
        els.resultTitle.textContent = isLms
            ? cheatFailed
                ? "Ujian dihentikan karena batas peringatan tercapai."
                : isPassed ? "Selamat, langkah LMS ini berhasil diselesaikan." : "Belum mencapai batas kelulusan LMS."
            : score >= 75 ? "Kerja bagus, ritmemu sudah kuat." : "Sesi selesai, peta belajarmu makin jelas.";
        els.resultMessage.textContent = isLms
            ? cheatFailed
                ? "Mode Tantangan mendeteksi perpindahan tab sebanyak tiga kali. Skor sesi ditetapkan menjadi 0%."
                : isPassed
                    ? `Kamu meraih ${score}% dan melewati batas kelulusan ${passThreshold}%. Progres modul sudah diperbarui.`
                    : `Skor ${score}%. Kamu memerlukan minimal ${passThreshold}% untuk menandai langkah ini selesai.`
            : buildSummary(score);
        els.resultCorrect.textContent = cheatFailed ? 0 : state.correct;
        els.resultWrong.textContent = cheatFailed ? total : missed;
        els.resultStreak.textContent = state.bestStreak;
        els.resultXp.textContent = `+${xp}`;
        configureResultActions(isLms);
        els.resultOverlay.hidden = false;
    }

    function saveLmsResult(score) {
        const progress = readJson(localStorage, "eduquestLmsProgress", {
            completedLectures: [],
            quizScores: {},
            unlockedBadges: [],
            userName: "Developer Indonesia"
        });
        progress.completedLectures = progress.completedLectures || [];
        progress.quizScores = progress.quizScores || {};
        progress.unlockedBadges = progress.unlockedBadges || [];
        const lms = state.payload.lms;
        const scoreKey = `${lms.trackId}_${lms.moduleId}_${lms.quizType}`;
        progress.quizScores[scoreKey] = Math.max(score, Number(progress.quizScores[scoreKey] || 0));
        writeJson(localStorage, "eduquestLmsProgress", progress);
    }

    function getLmsReturnUrl() {
        const lms = state.payload.lms;
        if (!lms) return "quiz.html";
        return `quiz.html?lmsReturn=1&track=${encodeURIComponent(lms.trackId)}&module=${lms.moduleIndex}&step=${encodeURIComponent(lms.quizType)}`;
    }

    function configureResultActions(isLms) {
        if (!isLms) {
            els.reviewResultButton.textContent = "Lihat Review";
            els.resultBackLink.href = "quiz.html";
            els.resultBackLink.textContent = "Kembali";
            return;
        }
        const returnUrl = getLmsReturnUrl();
        els.reviewResultButton.textContent = "Kembali ke Modul";
        els.resultBackLink.href = returnUrl;
        els.resultBackLink.textContent = "Jalur Belajar";
    }

    function openNavigator() {
        els.focusSidebar.classList.add("open");
    }

    function closeNavigator() {
        els.focusSidebar.classList.remove("open");
    }

    function confirmExit() {
        if (!state.running || window.confirm("Keluar dari Focus Room? Progres sesi saat ini tetap disimpan sementara.")) {
            state.exiting = true;
            saveActiveState();
            window.location.href = state.payload.source === "lms" ? getLmsReturnUrl() : "quiz.html";
        }
    }

    function handleChallengeVisibility() {
        if (state.exiting || !state.running || state.payload.source !== "lms" || state.payload.lms?.quizType !== "challenge") return;
        if (document.visibilityState !== "hidden") return;
        state.cheatWarnings += 1;
        saveActiveState();
        playSound("alarm");
        if (state.cheatWarnings >= 3) {
            window.setTimeout(() => finishQuizWithStatus(true), 0);
            return;
        }
        window.setTimeout(() => {
            window.alert(`Peringatan ujian ${state.cheatWarnings}/3: perpindahan tab terdeteksi. Pada peringatan ketiga, ujian otomatis dihentikan.`);
        }, 0);
    }

    function initTheme() {
        const saved = localStorage.getItem("eduquest_theme") || "dark";
        const light = saved === "light";
        document.body.classList.toggle("light-session", light);
        els.themeButton.textContent = light ? "🌙" : "☀️";
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
        els.soundButton.textContent = soundEnabled ? "🔊" : "🔇";
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
        els.hintButton.addEventListener("click", showHint);
        els.fiftyButton.addEventListener("click", useFifty);
        els.bookmarkButton.addEventListener("click", bookmarkQuestion);
        els.flagButton.addEventListener("click", toggleFlag);
        els.skipButton.addEventListener("click", skipQuestion);
        els.nextButton.addEventListener("click", nextQuestion);
        els.navigatorButton.addEventListener("click", openNavigator);
        els.closeNavigator.addEventListener("click", closeNavigator);
        els.retrySessionButton.addEventListener("click", () => {
            sessionStorage.removeItem(ACTIVE_KEY);
            window.location.reload();
        });
        els.reviewResultButton.addEventListener("click", () => {
            if (state.payload.source === "lms") {
                window.location.href = getLmsReturnUrl();
            } else {
                sessionStorage.setItem("quizActiveTab", "quick-arena");
                window.location.href = "quiz.html?review=1#review";
            }
        });

        document.addEventListener("keydown", (event) => {
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
            window.location.replace("quiz.html");
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
