const storage = {
    get(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

function initTheme() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("eduquest_theme") || "light";

    document.body.classList.toggle("dark-theme", savedTheme === "dark");
    if (!themeToggleBtn) return;

    themeToggleBtn.innerHTML = savedTheme === "dark" ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    themeToggleBtn.setAttribute("aria-label", savedTheme === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap");
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        localStorage.setItem("eduquest_theme", isDark ? "dark" : "light");
        themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        themeToggleBtn.setAttribute("aria-label", isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
        themeToggleBtn.setAttribute("aria-pressed", String(isDark));
        themeToggleBtn.style.transform = "scale(0.9)";
        setTimeout(() => themeToggleBtn.style.transform = "none", 150);
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function initTKAPage() {
    const targetInput = document.getElementById("targetScore");
    const weeksInput = document.getElementById("studyWeeks");
    const focusSelect = document.getElementById("focusArea");
    const firstElective = document.getElementById("firstElective");
    const secondElective = document.getElementById("secondElective");
    const planList = document.getElementById("snbtPlanList");
    const ring = document.getElementById("snbtRing");
    const ringText = document.getElementById("snbtRingText");
    const subjectButtons = document.querySelectorAll("[data-snbt-subject]");
    const questionMeta = document.getElementById("snbtQuestionMeta");
    const questionText = document.getElementById("snbtQuestion");
    const answerGrid = document.getElementById("snbtAnswers");
    const feedback = document.getElementById("snbtFeedback");
    const nextButton = document.getElementById("nextTKAQuestion");
    const diagnostic = document.getElementById("tkaDiagnostic");
    const checklistInputs = document.querySelectorAll("[data-tka-check]");
    const stats = storage.get("snbt_stats", { done: 0, correct: 0, bySubject: {} });
    stats.bySubject = stats.bySubject || {};
    const checklist = storage.get("tka_checklist", {});
    let activeSubject = "indonesia";
    let activeQuestionIndex = 0;

    const questions = {
        indonesia: [
            {
                topic: "Bahasa Indonesia - Inferensi teks",
                level: "Sedang",
                time: "90 detik",
                q: "Sebuah artikel menjelaskan bahwa kebiasaan membaca singkat setiap hari lebih efektif daripada membaca lama tetapi jarang. Simpulan yang paling tepat adalah...",
                answers: ["Durasi belajar tidak penting", "Konsistensi latihan membantu pemahaman", "Membaca lama selalu buruk", "Artikel hanya membahas buku fiksi"],
                correct: 1,
                note: "Kata kunci pada teks adalah kebiasaan harian dan efektivitas. Jadi simpulan aman berfokus pada konsistensi."
            },
            {
                topic: "Bahasa Indonesia - Evaluasi argumen",
                level: "HOTS",
                time: "100 detik",
                q: "Pernyataan: Sekolah A perlu menambah jam literasi karena nilai membaca turun. Data tambahan mana yang paling memperkuat argumen itu?",
                answers: ["Jumlah kantin di sekolah", "Perbandingan nilai membaca sebelum dan sesudah program literasi", "Daftar warna seragam", "Jumlah lapangan olahraga"],
                correct: 1,
                note: "Argumen tentang literasi paling kuat bila didukung data yang langsung membandingkan efek program literasi."
            },
            {
                topic: "Bahasa Indonesia - Ide pokok",
                level: "Dasar",
                time: "75 detik",
                q: "Kalimat utama paragraf biasanya berfungsi sebagai...",
                answers: ["Contoh tambahan", "Ide pokok", "Data pendukung", "Kesimpulan lawan"],
                correct: 1,
                note: "Kalimat utama membawa ide pokok yang dijelaskan oleh kalimat-kalimat pendukung."
            }
        ],
        matematika: [
            {
                topic: "Matematika - Aljabar kontekstual",
                level: "Dasar",
                time: "80 detik",
                q: "Biaya langganan aplikasi adalah Rp12.000 ditambah Rp3.000 per fitur premium. Jika total biaya Rp30.000, banyak fitur premium adalah...",
                answers: ["4", "5", "6", "7"],
                correct: 2,
                note: "Modelnya 12.000 + 3.000x = 30.000, maka 3.000x = 18.000 dan x = 6."
            },
            {
                topic: "Matematika - Peluang",
                level: "Sedang",
                time: "95 detik",
                q: "Dalam kotak ada 4 kartu merah, 3 biru, dan 5 hijau. Peluang mengambil kartu biru adalah...",
                answers: ["1/4", "3/12", "5/12", "7/12"],
                correct: 1,
                note: "Total kartu 12, kartu biru 3. Peluangnya 3/12 atau 1/4; opsi yang tersedia adalah 3/12."
            },
            {
                topic: "Matematika - Rasio data",
                level: "HOTS",
                time: "110 detik",
                q: "Rasio siswa yang lulus simulasi dan belum lulus adalah 7:5. Jika 18 siswa belum lulus, perkiraan jumlah siswa yang lulus adalah...",
                answers: ["21", "24", "25", "28"],
                correct: 2,
                note: "Satu bagian = 18/5 = 3,6. Yang lulus 7 bagian = 25,2, sehingga perkiraan terdekat 25."
            }
        ],
        inggris: [
            {
                topic: "Bahasa Inggris - Main idea",
                level: "Dasar",
                time: "80 detik",
                q: "A paragraph says: Online learning is flexible, but students need discipline to avoid distractions. The main idea is...",
                answers: ["Online learning has no benefits", "Discipline is needed in flexible online learning", "Students never get distracted", "Offline classes are always better"],
                correct: 1,
                note: "Kalimat menyeimbangkan fleksibilitas dan kebutuhan disiplin. Main idea terbaik memuat dua unsur itu."
            },
            {
                topic: "Bahasa Inggris - Inference",
                level: "Sedang",
                time: "95 detik",
                q: "Text: Rina submitted the report two days early and asked for feedback. What can be inferred?",
                answers: ["Rina ignored the assignment", "Rina was proactive", "The report was rejected", "The teacher was absent"],
                correct: 1,
                note: "Mengumpulkan lebih awal dan meminta feedback menunjukkan sikap proaktif."
            },
            {
                topic: "Bahasa Inggris - Vocabulary in context",
                level: "HOTS",
                time: "100 detik",
                q: "In the sentence 'The evidence was compelling,' the word 'compelling' is closest in meaning to...",
                answers: ["Confusing", "Convincing", "Ordinary", "Hidden"],
                correct: 1,
                note: "Compelling berarti sangat meyakinkan atau kuat untuk dipercaya."
            }
        ],
        pilihan: [
            {
                topic: "Mapel Pilihan - Sains",
                level: "Sedang",
                time: "100 detik",
                q: "Dalam percobaan, tanaman A diberi cahaya cukup dan tanaman B disimpan gelap. Variabel bebas percobaan tersebut adalah...",
                answers: ["Jenis tanaman", "Jumlah daun", "Paparan cahaya", "Tinggi akhir tanaman"],
                correct: 2,
                note: "Variabel bebas adalah faktor yang sengaja diubah peneliti, yaitu paparan cahaya."
            },
            {
                topic: "Mapel Pilihan - Sosial",
                level: "Sedang",
                time: "95 detik",
                q: "Ketika harga barang naik dan jumlah yang diminta turun, konsep ekonomi yang sedang ditunjukkan adalah...",
                answers: ["Hukum permintaan", "Inflasi biaya", "Kelangkaan mutlak", "Mobilitas sosial"],
                correct: 0,
                note: "Hukum permintaan menyatakan harga dan jumlah diminta bergerak berlawanan, ceteris paribus."
            },
            {
                topic: "Mapel Pilihan - Analisis data",
                level: "HOTS",
                time: "110 detik",
                q: "Data menunjukkan peningkatan suhu kota sejalan dengan berkurangnya ruang hijau. Pernyataan paling hati-hati adalah...",
                answers: ["Ruang hijau pasti satu-satunya penyebab suhu naik", "Ada hubungan yang perlu diuji lebih lanjut", "Suhu tidak terkait lingkungan", "Semua kota punya suhu sama"],
                correct: 1,
                note: "Data korelasi belum otomatis membuktikan sebab tunggal. Jawaban hati-hati menyebut hubungan dan perlunya uji lanjutan."
            }
        ]
    };

    function updateStats() {
        const done = Number(stats.done) || 0;
        const correct = Number(stats.correct) || 0;
        const accuracy = done > 0 ? Math.round((correct / done) * 100) : 0;
        document.getElementById("snbtDone").textContent = done;
        document.getElementById("snbtAccuracy").textContent = `${accuracy}%`;
        document.getElementById("snbtLevel").textContent = accuracy >= 80 ? "Siap" : accuracy >= 60 ? "Stabil" : accuracy >= 40 ? "Naik" : "Fondasi";
        ring.style.setProperty("--progress", `${Math.min(accuracy, 100)}%`);
        ringText.textContent = `${accuracy}%`;
        stats.done = done;
        stats.correct = correct;
        storage.set("snbt_stats", stats);
        renderDiagnostic(accuracy);
    }

    function buildPlan() {
        const target = Number(targetInput.value || 75);
        const weeks = Number(weeksInput.value || 6);
        const focus = focusSelect.value;
        const electivePair = `${firstElective.value} + ${secondElective.value}`;
        const intensity = target >= 85 ? "intensif" : target >= 70 ? "stabil" : "fondasi";
        const firstEnd = Math.max(1, Math.ceil(weeks / 3));
        const secondStart = firstEnd + 1;
        const secondEnd = Math.ceil((weeks * 2) / 3);
        const thirdStart = secondEnd + 1;
        const items = [
            [`Minggu 1-${firstEnd}`, `Bangun fondasi ${focus}: 15 soal konsep, 5 soal HOTS, dan ringkasan salah setiap hari.`],
            [`Minggu ${secondStart}-${secondEnd}`, `Seimbangkan mapel wajib dengan pilihan ${electivePair}. Pakai pola 3 sesi wajib dan 2 sesi pilihan per pekan.`],
            [`Minggu ${thirdStart}-${weeks}`, `Masuk simulasi level ${intensity}: batas waktu, review pembahasan, dan ulang soal yang salah setelah 48 jam.`]
        ];
        planList.innerHTML = items.map(([title, body]) => `
            <div class="plan-item">
                <div><strong>${title}</strong><span class="muted">${body}</span></div>
                <span class="mini-tag">Target ${target}</span>
            </div>
        `).join("");
        showToast("Rencana TKA diperbarui.");
    }

    function renderDiagnostic(accuracy) {
        if (!diagnostic) return;
        const subjectRows = Object.entries(stats.bySubject || {}).map(([subject, data]) => {
            const sDone = Number(data.done) || 0;
            const sCorrect = Number(data.correct) || 0;
            const subjectAccuracy = sDone > 0 ? Math.round((sCorrect / sDone) * 100) : 0;
            const label = {
                indonesia: "Bahasa Indonesia",
                matematika: "Matematika",
                inggris: "Bahasa Inggris",
                pilihan: "Mapel Pilihan"
            }[subject];
            return `<div class="diagnostic-row"><span>${label}</span><strong>${subjectAccuracy}%</strong></div>`;
        }).join("");
        const recommendation = accuracy >= 80
            ? "Naikkan porsi simulasi waktu dan campur soal HOTS lintas mapel."
            : accuracy >= 60
                ? "Pertahankan ritme, lalu tambah review kesalahan untuk mapel dengan akurasi terendah."
                : "Kembali ke konsep inti, kerjakan paket pendek, dan tulis alasan setiap jawaban salah.";
        diagnostic.innerHTML = `
            <p class="muted">${recommendation}</p>
            <div class="diagnostic-list">
                ${subjectRows || `<div class="diagnostic-row"><span>Belum ada data latihan</span><strong>0%</strong></div>`}
            </div>
        `;
    }

    function renderQuestion(subject) {
        activeSubject = subject;
        const subjectQuestions = questions[subject] || questions.indonesia;
        const item = subjectQuestions[activeQuestionIndex % subjectQuestions.length];
        questionMeta.innerHTML = `
            <span>${item.topic}</span>
            <span>${item.level}</span>
            <span>${item.time}</span>
        `;
        questionText.textContent = item.q;
        feedback.textContent = "Pilih jawaban untuk melihat pembahasan singkat.";
        answerGrid.innerHTML = item.answers.map((answer, index) => (
            `<button class="answer-choice answer-btn" data-answer="${index}">${answer}</button>`
        )).join("");
        answerGrid.querySelectorAll(".answer-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const chosen = Number(btn.dataset.answer);
                stats.done += 1;
                stats.bySubject[subject] = stats.bySubject[subject] || { done: 0, correct: 0 };
                stats.bySubject[subject].done += 1;
                if (chosen === item.correct) {
                    stats.correct += 1;
                    stats.bySubject[subject].correct += 1;
                    btn.classList.add("correct");
                    feedback.textContent = `Benar. ${item.note}`;
                } else {
                    btn.classList.add("wrong");
                    answerGrid.querySelector(`[data-answer="${item.correct}"]`).classList.add("correct");
                    feedback.textContent = `Belum tepat. ${item.note}`;
                }
                answerGrid.querySelectorAll("button").forEach(button => button.disabled = true);
                updateStats();
            });
        });
    }

    subjectButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            subjectButtons.forEach(item => item.classList.remove("active"));
            btn.classList.add("active");
            activeQuestionIndex = 0;
            renderQuestion(btn.dataset.snbtSubject);
        });
    });

    nextButton.addEventListener("click", () => {
        activeQuestionIndex += 1;
        renderQuestion(activeSubject);
    });

    checklistInputs.forEach(input => {
        input.checked = Boolean(checklist[input.dataset.tkaCheck]);
        input.addEventListener("change", () => {
            checklist[input.dataset.tkaCheck] = input.checked;
            storage.set("tka_checklist", checklist);
            showToast(input.checked ? "Checklist TKA ditandai." : "Checklist TKA diperbarui.");
        });
    });

    [targetInput, weeksInput, focusSelect, firstElective, secondElective].forEach(input => {
        input.addEventListener("change", buildPlan);
    });
    document.getElementById("buildTKAPlan").addEventListener("click", buildPlan);
    buildPlan();
    renderQuestion("indonesia");
    updateStats();
}

