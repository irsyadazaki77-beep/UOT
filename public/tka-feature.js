import { storage, showToast } from "./shared-utilities.js";

export function initTKALMSPage() {
    const isQuizPage = document.body.dataset.page === "tka-quiz";
    const subjectList = document.getElementById("tkaLmsSubjects") || document.createElement("div");
    const difficultyFilters = document.querySelectorAll("[data-tka-difficulty]");
    const typeFilters = document.querySelectorAll("[data-tka-type]");
    const searchInput = document.getElementById("tkaQuestionSearch") || document.createElement("input");
    const questionList = document.getElementById("tkaQuestionList") || document.createElement("div");
    const questionMeta = document.getElementById("tkaLmsQuestionMeta") || document.createElement("div");
    const questionTitle = document.getElementById("tkaLmsQuestionTitle") || document.createElement("div");
    const questionStimulus = document.getElementById("tkaLmsStimulus") || document.createElement("div");
    const answerGrid = document.getElementById("tkaLmsAnswers") || document.createElement("div");
    const explanation = document.getElementById("tkaLmsExplanation") || document.createElement("div");
    const submitButton = document.getElementById("tkaSubmitAnswer") || document.createElement("button");
    const nextButton = document.getElementById("tkaNextQuestion") || document.createElement("button");
    const reviewButton = document.getElementById("tkaMarkReview") || document.createElement("button");
    const resetButton = document.getElementById("tkaResetFilters") || document.createElement("button");
    const progressBar = document.getElementById("tkaLmsProgressBar") || document.createElement("div");
    const doneText = document.getElementById("tkaLmsDone");
    const accuracyText = document.getElementById("tkaLmsAccuracy");
    const streakText = document.getElementById("tkaLmsStreak");
    const weakText = document.getElementById("tkaLmsWeak");
    const sourceText = document.getElementById("tkaLmsSource");
    const modeFilters = document.querySelectorAll("[data-tka-mode]");
    const sessionSizeSelect = document.getElementById("tkaSessionSize") || document.createElement("select");
    const timerDisplay = document.getElementById("tkaTimerDisplay");
    const timerToggle = document.getElementById("tkaTimerToggle") || document.createElement("button");
    const timerReset = document.getElementById("tkaTimerReset") || document.createElement("button");
    const reviewCountText = document.getElementById("tkaLmsReviewCount");
    const masteryText = document.getElementById("tkaLmsMastery");
    const sessionTargetText = document.getElementById("tkaLmsSessionTarget");
    const questionCounter = document.getElementById("tkaQuestionCounter");
    const questionStatus = document.getElementById("tkaQuestionStatus");
    const prevButton = document.getElementById("tkaPrevQuestion") || document.createElement("button");
    const hintButton = document.getElementById("tkaShowHint") || document.createElement("button");
    const noteInput = document.getElementById("tkaQuestionNote") || document.createElement("textarea");
    const saveNoteButton = document.getElementById("tkaSaveNote") || document.createElement("button");
    const analyticsGrid = document.getElementById("tkaAnalyticsGrid") || document.createElement("div");
    const resetProgressButton = document.getElementById("tkaResetProgress") || document.createElement("button");
    const launchButtons = [document.getElementById("tkaLaunchQuiz")].filter(Boolean);
    const launchSummary = document.getElementById("tkaLaunchSummary");
    const advancedToggle = document.getElementById("tkaAdvancedToggle");
    const advancedPanel = document.getElementById("tkaAdvancedPanel");
    const clearAnswerButton = document.getElementById("tkaClearAnswer") || document.createElement("button");
    const timerDuration = document.getElementById("tkaTimerDuration");
    const sessionAnswered = document.getElementById("tkaSessionAnswered");
    const sessionAccuracy = document.getElementById("tkaSessionAccuracy");
    const sessionReview = document.getElementById("tkaSessionReview");
    const resultDialog = document.getElementById("tkaResultDialog");
    const resultContent = document.getElementById("tkaResultContent");

    const subjects = [
        ["indonesia", "Bahasa Indonesia", "Wajib", "BI"],
        ["matematika", "Matematika", "Wajib", "MT"],
        ["inggris", "Bahasa Inggris", "Wajib", "EN"],
        ["fisika", "Fisika", "Pilihan IPA", "FI"],
        ["kimia", "Kimia", "Pilihan IPA", "KI"],
        ["biologi", "Biologi", "Pilihan IPA", "BO"],
        ["ekonomi", "Ekonomi", "Pilihan IPS", "EK"],
        ["sosiologi", "Sosiologi", "Pilihan IPS", "SO"],
        ["geografi", "Geografi", "Pilihan IPS", "GE"]
    ].map(([id, name, group, mark]) => ({ id, name, group, mark }));

    const labels = {
        dasar: "Dasar",
        sedang: "Sedang",
        hots: "HOTS",
        prediksi: "Prediksi",
        single: "Pilihan ganda",
        multi: "Pilihan kompleks",
        truefalse: "Benar/Salah"
    };

    function calculateIRTScore(answers) {
        const items = [];
        for (const qId in answers) {
            const ans = answers[qId];
            if (ans && ans.submitted) {
                const question = questionBank.find(q => q.id === qId);
                if (question) {
                    let b = 0.0;
                    let a = 1.0;
                    if (question.difficulty === "dasar") {
                        b = -1.2;
                        a = 0.8;
                    } else if (question.difficulty === "sedang") {
                        b = 0.0;
                        a = 1.1;
                    } else if (question.difficulty === "hots") {
                        b = 1.3;
                        a = 1.6;
                    } else if (question.difficulty === "prediksi") {
                        b = 0.8;
                        a = 1.3;
                    }
                    items.push({
                        correct: ans.correct ? 1 : 0,
                        a: a,
                        b: b
                    });
                }
            }
        }

        if (items.length === 0) return 300;

        let maxLogPost = -Infinity;
        let bestTheta = 0.0;

        for (let theta = -3.0; theta <= 3.0; theta += 0.02) {
            let logPost = -0.5 * theta * theta;
            for (const item of items) {
                const p = 1.0 / (1.0 + Math.exp(-item.a * (theta - item.b)));
                const epsilon = 1e-9;
                if (item.correct === 1) {
                    logPost += Math.log(p + epsilon);
                } else {
                    logPost += Math.log(1.0 - p + epsilon);
                }
            }
            if (logPost > maxLogPost) {
                maxLogPost = logPost;
                bestTheta = theta;
            }
        }

        let score = Math.round(500 + 130 * bestTheta);
        return Math.max(300, Math.min(900, score));
    }

    const questionBank = window.TKA_LMS_QUESTIONS || [];
    questionBank.push(...(window.TKA_SUPPLEMENTAL_QUESTIONS || []));

    // Apply detailed expanded explanations if available
    questionBank.forEach(q => {
        if (window.TKA_EXPANDED_EXPLANATIONS && window.TKA_EXPANDED_EXPLANATIONS[q.id]) {
            q.explanation = window.TKA_EXPANDED_EXPLANATIONS[q.id];
        }
    });

    const progress = storage.get("tka_lms_progress", { answers: {}, streak: 0, elapsedSeconds: 0, timerRunning: false });
    progress.answers = progress.answers || {};
    progress.elapsedSeconds = Number(progress.elapsedSeconds || 0);
    progress.timerRunning = Boolean(progress.timerRunning);
    progress.quizDuration = Number(progress.quizDuration || 1800);
    progress.quizRemaining = Number.isFinite(Number(progress.quizRemaining)) ? Number(progress.quizRemaining) : progress.quizDuration;
    if (isQuizPage && progress.quizRemaining > 0) progress.timerRunning = true;
    const preferences = storage.get("tka_lms_preferences", {
        subject: "indonesia",
        difficulty: "all",
        type: "all",
        mode: "all",
        sessionSize: "10",
        query: ""
    });
    let activeSubject = subjects.some(subject => subject.id === preferences.subject) ? preferences.subject : "indonesia";
    let activeDifficulty = preferences.difficulty || "all";
    let activeType = preferences.type || "all";
    let activeMode = preferences.mode || "all";
    let sessionSize = preferences.sessionSize || "10";
    let selectedQuestionId = "";
    let selectedAnswers = [];
    let lastRenderedQuestionId = "";
    let timerId = null;
    let subjectMenuOpen = false;
    let focusedSubjectIndex = 0;

    if (!isQuizPage) {
        window.addEventListener("scroll", () => {
            if (!subjectMenuOpen) return;
            subjectMenuOpen = false;
            renderSubjects();
        }, { passive: true });
    }

    function getSubject(id) {
        return subjects.find(subject => subject.id === id) || subjects[0];
    }

    function questionMatchesMode(question) {
        const saved = progress.answers[question.id];
        return activeMode === "all"
            || (activeMode === "unanswered" && !saved?.submitted)
            || (activeMode === "wrong" && saved?.submitted && !saved.correct)
            || (activeMode === "review" && saved?.review);
    }

    function getStrictFilteredQuestions() {
        const query = searchInput.value.trim().toLowerCase();
        return questionBank.filter(question => {
            const matchSubject = question.subject === activeSubject;
            const matchDifficulty = activeDifficulty === "all" || question.difficulty === activeDifficulty;
            const matchType = activeType === "all" || question.type === activeType;
            const searchable = `${question.prompt} ${question.stimulus} ${question.skill} ${question.sourceKind}`.toLowerCase();
            return matchSubject && matchDifficulty && matchType && questionMatchesMode(question) && searchable.includes(query);
        });
    }

    function getFilteredQuestions() {
        const strictMatches = getStrictFilteredQuestions();
        if (sessionSize === "all") return strictMatches;

        const targetSize = Number(sessionSize || 10);
        if (strictMatches.length === 0 || strictMatches.length >= targetSize || searchInput.value.trim()) {
            return strictMatches.slice(0, targetSize);
        }

        // Keep advanced filters as the priority, then fill the requested session
        // from the same subject and learning mode so a 20-question target stays 20.
        const selectedIds = new Set(strictMatches.map(question => question.id));
        const fillers = questionBank.filter(question =>
            question.subject === activeSubject
            && questionMatchesMode(question)
            && !selectedIds.has(question.id)
        );
        return [...strictMatches, ...fillers].slice(0, targetSize);
    }

    function isCorrect(question, chosen) {
        if (Array.isArray(question.correct)) {
            return question.correct.length === chosen.length && question.correct.every(index => chosen.includes(index));
        }
        return chosen.length === 1 && chosen[0] === question.correct;
    }

    function getAnswerStats() {
        const answers = Object.values(progress.answers);
        const done = answers.filter(answer => answer.submitted).length;
        const correct = answers.filter(answer => answer.submitted && answer.correct).length;
        const review = answers.filter(answer => answer.review).length;
        return { done, correct, review, accuracy: Math.round((correct / Math.max(done, 1)) * 100) };
    }

    function getSubjectAccuracy(subjectId) {
        const answers = questionBank
            .filter(question => question.subject === subjectId)
            .map(question => progress.answers[question.id])
            .filter(answer => answer && answer.submitted);
        const correct = answers.filter(answer => answer.correct).length;
        return {
            done: answers.length,
            accuracy: Math.round((correct / Math.max(answers.length, 1)) * 100)
        };
    }

    function updatePreferences() {
        const targetInputLMS = document.getElementById("tkaTargetScoreLMS");
        storage.set("tka_lms_preferences", {
            subject: activeSubject,
            difficulty: activeDifficulty,
            type: activeType,
            mode: activeMode,
            sessionSize,
            query: searchInput.value,
            targetScore: targetInputLMS ? parseInt(targetInputLMS.value) : (preferences.targetScore || 700)
        });
    }

    function saveProgress() {
        storage.set("tka_lms_progress", progress);
    }

    function renderSubjects() {
        if (isQuizPage || !subjectList.isConnected) return;
        const active = getSubject(activeSubject);
        const activeTotal = questionBank.filter(question => question.subject === active.id).length;
        const activeStats = getSubjectAccuracy(active.id);
        subjectList.innerHTML = `
            <button class="lms-subject-trigger" id="tkaSubjectTrigger" type="button" role="combobox"
                aria-haspopup="listbox" aria-expanded="${subjectMenuOpen}" aria-controls="tkaSubjectOptions">
                <span class="lms-subject-mark">${active.mark}</span>
                <span class="lms-subject-copy">
                    <strong>${active.name}</strong>
                    <small>${active.group} - ${activeStats.done}/${activeTotal} selesai - ${activeStats.accuracy}%</small>
                </span>
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div class="lms-subject-menu" id="tkaSubjectMenu" ${subjectMenuOpen ? "" : "hidden"}>
                <input class="lms-subject-search" id="tkaSubjectSearch" type="search"
                    placeholder="Cari mapel..." aria-label="Cari mapel" autocomplete="off">
                <div class="lms-subject-options" id="tkaSubjectOptions" role="listbox" aria-label="Daftar mapel"></div>
            </div>
        `;

        const trigger = document.getElementById("tkaSubjectTrigger");
        const menu = document.getElementById("tkaSubjectMenu");
        const subjectSearch = document.getElementById("tkaSubjectSearch");
        const options = document.getElementById("tkaSubjectOptions");

        function getVisibleSubjects() {
            const query = subjectSearch.value.trim().toLowerCase();
            return subjects.filter(subject => `${subject.name} ${subject.group} ${subject.mark}`.toLowerCase().includes(query));
        }

        function renderSubjectOptions() {
            const visibleSubjects = getVisibleSubjects();
            focusedSubjectIndex = Math.min(focusedSubjectIndex, Math.max(visibleSubjects.length - 1, 0));
            const query = subjectSearch.value.trim();
            options.innerHTML = visibleSubjects.map((subject, index) => {
                const total = questionBank.filter(question => question.subject === subject.id).length;
                const stats = getSubjectAccuracy(subject.id);
                
                let displayName = subject.name;
                if (query) {
                    try {
                        const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
                        displayName = subject.name.replace(regex, '<span class="search-match-highlight">$1</span>');
                    } catch (e) {}
                }
                
                return `
                    <button class="lms-subject-option ${index === focusedSubjectIndex ? "focused" : ""}"
                        type="button" role="option" aria-selected="${subject.id === activeSubject}"
                        data-tka-subject="${subject.id}">
                        <span class="lms-subject-mark">${subject.mark}</span>
                        <span class="lms-subject-copy">
                            <strong>${displayName}</strong>
                            <small>${subject.group} - ${stats.done}/${total} selesai</small>
                        </span>
                        <small>${stats.accuracy}%</small>
                    </button>
                `;
            }).join("") || `<div class="lms-subject-empty">Mapel tidak ditemukan.</div>`;
            options.querySelector(".focused")?.scrollIntoView({ block: "nearest" });
        }

        function closeSubjectMenu({ focusTrigger = false } = {}) {
            subjectMenuOpen = false;
            menu.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
            if (focusTrigger) trigger.focus();
        }

        function selectSubject(subjectId) {
            activeSubject = subjectId;
            selectedQuestionId = "";
            subjectMenuOpen = false;
            focusedSubjectIndex = Math.max(0, subjects.findIndex(subject => subject.id === subjectId));
            updatePreferences();
            renderAll();
            document.getElementById("tkaSubjectTrigger")?.focus();
        }

        function openSubjectMenu() {
            subjectMenuOpen = true;
            menu.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
            focusedSubjectIndex = Math.max(0, subjects.findIndex(subject => subject.id === activeSubject));
            renderSubjectOptions();
            subjectSearch.focus();
        }

        trigger.addEventListener("click", () => {
            if (subjectMenuOpen) closeSubjectMenu();
            else openSubjectMenu();
        });
        trigger.addEventListener("keydown", event => {
            if (["ArrowDown", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                openSubjectMenu();
            }
        });
        subjectSearch.addEventListener("input", () => {
            focusedSubjectIndex = 0;
            renderSubjectOptions();
        });
        subjectSearch.addEventListener("keydown", event => {
            const visibleSubjects = getVisibleSubjects();
            if (event.key === "Escape") {
                event.preventDefault();
                closeSubjectMenu({ focusTrigger: true });
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const direction = event.key === "ArrowDown" ? 1 : -1;
                focusedSubjectIndex = (focusedSubjectIndex + direction + visibleSubjects.length) % Math.max(visibleSubjects.length, 1);
                renderSubjectOptions();
            } else if (event.key === "Enter" && visibleSubjects[focusedSubjectIndex]) {
                event.preventDefault();
                selectSubject(visibleSubjects[focusedSubjectIndex].id);
            }
        });
        options.addEventListener("click", event => {
            const option = event.target.closest("[data-tka-subject]");
            if (option) selectSubject(option.dataset.tkaSubject);
        });
        subjectList.onfocusout = event => {
            if (subjectMenuOpen && !subjectList.contains(event.relatedTarget)) closeSubjectMenu();
        };
        renderSubjectOptions();
    }

    function renderFilters() {
        difficultyFilters.forEach(button => {
            button.classList.toggle("active", button.dataset.tkaDifficulty === activeDifficulty);
        });
        typeFilters.forEach(button => {
            button.classList.toggle("active", button.dataset.tkaType === activeType);
        });
        modeFilters.forEach(button => {
            button.classList.toggle("active", button.dataset.tkaMode === activeMode);
        });
        sessionSizeSelect.value = sessionSize;
    }

    function renderLaunchSummary() {
        if (!launchSummary) return;
        const subject = getSubject(activeSubject);
        const questionCount = getFilteredQuestions().length;
        const strictQuestionCount = getStrictFilteredQuestions().length;
        const hasSessionFill = sessionSize !== "all"
            && !searchInput.value.trim()
            && strictQuestionCount > 0
            && strictQuestionCount < questionCount;
        const modeNames = {
            all: "Semua soal",
            unanswered: "Belum dijawab",
            wrong: "Jawaban salah",
            review: "Daftar review"
        };
        const difficultyName = activeDifficulty === "all" ? "Semua level" : labels[activeDifficulty];
        const typeName = activeType === "all" ? "Semua tipe" : labels[activeType];
        const sizeName = sessionSize === "all" ? "Marathon" : `${sessionSize} soal`;
        launchSummary.innerHTML = `
            <div class="lms-summary-item"><span>Mapel</span><strong>${subject.name}</strong></div>
            <div class="lms-summary-item"><span>Sesi</span><strong>${modeNames[activeMode] || "Semua soal"} - ${sizeName}</strong></div>
            <div class="lms-summary-item"><span>Tersedia</span><strong>${questionCount} soal</strong></div>
            ${hasSessionFill ? `<div class="lms-summary-note">${strictQuestionCount} sesuai filter, ${questionCount - strictQuestionCount} soal pelengkap dari mapel yang sama.</div>` : ""}
            ${questionCount === 0 ? `<div class="lms-summary-empty">Tidak ada soal yang cocok. Ubah filter lanjutan.</div>` : ""}
        `;
        launchButtons.forEach(button => {
            button.disabled = questionCount === 0;
            button.title = questionCount === 0
                ? "Ubah filter karena belum ada soal yang cocok."
                : "Mulai sesi di ruang quiz.";
        });
        if (advancedToggle) {
            const hasAdvancedFilters = activeDifficulty !== "all" || activeType !== "all" || Boolean(searchInput.value.trim());
            advancedToggle.classList.toggle("has-active-filter", hasAdvancedFilters);
            advancedToggle.title = hasAdvancedFilters
                ? `${difficultyName}, ${typeName}${searchInput.value.trim() ? ", pencarian aktif" : ""}`
                : "Tampilkan pencarian, tingkat kesulitan, dan tipe soal.";
        }
    }

    function renderQuestionList() {
        const filtered = getFilteredQuestions();
        if (!filtered.some(question => question.id === selectedQuestionId)) {
            selectedQuestionId = filtered[0]?.id || "";
        }
        questionList.innerHTML = filtered.map((question, index) => { const answer = progress.answers[question.id]; let stateClass = ""; if (answer?.submitted) stateClass = answer.correct ? "answered correct" : "wrong"; else if (answer?.review) stateClass = "review"; else if (answer?.chosen?.length) stateClass = "draft"; const activeClass = question.id === selectedQuestionId ? "current" : ""; const stateLabel = answer?.submitted ? (answer.correct ? "benar" : "salah") : answer?.review ? "ditandai review" : answer?.chosen?.length ? "jawaban tersimpan" : "belum dijawab"; return `<button type="button" class="question-jump ${stateClass} ${activeClass}" data-tka-question="${question.id}" aria-label="Soal ${index + 1}, ${stateLabel}" title="Soal ${index + 1} · ${stateLabel}">${index + 1}</button>`; }).join("") || `<div style="color:var(--text-muted); font-size:0.875rem;">Tidak ada soal.</div>`;
        questionList.querySelectorAll("[data-tka-question]").forEach(button => {
            button.addEventListener("click", () => {
                selectedQuestionId = button.dataset.tkaQuestion;
                renderActiveQuestion();
                renderQuestionList();
            });
        });
    }

    function renderMetrics() {
        const stats = getAnswerStats();
        const weakSubject = subjects
            .map(subject => ({ ...subject, ...getSubjectAccuracy(subject.id) }))
            .filter(subject => subject.done > 0)
            .sort((a, b) => a.accuracy - b.accuracy)[0];
        const filtered = getFilteredQuestions();
        const filteredDone = filtered.filter(question => progress.answers[question.id]?.submitted).length;
        if (doneText) doneText.textContent = `${stats.done}/${questionBank.length}`;
        if (accuracyText) accuracyText.textContent = `${stats.accuracy}%`;
        if (streakText) streakText.textContent = progress.streak || 0;
        if (weakText) weakText.textContent = weakSubject ? weakSubject.name : "Belum ada";
        if (reviewCountText) reviewCountText.textContent = stats.review;
        if (masteryText) masteryText.textContent = `${Math.round((stats.correct / questionBank.length) * 100)}%`;
        if (sessionTargetText) sessionTargetText.textContent = `${filteredDone}/${filtered.length || 0}`;
        const sessionProgress = isQuizPage
            ? Math.round((filteredDone / Math.max(filtered.length, 1)) * 100)
            : Math.round((stats.done / questionBank.length) * 100);
        progressBar.style.width = `${sessionProgress}%`;
        progressBar.parentElement?.setAttribute("aria-valuemin", "0");
        progressBar.parentElement?.setAttribute("aria-valuemax", "100");
        progressBar.parentElement?.setAttribute("aria-valuenow", String(sessionProgress));
        if (sessionAnswered) sessionAnswered.textContent = String(filteredDone);
        const filteredCorrect = filtered.filter(question => progress.answers[question.id]?.submitted && progress.answers[question.id]?.correct).length;
        const filteredReview = filtered.filter(question => progress.answers[question.id]?.review).length;
        if (sessionAccuracy) sessionAccuracy.textContent = `${Math.round((filteredCorrect / Math.max(filteredDone, 1)) * 100)}%`;
        if (sessionReview) sessionReview.textContent = String(filteredReview);

        // Update Estimated TKA Score
        const scoreText = document.getElementById("tkaLmsEstimatedScore");
        if (scoreText) {
            if (stats.done < 5) {
                scoreText.textContent = "Belum Terukur";
                if (scoreText.nextElementSibling) {
                    scoreText.nextElementSibling.textContent = `Kerjakan ${5 - stats.done} soal lagi untuk mengaktifkan estimasi`;
                }
            } else {
                const estimatedScore = calculateIRTScore(progress.answers);
                scoreText.textContent = estimatedScore;
                if (scoreText.nextElementSibling) {
                    scoreText.nextElementSibling.textContent = `Dihitung menggunakan model IRT 2-Parameter (2PL) resmi`;
                }
            }
        }
    }

    function renderAnalytics() {
        analyticsGrid.innerHTML = subjects.map(subject => {
            const total = questionBank.filter(question => question.subject === subject.id).length;
            const subjectQuestions = questionBank.filter(question => question.subject === subject.id);
            const done = subjectQuestions.filter(question => progress.answers[question.id]?.submitted).length;
            const correct = subjectQuestions.filter(question => progress.answers[question.id]?.correct).length;
            const review = subjectQuestions.filter(question => progress.answers[question.id]?.review).length;
            const accuracy = Math.round((correct / Math.max(done, 1)) * 100);
            const completion = Math.round((done / total) * 100);
            const tone = done === 0 ? "Belum mulai" : accuracy >= 75 ? "Kuat" : accuracy >= 50 ? "Stabil" : "Perlu drill";
            return `
                <article class="lms-analytics-card">
                    <div class="resource-meta"><span>${subject.group}</span><span>${tone}</span></div>
                    <h3>${subject.name}</h3>
                    <div class="lms-analytics-row"><span>Akurasi</span><strong>${accuracy}%</strong></div>
                    <div class="lms-analytics-row"><span>Review</span><strong>${review}</strong></div>
                    <div class="lms-progress-track"><div style="width:${completion}%"></div></div>
                </article>
            `;
        }).join("");
    }

    function renderReviewHistory() {
        const historyContainer = document.getElementById("tkaHistoryContainer");
        if (!historyContainer) return;
        
        const answeredIds = Object.keys(progress.answers).filter(id => progress.answers[id].submitted);
        if (answeredIds.length === 0) {
            historyContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--muted); font-style: italic;">Belum ada riwayat latihan. Kerjakan beberapa soal terlebih dahulu!</div>`;
            return;
        }
        
        // Extract history filters & query
        const hSearch = document.getElementById("tkaHistorySearch");
        const query = hSearch ? hSearch.value.trim().toLowerCase() : "";
        
        const filterButtons = document.querySelectorAll("[data-history-filter]");
        let activeHFilter = "all";
        filterButtons.forEach(btn => {
            if (btn.classList.contains("active")) {
                activeHFilter = btn.dataset.historyFilter;
            }
        });
        
        let filteredIds = answeredIds.filter(id => {
            const question = questionBank.find(q => q.id === id);
            if (!question) return false;
            
            const ans = progress.answers[id];
            
            // Filter by correct/wrong
            if (activeHFilter === "correct" && !ans.correct) return false;
            if (activeHFilter === "wrong" && ans.correct) return false;
            
            // Search filter
            if (query) {
                const subjectObj = getSubject(question.subject);
                const searchContent = `${question.prompt} ${question.stimulus || ""} ${question.skill || ""} ${subjectObj ? subjectObj.name : ""}`.toLowerCase();
                if (!searchContent.includes(query)) return false;
            }
            
            return true;
        });
        
        if (filteredIds.length === 0) {
            historyContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--muted); font-style: italic; font-size: 14px;">Tidak ada riwayat yang cocok dengan filter/pencarian.</div>`;
            return;
        }
        
        const recentAnswers = filteredIds.slice(-20).reverse();
        
        historyContainer.innerHTML = recentAnswers.map(id => {
            const question = questionBank.find(q => q.id === id);
            if(!question) return "";
            const answer = progress.answers[id];
            const isCorrect = answer.correct;
            const tagClass = isCorrect ? 'tag-correct' : 'tag-wrong';
            const tagText = isCorrect ? 'BENAR' : 'SALAH';
            const shortPrompt = question.prompt.length > 55 ? question.prompt.substring(0, 55) + '...' : question.prompt;
            const subjectObj = getSubject(question.subject);
            
            return `
                <div class="history-row">
                    <span class="history-tag ${tagClass}">${tagText}</span>
                    <div class="history-preview" title="${question.prompt.replace(/"/g, '&quot;')}">${shortPrompt}</div>
                    <span style="font-size: 12px; color: var(--muted); font-weight: 600;">${subjectObj ? subjectObj.name : ""}</span>
                    <button class="btn btn-ghost" style="padding: 6px 12px; font-size: 12px; border-radius: 8px;" data-review-id="${id}">Baca Pembahasan</button>
                </div>
            `;
        }).join("");

        historyContainer.querySelectorAll('[data-review-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                openReviewModal(btn.dataset.reviewId);
            });
        });
    }

    function openReviewModal(questionId) {
        const question = questionBank.find(q => q.id === questionId);
        
        const modalBody = document.getElementById("reviewModalBody");
        const modalOverlay = document.getElementById("reviewModalOverlay");
        if(!modalBody || !modalOverlay) return;

        let optionsHtml = '';
        if (question.type === "truefalse") {
            optionsHtml = `<ul><li>Benar</li><li>Salah</li></ul>`;
        } else {
            optionsHtml = `<ul style="padding-left:20px; margin-top:8px;">${question.options.map(opt => `<li style="margin-bottom:4px;">${opt}</li>`).join('')}</ul>`;
        }
        
        let correctAnswerText = "";
        if (question.type === "truefalse") {
            correctAnswerText = question.options[question.correct];
        } else if (Array.isArray(question.correct)) {
            correctAnswerText = question.correct.map(idx => question.options[idx]).join(", ");
        } else {
            correctAnswerText = question.options[question.correct];
        }

        modalBody.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span class="mini-tag">${getSubject(question.subject).name} - ${question.difficulty}</span>
                <span class="mini-tag" style="background:var(--surface-2); color:var(--text); margin-left:8px;">${question.skill}</span>
            </div>
            ${question.stimulus ? `<div class="stimulus-box" style="margin-bottom:16px;">${question.stimulus}</div>` : ''}
            <h4 style="margin-bottom:12px; font-size: 1.1rem; font-weight: 600;">${question.prompt}</h4>
            <div style="opacity:0.8; font-size: 0.95rem; margin-bottom: 24px;">${optionsHtml}</div>
            
            <div class="review-correct-answer">
                <strong style="display:block; margin-bottom:8px;">Kunci Jawaban:</strong>
                ${correctAnswerText}
            </div>
            
            <div class="review-explanation">
                <strong style="display:block; margin-bottom:8px;">Pembahasan:</strong>
                ${question.explanation || "Pembahasan belum tersedia untuk soal ini."}
            </div>
        `;
        
        modalOverlay.classList.add("show");
    }

    function formatTimer(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${minutes}:${remaining}`;
    }

    function renderTimer() {
        const seconds = isQuizPage ? progress.quizRemaining : progress.elapsedSeconds;
        if (timerDisplay) timerDisplay.textContent = formatTimer(seconds);
        timerToggle.textContent = progress.timerRunning ? "Pause" : "Mulai";
        timerDisplay?.closest(".timer-card")?.classList.toggle("is-urgent", isQuizPage && seconds <= 300);
        if (timerDuration && timerDuration.value !== String(progress.quizDuration)) timerDuration.value = String(progress.quizDuration);
    }

    function startTimerLoop() {
        clearInterval(timerId);
        if (!isQuizPage || !progress.timerRunning) return;
        timerId = setInterval(() => {
            progress.elapsedSeconds += 1;
            if (isQuizPage) {
                progress.quizRemaining = Math.max(0, progress.quizRemaining - 1);
                if (progress.quizRemaining === 0) {
                    progress.timerRunning = false;
                    clearInterval(timerId);
                    showToast("Waktu habis. Sesi dijeda.");
                    showResultSummary();
                }
            }
            saveProgress();
            renderTimer();
        }, 1000);
    }

    function renderActiveQuestion() {
        const question = questionBank.find(item => item.id === selectedQuestionId);
        const filtered = getFilteredQuestions();
        const questionIndex = filtered.findIndex(item => item.id === selectedQuestionId);
        if (!question) {
            questionMeta.innerHTML = "";
            questionTitle.textContent = "Pilih soal untuk mulai latihan.";
            questionStimulus.textContent = "Gunakan katalog mapel dan filter untuk menemukan paket soal yang ingin dikerjakan.";
            answerGrid.innerHTML = "";
            explanation.innerHTML = `<p class="muted">Belum ada soal aktif.</p>`;
            sourceText.textContent = "Pola adaptif TKA";
            questionCounter.textContent = "Soal 0/0";
            questionStatus.textContent = "Tidak ada soal";
            noteInput.value = "";
            noteInput.disabled = true;
            saveNoteButton.disabled = true;
            submitButton.disabled = true;
            nextButton.disabled = true;
            prevButton.disabled = true;
            hintButton.disabled = true;
            reviewButton.disabled = true;
            clearAnswerButton.disabled = true;
            return;
        }
        const saved = progress.answers[question.id];
        if (lastRenderedQuestionId !== question.id || saved?.submitted) {
            selectedAnswers = saved?.chosen ? [...saved.chosen] : [];
            lastRenderedQuestionId = question.id;
        }
        const subject = getSubject(question.subject);
        questionMeta.innerHTML = `<span class="meta-tag">${subject.name}</span><span class="meta-tag difficulty-${question.difficulty}">${labels[question.difficulty]}</span><span class="meta-tag">${labels[question.type]}</span><span class="meta-tag">${question.sourceKind}</span>`;
        questionCounter.textContent = `Soal ${questionIndex + 1}/${filtered.length}`;
        questionStatus.textContent = saved?.submitted ? (saved.correct ? "Benar" : "Salah") : saved?.review ? "Review" : "Belum dijawab";
        questionTitle.textContent = question.prompt;
        questionStimulus.textContent = question.stimulus;
        sourceText.textContent = `${question.skill} - ${question.sourceKind}`;
        noteInput.disabled = false;
        saveNoteButton.disabled = false;
        noteInput.value = saved?.note || "";
        answerGrid.innerHTML = question.options.map((option, index) => {
            const selected = selectedAnswers.includes(index);
            const correct = Array.isArray(question.correct) ? question.correct.includes(index) : question.correct === index;
            const stateClass = saved?.submitted && correct ? "is-correct correct" : saved?.submitted && selected && !correct ? "is-wrong wrong" : "";
            return `<button type="button" class="answer-choice answer-btn ${selected ? "selected" : ""} ${stateClass}" data-lms-answer="${index}" aria-pressed="${selected}" ${saved?.submitted ? "disabled" : ""}>${option}</button>`;
        }).join("");
        explanation.innerHTML = saved?.submitted
            ? `<strong>${saved.correct ? "Jawaban benar." : "Perlu review."}</strong><p>${question.explanation}</p>`
            : `<p class="muted">${question.type === "multi" ? "Pilih semua jawaban yang benar, lalu tekan Submit." : "Pilih satu jawaban, lalu tekan Submit."}</p>`;
        submitButton.disabled = Boolean(saved?.submitted) || selectedAnswers.length === 0;
        clearAnswerButton.disabled = Boolean(saved?.submitted) || selectedAnswers.length === 0;
        const isLast = questionIndex === filtered.length - 1; nextButton.textContent = isLast ? "Selesai Latihan" : "Soal Berikutnya"; if (isLast) nextButton.style.background = "linear-gradient(135deg, var(--danger), var(--purple))"; else nextButton.style.background = ""; nextButton.disabled = false; prevButton.disabled = false;
        hintButton.disabled = Boolean(saved?.submitted);
        reviewButton.disabled = false;
        reviewButton.textContent = saved?.review ? "Batal Review" : "Tandai Review";
        answerGrid.querySelectorAll("[data-lms-answer]").forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.lmsAnswer);
                if (question.type === "multi") {
                    selectedAnswers = selectedAnswers.includes(index)
                        ? selectedAnswers.filter(answer => answer !== index)
                        : [...selectedAnswers, index];
                } else {
                    selectedAnswers = [index];
                }
                progress.answers[question.id] = {
                    ...(progress.answers[question.id] || {}),
                    chosen: [...selectedAnswers], submitted: false, correct: false, updatedAt: Date.now()
                };
                saveProgress();
                renderActiveQuestion();
                renderQuestionList();
            });
        });
    }

    function submitAnswer() {
        const question = questionBank.find(item => item.id === selectedQuestionId);
        if (!question || selectedAnswers.length === 0) {
            showToast("Pilih jawaban dulu.");
            return;
        }
        const correct = isCorrect(question, selectedAnswers);
        if (window.QuizNationPro) {
            const correctIndexes = Array.isArray(question.correct) ? question.correct : [question.correct];
            window.QuizNationPro.recordAttempt({
                questionId: question.id, question: question.prompt, topic: question.subject || question.skill,
                difficulty: question.difficulty, source: "tka-lms",
                selected: selectedAnswers.map(index => question.options[index]).join(", "),
                correctAnswer: correctIndexes.map(index => question.options[index]).join(", "), correct,
                isCorrect: correct, durationMs: Number(progress.elapsedSeconds || 0) * 1000,
                explanation: question.explanation, answers: question.options
            });
        }
        progress.answers[question.id] = {
            chosen: [...selectedAnswers],
            submitted: true,
            correct,
            review: progress.answers[question.id]?.review || !correct,
            note: progress.answers[question.id]?.note || noteInput.value.trim(),
            updatedAt: Date.now()
        };
        progress.streak = correct ? (progress.streak || 0) + 1 : 0;
        saveProgress();
        showToast(correct ? "Jawaban benar." : "Masuk daftar review.");
        renderAll();
    }

    function showResultSummary() {
        if (!resultDialog || !resultContent) return;
        const filtered = getFilteredQuestions();
        const answered = filtered.filter(q => progress.answers[q.id]?.submitted);
        const correct = answered.filter(q => progress.answers[q.id]?.correct).length;
        const review = filtered.filter(q => progress.answers[q.id]?.review).length;
        const accuracy = Math.round((correct / Math.max(answered.length, 1)) * 100);
        resultContent.innerHTML = `<div class="result-score"><strong>${accuracy}%</strong><span>Akurasi sesi</span></div><div class="result-stats"><span><b>${answered.length}</b>Dijawab</span><span><b>${correct}</b>Benar</span><span><b>${review}</b>Review</span><span><b>${formatTimer(progress.elapsedSeconds)}</b>Durasi</span></div>`;
        if (!resultDialog.open) resultDialog.showModal();
    }

    function moveQuestion(direction = 1) { const filtered = getFilteredQuestions(); if (!filtered.length) return; const index = filtered.findIndex(question => question.id === selectedQuestionId); if (direction === 1 && index === filtered.length - 1) { showResultSummary(); return; } selectedQuestionId = filtered[(index + direction + filtered.length) % filtered.length].id; renderActiveQuestion(); renderQuestionList(); }

    function showHint() {
        const question = questionBank.find(item => item.id === selectedQuestionId);
        if (!question) return;
        explanation.innerHTML = `
            <strong>Hint pengerjaan</strong>
            <p>Fokus pada ${question.skill}. Baca stimulus dulu, coret opsi yang terlalu mutlak, lalu cocokkan jawaban dengan data yang benar-benar disebutkan.</p>
        `;
    }

    function saveQuestionNote() {
        const question = questionBank.find(item => item.id === selectedQuestionId);
        if (!question) return;
        const current = progress.answers[question.id] || { chosen: [], submitted: false, correct: false };
        progress.answers[question.id] = { ...current, note: noteInput.value.trim(), updatedAt: Date.now() };
        saveProgress();
        showToast("Catatan soal tersimpan.");
        renderQuestionList();
        renderAnalytics();
    }

    function toggleReview() {
        const question = questionBank.find(item => item.id === selectedQuestionId);
        if (!question) return;
        const current = progress.answers[question.id] || { chosen: [], submitted: false, correct: false };
        progress.answers[question.id] = { ...current, review: !current.review, updatedAt: Date.now() };
        saveProgress();
        showToast(progress.answers[question.id].review ? "Soal ditandai review." : "Tanda review dihapus.");
        renderAll();
    }

    function resetProgress() {
        const allowed = typeof confirm === "function" ? confirm("Reset semua progress LMS TKA di browser ini?") : true;
        if (!allowed) return;
        progress.answers = {};
        progress.streak = 0;
        progress.elapsedSeconds = 0;
        progress.quizRemaining = progress.quizDuration;
        progress.timerRunning = false;
        selectedQuestionId = "";
        selectedAnswers = [];
        lastRenderedQuestionId = "";
        saveProgress();
        renderTimer();
        startTimerLoop();
        renderAll();
        showToast("Progress LMS direset.");
    }

    function bindFilters() {
        difficultyFilters.forEach(button => {
            button.addEventListener("click", () => {
                activeDifficulty = button.dataset.tkaDifficulty;
                selectedQuestionId = "";
                updatePreferences();
                renderAll();
            });
        });
        typeFilters.forEach(button => {
            button.addEventListener("click", () => {
                activeType = button.dataset.tkaType;
                selectedQuestionId = "";
                updatePreferences();
                renderAll();
            });
        });
        modeFilters.forEach(button => {
            button.addEventListener("click", () => {
                activeMode = button.dataset.tkaMode;
                selectedQuestionId = "";
                updatePreferences();
                renderAll();
            });
        });
        sessionSizeSelect.addEventListener("change", () => {
            sessionSize = sessionSizeSelect.value;
            selectedQuestionId = "";
            updatePreferences();
            renderAll();
        });
        searchInput.addEventListener("input", () => {
            selectedQuestionId = "";
            updatePreferences();
            renderAll();
        });
        resetButton.addEventListener("click", () => {
            activeDifficulty = "all";
            activeType = "all";
            activeMode = "all";
            sessionSize = "10";
            searchInput.value = "";
            selectedQuestionId = "";
            updatePreferences();
            renderAll();
        });
        advancedToggle?.addEventListener("click", () => {
            const isOpen = advancedToggle.getAttribute("aria-expanded") === "true";
            advancedToggle.setAttribute("aria-expanded", String(!isOpen));
            advancedPanel.hidden = isOpen;
        });
        submitButton.addEventListener("click", submitAnswer);
        nextButton.addEventListener("click", () => moveQuestion(1));
        prevButton.addEventListener("click", () => moveQuestion(-1));
        hintButton.addEventListener("click", showHint);
        reviewButton.addEventListener("click", toggleReview);
        saveNoteButton.addEventListener("click", saveQuestionNote);
        resetProgressButton.addEventListener("click", resetProgress);
        timerToggle.addEventListener("click", () => {
            progress.timerRunning = !progress.timerRunning;
            saveProgress();
            renderTimer();
            startTimerLoop();
        });
        timerReset.addEventListener("click", () => {
            progress.elapsedSeconds = 0;
            progress.quizRemaining = progress.quizDuration;
            progress.timerRunning = false;
            saveProgress();
            renderTimer();
            startTimerLoop();
        });
        timerDuration?.addEventListener("change", () => {
            progress.quizDuration = Number(timerDuration.value);
            progress.quizRemaining = progress.quizDuration;
            progress.timerRunning = false;
            saveProgress(); renderTimer(); startTimerLoop();
            showToast(`Timer diatur ${Math.round(progress.quizDuration / 60)} menit.`);
        });
        clearAnswerButton.addEventListener("click", () => {
            const question = questionBank.find(item => item.id === selectedQuestionId);
            if (!question || progress.answers[question.id]?.submitted) return;
            selectedAnswers = [];
            const current = progress.answers[question.id] || {};
            progress.answers[question.id] = { ...current, chosen: [], submitted: false, updatedAt: Date.now() };
            saveProgress(); renderActiveQuestion(); renderQuestionList();
        });
        launchButtons.forEach(button => {
            button.addEventListener("click", () => {
                updatePreferences();
                window.location.href = "tka-quiz.html";
            });
        });

        // Advanced History Filters
        const historyFilterButtons = document.querySelectorAll("[data-history-filter]");
        historyFilterButtons.forEach(button => {
            button.addEventListener("click", () => {
                historyFilterButtons.forEach(item => item.classList.remove("active"));
                button.add("active");
                renderReviewHistory();
            });
        });
        
        const historySearchInput = document.getElementById("tkaHistorySearch");
        if (historySearchInput) {
            historySearchInput.addEventListener("input", () => {
                renderReviewHistory();
            });
        }

        // Click on weak subject row to start training it
        const weakRow = document.getElementById("tkaLmsWeakRow");
        if (weakRow) {
            weakRow.addEventListener("click", () => {
                const weakTextEl = document.getElementById("tkaLmsWeak");
                const weakName = weakTextEl ? weakTextEl.textContent.trim() : "";
                if (weakName && weakName !== "Belum ada") {
                    const foundSubj = subjects.find(s => s.name.toLowerCase() === weakName.toLowerCase());
                    if (foundSubj) {
                        activeSubject = foundSubj.id;
                        selectedQuestionId = "";
                        updatePreferences();
                        renderAll();
                        showToast(`Melatih mapel terlemah: ${foundSubj.name}`);
                        
                        // Switch to setup tab
                        const setupTabBtn = document.querySelector('[data-target="tab-setup"]');
                        if (setupTabBtn) {
                            setupTabBtn.click();
                        }
                        
                        document.getElementById("lms-workspace")?.scrollIntoView({ behavior: "smooth" });
                    }
                }
            });
        }

        // Recommendation Buttons bindings
        const btnErrors = document.querySelector("#recRepeatErrors button");
        if (btnErrors) {
            btnErrors.addEventListener("click", () => {
                const wrongQuestions = questionBank.filter(q => progress.answers[q.id]?.submitted && !progress.answers[q.id].correct);
                if (wrongQuestions.length > 0) {
                    activeMode = "wrong";
                    sessionSize = "5";
                    activeDifficulty = "all";
                    activeType = "all";
                    searchInput.value = "";
                    updatePreferences();
                    window.location.href = "tka-quiz.html";
                }
            });
        }

        const btnWeak = document.querySelector("#recWeakestDrill button");
        if (btnWeak) {
            btnWeak.addEventListener("click", () => {
                const weakSubjectObj = subjects
                    .map(subject => ({ ...subject, ...getSubjectAccuracy(subject.id) }))
                    .filter(subject => subject.done > 0)
                    .sort((a, b) => a.accuracy - b.accuracy)[0];
                if (weakSubjectObj) {
                    activeSubject = weakSubjectObj.id;
                    activeMode = "all";
                    sessionSize = "5";
                    activeDifficulty = "all";
                    activeType = "all";
                    searchInput.value = "";
                    updatePreferences();
                    window.location.href = "tka-quiz.html";
                }
            });
        }

        const btnHots = document.querySelector("#recHotsChallenge button");
        if (btnHots) {
            btnHots.addEventListener("click", () => {
                const hotsQuestions = questionBank.filter(q => q.subject === activeSubject && q.difficulty === "hots");
                if (hotsQuestions.length > 0) {
                    activeDifficulty = "hots";
                    activeMode = "all";
                    sessionSize = "5";
                    activeType = "all";
                    searchInput.value = "";
                    updatePreferences();
                    window.location.href = "tka-quiz.html";
                }
            });
        }

        // Bind Target Score input
        const targetInputLMS = document.getElementById("tkaTargetScoreLMS");
        if (targetInputLMS) {
            targetInputLMS.value = preferences.targetScore || 700;
            targetInputLMS.addEventListener("input", () => {
                let val = parseInt(targetInputLMS.value);
                if (isNaN(val)) val = 700;
                if (val < 400) val = 400;
                if (val > 900) val = 900;
                
                updatePreferences();
                renderStrategy();
            });
            targetInputLMS.addEventListener("change", () => {
                let val = parseInt(targetInputLMS.value);
                if (isNaN(val) || val < 400) val = 400;
                if (val > 900) val = 900;
                targetInputLMS.value = val;
                updatePreferences();
                renderStrategy();
            });
        }

        const actionsList = document.getElementById("tkaStrategyActionsList");
        if (actionsList) {
            actionsList.addEventListener("click", (event) => {
                const card = event.target.closest(".strategy-action-card");
                if (!card) return;
                const actionType = card.dataset.actionType;
                if (!actionType) return;
                
                if (actionType.startsWith("weakSubject:")) {
                    const subjId = actionType.split(":")[1];
                    activeSubject = subjId;
                    activeMode = "all";
                    sessionSize = "5";
                    updatePreferences();
                    renderAll();
                    showToast(`Melatih mapel terlemah: ${getSubject(subjId).name}`);
                } else if (actionType === "coverage") {
                    activeMode = "unanswered";
                    sessionSize = "10";
                    updatePreferences();
                    renderAll();
                    showToast("Menyiapkan latihan soal baru.");
                } else if (actionType === "hots" || actionType === "hotsAccuracy") {
                    activeDifficulty = "hots";
                    activeMode = "all";
                    sessionSize = "5";
                    updatePreferences();
                    renderAll();
                    showToast("Menyiapkan Tantangan HOTS.");
                } else if (actionType === "accuracy") {
                    activeMode = "wrong";
                    sessionSize = "5";
                    updatePreferences();
                    renderAll();
                    showToast("Menyiapkan drill soal salah.");
                } else if (actionType === "intensitas") {
                    activeMode = "unanswered";
                    sessionSize = "10";
                    updatePreferences();
                    renderAll();
                    showToast("Menyiapkan latihan intensif.");
                } else if (actionType === "wrong") {
                    activeMode = "wrong";
                    sessionSize = "5";
                    updatePreferences();
                    renderAll();
                    showToast("Menyiapkan review berkala.");
                }
                
                // Switch to setup tab
                const setupTabBtn = document.querySelector('[data-target="tab-setup"]');
                if (setupTabBtn) setupTabBtn.click();
                
                document.getElementById("lms-workspace")?.scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    function renderRecommendations() {
        if (isQuizPage) return;
        
        // 1. Repeat Errors
        const wrongQuestions = questionBank.filter(q => progress.answers[q.id]?.submitted && !progress.answers[q.id].correct);
        const btnErrors = document.querySelector("#recRepeatErrors button");
        const cardErrors = document.getElementById("recRepeatErrors");
        if (btnErrors && cardErrors) {
            const p = cardErrors.querySelector("p");
            if (p) {
                p.innerHTML = wrongQuestions.length > 0 
                    ? `Ulangi <strong>${wrongQuestions.length}</strong> soal yang pernah dijawab salah untuk evaluasi.` 
                    : `Tidak ada soal salah saat ini. Bagus sekali!`;
            }
            if (wrongQuestions.length === 0) {
                btnErrors.disabled = true;
                btnErrors.textContent = "Tidak Tersedia";
                cardErrors.style.opacity = "0.5";
            } else {
                btnErrors.disabled = false;
                btnErrors.textContent = `Mulai (${Math.min(wrongQuestions.length, 5)} soal)`;
                cardErrors.style.opacity = "1";
            }
        }

        // 2. Weakest Drill
        const weakSubjectObj = subjects
            .map(subject => ({ ...subject, ...getSubjectAccuracy(subject.id) }))
            .filter(subject => subject.done > 0)
            .sort((a, b) => a.accuracy - b.accuracy)[0];
        const btnWeak = document.querySelector("#recWeakestDrill button");
        const cardWeak = document.getElementById("recWeakestDrill");
        if (btnWeak && cardWeak) {
            const p = cardWeak.querySelector("p");
            if (p) {
                p.innerHTML = weakSubjectObj 
                    ? `Sesi khusus mapel terlemahmu: <strong>${weakSubjectObj.name}</strong> (${weakSubjectObj.accuracy}% akurasi).` 
                    : `Kerjakan minimal 2 mapel berbeda untuk mengidentifikasi kelemahan.`;
            }
            if (!weakSubjectObj) {
                btnWeak.disabled = true;
                btnWeak.textContent = "Belum Ada Data";
                cardWeak.style.opacity = "0.5";
            } else {
                btnWeak.disabled = false;
                btnWeak.textContent = `Mulai (${weakSubjectObj.name})`;
                cardWeak.style.opacity = "1";
            }
        }
        
        // 3. HOTS Challenge
        const hotsQuestions = questionBank.filter(q => q.subject === activeSubject && q.difficulty === "hots");
        const btnHots = document.querySelector("#recHotsChallenge button");
        const cardHots = document.getElementById("recHotsChallenge");
        if (btnHots && cardHots) {
            const p = cardHots.querySelector("p");
            if (p) {
                p.innerHTML = hotsQuestions.length > 0
                    ? `5 soal level analisis tinggi campuran untuk melatih logika berpikir.`
                    : `Tidak ada soal HOTS tersedia di mapel ${getSubject(activeSubject).name}.`;
            }
            if (hotsQuestions.length === 0) {
                btnHots.disabled = true;
                btnHots.textContent = "Tidak Tersedia";
                cardHots.style.opacity = "0.5";
            } else {
                btnHots.disabled = false;
                btnHots.textContent = `Mulai (5 Soal HOTS)`;
                cardHots.style.opacity = "1";
            }
        }
    }

    function renderStrategy() {
        if (isQuizPage) return;
        const targetInputLMS = document.getElementById("tkaTargetScoreLMS");
        if (!targetInputLMS) return;
        
        const targetVal = parseInt(targetInputLMS.value) || 700;
        const stats = getAnswerStats();
        
        const projStatusText = document.getElementById("tkaProjectionStatusText");
        const gapText = document.getElementById("tkaScoreGapText");
        const actionsList = document.getElementById("tkaStrategyActionsList");
        
        if (!projStatusText || !gapText || !actionsList) return;
        
        if (stats.done < 5) {
            projStatusText.textContent = "Belum Terukur";
            projStatusText.style.color = "var(--muted)";
            gapText.textContent = "Kerjakan minimal 5 soal untuk menganalisis gap skor.";
            actionsList.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--muted); padding: 12px;">
                    <i class="fa-solid fa-lock" style="font-size: 16px; color: var(--muted);"></i>
                    <span>Selesaikan minimal 5 soal di mapel apa pun untuk membuka rencana strategi aksi.</span>
                </div>
            `;
            return;
        }
        
        // Calculate estimated score
        const estimatedScore = calculateIRTScore(progress.answers);
        
        projStatusText.textContent = `${estimatedScore} Poin`;
        
        const gap = targetVal - estimatedScore;
        if (gap <= 0) {
            projStatusText.style.color = "var(--green)";
            gapText.textContent = `Hebat! Estimasi skor kamu saat ini telah melampaui target (${Math.abs(gap)} poin di atas target).`;
        } else {
            projStatusText.style.color = gap > 100 ? "var(--danger)" : "var(--blue)";
            gapText.textContent = `Kurang ${gap} poin lagi untuk mencapai target ${targetVal}.`;
        }
        
        // Dynamic Recommendations list
        const actions = [];
        
        // 1. Weakest subject action
        const weakSubject = subjects
            .map(subject => ({ ...subject, ...getSubjectAccuracy(subject.id) }))
            .filter(subject => subject.done > 0)
            .sort((a, b) => a.accuracy - b.accuracy)[0];
            
        if (weakSubject && weakSubject.accuracy < 70) {
            actions.push({
                icon: "fa-triangle-exclamation",
                color: "var(--danger)",
                title: `Tingkatkan akurasi ${weakSubject.name}`,
                desc: `Akurasi saat ini ${weakSubject.accuracy}%. Lakukan drill minimal 5 soal dari materi ini untuk menaikkan proyeksi nilai.`,
                actionType: `weakSubject:${weakSubject.id}`
            });
        }
        
        // 2. Completion action
        const totalDone = stats.done;
        const totalQuestions = questionBank.length;
        const coverageRate = Math.round((totalDone / totalQuestions) * 100);
        if (coverageRate < 30) {
            actions.push({
                icon: "fa-database",
                color: "var(--blue)",
                title: "Perluas cakupan materi latihan",
                desc: `Kamu baru mengerjakan ${coverageRate}% dari bank soal TKA. Selesaikan minimal 15 soal lagi untuk menstabilkan estimasi nilai.`,
                actionType: "coverage"
            });
        }
        
        // 3. HOTS challenge recommendation
        const answeredHots = questionBank.filter(q => q.difficulty === "hots" && progress.answers[q.id]?.submitted);
        const correctHots = answeredHots.filter(q => progress.answers[q.id]?.correct);
        const hotsAccuracy = answeredHots.length ? Math.round((correctHots.length / answeredHots.length) * 100) : 0;
        
        if (answeredHots.length === 0) {
            actions.push({
                icon: "fa-fire",
                color: "var(--purple)",
                title: "Coba Tantangan HOTS pertama kamu",
                desc: "Uji logika analisis tinggi dengan menyelesaikan sesi khusus HOTS.",
                actionType: "hots"
            });
        } else if (hotsAccuracy < 60) {
            actions.push({
                icon: "fa-fire",
                color: "var(--purple)",
                title: "Perbaiki akurasi soal analisis tinggi (HOTS)",
                desc: `Akurasi HOTS kamu saat ini ${hotsAccuracy}%. Pelajari kembali pembahasan di Riwayat & Review.`,
                actionType: "hotsAccuracy"
            });
        }
        
        // 4. General advice based on gap
        if (gap > 0) {
            if (stats.accuracy < 75) {
                actions.push({
                    icon: "fa-bullseye",
                    color: "var(--yellow)",
                    title: "Fokus pada ketelitian (Akurasi)",
                    desc: "Akurasi belajar saat ini masih di bawah 75%. Kurangi kecepatan pengerjaan dan pastikan membaca stimulus soal secara teliti sebelum submit.",
                    actionType: "accuracy"
                });
            } else {
                actions.push({
                    icon: "fa-bolt",
                    color: "var(--green)",
                    title: "Tingkatkan intensitas latihan",
                    desc: "Akurasi kamu sudah sangat baik! Terus selesaikan soal baru untuk menambahkan bobot progres belajar ke estimasi skor.",
                    actionType: "intensitas"
                });
            }
        } else {
            actions.push({
                icon: "fa-crown",
                color: "var(--green)",
                title: "Pertahankan keunggulan",
                desc: "Rutinlah melakukan review berkala terhadap soal-soal salah agar kemampuanmu tetap prima menjelang ujian resmi.",
                actionType: "wrong"
            });
        }
        
        actionsList.innerHTML = actions.map(act => `
            <button type="button" class="strategy-action-card" data-action-type="${act.actionType}">
                <div class="action-card-icon" style="background-color: ${act.color}15; color: ${act.color};">
                    <i class="fa-solid ${act.icon}"></i>
                </div>
                <div class="action-card-body">
                    <strong>${act.title}</strong>
                    <p>${act.desc}</p>
                </div>
                <div class="action-card-arrow">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </button>
        `).join("");
    }

    function renderAll() {
        renderSubjects();
        renderFilters();
        renderMetrics();
        renderAnalytics();
        renderReviewHistory();
        renderTimer();
        renderLaunchSummary();
        renderRecommendations();
        renderStrategy();
        if (isQuizPage) {
            renderQuestionList();
            renderActiveQuestion();
        }
    }

    searchInput.value = preferences.query || "";
    sessionSizeSelect.value = sessionSize;
    bindFilters();

    if (isQuizPage) {
        const shortcutDialog = document.getElementById("tkaShortcutDialog");
        document.getElementById("tkaShortcutHelp")?.addEventListener("click", () => shortcutDialog?.showModal());
        document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => button.closest("dialog")?.close()));
        document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => {
            if (event.target === dialog) dialog.close();
        }));
        document.getElementById("tkaFullscreenToggle")?.addEventListener("click", async () => {
            try {
                if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                else await document.exitFullscreen();
            } catch { showToast("Mode layar penuh tidak tersedia."); }
        });
        const readableButton = document.getElementById("tkaReadableToggle");
        readableButton?.addEventListener("click", () => {
            const active = document.body.classList.toggle("readable-mode");
            readableButton.setAttribute("aria-pressed", String(active));
            showToast(active ? "Teks diperbesar." : "Ukuran teks normal.");
        });
        const sidebarButton = document.getElementById("tkaSidebarToggle");
        sidebarButton?.addEventListener("click", () => {
            const collapsed = document.body.classList.toggle("sidebar-collapsed");
            sidebarButton.setAttribute("aria-expanded", String(!collapsed));
            sidebarButton.textContent = collapsed ? "Buka" : "Tutup";
        });
        document.addEventListener("keydown", event => {
            if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "") || document.querySelector("dialog[open]")) return;
            const question = questionBank.find(item => item.id === selectedQuestionId);
            const key = event.key.toLowerCase();
            const answerIndex = "abcdef".indexOf(key);
            if (answerIndex >= 0 && answerIndex < (question?.options.length || 0)) {
                answerGrid.querySelector(`[data-lms-answer="${answerIndex}"]`)?.click(); event.preventDefault();
            } else if (event.key === "Enter" && !submitButton.disabled) { submitButton.click(); event.preventDefault(); }
            else if (event.key === "ArrowRight") { moveQuestion(1); event.preventDefault(); }
            else if (event.key === "ArrowLeft") { moveQuestion(-1); event.preventDefault(); }
            else if (key === "h") { hintButton.click(); event.preventDefault(); }
            else if (key === "r") { reviewButton.click(); event.preventDefault(); }
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && progress.timerRunning) {
                progress.timerRunning = false; saveProgress(); renderTimer(); startTimerLoop();
                showToast("Timer dijeda saat halaman tidak aktif.");
            }
        });
        document.querySelectorAll('a[href^="tka-lms.html"]').forEach(link => link.addEventListener("click", event => {
            const hasDraft = getFilteredQuestions().some(question => progress.answers[question.id]?.chosen?.length && !progress.answers[question.id]?.submitted);
            if (hasDraft && !confirm("Ada pilihan yang belum disubmit. Tetap keluar dari Focus Room?")) event.preventDefault();
        }));
    }
    
    const reviewModalOverlay = document.getElementById("reviewModalOverlay");
    const closeReviewModal = document.getElementById("closeReviewModal");
    if (closeReviewModal && reviewModalOverlay) {
        closeReviewModal.addEventListener("click", () => reviewModalOverlay.classList.remove("show"));
        reviewModalOverlay.addEventListener("click", (e) => {
            if(e.target === reviewModalOverlay) reviewModalOverlay.classList.remove("show");
        });
    }

    renderTimer();
    startTimerLoop();
    renderAll();
}

// Global scope attachment for backward compatibility
window.initTKALMSPage = initTKALMSPage;