function initTKALMSPage() {
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
                button.classList.add("active");
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

function initLibraryPage() {
    const resources = [
        { id: "js-basic", title: "Dasar JavaScript", type: "Modul", topic: "Programming", time: "18 menit" },
        { id: "sql-join", title: "SQL Join Visual", type: "Cheatsheet", topic: "Database", time: "10 menit" },
        { id: "ui-heuristic", title: "Checklist UI/UX", type: "Checklist", topic: "Design", time: "8 menit" },
        { id: "analytics-kpi", title: "KPI dan Funnel", type: "Ringkasan", topic: "Analytics", time: "12 menit" },
        { id: "web-semantic", title: "Semantic HTML", type: "Modul", topic: "Web", time: "15 menit" },
        { id: "flash-snbt", title: "Flashcard TKA", type: "Flashcard", topic: "TKA", time: "20 kartu" }
    ];
    const searchInput = document.getElementById("librarySearch");
    const filterButtons = document.querySelectorAll("[data-library-filter]");
    const grid = document.getElementById("resourceGrid");
    const savedList = document.getElementById("savedList");
    const noteInput = document.getElementById("libraryNote");
    const saved = storage.get("library_saved", []);
    let activeFilter = "all";

    function renderSaved() {
        const items = saved.map(id => resources.find(item => item.id === id)).filter(Boolean);
        savedList.innerHTML = items.map(item => `
            <div class="saved-item">
                <div><strong>${item.title}</strong><span class="muted">${item.type} - ${item.topic}</span></div>
                <span class="mini-tag">${item.time}</span>
            </div>
        `).join("") || `<div class="saved-item"><div><strong>Belum ada simpanan</strong><span class="muted">Tekan tombol simpan pada materi yang ingin kamu baca lagi.</span></div></div>`;
    }

    function renderResources() {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = resources.filter(item => {
            const matchFilter = activeFilter === "all" || item.topic.toLowerCase() === activeFilter;
            const matchSearch = `${item.title} ${item.type} ${item.topic}`.toLowerCase().includes(query);
            return matchFilter && matchSearch;
        });
        grid.innerHTML = filtered.map(item => {
            const isSaved = saved.includes(item.id);
            return `
                <article class="resource-card">
                    <div class="resource-meta"><span>${item.type}</span><span>${item.time}</span></div>
                    <h3>${item.title}</h3>
                    <p class="muted">Materi ${item.topic} untuk sesi belajar cepat dan review sebelum quiz.</p>
                    <button class="save-btn" data-save="${item.id}">${isSaved ? "Tersimpan" : "Simpan ke Library"}</button>
                </article>
            `;
        }).join("") || `<div class="card"><h3>Materi tidak ditemukan</h3><p>Coba kata kunci atau filter lain.</p></div>`;

        grid.querySelectorAll("[data-save]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.save;
                const index = saved.indexOf(id);
                if (index >= 0) {
                    saved.splice(index, 1);
                    showToast("Materi dihapus dari Library.");
                } else {
                    saved.push(id);
                    showToast("Materi disimpan ke Library.");
                }
                storage.set("library_saved", saved);
                renderResources();
                renderSaved();
            });
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(item => item.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.dataset.libraryFilter;
            renderResources();
        });
    });
    searchInput.addEventListener("input", renderResources);
    document.getElementById("saveLibraryNote").addEventListener("click", () => {
        storage.set("library_note", noteInput.value.trim());
        showToast("Catatan belajar tersimpan.");
    });

    noteInput.value = storage.get("library_note", "");
    renderResources();
    renderSaved();
}

function initBahasaPage() {
    const regions = ["Semua", "Sumatra", "Jawa", "Kalimantan", "Sulawesi", "Bali-Nusa", "Papua Raya", "Maluku"];
    const places = [
        {
            id: "jawa",
            label: "Jawa",
            region: "Jawa",
            mark: "JW",
            summary: "Ragam Jawa dikenal dengan unggah-ungguh, seni gamelan, batik, wayang, dan tradisi keraton yang kuat.",
            cards: [["Sugeng enjing", "Selamat pagi", "Sapaan pagi yang sopan."], ["Matur nuwun", "Terima kasih", "Ungkapan apresiasi."], ["Piye kabare?", "Apa kabar?", "Sapaan santai untuk teman sebaya."]],
            phrases: [["Kulo badhe sinau.", "Saya ingin belajar."], ["Nyuwun pangapunten.", "Mohon maaf."], ["Sampun dhahar?", "Sudah makan?"]],
            destination: ["Yogyakarta", "Kota budaya dengan keraton, Malioboro, candi, dan ruang kreatif anak muda."],
            food: ["Gudeg", "Olahan nangka muda bercita rasa manis gurih yang identik dengan Yogyakarta."],
            tradition: ["Wayang Kulit", "Pertunjukan bayangan dengan dalang, gamelan, dan cerita penuh nilai moral."],
            fact: "Bahasa Jawa punya tingkatan tutur seperti ngoko dan krama untuk menunjukkan sopan santun.",
            quiz: { q: "Tradisi pertunjukan bayangan khas Jawa disebut...", answers: ["Wayang Kulit", "Tari Piring", "Karapan Sapi", "Ma'nene"], correct: 0 }
        },
        {
            id: "sunda",
            label: "Sunda",
            region: "Jawa",
            mark: "SD",
            summary: "Budaya Sunda dekat dengan alam pegunungan, keramahan, angklung, dan kuliner segar.",
            cards: [["Wilujeng enjing", "Selamat pagi", "Sapaan pagi yang sopan."], ["Hatur nuhun", "Terima kasih", "Ungkapan apresiasi."], ["Kumaha damang?", "Apa kabar?", "Sapaan umum dalam percakapan."]],
            phrases: [["Abdi hoyong diajar.", "Saya ingin belajar."], ["Punten.", "Permisi atau maaf."], ["Wilujeng sumping.", "Selamat datang."]],
            destination: ["Bandung", "Kota kreatif dengan udara sejuk, museum, kuliner, dan lanskap pegunungan."],
            food: ["Seblak", "Makanan pedas gurih berbahan kerupuk basah dengan bumbu kencur."],
            tradition: ["Angklung", "Alat musik bambu yang dimainkan bersama untuk membentuk harmoni."],
            fact: "Angklung dikenal sebagai simbol kolaborasi karena satu pemain biasanya memegang satu atau beberapa nada.",
            quiz: { q: "Alat musik bambu khas Sunda yang dimainkan dengan digoyangkan adalah...", answers: ["Angklung", "Sasando", "Tifa", "Kolintang"], correct: 0 }
        },
        {
            id: "bali",
            label: "Bali",
            region: "Bali-Nusa",
            mark: "BL",
            summary: "Bali memadukan ritual, seni tari, arsitektur pura, pantai, dan kehidupan komunal yang kuat.",
            cards: [["Rahajeng semeng", "Selamat pagi", "Sapaan pagi."], ["Suksma", "Terima kasih", "Ucapan terima kasih."], ["Kenken kabare?", "Apa kabar?", "Sapaan santai."]],
            phrases: [["Tiang melajah.", "Saya belajar."], ["Ampura.", "Maaf."], ["Rahajeng rauh.", "Selamat datang."]],
            destination: ["Ubud", "Pusat seni, sawah terasering, galeri, dan suasana budaya Bali yang tenang."],
            food: ["Ayam Betutu", "Ayam berbumbu rempah yang dimasak perlahan hingga meresap."],
            tradition: ["Tari Kecak", "Pertunjukan tari dan vokal ritmis yang sering mengangkat kisah Ramayana."],
            fact: "Banyak kegiatan adat Bali terhubung dengan konsep harmoni manusia, alam, dan spiritualitas.",
            quiz: { q: "Pertunjukan Bali yang terkenal dengan suara ritmis 'cak' adalah...", answers: ["Tari Kecak", "Tari Saman", "Tari Jaipong", "Tari Tor-Tor"], correct: 0 }
        },
        {
            id: "minang",
            label: "Minang",
            region: "Sumatra",
            mark: "MN",
            summary: "Minangkabau dikenal dengan rumah gadang, tradisi merantau, sistem matrilineal, dan kuliner kaya rempah.",
            cards: [["Salamaik pagi", "Selamat pagi", "Sapaan pagi."], ["Tarimo kasih", "Terima kasih", "Ungkapan terima kasih."], ["Apo kaba?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Ambo nio baraja.", "Saya ingin belajar."], ["Maaf yo.", "Mohon maaf."], ["Dima tampeknyo?", "Di mana tempatnya?"]],
            destination: ["Bukittinggi", "Kota sejuk dengan Jam Gadang, Ngarai Sianok, dan jejak sejarah."],
            food: ["Rendang", "Daging berbumbu santan dan rempah yang dimasak lama hingga pekat."],
            tradition: ["Rumah Gadang", "Rumah adat beratap gonjong yang menjadi simbol Minangkabau."],
            fact: "Budaya Minang dikenal dengan pepatah adat basandi syarak, syarak basandi Kitabullah.",
            quiz: { q: "Rumah adat Minangkabau yang beratap gonjong disebut...", answers: ["Rumah Gadang", "Tongkonan", "Honai", "Joglo"], correct: 0 }
        },
        {
            id: "batak",
            label: "Batak",
            region: "Sumatra",
            mark: "BT",
            summary: "Budaya Batak kuat dengan marga, musik gondang, ulos, dan kawasan Danau Toba yang ikonik.",
            cards: [["Horas", "Salam sejahtera", "Sapaan khas Batak."], ["Mauliate", "Terima kasih", "Ucapan terima kasih."], ["Boha kabar?", "Apa kabar?", "Sapaan santai."]],
            phrases: [["Au marsiajar.", "Saya belajar."], ["Sai horas ma.", "Semoga sehat selalu."], ["Tudia ho?", "Ke mana kamu?"]],
            destination: ["Danau Toba", "Danau vulkanik besar dengan Pulau Samosir dan lanskap pegunungan."],
            food: ["Arsik", "Ikan berbumbu kuning khas Batak dengan cita rasa rempah kuat."],
            tradition: ["Ulos", "Kain tradisional yang dipakai dalam upacara adat dan simbol doa restu."],
            fact: "Marga dalam budaya Batak membantu menunjukkan garis keturunan dan hubungan sosial.",
            quiz: { q: "Kain tradisional penting dalam adat Batak adalah...", answers: ["Ulos", "Songket", "Batik", "Endek"], correct: 0 }
        },
        {
            id: "aceh",
            label: "Aceh",
            region: "Sumatra",
            mark: "AC",
            summary: "Aceh dikenal sebagai Serambi Mekkah, dengan tari Saman, kopi Gayo, dan sejarah maritim kuat.",
            cards: [["Seulamat beungoh", "Selamat pagi", "Sapaan pagi."], ["Teurimong geunaseh", "Terima kasih", "Ungkapan apresiasi."], ["Pakon haba?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Lon jak meujak.", "Saya pergi belajar."], ["Peue haba?", "Ada kabar apa?"], ["Seulamat datang.", "Selamat datang."]],
            destination: ["Banda Aceh", "Kota bersejarah dengan Masjid Raya Baiturrahman dan museum tsunami."],
            food: ["Mie Aceh", "Mie berbumbu kari rempah dengan rasa kuat dan hangat."],
            tradition: ["Tari Saman", "Tari duduk yang menonjolkan kekompakan, ritme, dan syair."],
            fact: "Tari Saman sering disebut tari seribu tangan karena gerakannya cepat dan kompak.",
            quiz: { q: "Tari Aceh yang terkenal dengan gerakan cepat dan kompak adalah...", answers: ["Tari Saman", "Tari Kecak", "Tari Pendet", "Tari Pakarena"], correct: 0 }
        },
        {
            id: "betawi",
            label: "Betawi",
            region: "Jawa",
            mark: "BW",
            summary: "Betawi tumbuh dari pertemuan banyak budaya di Jakarta, terlihat pada lenong, ondel-ondel, dan kuliner kota.",
            cards: [["Selamet pagi", "Selamat pagi", "Sapaan pagi."], ["Makasih", "Terima kasih", "Ungkapan sehari-hari."], ["Apa kabar, lu?", "Apa kabar?", "Sapaan santai."]],
            phrases: [["Gue mau belajar.", "Saya ingin belajar."], ["Permisi ye.", "Permisi ya."], ["Mampir dulu.", "Singgah sebentar."]],
            destination: ["Kota Tua Jakarta", "Kawasan bersejarah dengan museum, arsitektur kolonial, dan ruang publik."],
            food: ["Kerak Telor", "Makanan khas berbahan ketan, telur, ebi, dan serundeng."],
            tradition: ["Ondel-ondel", "Boneka besar ikon Betawi yang hadir dalam perayaan rakyat."],
            fact: "Budaya Betawi menyerap pengaruh Melayu, Arab, Tionghoa, Portugis, dan berbagai etnis Nusantara.",
            quiz: { q: "Ikon boneka besar khas Betawi disebut...", answers: ["Ondel-ondel", "Ogoh-ogoh", "Sigale-gale", "Barong"], correct: 0 }
        },
        {
            id: "dayak",
            label: "Dayak",
            region: "Kalimantan",
            mark: "DY",
            summary: "Ragam Dayak kaya dengan rumah panjang, seni ukir, manik-manik, hutan tropis, dan tradisi komunal.",
            cards: [["Selamat dauh", "Selamat pagi", "Sapaan sederhana."], ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Aku belajar budaya.", "Saya belajar budaya."], ["Mari menjaga hutan.", "Ajakan merawat alam."], ["Salam damai.", "Sapaan hangat."]],
            destination: ["Tanjung Puting", "Kawasan konservasi orangutan dan ekosistem hutan Kalimantan."],
            food: ["Juhu Singkah", "Olahan umbut rotan khas Kalimantan dengan rasa unik."],
            tradition: ["Rumah Betang", "Rumah panjang yang mencerminkan kehidupan komunal masyarakat Dayak."],
            fact: "Banyak motif Dayak terinspirasi dari alam, leluhur, dan simbol perlindungan.",
            quiz: { q: "Rumah panjang khas banyak komunitas Dayak dikenal sebagai...", answers: ["Rumah Betang", "Rumah Gadang", "Joglo", "Honai"], correct: 0 }
        },
        {
            id: "banjar",
            label: "Banjar",
            region: "Kalimantan",
            mark: "BJ",
            summary: "Banjar dekat dengan budaya sungai, pasar terapung, sasirangan, dan kuliner berkuah hangat.",
            cards: [["Salamat pagi", "Selamat pagi", "Sapaan pagi."], ["Tarima kasih", "Terima kasih", "Ucapan terima kasih."], ["Apa habar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Ulun handak belajar.", "Saya ingin belajar."], ["Pian sehat?", "Anda sehat?"], ["Ayo bajalan.", "Ayo berjalan."]],
            destination: ["Pasar Terapung", "Aktivitas jual beli di atas perahu yang menjadi ikon Kalimantan Selatan."],
            food: ["Soto Banjar", "Soto berempah dengan kuah bening dan aroma khas."],
            tradition: ["Sasirangan", "Kain tradisional Banjar dengan motif dan warna khas."],
            fact: "Budaya Banjar sangat dipengaruhi kehidupan sungai sebagai jalur ekonomi dan sosial.",
            quiz: { q: "Kain tradisional khas Banjar disebut...", answers: ["Sasirangan", "Ulos", "Endek", "Tapis"], correct: 0 }
        },
        {
            id: "bugis",
            label: "Bugis",
            region: "Sulawesi",
            mark: "BG",
            summary: "Bugis dikenal sebagai pelaut ulung, pembuat kapal pinisi, dan penjaga tradisi siri' na pacce.",
            cards: [["Mappadeceng", "Semoga baik", "Sapaan bernuansa doa."], ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Aga kareba?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Iyya melo belajar.", "Saya ingin belajar."], ["Salama ki.", "Semoga selamat."], ["Kareba madeceng.", "Kabar baik."]],
            destination: ["Bulukumba", "Daerah yang dikenal dengan pembuatan kapal pinisi dan pantai indah."],
            food: ["Coto Makassar", "Hidangan berkuah kaya rempah yang populer di Sulawesi Selatan."],
            tradition: ["Kapal Pinisi", "Warisan kapal layar tradisional yang menunjukkan keahlian maritim Bugis-Makassar."],
            fact: "Pinisi adalah simbol ketangguhan pelaut Nusantara dan keterampilan pembuatan kapal tradisional.",
            quiz: { q: "Kapal layar tradisional yang lekat dengan Bugis-Makassar adalah...", answers: ["Pinisi", "Jukung", "Kora-kora", "Sampan"], correct: 0 }
        },
        {
            id: "madura",
            label: "Madura",
            region: "Jawa",
            mark: "MD",
            summary: "Madura dikenal dengan karapan sapi, garam, batik pesisir, dan kuliner sate yang kuat rasa.",
            cards: [["Salamet lagghu", "Selamat pagi", "Sapaan pagi."], ["Mator sakalangkong", "Terima kasih", "Ungkapan terima kasih."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Sengko' ajar.", "Saya belajar."], ["Pangapora.", "Maaf."], ["Dha' remma?", "Ke mana?"]],
            destination: ["Sumenep", "Kawasan dengan keraton, masjid tua, dan pantai-pantai Madura."],
            food: ["Sate Madura", "Sate berbumbu kacang yang terkenal di banyak kota Indonesia."],
            tradition: ["Karapan Sapi", "Lomba pacuan sapi yang menjadi identitas budaya Madura."],
            fact: "Karapan Sapi bukan hanya lomba, tetapi juga perayaan sosial dan kebanggaan komunitas.",
            quiz: { q: "Pacuan sapi khas Madura disebut...", answers: ["Karapan Sapi", "Pacu Jawi", "Makepung", "Pasola"], correct: 0 }
        },
        {
            id: "papua-provinsi",
            label: "Papua",
            region: "Papua Raya",
            mark: "PA",
            summary: "Provinsi Papua kini berpusat di wilayah utara dan timur, dengan Jayapura, Danau Sentani, tifa, noken, dan bahasa-bahasa pesisir yang beragam.",
            cards: [["Wa wa", "Salam hangat", "Sapaan ramah yang sering diasosiasikan dengan suasana Papua."], ["Mace", "Ibu atau perempuan dewasa", "Panggilan akrab dalam percakapan Papua."], ["Pace", "Bapak atau laki-laki dewasa", "Panggilan akrab sehari-hari."]],
            phrases: [["Saya mau belajar budaya Papua.", "Niat belajar budaya lokal."], ["Mari jaga Danau Sentani.", "Ajakan merawat alam."], ["Kitorang bersaudara.", "Ungkapan kebersamaan."], ["Terima kasih banyak.", "Ungkapan apresiasi."]],
            destination: ["Danau Sentani", "Danau luas dekat Jayapura yang dikenal dengan pulau-pulau kecil, festival budaya, dan lanskap perbukitan."],
            food: ["Papeda", "Olahan sagu bertekstur kenyal yang sering disantap dengan ikan kuah kuning."],
            tradition: ["Festival Danau Sentani", "Perayaan budaya yang menampilkan tari, musik, perahu, dan keragaman masyarakat sekitar danau."],
            fact: "Setelah pemekaran 2022, Provinsi Papua tetap menjadi pintu penting untuk mengenal budaya pesisir utara Tanah Papua.",
            quiz: { q: "Destinasi dan festival budaya yang lekat dengan Provinsi Papua adalah...", answers: ["Danau Sentani", "Jam Gadang", "Tana Toraja", "Pulau Penyengat"], correct: 0 }
        },
        {
            id: "papua-barat",
            label: "Papua Barat",
            region: "Papua Raya",
            mark: "PB",
            summary: "Papua Barat dikenal dengan Manokwari, Pegunungan Arfak, Teluk Cenderawasih, tradisi pesisir, dan lanskap hutan pegunungan.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum lintas komunitas."], ["Kitorang", "Kita atau kami", "Kata sehari-hari dalam Melayu Papua."], ["Sa senang belajar", "Saya senang belajar", "Kalimat sederhana untuk latihan."]],
            phrases: [["Kitorang jaga hutan.", "Kami menjaga hutan."], ["Sa mau lihat Pegunungan Arfak.", "Saya ingin melihat Pegunungan Arfak."], ["Mari belajar dari masyarakat lokal.", "Ajakan menghargai pengetahuan setempat."]],
            destination: ["Pegunungan Arfak", "Kawasan pegunungan dekat Manokwari dengan danau, burung endemik, dan komunitas adat yang kuat."],
            food: ["Ikan Bakar Manokwari", "Ikan bakar dengan sambal khas yang kuat dan segar."],
            tradition: ["Rumah Kaki Seribu", "Rumah tradisional suku Arfak dengan banyak tiang penyangga sebagai ciri arsitektur."],
            fact: "Papua Barat memiliki kekayaan ekologi dari pesisir Teluk Cenderawasih sampai dataran tinggi Arfak.",
            quiz: { q: "Rumah tradisional suku Arfak di Papua Barat dikenal sebagai...", answers: ["Rumah Kaki Seribu", "Rumah Gadang", "Joglo", "Tongkonan"], correct: 0 }
        },
        {
            id: "papua-selatan",
            label: "Papua Selatan",
            region: "Papua Raya",
            mark: "PS",
            summary: "Papua Selatan meliputi kawasan Merauke dan sekitarnya, dikenal dengan budaya Marind, rawa, savana, sagu, dan Taman Nasional Wasur.",
            cards: [["Izakod bekai izakod kai", "Satu hati satu tujuan", "Semboyan yang sering dilekatkan dengan Merauke."], ["Sagu", "Pangan pokok", "Bahan makanan penting di banyak komunitas Papua."], ["Amai", "Sapaan hangat", "Contoh sapaan sederhana untuk latihan."]],
            phrases: [["Saya mau belajar tentang Merauke.", "Niat belajar daerah selatan Papua."], ["Mari jaga rawa dan savana.", "Ajakan menjaga ekosistem."], ["Sagu penting untuk hidup.", "Kalimat tentang pangan lokal."]],
            destination: ["Taman Nasional Wasur", "Kawasan rawa, savana, dan keanekaragaman hayati di sekitar Merauke."],
            food: ["Sagu Sep", "Olahan sagu bakar khas Merauke yang dekat dengan kehidupan masyarakat setempat."],
            tradition: ["Budaya Marind", "Tradisi masyarakat Marind yang kuat dengan identitas klan, alam, dan cerita leluhur."],
            fact: "Papua Selatan adalah salah satu provinsi baru yang diresmikan pada 2022 berdasarkan UU Nomor 14 Tahun 2022.",
            quiz: { q: "Provinsi Papua Selatan berpusat kuat pada kawasan budaya dan alam di sekitar...", answers: ["Merauke", "Bandung", "Banjarmasin", "Bukittinggi"], correct: 0 }
        },
        {
            id: "papua-tengah",
            label: "Papua Tengah",
            region: "Papua Raya",
            mark: "PT",
            summary: "Papua Tengah memiliki Nabire, Mimika, Paniai, dan wilayah pegunungan-danau yang kaya budaya Mee, Amungme, Kamoro, dan komunitas lain.",
            cards: [["Amapane", "Terima kasih", "Ungkapan apresiasi dalam salah satu konteks lokal Papua Tengah."], ["Danau", "Danau", "Kata kunci lanskap Paniai."], ["Sa belajar pelan-pelan", "Saya belajar pelan-pelan", "Kalimat latihan."]],
            phrases: [["Saya mau kenal budaya Mee.", "Niat mengenal budaya lokal."], ["Danau Paniai indah.", "Kalimat tentang destinasi."], ["Kitorang hormati adat.", "Kami menghormati adat."]],
            destination: ["Danau Paniai", "Danau dataran tinggi yang menjadi ruang hidup, perikanan, dan identitas masyarakat sekitar."],
            food: ["Udang Selingkuh", "Kuliner air tawar populer di kawasan pegunungan Papua."],
            tradition: ["Noken", "Tas rajut multifungsi yang juga menjadi simbol identitas, kerja, dan kehidupan sosial."],
            fact: "Papua Tengah dibentuk melalui UU Nomor 15 Tahun 2022, dengan Nabire sebagai ibu kota provinsi.",
            quiz: { q: "Ibu kota Provinsi Papua Tengah berada di...", answers: ["Nabire", "Sorong", "Denpasar", "Medan"], correct: 0 }
        },
        {
            id: "papua-pegunungan",
            label: "Papua Pegunungan",
            region: "Papua Raya",
            mark: "PG",
            summary: "Papua Pegunungan adalah provinsi dataran tinggi dengan Wamena, Lembah Baliem, honai, mumi adat, dan kebun-kebun pegunungan.",
            cards: [["Wamena", "Kota di Lembah Baliem", "Pintu masuk penting kawasan pegunungan."], ["Honai", "Rumah adat", "Rumah bundar khas masyarakat pegunungan."], ["Apen", "Ubi", "Contoh pangan penting di dataran tinggi."]],
            phrases: [["Saya mau belajar tentang honai.", "Niat belajar arsitektur lokal."], ["Lembah Baliem luas.", "Kalimat tentang destinasi."], ["Mari hormati kepala suku.", "Ajakan menghargai struktur adat."]],
            destination: ["Lembah Baliem", "Lembah dataran tinggi yang dikenal dengan festival budaya, honai, kebun, dan panorama pegunungan."],
            food: ["Ubi Bakar Batu", "Ubi dan bahan pangan lokal yang dimasak dalam tradisi bakar batu."],
            tradition: ["Bakar Batu", "Tradisi memasak komunal dengan batu panas untuk merayakan kebersamaan dan momen adat."],
            fact: "Papua Pegunungan dibentuk melalui UU Nomor 16 Tahun 2022 dan menjadi provinsi yang seluruh wilayahnya berada di pedalaman pegunungan.",
            quiz: { q: "Rumah adat yang lekat dengan Papua Pegunungan disebut...", answers: ["Honai", "Baileo", "Rumah Gadang", "Lamin"], correct: 0 }
        },
        {
            id: "papua-barat-daya",
            label: "Papua Barat Daya",
            region: "Papua Raya",
            mark: "BD",
            summary: "Papua Barat Daya berpusat di Sorong dan mencakup Raja Ampat, dengan budaya pesisir, pulau karang, sasi laut, dan jalur maritim.",
            cards: [["Sorong", "Kota gerbang Raja Ampat", "Kata kunci wilayah Papua Barat Daya."], ["Sasi", "Aturan adat menjaga alam", "Praktik konservasi lokal di wilayah timur Indonesia."], ["Kitorang jaga laut", "Kami menjaga laut", "Kalimat latihan."]],
            phrases: [["Saya mau ke Raja Ampat.", "Niat perjalanan budaya dan alam."], ["Sasi menjaga laut.", "Kalimat tentang tradisi konservasi."], ["Terumbu karang harus dijaga.", "Ajakan menjaga ekosistem."]],
            destination: ["Raja Ampat", "Kepulauan dengan laut jernih, karang, dan biodiversitas tinggi."],
            food: ["Ikan Kuah Kuning", "Olahan ikan berbumbu kunyit yang sering disantap dengan papeda."],
            tradition: ["Sasi Laut", "Aturan adat untuk mengatur waktu pemanfaatan sumber daya laut agar tetap lestari."],
            fact: "Papua Barat Daya menjadi provinsi ke-38 Indonesia melalui UU Nomor 29 Tahun 2022.",
            quiz: { q: "Provinsi Papua Barat Daya dikenal sebagai gerbang menuju...", answers: ["Raja Ampat", "Malioboro", "Danau Toba", "Kota Tua"], correct: 0 }
        },
        {
            id: "sasak",
            label: "Sasak",
            region: "Bali-Nusa",
            mark: "SK",
            summary: "Sasak di Lombok dikenal dengan desa adat, tenun, lumbung, pantai, dan tradisi yang dekat dengan ritme agraris.",
            cards: [["Selamat semeton", "Salam saudara", "Sapaan bernuansa persaudaraan."], ["Matur tampiasih", "Terima kasih", "Ungkapan apresiasi."], ["Napi kabar?", "Apa kabar?", "Sapaan umum."], ["Titiang mele belajar", "Saya ingin belajar", "Niat belajar sederhana."]],
            phrases: [["Ayo melajah budaya.", "Mari belajar budaya."], ["Ampure.", "Maaf atau permisi."], ["Silaq mampir.", "Silakan singgah."]],
            destination: ["Desa Sade", "Desa adat Sasak dengan rumah tradisional, tenun, dan pola hidup komunal."],
            food: ["Ayam Taliwang", "Ayam berbumbu pedas gurih yang menjadi ikon kuliner Lombok."],
            tradition: ["Bau Nyale", "Tradisi menangkap cacing laut yang terhubung dengan legenda Putri Mandalika."],
            fact: "Tradisi Bau Nyale memadukan cerita rakyat, kalender alam, dan perayaan komunitas pesisir.",
            quiz: { q: "Tradisi Lombok yang berkaitan dengan legenda Putri Mandalika adalah...", answers: ["Bau Nyale", "Sekaten", "Tabuik", "Pasola"], correct: 0 }
        },
        {
            id: "toraja",
            label: "Toraja",
            region: "Sulawesi",
            mark: "TJ",
            summary: "Toraja memiliki arsitektur tongkonan, ukiran, upacara adat, kopi, dan lanskap dataran tinggi yang khas.",
            cards: [["Melo tongan", "Baik sekali", "Ungkapan positif."], ["Kurre sumanga'", "Terima kasih", "Ucapan syukur atau terima kasih."], ["Umba susi kabar?", "Bagaimana kabar?", "Sapaan umum."], ["Tabe'", "Permisi", "Sapaan sopan."]],
            phrases: [["Aku la belajar budaya.", "Saya akan belajar budaya."], ["Tabe' lako mai.", "Permisi ke sini."], ["Kurre sumanga' sola nasang.", "Terima kasih semuanya."]],
            destination: ["Kete Kesu", "Kawasan adat dengan tongkonan, ukiran, dan situs budaya Toraja."],
            food: ["Pa'piong", "Hidangan berbumbu yang dimasak dalam bambu."],
            tradition: ["Tongkonan", "Rumah adat beratap melengkung yang menjadi pusat identitas keluarga Toraja."],
            fact: "Tongkonan bukan hanya rumah, tetapi juga simbol garis keturunan dan ruang musyawarah keluarga.",
            quiz: { q: "Rumah adat Toraja yang beratap melengkung disebut...", answers: ["Tongkonan", "Joglo", "Baileo", "Lamin"], correct: 0 }
        },
        {
            id: "melayu-riau",
            label: "Melayu Riau",
            region: "Sumatra",
            mark: "MR",
            summary: "Melayu Riau kuat dengan pantun, gurindam, tanjak, zapin, dan sejarah literasi maritim Nusantara.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum."], ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Apa khabar?", "Apa kabar?", "Sapaan harian."], ["Mohon izin", "Permisi", "Ungkapan sopan."]],
            phrases: [["Saya hendak belajar.", "Saya ingin belajar."], ["Silakan singgah.", "Ajak mampir."], ["Elok budi elok bahasa.", "Budi dan bahasa perlu dijaga."]],
            destination: ["Pulau Penyengat", "Pulau bersejarah dengan jejak sastra, kerajaan, dan Masjid Raya Sultan Riau."],
            food: ["Gulai Ikan Patin", "Olahan ikan patin berbumbu gurih yang populer di Riau."],
            tradition: ["Pantun Melayu", "Tradisi tutur berima yang menyampaikan nasihat, humor, dan nilai sosial."],
            fact: "Pantun Melayu membantu menjaga kecakapan berbahasa, etika, dan memori budaya lisan.",
            quiz: { q: "Tradisi tutur berima yang lekat dengan budaya Melayu adalah...", answers: ["Pantun", "Haiku", "Mantra Bali", "Syair bebas"], correct: 0 }
        },
        {
            id: "lampung",
            label: "Lampung",
            region: "Sumatra",
            mark: "LP",
            summary: "Lampung dikenal dengan tapis, aksara Lampung, siger, gajah, dan wilayah pesisir yang strategis.",
            cards: [["Tabik pun", "Salam hormat", "Sapaan sopan khas Lampung."], ["Terima kasih", "Terima kasih", "Ucapan apresiasi."], ["Api kabar?", "Apa kabar?", "Sapaan umum."], ["Nyak haga belajar", "Saya ingin belajar", "Kalimat niat belajar."]],
            phrases: [["Tabik pun, ulun belajar.", "Salam, saya belajar."], ["Sikam jama-jama.", "Kita bersama-sama."], ["Pekon sai indah.", "Kampung yang indah."]],
            destination: ["Way Kambas", "Taman nasional yang dikenal dengan konservasi gajah dan ekosistem hutan."],
            food: ["Seruit", "Hidangan ikan dengan sambal dan lalapan khas Lampung."],
            tradition: ["Kain Tapis", "Kain tradisional bersulam benang emas yang dipakai dalam acara adat."],
            fact: "Siger menjadi simbol kehormatan dan identitas perempuan Lampung dalam banyak representasi budaya.",
            quiz: { q: "Kain tradisional Lampung yang bersulam benang emas disebut...", answers: ["Tapis", "Ulos", "Sasirangan", "Songket Palembang"], correct: 0 }
        },
        {
            id: "ambon",
            label: "Ambon",
            region: "Maluku",
            mark: "AM",
            summary: "Ambon mewakili kekayaan Maluku: musik, rempah, pela gandong, pantai, dan tradisi persaudaraan lintas komunitas.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum."], ["Tarima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."], ["Beta mau belajar", "Saya ingin belajar", "Niat belajar."]],
            phrases: [["Ale sehat?", "Kamu sehat?"], ["Mari katong jaga budaya.", "Mari kita menjaga budaya."], ["Seng apa-apa.", "Tidak apa-apa."]],
            destination: ["Pantai Natsepa", "Pantai populer di Ambon dengan suasana pesisir dan kuliner rujak natsepa."],
            food: ["Ikan Kuah Kuning", "Olahan ikan berbumbu kunyit yang sering disantap dengan papeda."],
            tradition: ["Pela Gandong", "Ikatan persaudaraan antarnegeri yang menjaga solidaritas sosial."],
            fact: "Maluku sering disebut kepulauan rempah karena peran historis pala dan cengkih dalam perdagangan dunia.",
            quiz: { q: "Ikatan persaudaraan antarnegeri di Maluku dikenal sebagai...", answers: ["Pela Gandong", "Mapalus", "Subak", "Sasi Bali"], correct: 0 }
        },
        {
            id: "gorontalo",
            label: "Gorontalo",
            region: "Sulawesi",
            mark: "GT",
            summary: "Gorontalo memiliki tradisi lisan, adat Hulondalo, benteng bersejarah, dan kuliner laut yang kuat.",
            cards: [["Mopotuwawu", "Bersatu", "Nilai kebersamaan."], ["Tabea", "Permisi atau salam", "Sapaan sopan."], ["Wolo kabar?", "Apa kabar?", "Sapaan umum."], ["Ami belajar", "Saya belajar", "Kalimat belajar."]],
            phrases: [["Tabea, ami mo belajar.", "Permisi, saya mau belajar."], ["Delo u lipu.", "Cinta tanah kelahiran."], ["Ayo mo hulondalo.", "Mari mengenal Gorontalo."]],
            destination: ["Benteng Otanaha", "Situs bersejarah di perbukitan dengan panorama Danau Limboto."],
            food: ["Binte Biluhuta", "Sup jagung khas Gorontalo dengan rasa segar gurih."],
            tradition: ["Tumbilotohe", "Tradisi malam pasang lampu menjelang akhir Ramadan."],
            fact: "Tumbilotohe membuat kampung bercahaya dengan lampu tradisional dan memperkuat suasana kebersamaan.",
            quiz: { q: "Tradisi malam pasang lampu di Gorontalo disebut...", answers: ["Tumbilotohe", "Bau Nyale", "Sekaten", "Dugderan"], correct: 0 }
        }
    ];

    const languageSelect = document.getElementById("languageSelect");
    const flashcard = document.getElementById("flashcard");
    const phraseGrid = document.getElementById("phraseGrid");
    const vocabList = document.getElementById("vocabList");
    const quizQuestion = document.getElementById("languageQuizQuestion");
    const answerGrid = document.getElementById("languageAnswers");
    const regionChips = document.getElementById("regionChips");
    const cultureGrid = document.getElementById("cultureGrid");
    const languageSearch = document.getElementById("languageSearch");
    const routeGoal = document.getElementById("routeGoal");
    const sortCulture = document.getElementById("sortCulture");
    const sessionTarget = document.getElementById("sessionTarget");
    const languageRecommendation = document.getElementById("languageRecommendation");
    const quickBrief = document.getElementById("quickBrief");
    const compareSelect = document.getElementById("compareSelect");
    const compareOutput = document.getElementById("compareOutput");
    const journeyGrid = document.getElementById("journeyGrid");
    const listenWord = document.getElementById("listenWord");
    const toggleFavorite = document.getElementById("toggleFavorite");
    const markMastered = document.getElementById("markMastered");
    const nextCultureQuiz = document.getElementById("nextCultureQuiz");
    const resetLanguageProgress = document.getElementById("resetLanguageProgress");
    const startRecommendedRoute = document.getElementById("startRecommendedRoute");
    const randomCulture = document.getElementById("randomCulture");
    const focusPapua = document.getElementById("focusPapua");
    const quickQuiz = document.getElementById("quickQuiz");
    const copyMission = document.getElementById("copyMission");
    const flashcardProgress = document.getElementById("flashcardProgress");
    const flashcardBar = document.getElementById("flashcardBar");
    const flowCards = Array.from(document.querySelectorAll(".learning-flow-card"));
    const cultureResultTitle = document.getElementById("cultureResultTitle");
    const cultureResultMeta = document.getElementById("cultureResultMeta");
    let currentIndex = 0;
    let showingMeaning = false;
    let collectionMode = storage.get("wonder_mode", "semua");
    let selectedRegion = storage.get("wonder_region", "Semua");
    let selectedPlaceId = storage.get("wonder_place", "jawa");
    let sortMode = storage.get("wonder_sort", "recommended");
    let targetCount = Number(storage.get("wonder_target", 3)) || 3;
    const progress = storage.get("bahasa_progress", { reviewed: 0, correct: 0, explored: [], quizDone: 0, favorites: [], mastered: [], streak: 0, lastActiveDay: "" });

    if (selectedRegion === "Papua-Maluku") selectedRegion = "Papua Raya";
    if (!regions.includes(selectedRegion)) selectedRegion = "Semua";
    if (selectedPlaceId === "papua") selectedPlaceId = "papua-provinsi";
    if (!places.some(place => place.id === selectedPlaceId)) selectedPlaceId = "jawa";
    languageSelect.innerHTML = places.map(place => `<option value="${place.id}">${place.label}</option>`).join("");
    languageSelect.value = selectedPlaceId;
    compareSelect.innerHTML = places.map(place => `<option value="${place.id}">${place.label}</option>`).join("");
    compareSelect.value = places.find(place => place.id !== selectedPlaceId)?.id || selectedPlaceId;
    if (!["semua", "belum", "favorit", "mastered"].includes(collectionMode)) collectionMode = "semua";
    if (!["recommended", "az", "region", "unexplored"].includes(sortMode)) sortMode = "recommended";
    if (![3, 5, 7, 10].includes(targetCount)) targetCount = 3;
    if (sortCulture) sortCulture.value = sortMode;
    if (sessionTarget) sessionTarget.value = String(targetCount);

    function getSelectedPlace() {
        return places.find(place => place.id === selectedPlaceId) || places[0];
    }

    function setActiveFlow(stepId) {
        flowCards.forEach(card => {
            const isActive = card.dataset.flowStep === stepId;
            card.classList.toggle("active", isActive);
            if (isActive) {
                card.setAttribute("aria-current", "step");
            } else {
                card.removeAttribute("aria-current");
            }
        });
    }

    function setOptionalText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function getFilteredPlaces() {
        return selectedRegion === "Semua" ? places : places.filter(place => place.region === selectedRegion);
    }

    function getSearchQuery() {
        return (languageSearch?.value || "").trim().toLowerCase();
    }

    function matchesSearch(place) {
        const query = getSearchQuery();
        if (!query) return true;
        const haystack = [
            place.label,
            place.region,
            place.summary,
            place.destination[0],
            place.destination[1],
            place.food[0],
            place.food[1],
            place.tradition[0],
            place.tradition[1],
            place.fact,
            ...place.cards.flat(),
            ...place.phrases.flat()
        ].join(" ").toLowerCase();
        return haystack.includes(query);
    }

    function getVisiblePlaces() {
        const explored = new Set(progress.explored || []);
        const favorites = new Set(progress.favorites || []);
        const mastered = new Set(progress.mastered || []);
        const visible = getFilteredPlaces().filter(place => {
            if (!matchesSearch(place)) return false;
            if (collectionMode === "belum") return !explored.has(place.id);
            if (collectionMode === "favorit") return favorites.has(place.id);
            if (collectionMode === "mastered") return mastered.has(place.id);
            return true;
        });
        const sorted = [...visible];
        if (sortMode === "az") {
            sorted.sort((a, b) => a.label.localeCompare(b.label));
        } else if (sortMode === "region") {
            sorted.sort((a, b) => `${a.region} ${a.label}`.localeCompare(`${b.region} ${b.label}`));
        } else if (sortMode === "unexplored") {
            sorted.sort((a, b) => Number(explored.has(a.id)) - Number(explored.has(b.id)) || a.label.localeCompare(b.label));
        }
        return sorted;
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function recordActivity() {
        const today = todayKey();
        if (progress.lastActiveDay !== today) {
            progress.streak = (progress.streak || 0) + 1;
            progress.lastActiveDay = today;
        }
    }

    function toggleSetValue(key, value) {
        const values = new Set(progress[key] || []);
        if (values.has(value)) {
            values.delete(value);
        } else {
            values.add(value);
        }
        progress[key] = Array.from(values);
        updateMetrics();
    }

    function updateMetrics() {
        const exploredCount = new Set(progress.explored || []).size;
        const favoriteCount = new Set(progress.favorites || []).size;
        const masteredCount = new Set(progress.mastered || []).size;
        const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
        const remainingCount = Math.max(places.length - exploredCount, 0);
        const completion = Math.round((exploredCount / places.length) * 100);
        document.getElementById("languageReviewed").textContent = progress.reviewed;
        document.getElementById("languageCorrect").textContent = `${accuracy}%`;
        document.getElementById("languageTotal").textContent = places.length;
        document.getElementById("missionCount").textContent = `${exploredCount}/${places.length}`;
        document.getElementById("missionBar").style.width = `${Math.round((exploredCount / places.length) * 100)}%`;
        setOptionalText("languageFavoriteCount", favoriteCount);
        setOptionalText("languageMasteredCount", masteredCount);
        setOptionalText("languageStreakCount", progress.streak || 0);
        setOptionalText("languageVisibleCount", getVisiblePlaces().length);
        setOptionalText("languageRemainingCount", remainingCount);
        setOptionalText("languageCompletionCount", `${completion}%`);

        let badge = "Explorer Baru";
        let title = "Mulai jelajah pertamamu.";
        let text = "Pilih satu region dan buka kartu budaya untuk memulai misi.";
        if (exploredCount >= 10) {
            badge = "Nusantara Master";
            title = "Kamu hampir menamatkan Wonderful Indonesia.";
            text = "Lanjutkan quiz budaya untuk mempertahankan akurasi eksplorasi.";
        } else if (exploredCount >= 6) {
            badge = "Culture Hunter";
            title = "Setengah Nusantara sudah terbuka.";
            text = "Coba region yang belum tersentuh agar koleksimu makin lengkap.";
        } else if (exploredCount >= 3) {
            badge = "Region Scout";
            title = "Eksplorasi mulai panas.";
            text = "Buka beberapa kartu budaya lagi untuk menaikkan badge.";
        }
        document.getElementById("explorerBadge").textContent = badge;
        document.getElementById("missionBadge").textContent = badge;
        document.getElementById("missionTitle").textContent = title;
        document.getElementById("missionText").textContent = text;
        document.getElementById("phoneRegionTitle").textContent = `${getVisiblePlaces().length} pilihan`;
        document.getElementById("phoneRegionText").textContent = selectedRegion === "Semua" ? "Jelajah semua region Indonesia." : `Fokus region ${selectedRegion}.`;
        document.querySelector(".language-progress-track div").style.width = `${Math.round((exploredCount / places.length) * 100)}%`;
        toggleFavorite.textContent = (progress.favorites || []).includes(selectedPlaceId) ? "Hapus Favorit" : "Favorit";
        markMastered.textContent = (progress.mastered || []).includes(selectedPlaceId) ? "Sudah Dikuasai" : "Tandai Dikuasai";
        storage.set("bahasa_progress", progress);
        storage.set("wonder_region", selectedRegion);
        storage.set("wonder_place", selectedPlaceId);
        storage.set("wonder_mode", collectionMode);
        storage.set("wonder_sort", sortMode);
        storage.set("wonder_target", targetCount);
    }

    function markExplored(placeId) {
        recordActivity();
        const explored = new Set(progress.explored || []);
        const before = explored.size;
        explored.add(placeId);
        progress.explored = Array.from(explored);
        if (explored.size > before) {
            showToast("Daerah baru masuk koleksi eksplorasi.");
        }
        updateMetrics();
    }

    function selectRegion(region) {
        if (region === "Papua") region = "Papua Raya";
        selectedRegion = region;
        const firstPlace = getVisiblePlaces()[0] || getFilteredPlaces()[0];
        if (firstPlace) selectedPlaceId = firstPlace.id;
        currentIndex = 0;
        languageSelect.value = selectedPlaceId;
        setActiveFlow("jelajah-region");
        renderAll();
    }

    function syncIndonesiaMap() {
        document.querySelectorAll(".map-region").forEach(regionEl => {
            const mapRegion = regionEl.dataset.region === "Papua" ? "Papua Raya" : regionEl.dataset.region;
            regionEl.classList.toggle("active", mapRegion === selectedRegion);
        });
    }

    function bindIndonesiaMap() {
        document.querySelectorAll(".map-region").forEach(regionEl => {
            regionEl.addEventListener("click", () => selectRegion(regionEl.dataset.region));
            regionEl.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectRegion(regionEl.dataset.region);
                }
            });
        });
    }

    function renderRegionChips() {
        regionChips.innerHTML = regions.map(region => `
            <button class="region-chip ${region === selectedRegion ? "active" : ""}" data-region="${region}">
                ${region}
            </button>
        `).join("");
        regionChips.querySelectorAll(".region-chip").forEach(btn => {
            btn.addEventListener("click", () => selectRegion(btn.dataset.region));
        });
    }

    function renderCultureGrid() {
        const explored = new Set(progress.explored || []);
        const favorites = new Set(progress.favorites || []);
        const mastered = new Set(progress.mastered || []);
        const visiblePlaces = getVisiblePlaces();
        const query = getSearchQuery();
        const modeLabel = {
            semua: "Semua kartu",
            belum: "Belum dibuka",
            favorit: "Favorit",
            mastered: "Dikuasai"
        }[collectionMode] || "Semua kartu";
        const sortLabel = {
            recommended: "Rekomendasi",
            az: "Nama A-Z",
            region: "Region",
            unexplored: "Belum dijelajahi dulu"
        }[sortMode] || "Rekomendasi";
        if (cultureResultTitle) {
            cultureResultTitle.textContent = `${visiblePlaces.length} kartu ditemukan`;
        }
        if (cultureResultMeta) {
            cultureResultMeta.textContent = `${selectedRegion === "Semua" ? "Semua region" : selectedRegion} - ${modeLabel} - ${sortLabel}${query ? ` - Pencarian "${query}"` : ""}`;
        }
        cultureGrid.innerHTML = visiblePlaces.length ? visiblePlaces.map(place => `
            <button class="culture-card ${place.id === selectedPlaceId ? "active" : ""} ${favorites.has(place.id) ? "is-favorite" : ""} ${mastered.has(place.id) ? "is-mastered" : ""}" data-place="${place.id}">
                <span class="culture-mark">${place.mark}</span>
                <div>
                    <strong>${place.label}</strong>
                    <p>${place.summary}</p>
                    <small>${place.region} - ${place.destination[0]} - ${mastered.has(place.id) ? "Dikuasai" : explored.has(place.id) ? "Sudah dijelajahi" : "Belum dibuka"}${favorites.has(place.id) ? " - Favorit" : ""}</small>
                </div>
            </button>
        `).join("") : `<div class="empty-state">Tidak ada daerah yang cocok dengan filter. Coba ubah mode koleksi atau kata pencarian.</div>`;
        cultureGrid.querySelectorAll(".culture-card").forEach(card => {
            card.addEventListener("click", () => {
                selectedPlaceId = card.dataset.place;
                languageSelect.value = selectedPlaceId;
                currentIndex = 0;
                markExplored(selectedPlaceId);
                setActiveFlow("latihan");
                renderAll();
            });
        });
    }

    function getRecommendedPlace() {
        const explored = new Set(progress.explored || []);
        const mastered = new Set(progress.mastered || []);
        const candidates = getFilteredPlaces().filter(place => matchesSearch(place));
        return candidates.find(place => !explored.has(place.id))
            || candidates.find(place => !mastered.has(place.id))
            || candidates[0]
            || places[0];
    }

    function renderRecommendation() {
        const recommended = getRecommendedPlace();
        const goalCopy = {
            balanced: "Mulai dari kosakata, lanjut fakta, lalu jawab quiz budaya.",
            language: `Fokuskan pada ${recommended.cards.length} kosakata dan ${recommended.phrases.length} frasa harian.`,
            food: `Pelajari kuliner ${recommended.food[0]} dan kaitannya dengan lanskap lokal.`,
            travel: `Gunakan ${recommended.destination[0]} sebagai pintu masuk memahami wilayahnya.`,
            tradition: `Dalami ${recommended.tradition[0]} sebagai identitas budaya utama.`
        }[routeGoal?.value || "balanced"] || "Mulai dari kosakata, lanjut fakta, lalu jawab quiz budaya.";
        if (!languageRecommendation) return;
        languageRecommendation.innerHTML = `
            <h3>${recommended.label}</h3>
            <p>${goalCopy}</p>
            <small class="mini-tag">${recommended.region} - ${recommended.destination[0]}</small>
        `;
        if (startRecommendedRoute) startRecommendedRoute.dataset.place = recommended.id;
        if (quickBrief) {
            const explored = new Set(progress.explored || []);
            quickBrief.innerHTML = `
                <strong>Brief cepat</strong>
                <p>${explored.has(recommended.id) ? "Lanjutkan pendalaman" : "Buka daerah baru"}: ${recommended.cards[0][0]}, ${recommended.food[0]}, dan ${recommended.tradition[0]}.</p>
            `;
        }
    }

    function renderDossier() {
        const selected = getSelectedPlace();
        document.getElementById("skillFocusTitle").textContent = `${selected.label}: frasa sopan dan identitas lokal`;
        document.getElementById("skillFocusText").textContent = `Prioritaskan sapaan "${selected.cards[0][0]}", ucapan terima kasih, dan satu frasa percakapan. Setelah itu hubungkan dengan fakta: ${selected.fact}`;
        document.getElementById("miniProjectTitle").textContent = `Kartu Cerita ${selected.destination[0]}`;
        document.getElementById("miniProjectText").textContent = `Buat 4 kalimat pendek: sapaan lokal, alasan mengunjungi ${selected.destination[0]}, kuliner ${selected.food[0]}, dan tradisi ${selected.tradition[0]}.`;
    }

    function renderCompare() {
        const selected = getSelectedPlace();
        if (compareSelect.value === selected.id) {
            compareSelect.value = places.find(place => place.id !== selected.id)?.id || selected.id;
        }
        const compared = places.find(place => place.id === compareSelect.value) || places[0];
        compareOutput.innerHTML = `
            <div class="compare-row">
                <span>${selected.label} vs ${compared.label}</span>
                <p><strong>Bahasa:</strong> ${selected.cards[0][0]} dibanding ${compared.cards[0][0]}.</p>
                <p><strong>Budaya:</strong> ${selected.tradition[0]} dibanding ${compared.tradition[0]}.</p>
                <p><strong>Kuliner:</strong> ${selected.food[0]} dibanding ${compared.food[0]}.</p>
            </div>
        `;
    }

    function renderJourney() {
        const favorites = new Set(progress.favorites || []);
        const explored = new Set(progress.explored || []);
        const prioritized = [
            ...places.filter(place => !explored.has(place.id)),
            ...places.filter(place => favorites.has(place.id)),
            ...places
        ];
        const uniqueRoute = Array.from(new Map(prioritized.map(place => [place.id, place])).values()).slice(0, 7);
        const actionByGoal = {
            balanced: place => `Flashcard, baca fakta, lalu jawab quiz ${place.label}.`,
            language: place => `Hafalkan sapaan "${place.cards[0][0]}" dan ulangi 3 frasa.`,
            food: place => `Catat bahan atau ciri rasa ${place.food[0]}.`,
            travel: place => `Buat alasan singkat mengunjungi ${place.destination[0]}.`,
            tradition: place => `Ringkas makna ${place.tradition[0]} dalam 2 kalimat.`
        };
        const planner = actionByGoal[routeGoal?.value || "balanced"] || actionByGoal.balanced;
        journeyGrid.innerHTML = uniqueRoute.slice(0, targetCount).map((place, index) => `
            <article class="journey-day">
                <span>Hari ${index + 1}</span>
                <strong>${place.label}</strong>
                <p>${planner(place)}</p>
                <small>${place.region} - ${place.destination[0]}</small>
            </article>
        `).join("");
    }

    function renderCultureDetails() {
        const selected = getSelectedPlace();
        document.getElementById("cultureTitle").textContent = selected.label;
        document.getElementById("cultureSummary").textContent = selected.summary;
        document.getElementById("destinationTitle").textContent = `${selected.label}: destinasi, kuliner, tradisi.`;
        document.getElementById("cultureFact").textContent = selected.fact;
        document.getElementById("destinationName").textContent = selected.destination[0];
        document.getElementById("destinationDesc").textContent = selected.destination[1];
        document.getElementById("foodName").textContent = selected.food[0];
        document.getElementById("foodDesc").textContent = selected.food[1];
        document.getElementById("traditionName").textContent = selected.tradition[0];
        document.getElementById("traditionDesc").textContent = selected.tradition[1];
        renderDossier();
        renderCompare();
    }

    function renderLanguageQuiz() {
        const selected = getSelectedPlace();
        const correctAnswer = selected.quiz.answers[selected.quiz.correct];
        const answers = [...selected.quiz.answers].sort(() => Math.random() - 0.5);
        document.getElementById("languageQuizMeta").textContent = `${selected.label} - ${selected.region}`;
        quizQuestion.textContent = selected.quiz.q;
        answerGrid.classList.remove("answered");
        answerGrid.innerHTML = answers.map(answer => `<button class="answer-choice answer-btn">${answer}</button>`).join("");
        answerGrid.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                recordActivity();
                progress.reviewed += 1;
                progress.quizDone = (progress.quizDone || 0) + 1;
                answerGrid.classList.add("answered");
                if (btn.textContent === correctAnswer) {
                    progress.correct += 1;
                    btn.classList.add("correct");
                    showToast("Jawaban budaya benar.");
                } else {
                    btn.classList.add("wrong");
                    showToast(`Jawaban tepat: ${correctAnswer}`);
                }
                answerGrid.querySelectorAll("button").forEach(button => {
                    button.disabled = true;
                    if (button.textContent === correctAnswer) button.classList.add("correct");
                });
                markExplored(selected.id);
                updateMetrics();
            });
        });
    }

    function renderLanguage() {
        const selected = getSelectedPlace();
        const card = selected.cards[currentIndex % selected.cards.length];
        showingMeaning = false;
        flashcard.classList.remove("is-flipped", "is-flipping");
        flashcard.innerHTML = `<small>${selected.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
        if (flashcardProgress && flashcardBar) {
            const activeIndex = (currentIndex % selected.cards.length) + 1;
            flashcardProgress.textContent = `Kartu ${activeIndex}/${selected.cards.length}`;
            flashcardBar.style.width = `${Math.round((activeIndex / selected.cards.length) * 100)}%`;
        }
        phraseGrid.innerHTML = selected.phrases.map(item => `
            <article class="phrase-card"><strong>${item[0]}</strong><p class="muted">${item[1]}</p></article>
        `).join("");
        vocabList.innerHTML = selected.cards.map((item, index) => `
            <div class="vocab-item ${index === currentIndex % selected.cards.length ? "is-active" : ""}"><div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div><span class="mini-tag">${item[2]}</span></div>
        `).join("");
        renderCultureDetails();
        renderLanguageQuiz();
        renderRecommendation();
        renderJourney();
    }

    function renderAll() {
        renderRegionChips();
        syncIndonesiaMap();
        renderCultureGrid();
        renderLanguage();
        updateMetrics();
        document.querySelectorAll(".language-mode").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === collectionMode);
        });
    }

    flashcard.addEventListener("click", () => {
        const selected = getSelectedPlace();
        const card = selected.cards[currentIndex % selected.cards.length];
        showingMeaning = !showingMeaning;
        flashcard.classList.add("is-flipping");
        window.setTimeout(() => {
            flashcard.classList.toggle("is-flipped", showingMeaning);
            flashcard.innerHTML = showingMeaning
                ? `<small>Arti</small><strong>${card[1]}</strong><span>${card[0]}</span>`
                : `<small>${selected.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
            flashcard.classList.remove("is-flipping");
        }, 120);
    });
    flowCards.forEach(card => {
        card.addEventListener("click", () => {
            setActiveFlow(card.dataset.flowStep);
        });
    });
    document.getElementById("nextWord").addEventListener("click", () => {
        currentIndex += 1;
        progress.reviewed += 1;
        recordActivity();
        markExplored(selectedPlaceId);
        renderAll();
        updateMetrics();
    });
    languageSelect.addEventListener("change", () => {
        selectedPlaceId = languageSelect.value;
        selectedRegion = getSelectedPlace().region;
        currentIndex = 0;
        markExplored(selectedPlaceId);
        setActiveFlow("latihan");
        renderAll();
    });
    languageSearch?.addEventListener("input", () => {
        const firstVisible = getVisiblePlaces()[0];
        if (firstVisible && !getVisiblePlaces().some(place => place.id === selectedPlaceId)) {
            selectedPlaceId = firstVisible.id;
            languageSelect.value = selectedPlaceId;
            currentIndex = 0;
        }
        renderAll();
    });
    document.querySelectorAll(".language-mode").forEach(btn => {
        btn.addEventListener("click", () => {
            collectionMode = btn.dataset.mode;
            const firstVisible = getVisiblePlaces()[0];
            if (firstVisible) {
                selectedPlaceId = firstVisible.id;
                languageSelect.value = selectedPlaceId;
                currentIndex = 0;
            }
            renderAll();
        });
    });
    routeGoal?.addEventListener("change", () => {
        renderRecommendation();
        renderJourney();
    });
    sortCulture?.addEventListener("change", () => {
        sortMode = sortCulture.value;
        const firstVisible = getVisiblePlaces()[0];
        if (firstVisible && !getVisiblePlaces().some(place => place.id === selectedPlaceId)) {
            selectedPlaceId = firstVisible.id;
            languageSelect.value = selectedPlaceId;
            currentIndex = 0;
        }
        renderAll();
    });
    sessionTarget?.addEventListener("change", () => {
        targetCount = Number(sessionTarget.value) || 3;
        renderJourney();
        updateMetrics();
    });
    compareSelect.addEventListener("change", renderCompare);
    randomCulture?.addEventListener("click", () => {
        const visible = getVisiblePlaces();
        const pool = visible.length ? visible : places;
        const randomPlace = pool[Math.floor(Math.random() * pool.length)];
        selectedPlaceId = randomPlace.id;
        selectedRegion = randomPlace.region;
        languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        markExplored(selectedPlaceId);
        renderAll();
        setActiveFlow("latihan");
        showToast(`Rute acak membuka ${randomPlace.label}.`);
    });
    focusPapua?.addEventListener("click", () => {
        selectRegion("Papua Raya");
        document.getElementById("jelajah-region").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("Fokus dipindahkan ke Papua Raya.");
    });
    quickQuiz?.addEventListener("click", () => {
        const visible = getVisiblePlaces();
        const currentPosition = Math.max(0, visible.findIndex(place => place.id === selectedPlaceId));
        const nextPlace = visible[(currentPosition + 1) % Math.max(visible.length, 1)] || places[0];
        selectedPlaceId = nextPlace.id;
        selectedRegion = nextPlace.region;
        languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        renderAll();
        document.getElementById("languageQuizQuestion").scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveFlow("quiz-budaya");
    });
    copyMission?.addEventListener("click", async () => {
        const selected = getSelectedPlace();
        const mission = `Misi ${selected.label}: hafalkan "${selected.cards[0][0]}", pelajari ${selected.food[0]}, kunjungi cerita ${selected.destination[0]}, lalu jawab quiz budaya.`;
        try {
            await navigator.clipboard.writeText(mission);
            showToast("Misi belajar disalin.");
        } catch {
            showToast(mission);
        }
    });
    toggleFavorite.addEventListener("click", () => {
        toggleSetValue("favorites", selectedPlaceId);
        showToast((progress.favorites || []).includes(selectedPlaceId) ? "Daerah masuk favorit." : "Daerah dihapus dari favorit.");
        renderAll();
    });
    markMastered.addEventListener("click", () => {
        toggleSetValue("mastered", selectedPlaceId);
        showToast((progress.mastered || []).includes(selectedPlaceId) ? "Daerah ditandai dikuasai." : "Status dikuasai dibatalkan.");
        renderAll();
    });
    listenWord.addEventListener("click", () => {
        const selected = getSelectedPlace();
        const card = selected.cards[currentIndex % selected.cards.length];
        if (!("speechSynthesis" in window)) {
            showToast("Browser belum mendukung suara otomatis.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`${card[0]}. Artinya ${card[1]}.`);
        utterance.lang = "id-ID";
        utterance.rate = 0.88;
        window.speechSynthesis.speak(utterance);
    });
    nextCultureQuiz.addEventListener("click", () => {
        const visible = getVisiblePlaces();
        const currentPosition = Math.max(0, visible.findIndex(place => place.id === selectedPlaceId));
        const nextPlace = visible[(currentPosition + 1) % Math.max(visible.length, 1)] || places[(places.findIndex(place => place.id === selectedPlaceId) + 1) % places.length];
        selectedPlaceId = nextPlace.id;
        selectedRegion = nextPlace.region;
        languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        renderAll();
    });
    startRecommendedRoute?.addEventListener("click", () => {
        const placeId = startRecommendedRoute.dataset.place;
        if (!placeId) return;
        selectedPlaceId = placeId;
        selectedRegion = getSelectedPlace().region;
        languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        markExplored(selectedPlaceId);
        renderAll();
        document.getElementById("latihan").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    resetLanguageProgress?.addEventListener("click", () => {
        progress.reviewed = 0;
        progress.correct = 0;
        progress.explored = [];
        progress.quizDone = 0;
        progress.favorites = [];
        progress.mastered = [];
        progress.streak = 0;
        progress.lastActiveDay = "";
        collectionMode = "semua";
        selectedRegion = "Semua";
        selectedPlaceId = "jawa";
        languageSelect.value = selectedPlaceId;
        if (languageSearch) languageSearch.value = "";
        currentIndex = 0;
        showToast("Progress Wonderful Indonesia direset.");
        renderAll();
    });

    bindIndonesiaMap();
    if ("IntersectionObserver" in window) {
        const flowObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible?.target?.id) setActiveFlow(visible.target.id);
        }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.18, 0.35, 0.6] });
        ["jelajah-region", "latihan", "quiz-budaya"].forEach(id => {
            const section = document.getElementById(id);
            if (section) flowObserver.observe(section);
        });
    }
    renderAll();
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    const page = document.body.dataset.page;
    if (page === "snbt") initTKAPage();
    if (page === "tka-lms" || page === "tka-quiz") initTKALMSPage();
    if (page === "library") initLibraryPage();
    if (page === "bahasa") initBahasaPage();
});
