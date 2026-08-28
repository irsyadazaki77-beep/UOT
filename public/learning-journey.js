(() => {
    "use strict";

    const STORAGE_KEY = "quiznationLearningJourneyV1";
    const Account = window.QuizNationAccount;
    const $ = id => document.getElementById(id);
    const GOALS = Object.freeze({
        frontend: {
            label: "Web & Frontend", icon: "fa-code", accent: "#6558f5", start: "materi.html",
            description: "Dari fondasi web hingga project antarmuka yang siap dipamerkan.",
            topics: ["HTML Semantik", "CSS Layout", "JavaScript DOM", "Aksesibilitas"],
            steps: [
                ["Fondasi web yang kokoh", "Pahami HTML semantik, struktur dokumen, dan cara browser membaca halaman.", "materi.html", 35],
                ["Layout responsif modern", "Kuasai Flexbox, Grid, spacing, dan strategi mobile-first.", "materi.html", 45],
                ["JavaScript dan DOM", "Bangun interaksi menggunakan event, state, dan manipulasi DOM yang aman.", "learning-path.html", 55],
                ["Evaluasi frontend", "Uji pemahaman melalui quiz adaptif dan tinjau kesalahan utama.", "quiz.html", 30],
                ["Project UI nyata", "Satukan fondasi menjadi dashboard interaktif yang responsif.", "materi.html", 75],
                ["Final mastery check", "Capai akurasi minimal 75% untuk menyelesaikan perjalanan.", "quiz.html", 35]
            ],
            checklists: [
                ["Struktur HTML Semantik (<header>, <main>, <article>, <section>)", "Elemen Metadata & SEO dasar pada <head>", "Form & Input accessibility (label, aria-describedby)", "Validasi sintaks di W3C Validator"],
                ["Flexbox untuk komponen linier (navbar, kartu, baris tombol)", "CSS Grid untuk tata letak halaman & galeri multikolom", "Media queries & strategi Mobile-First responsive design", "Sistem spacing, tipografi modern, dan variabel CSS"],
                ["Selektor DOM (querySelector) & penanganan Event Listener", "Manajemen state lokal & render elemen secara dinamis", "Validasi form sisi klien & penanganan error aman", "Penyimpanan data lokal (localStorage / sessionStorage)"],
                ["Simulasi quiz pemahaman HTML, CSS, dan DOM dasar", "Tinjau pembahasan soal salah untuk memperkuat ingatan", "Analisis waktu pengerjaan agar tetap efisien"],
                ["Rancang wireframe sederhana dashboard antarmuka", "Implementasi Dark/Light mode transisi halus", "Penyatuan komponen menjadi aplikasi interaktif utuh", "Uji coba responsivitas di berbagai layar (Mobile, Tablet, Desktop)"],
                ["Uji kompetensi menyeluruh frontend standar industri", "Pencapaian akurasi minimal 75% di sesi evaluasi akhir", "Klaim & unduh sertifikat kelulusan Web & Frontend"]
            ]
        },
        backend: {
            label: "Backend & Data", icon: "fa-database", accent: "#168f76", start: "materi.html",
            description: "Bangun cara berpikir sistematis untuk API, database, dan alur data.",
            topics: ["Logika Program", "Database SQL", "REST API", "Keamanan Data"],
            steps: [
                ["Logika dan struktur data", "Bangun fondasi fungsi, koleksi data, dan pemecahan masalah.", "materi.html", 40],
                ["Database relasional", "Pelajari tabel, relasi, query, dan desain data yang konsisten.", "materi.html", 50],
                ["REST API dan async flow", "Pahami request, response, validasi, serta error handling.", "learning-path.html", 55],
                ["Evaluasi backend", "Uji konsep database, API, dan keamanan melalui latihan adaptif.", "quiz.html", 30],
                ["Project service sederhana", "Rancang alur data lengkap untuk aplikasi pembelajaran.", "materi.html", 80],
                ["Final mastery check", "Buktikan penguasaan melalui evaluasi akhir minimal 75%.", "quiz.html", 35]
            ],
            checklists: [
                ["Tipe data primitif, array, object, dan perulangan efisien", "Penyusunan fungsi murni & penanganan nilai kembalian (return)", "Rekursi dasar & analisis kompleksitas sederhana", "Teknik debugging & penelusuran alur eksekusi"],
                ["Desain skema tabel (Primary Key, Foreign Key, Relasi 1:N, N:M)", "Query CRUD dasar (SELECT, INSERT, UPDATE, DELETE)", "Agregasi data & penggunaan JOIN antar tabel", "Normalisasi database dan indeks performa"],
                ["Arsitektur RESTful & penggunaan HTTP Methods (GET, POST, PUT, DELETE)", "Penanganan Asynchronous (Promise, async/await, fetch API)", "Validasi request payload & struktur JSON response standar", "HTTP Status codes & penanganan error global"],
                ["Simulasi evaluasi database dan logika API", "Tinjauan query yang kurang efisien dan perbaikannya", "Latihan skenario kasus penanganan error data"],
                ["Struktur direktori modular untuk web service sederhana", "Implementasi autentikasi dasar & token handling", "Simulasi penyimpanan dan pemanggilan data interaktif"],
                ["Uji kelayakan sistem backend & ketahanan API", "Pencapaian akurasi minimal 75% di evaluasi akhir", "Klaim kredensial Backend & Data Mastery"]
            ]
        },
        snbt: {
            label: "Persiapan SNBT", icon: "fa-graduation-cap", accent: "#dd7b28", start: "snbt.html",
            description: "Persiapan terukur melalui diagnosis, latihan, review, dan simulasi.",
            topics: ["Penalaran Umum", "Literasi", "Matematika", "Strategi Waktu"],
            steps: [
                ["Diagnosis kemampuan", "Petakan titik kuat dan lemah sebelum menyusun prioritas latihan.", "snbt.html", 35],
                ["Fondasi penalaran", "Bangun pola berpikir logis dan strategi eliminasi jawaban.", "tka-lms.html", 50],
                ["Latihan topik prioritas", "Fokus pada topik dengan peluang kenaikan skor terbesar.", "tka-quiz.html", 45],
                ["Review kesalahan", "Kelompokkan kesalahan konsep, hitung, baca, dan manajemen waktu.", "snbt.html", 30],
                ["Simulasi terarah", "Kerjakan paket dengan batas waktu dan evaluasi keputusanmu.", "tka-quiz.html", 75],
                ["Final readiness check", "Capai kesiapan minimal 75% sebelum menyelesaikan path.", "snbt.html", 40]
            ],
            checklists: [
                ["Mengerjakan paket tes diagnosis awal lengkap", "Pencatatan sub-tes dengan persentase skor terendah", "Penetapan jadwal harian sesuai sisa waktu jelang ujian"],
                ["Logika proposisi dan silogisme dasar", "Analisis teks argumen dan identifikasi kesimpulan logis", "Strategi eliminasi 3 opsi salah dengan cepat"],
                ["Latihan soal Penalaran Matematika tingkat sedang", "Latihan intensif Literasi Bahasa Indonesia & Inggris", "Pencatatan pola soal yang kerap berulang"],
                ["Bedah pembahasan 10 soal salah di latihan sebelumnya", "Identifikasi jebakan kata kunci pada soal panjang", "Perbaikan teknik manajemen waktu pengerjaan"],
                ["Simulasi Try Out dengan batas waktu ketat (tanpa pause)", "Evaluasi rasio kecepatan vs akurasi jawaban", "Latihan mental ketenangan menghadapi soal sulit"],
                ["Simulasi akhir dengan standar passing grade target", "Pencapaian konsistensi akurasi minimal 75%", "Klaim lencana kesiapan ujian SNBT"]
            ]
        },
        culture: {
            label: "Bahasa & Budaya", icon: "fa-earth-asia", accent: "#c54d89", start: "bahasa-daerah.html",
            description: "Jelajahi keragaman Nusantara melalui bahasa, cerita, dan latihan budaya.",
            topics: ["Bahasa Daerah", "Tradisi", "Geografi Budaya", "Cerita Rakyat"],
            steps: [
                ["Peta budaya Nusantara", "Kenali wilayah budaya dan hubungan bahasa dengan komunitasnya.", "bahasa-daerah.html", 35],
                ["Bahasa dalam konteks", "Pelajari sapaan, ungkapan, dan penggunaan bahasa sehari-hari.", "bahasa-daerah.html", 45],
                ["Cerita dan tradisi", "Hubungkan cerita lokal dengan nilai serta sejarah masyarakat.", "library.html", 45],
                ["Quiz budaya adaptif", "Uji pemahaman dan identifikasi wilayah yang perlu ditinjau.", "quiz-budaya.html", 30],
                ["Culture Passport", "Selesaikan eksplorasi lintas wilayah dan catat penemuan utama.", "bahasa-daerah.html", 70],
                ["Final culture check", "Raih akurasi minimal 75% untuk menutup perjalanan.", "quiz-budaya.html", 35]
            ],
            checklists: [
                ["Eksplorasi peta bahasa daerah utama di Sumatera, Jawa, dan Sulawesi", "Mengenali rumpun bahasa dan persebaran dialek lokal", "Menghubungkan kondisi geografis dengan tradisi masyarakat"],
                ["Kosakata sapaan hormat dan percakapan sehari-hari", "Ungkapan khas / pepatah tradisional dan maknanya", "Praktik pelafalan sederhana bahasa daerah pilihan"],
                ["Membaca 2 cerita rakyat lokal dari perpustakaan (Library)", "Analisis pesan moral dan latar belakang sejarah cerita", "Mengenali kesenian dan upacara adat yang terkait"],
                ["Mengerjakan quiz adaptif kebudayaan Nusantara", "Review wilayah yang masih kurang dikuasai", "Pencatatan fakta unik budaya pada catatan harian"],
                ["Mengumpulkan 5 stempel eksplorasi pada Culture Passport", "Berbagi wawasan budaya di forum atau catatan sesi", "Dokumentasi rangkuman wawasan lintas pulau"],
                ["Uji akhir wawasan kebudayaan dan bahasa Nusantara", "Pencapaian akurasi minimal 75% pada evaluasi budaya", "Klaim sertifikat dan lencana Duta Budaya Nusantara"]
            ]
        }
    });
    const LEVELS = Object.freeze({ beginner: "Pemula", intermediate: "Menengah", advanced: "Lanjutan" });

    function defaultState() {
        return {
            version: 2, onboardingComplete: false, goal: "frontend", level: "beginner",
            dailyMinutes: 30, reminderTime: "19:00", reminder: true,
            completedSteps: [], taskLog: {}, activities: [],
            notes: [], subtasks: {},
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
    }
    function readState() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            return raw && typeof raw === "object" ? {
                ...defaultState(), ...raw,
                completedSteps: Array.isArray(raw.completedSteps) ? raw.completedSteps : [],
                taskLog: raw.taskLog || {},
                activities: Array.isArray(raw.activities) ? raw.activities : [],
                notes: Array.isArray(raw.notes) ? raw.notes : [],
                subtasks: raw.subtasks && typeof raw.subtasks === "object" ? raw.subtasks : {}
            } : defaultState();
        } catch { return defaultState(); }
    }
    let state = readState();
    let onboardingStep = 1;

    // Pomodoro Timer State
    let pomodoroTimerId = null;
    let pomodoroTotalSeconds = 25 * 60;
    let pomodoroRemainingSeconds = 25 * 60;
    let isPomodoroRunning = false;
    let selectedPresetMinutes = 25;
    let audioCtx = null;
    let ambientSourceNode = null;
    let ambientGainNode = null;
    let activeSoundType = "off";

    function saveState() {
        state.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        updateSyncChip("Tersimpan", "fa-circle-check");
        window.dispatchEvent(new CustomEvent("quiznation-journey-change", { detail: state }));
    }
    function safeJSON(key, fallback = {}) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } }
    function escapeHTML(value) { return String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }
    function localDateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
    function todayLog() { const key = localDateKey(); return state.taskLog[key] || []; }
    function getGoal() { return GOALS[state.goal] || GOALS.frontend; }
    function getSession() { return Account?.getSession?.() || safeJSON("eduquestUserSession", null); }
    function getStats() { return Account?.getStats?.() || { xp: Number(localStorage.getItem("eduquestXP") || 0), streak: Number(localStorage.getItem("eduquestStreak") || 0), accuracy: 0 }; }
    function toast(message) { const node = $("journeyToast"); if(!node) return; node.textContent = message; node.classList.add("show"); clearTimeout(window.journeyToastTimer); window.journeyToastTimer = setTimeout(() => node.classList.remove("show"), 2800); }
    function updateSyncChip(label, icon) { const chip = $("syncChip"); if (!chip) return; chip.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span>${escapeHTML(label)}</span>`; }

    // Synthesizer Chimes and Ambient Audio
    function playSuccessChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.7);
        } catch(e) {}
    }

    function toggleAmbientAudio(soundType) {
        activeSoundType = soundType;
        document.querySelectorAll(".ambient-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.sound === soundType));
        if (soundType === "off" || !isPomodoroRunning) {
            stopAmbientAudio();
            return;
        }
        startAmbientAudio(soundType);
    }

    function startAmbientAudio(type) {
        stopAmbientAudio();
        if (type === "off") return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === "suspended") audioCtx.resume();

            const bufferSize = 2 * audioCtx.sampleRate;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = buffer.getChannelData(0);

            if (type === "rain") {
                // Pink noise simulation for soothing rain
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    output[i] *= 0.08;
                    b6 = white * 0.115926;
                }
            } else if (type === "waves") {
                // Low filtered brown noise with slow amplitude modulation
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 0.15;
                }
            } else {
                // Lo-fi gentle white hum
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = (Math.random() * 2 - 1) * 0.03;
                }
            }

            ambientSourceNode = audioCtx.createBufferSource();
            ambientSourceNode.buffer = buffer;
            ambientSourceNode.loop = true;

            ambientGainNode = audioCtx.createGain();
            ambientGainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

            ambientSourceNode.connect(ambientGainNode);
            ambientGainNode.connect(audioCtx.destination);
            ambientSourceNode.start();
        } catch(e) {}
    }

    function stopAmbientAudio() {
        if (ambientSourceNode) {
            try { ambientSourceNode.stop(); ambientSourceNode.disconnect(); } catch(e) {}
            ambientSourceNode = null;
        }
    }

    // Activity Calculation Helpers
    function activityMinutesFor(dateKey) { return state.activities.filter(item => item.date === dateKey).reduce((sum, item) => sum + Number(item.minutes || 0), 0); }
    function weekData() {
        const formatter = new Intl.DateTimeFormat("id-ID", { weekday: "short" });
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(); date.setDate(date.getDate() - (6 - index));
            return { key: localDateKey(date), label: formatter.format(date).slice(0, 3), minutes: activityMinutesFor(localDateKey(date)) };
        });
    }
    function totalMinutes() { return state.activities.reduce((sum, item) => sum + Number(item.minutes || 0), 0); }
    function todayMinutes() { return activityMinutesFor(localDateKey()); }
    function calculateStreak() {
        const active = new Set(state.activities.filter(item => Number(item.minutes) > 0).map(item => item.date));
        let streak = 0; const date = new Date();
        if (!active.has(localDateKey(date))) date.setDate(date.getDate() - 1);
        while (active.has(localDateKey(date))) { streak += 1; date.setDate(date.getDate() - 1); }
        return Math.max(streak, Number(getStats().streak || 0));
    }
    function averageScore() {
        const scores = state.activities.map(item => Number(item.score)).filter(Number.isFinite);
        return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : Number(getStats().accuracy || 0);
    }
    function weakestTopic() {
        const scores = {};
        state.activities.forEach(item => { if (!item.topic || !Number.isFinite(Number(item.score))) return; (scores[item.topic] ||= []).push(Number(item.score)); });
        return Object.entries(scores).map(([topic, values]) => ({ topic, score: Math.round(values.reduce((a, b) => a + b, 0) / values.length) })).sort((a, b) => a.score - b.score)[0] || null;
    }
    function currentStepIndex() { return Math.min(state.completedSteps.length, getGoal().steps.length - 1); }
    function taskBlueprints() {
        const goal = getGoal(); const step = goal.steps[currentStepIndex()];
        return [
            { id: `path-${currentStepIndex()}`, icon: goal.icon, title: step[0], text: "Lanjutkan milestone aktif pada learning path personal.", minutes: Math.min(25, step[3]), link: step[2], pathStep: currentStepIndex() },
            { id: "practice", icon: "fa-bolt", title: "Latihan pemahaman", text: "Kerjakan latihan singkat dan tinjau alasan jawaban.", minutes: 10, link: state.goal === "culture" ? "quiz-budaya.html" : state.goal === "snbt" ? "tka-quiz.html" : "quiz.html" },
            { id: "review", icon: "fa-note-sticky", title: "Review satu konsep", text: "Ulangi konsep dengan skor terendah atau catat satu insight.", minutes: 5, link: "library.html" }
        ];
    }

    function renderIdentity() {
        const session = getSession(); const name = session?.username || session?.name || "Learner";
        const learnerEl = $("learnerName"); if(learnerEl) learnerEl.textContent = name.split(" ")[0];
        const profileEl = $("profileLink"); if(profileEl) profileEl.textContent = name.trim().charAt(0).toUpperCase() || "U";
        const hour = new Date().getHours();
        const greetEl = $("greetingText"); if(greetEl) greetEl.textContent = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
        const now = new Date();
        const dayNameEl = $("dayName"); if(dayNameEl) dayNameEl.textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(now);
        const dayNumEl = $("dayNumber"); if(dayNumEl) dayNumEl.textContent = String(now.getDate()).padStart(2, "0");
        const monthYearEl = $("monthYear"); if(monthYearEl) monthYearEl.textContent = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now);
    }

    function renderToday() {
        const goal = getGoal(), stepIndex = currentStepIndex(), step = goal.steps[stepIndex], stats = getStats();
        if ($("nextIcon")) $("nextIcon").innerHTML = `<i class="fa-solid ${goal.icon}" aria-hidden="true"></i>`;
        if ($("nextDuration")) $("nextDuration").textContent = Math.min(Number(state.dailyMinutes), step[3]);
        if ($("nextTitle")) $("nextTitle").textContent = step[0];
        if ($("nextDescription")) $("nextDescription").textContent = step[1];
        if ($("nextPathLabel")) $("nextPathLabel").textContent = goal.label;
        if ($("nextStepLabel")) $("nextStepLabel").textContent = `Langkah ${stepIndex + 1} dari ${goal.steps.length}`;
        if ($("nextAction")) $("nextAction").href = step[2];

        const minutes = todayMinutes(), percent = Math.min(100, Math.round((minutes / Math.max(1, state.dailyMinutes)) * 100));
        if ($("dailyRing")) $("dailyRing").style.setProperty("--value", percent);
        if ($("dailyPercent")) $("dailyPercent").textContent = `${percent}%`;
        if ($("dailyTargetText")) $("dailyTargetText").textContent = `${minutes} dari ${state.dailyMinutes} menit`;
        if ($("dailyEncouragement")) $("dailyEncouragement").textContent = percent >= 100 ? "Target hari ini tercapai. Bagus, berhenti saat masih berenergi." : percent >= 50 ? "Sedikit lagi. Selesaikan satu langkah pendek." : "Mulai satu sesi untuk membangun momentum.";
        
        if ($("streakValue")) $("streakValue").textContent = calculateStreak();
        if ($("xpValue")) $("xpValue").textContent = Number(stats.xp || 0) + (state.completedSteps.length * 25) + (state.activities.length * 10);
        if ($("accuracyValue")) $("accuracyValue").textContent = `${averageScore()}%`;

        const completed = new Set(todayLog());
        if ($("todayTasks")) {
            $("todayTasks").innerHTML = taskBlueprints().map(task => `
                <article class="j-task ${completed.has(task.id) ? "done" : ""}">
                    <span class="j-task-icon"><i class="fa-solid ${task.icon}" aria-hidden="true"></i></span>
                    <div><h3>${escapeHTML(task.title)}</h3><p>${escapeHTML(task.text)}</p></div>
                    <span class="j-task-time">${task.minutes} menit</span>
                    <button type="button" data-complete-task="${escapeHTML(task.id)}" aria-label="${completed.has(task.id) ? "Sudah selesai" : `Tandai ${escapeHTML(task.title)} selesai`}" ${completed.has(task.id) ? "disabled" : ""}>
                        <i class="fa-solid ${completed.has(task.id) ? "fa-check" : "fa-arrow-right"}"></i>
                    </button>
                </article>
            `).join("");
        }
        renderRemedial(); renderCharts(); renderNotesList();
    }

    async function renderRemedial() {
        if (!($("remedialTitle") && $("remedialText") && $("remedialReason") && $("remedialAction"))) return;
        
        if (window.RecommendationService) {
            try {
                const recs = await window.RecommendationService.getRecommendations();

                if (recs && recs.remedialTrigger) {
                    $("remedialTitle").textContent = `Remedial: ${recs.remedialTrigger.skillName}`;
                    $("remedialText").textContent = recs.remedialTrigger.explanation;
                    $("remedialReason").textContent = `Modul Micro-Lesson: ${recs.remedialTrigger.microLesson.title} (0 XP Penalty)`;
                    $("remedialAction").href = state.goal === "culture" ? "quiz-budaya.html" : state.goal === "snbt" ? "tka-quiz.html" : "quiz.html";
                    return;
                }

                if (recs && recs.recommendedNext && recs.recommendedNext.length > 0) {
                    const topRec = recs.recommendedNext[0];
                    $("remedialTitle").textContent = `Objektif Berikutnya: ${topRec.skillName}`;
                    $("remedialText").textContent = topRec.explanation;
                    $("remedialReason").textContent = `Tingkat Penguasaan Akademik: ${topRec.tier} (${topRec.score}%)`;
                    $("remedialAction").href = state.goal === "culture" ? "quiz-budaya.html" : state.goal === "snbt" ? "tka-quiz.html" : "quiz.html";
                    return;
                }
            } catch (err) {
                console.warn("[LearningJourney] Failed to load recommendations", err);
            }
        }

        const weak = weakestTopic(), accuracy = averageScore(), goal = getGoal();
        if (weak) {
            $("remedialTitle").textContent = `Perkuat ${weak.topic}.`;
            $("remedialText").textContent = `Skor rata-rata ${weak.score}% menunjukkan topik ini memberi peluang peningkatan terbesar.`;
            $("remedialReason").textContent = `${100 - weak.score} poin ruang peningkatan dari sesi tercatat`;
        } else if (accuracy && accuracy < 70) {
            $("remedialTitle").textContent = `Bangun ulang fondasi ${goal.topics[0]}.`;
            $("remedialText").textContent = `Akurasi keseluruhan ${accuracy}% menunjukkan review konsep akan lebih efektif daripada menambah materi baru.`;
            $("remedialReason").textContent = "Dipilih dari akurasi quiz keseluruhan";
        } else {
            $("remedialTitle").textContent = `Uji penguasaan ${goal.topics[currentStepIndex() % goal.topics.length]}.`;
            $("remedialText").textContent = "Latihan singkat membantu sistem menemukan konsep yang perlu diperkuat berikutnya.";
            $("remedialReason").textContent = "Belum ada kelemahan dominan yang terdeteksi";
        }
        $("remedialAction").href = state.goal === "culture" ? "quiz-budaya.html" : state.goal === "snbt" ? "tka-quiz.html" : "quiz.html";
    }

    function barsHTML(data, tall = false) {
        const max = Math.max(...data.map(item => item.minutes), state.dailyMinutes, 1);
        return data.map(item => `<i class="j-bar" style="--height:${Math.max(item.minutes ? 12 : 4, Math.round((item.minutes / max) * (tall ? 100 : 92)))}%" title="${escapeHTML(item.label)}: ${item.minutes} menit"><span>${escapeHTML(item.label)}</span></i>`).join("");
    }

    function renderCharts() {
        const data = weekData(), total = data.reduce((sum, item) => sum + item.minutes, 0), target = Number(state.dailyMinutes) * 5;
        if ($("weekChart")) $("weekChart").innerHTML = barsHTML(data);
        if ($("weekMinutes")) $("weekMinutes").textContent = `${total} menit`;
        if ($("weekComparison")) $("weekComparison").textContent = total >= target ? "Target mingguan tercapai." : `${Math.max(0, target - total)} menit lagi menuju target mingguan.`;
        if ($("weeklyGoalLabel")) $("weeklyGoalLabel").textContent = `${total} / ${target} menit`;
        if ($("weeklyGoalBar")) $("weeklyGoalBar").style.width = `${Math.min(100, Math.round(total / Math.max(1, target) * 100))}%`;
        if ($("weeklyGoalHint")) $("weeklyGoalHint").textContent = total >= target ? "Ritme minggu ini sudah kuat." : "Pertahankan sesi kecil yang konsisten.";
        if ($("insightChart")) $("insightChart").innerHTML = barsHTML(data, true);
    }

    
    async function autoCheckMilestones() {
        if (!window.RecommendationService) return;
        try {
            const recs = await window.RecommendationService.getRecommendations();
            if (!recs || !recs.masterySummary) return;
            
            const goal = getGoal();
            let changed = false;
            
            // Just a basic heuristic: if average mastery across related skills is > 75, we can auto-complete some steps.
            const masteryScores = Object.values(recs.masterySummary).map(m => m.score).filter(s => s > 0);
            if (masteryScores.length === 0) return;
            
            const avgMastery = masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length;
            
            // Auto complete steps proportional to overall mastery. (e.g. 80% mastery -> 80% of steps complete)
            const numStepsToUnlock = Math.floor((avgMastery / 100) * goal.steps.length);
            
            for (let i = 0; i < numStepsToUnlock; i++) {
                if (!state.completedSteps.includes(i)) {
                    state.completedSteps.push(i);
                    changed = true;
                }
            }
            if (changed) {
                saveState();
                renderPath();
            }
        } catch (e) {}
    }

    function renderPath() {
        const goal = getGoal(), completed = new Set(state.completedSteps), progress = Math.round(completed.size / goal.steps.length * 100);
        if ($("pathGoalTitle")) $("pathGoalTitle").textContent = goal.label;
        if ($("pathDescription")) $("pathDescription").textContent = `${goal.description} Klik milestone di bawah untuk melihat rincian & checklist pemahaman sub-topik.`;
        if ($("learnerLevel")) $("learnerLevel").textContent = LEVELS[state.level] || LEVELS.beginner;
        if ($("pathProgressText")) $("pathProgressText").textContent = `${progress}%`;
        if ($("pathProgressBar")) $("pathProgressBar").style.width = `${progress}%`;
        if ($("pathProgressHint")) $("pathProgressHint").textContent = `${completed.size} dari ${goal.steps.length} milestone selesai`;
        
        if ($("roadmapList")) {
            $("roadmapList").innerHTML = goal.steps.map((step, index) => {
                const done = completed.has(index), active = index === currentStepIndex() && !done;
                const stepKey = `${state.goal}-${index}`;
                const subitems = goal.checklists?.[index] || [];
                const checkedCount = (state.subtasks[stepKey] || []).filter(Boolean).length;
                const subText = subitems.length ? ` • ${checkedCount}/${subitems.length} checklist` : "";

                return `
                    <article class="j-roadmap-item ${done ? "complete" : active ? "active" : ""}" data-open-drawer="${index}">
                        <span class="j-roadmap-index">${done ? '<i class="fa-solid fa-check"></i>' : String(index + 1).padStart(2, "0")}</span>
                        <div>
                            <h2>${escapeHTML(step[0])}</h2>
                            <p>${escapeHTML(step[1])}</p>
                            <div class="j-roadmap-meta">
                                <span>${step[3]} menit</span>
                                <span>${index === goal.steps.length - 1 ? "Evaluasi" : index === 4 ? "Project" : "Milestone"}${subText}</span>
                            </div>
                        </div>
                        <span class="j-roadmap-state">${done ? "Selesai (Klik Detail)" : active ? "Mulai & Lihat Rincian" : "Lihat Rincian"}</span>
                    </article>
                `;
            }).join("");
        }
    }

    async function renderInsights() {
        const data = weekData(), minutes = totalMinutes(), accuracy = averageScore(), streak = calculateStreak(), sessions = state.activities.length;
        const metrics = [
            ["fa-clock", `${minutes}m`, "Total menit fokus"],
            ["fa-layer-group", sessions, "Sesi tercatat"],
            ["fa-bullseye", `${accuracy}%`, "Rata-rata pemahaman"],
            ["fa-fire", streak, "Streak aktif"]
        ];
        if ($("insightMetrics")) {
            $("insightMetrics").innerHTML = metrics.map(item => `
                <article class="j-insight-metric">
                    <i class="fa-solid ${item[0]}"></i>
                    <strong>${item[1]}</strong>
                    <span>${item[2]}</span>
                </article>
            `).join("");
        }
        renderCharts(); render30DayHeatmap(); renderAllNotesArchive();

        const goal = getGoal();
        let topicScores = {};

        if (window.RecommendationService) {
            try {
                const masteryMap = await window.RecommendationService.getMastery();
                if (masteryMap && window.AdaptiveLearningEngine) {
                    Object.keys(masteryMap).forEach(skillId => {
                        const m = masteryMap[skillId];
                        const sk = window.AdaptiveLearningEngine.SKILLS_REGISTRY[skillId];
                        if (sk && m && m.score > 0) {
                            topicScores[sk.name] = m.score;
                        }
                    });
                }
            } catch (e) {
                console.warn("[LearningJourney] Error fetching mastery:", e);
            }
        } 
        
        if (Object.keys(topicScores).length === 0) {
            goal.topics.forEach((topic, i) => topicScores[topic] = Math.max(10, Math.min(100, accuracy ? accuracy + (i % 2 ? -8 : 5) : 20 + state.completedSteps.length * 8 - i * 3)));
            state.activities.forEach(item => { if (item.topic && Number.isFinite(Number(item.score))) topicScores[item.topic] = Number(item.score); });
        }
        
        if ($("masteryList")) {
            $("masteryList").innerHTML = Object.entries(topicScores).slice(0, 5).map(([topic, score]) => `
                <div class="j-mastery-row">
                    <div><span>${escapeHTML(topic)}</span><strong>${Math.round(score)}%</strong></div>
                    <div class="j-progress"><i style="width:${Math.round(score)}%"></i></div>
                </div>
            `).join("");
        }
        if ($("bestTime")) $("bestTime").textContent = state.reminderTime;
        if ($("bestTimeHint")) $("bestTimeHint").textContent = state.reminder ? "Sesuai jadwal pengingat aktif" : "Pengingat saat ini nonaktif";
        const activeDays = data.filter(item => item.minutes > 0).length;
        if ($("insightTrend")) $("insightTrend").textContent = activeDays ? `${activeDays} hari aktif minggu ini` : "Belum ada tren";
        
        if ($("adjustmentTitle") && $("adjustmentText")) {
            if (accuracy < 65 && sessions) {
                $("adjustmentTitle").textContent = "Kurangi materi baru, tambah review.";
                $("adjustmentText").textContent = "Untuk tiga sesi berikutnya, gunakan rasio 60% latihan dan 40% materi agar fondasi menguat.";
            } else if (activeDays >= 4) {
                $("adjustmentTitle").textContent = "Ritmemu sudah stabil.";
                $("adjustmentText").textContent = "Pertahankan durasi saat ini. Tambahkan tantangan, bukan waktu belajar.";
            } else {
                $("adjustmentTitle").textContent = "Bangun frekuensi sebelum durasi.";
                $("adjustmentText").textContent = "Tiga sesi pendek pada hari berbeda akan memberi sinyal belajar lebih kuat daripada satu sesi panjang.";
            }
        }
    }

    function render30DayHeatmap() {
        const grid = $("monthHeatmap"); if (!grid) return;
        const today = new Date();
        const cells = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = localDateKey(d);
            const mins = activityMinutesFor(key);
            let level = "l0";
            if (mins > 45) level = "l4";
            else if (mins > 25) level = "l3";
            else if (mins > 10) level = "l2";
            else if (mins > 0) level = "l1";

            const formattedDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(d);
            cells.push(`<div class="j-heatmap-cell ${level}" title="${formattedDate}: ${mins} menit fokus">${d.getDate()}</div>`);
        }
        grid.innerHTML = cells.join("");
    }

    // Notes System
    function renderNotesList() {
        const container = $("todayNotesList"); if (!container) return;
        const todayKey = localDateKey();
        const recentNotes = state.notes.filter(n => n.date === todayKey || state.notes.indexOf(n) < 3).slice(0, 3);
        if (!recentNotes.length) {
            container.innerHTML = `<p class="j-empty-hint">Belum ada catatan atau refleksi untuk hari ini. Simpan poin penting atau rumus setelah kamu belajar!</p>`;
            return;
        }
        container.innerHTML = recentNotes.map(note => `
            <article class="j-note-card">
                <h3>${escapeHTML(note.title)}</h3>
                <p>${escapeHTML(note.content)}</p>
                <div class="j-note-meta">
                    <span class="j-note-badge">${escapeHTML(note.categoryLabel || "Web & Frontend")}</span>
                    <span><i class="fa-regular fa-clock"></i> ${escapeHTML(note.formattedDate || "Hari Ini")}</span>
                    <button type="button" class="j-delete-note-btn" data-delete-note="${escapeHTML(note.id)}" title="Hapus catatan"><i class="fa-solid fa-trash"></i></button>
                </div>
            </article>
        `).join("");
    }

    function renderAllNotesArchive(filter = "all") {
        const container = $("allNotesGrid"); if (!container) return;
        const filtered = filter === "all" ? state.notes : state.notes.filter(n => n.category === filter);
        if (!filtered.length) {
            container.innerHTML = `<p class="j-empty-hint" style="grid-column: 1/-1;">Belum ada catatan dalam kategori ini.</p>`;
            return;
        }
        container.innerHTML = filtered.map(note => `
            <article class="j-note-card">
                <h3>${escapeHTML(note.title)}</h3>
                <p>${escapeHTML(note.content)}</p>
                <div class="j-note-meta">
                    <span class="j-note-badge">${escapeHTML(note.categoryLabel || "Umum")}</span>
                    <span>${escapeHTML(note.formattedDate || "Baru saja")}</span>
                    <button type="button" class="j-delete-note-btn" data-delete-note="${escapeHTML(note.id)}" title="Hapus catatan"><i class="fa-solid fa-trash"></i></button>
                </div>
            </article>
        `).join("");
    }

    function saveNewNote() {
        const titleEl = $("noteTitleInput"), contentEl = $("noteContentInput"), catEl = $("noteCategorySelect");
        const title = titleEl?.value?.trim();
        const content = contentEl?.value?.trim();
        if (!title || !content) {
            toast("Harap isi judul dan isi catatan.");
            return;
        }
        const category = catEl?.value || "web";
        const categoryLabel = catEl?.options?.[catEl?.selectedIndex]?.text || "Web & Frontend";
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(now);

        state.notes.unshift({
            id: crypto.randomUUID?.() || `note-${Date.now()}`,
            date: localDateKey(),
            title, content, category, categoryLabel, formattedDate
        });
        saveState();
        if (titleEl) titleEl.value = "";
        if (contentEl) contentEl.value = "";
        $("noteDialog")?.close();
        renderAll();
        toast("Catatan & refleksi berhasil disimpan!");
    }

    function deleteNote(id) {
        state.notes = state.notes.filter(n => n.id !== id);
        saveState(); renderAll();
        toast("Catatan dihapus.");
    }

    // Milestone Drawer and Checklists
    let activeDrawerStepIndex = 0;
    function openMilestoneDrawer(stepIndex) {
        activeDrawerStepIndex = stepIndex;
        const goal = getGoal();
        const step = goal.steps[stepIndex];
        const checklists = goal.checklists?.[stepIndex] || [];
        const stepKey = `${state.goal}-${stepIndex}`;
        const savedChecks = state.subtasks[stepKey] || [];

        if ($("drawerStepKicker")) $("drawerStepKicker").textContent = `MILESTONE ${String(stepIndex + 1).padStart(2, "0")}`;
        if ($("drawerStepTitle")) $("drawerStepTitle").textContent = step[0];
        if ($("drawerStepDesc")) $("drawerStepDesc").textContent = step[1];
        if ($("drawerStartAction")) $("drawerStartAction").href = step[2];

        const updateChecklistUI = () => {
            const checks = state.subtasks[stepKey] || [];
            const doneCount = checks.filter(Boolean).length;
            const pct = checklists.length ? Math.round((doneCount / checklists.length) * 100) : 0;
            if ($("drawerChecklistPercent")) $("drawerChecklistPercent").textContent = `${pct}%`;
            if ($("drawerChecklistBar")) $("drawerChecklistBar").style.width = `${pct}%`;
        };

        if ($("drawerChecklistItems")) {
            $("drawerChecklistItems").innerHTML = checklists.map((itemText, i) => `
                <label class="j-checklist-item ${savedChecks[i] ? "checked" : ""}" data-check-idx="${i}">
                    <input type="checkbox" ${savedChecks[i] ? "checked" : ""}>
                    <span>${escapeHTML(itemText)}</span>
                </label>
            `).join("");
        }

        updateChecklistUI();
        $("milestoneDrawer")?.showModal();
    }

    function toggleSubtaskItem(idx, checked) {
        const stepKey = `${state.goal}-${activeDrawerStepIndex}`;
        if (!state.subtasks[stepKey]) state.subtasks[stepKey] = [];
        state.subtasks[stepKey][idx] = checked;
        saveState();
        
        const goal = getGoal();
        const checklists = goal.checklists?.[activeDrawerStepIndex] || [];
        const doneCount = state.subtasks[stepKey].filter(Boolean).length;
        const pct = checklists.length ? Math.round((doneCount / checklists.length) * 100) : 0;
        if ($("drawerChecklistPercent")) $("drawerChecklistPercent").textContent = `${pct}%`;
        if ($("drawerChecklistBar")) $("drawerChecklistBar").style.width = `${pct}%`;

        document.querySelector(`.j-checklist-item[data-check-idx="${idx}"]`)?.classList.toggle("checked", checked);
        if (pct === 100 && !state.completedSteps.includes(activeDrawerStepIndex)) {
            playSuccessChime();
        }
    }

    function markMilestoneCompleteFromDrawer() {
        if (!state.completedSteps.includes(activeDrawerStepIndex)) {
            state.completedSteps.push(activeDrawerStepIndex);
            playSuccessChime();
        }
        saveState();
        $("milestoneDrawer")?.close();
        renderAll();
        toast("Selamat! Milestone telah ditandai selesai.");
    }

    // Achievements
    function achievements() {
        const minutes = totalMinutes(), steps = state.completedSteps.length, streak = calculateStreak(), accuracy = averageScore();
        return [
            ["first-step", "fa-shoe-prints", "Langkah pertama", "Catat sesi belajar pertamamu.", state.activities.length >= 1],
            ["focus-60", "fa-hourglass-half", "Satu jam bermakna", "Kumpulkan total 60 menit fokus.", minutes >= 60],
            ["streak-3", "fa-fire", "Ritme tiga hari", "Belajar selama tiga hari berturut-turut.", streak >= 3],
            ["path-half", "fa-route", "Setengah perjalanan", "Selesaikan tiga milestone learning path.", steps >= 3],
            ["mastery-75", "fa-bullseye", "Mastery 75", "Capai rata-rata pemahaman minimal 75%.", accuracy >= 75 && state.activities.length >= 2],
            ["path-complete", "fa-trophy", "Journey finisher", "Selesaikan seluruh milestone personal.", steps >= getGoal().steps.length]
        ];
    }
    function renderAchievements() {
        const items = achievements(), unlocked = items.filter(item => item[4]).length;
        if ($("unlockedCount")) $("unlockedCount").textContent = unlocked;
        if ($("totalFocusMinutes")) $("totalFocusMinutes").textContent = totalMinutes();
        if ($("completedMilestones")) $("completedMilestones").textContent = state.completedSteps.length;
        if ($("achievementGrid")) {
            $("achievementGrid").innerHTML = items.map(item => `
                <article class="j-achievement-card ${item[4] ? "" : "locked"}">
                    <span class="j-achievement-icon"><i class="fa-solid ${item[1]}"></i></span>
                    <h2>${escapeHTML(item[2])}</h2>
                    <p>${escapeHTML(item[3])}</p>
                    <span>${item[4] ? "TERBUKA" : "BELUM TERBUKA"}</span>
                </article>
            `).join("");
        }
        const eligible = state.completedSteps.length >= getGoal().steps.length && averageScore() >= 75;
        if ($("certificateTitle")) $("certificateTitle").textContent = eligible ? `Sertifikat ${getGoal().label} siap dibuka.` : "Sertifikat perjalananmu masih terkunci.";
        if ($("certificateText")) $("certificateText").textContent = eligible ? "Kamu telah menyelesaikan path dan memenuhi standar mastery." : "Selesaikan seluruh milestone dan raih akurasi minimal 75% untuk membuka sertifikat.";
        if ($("certificateBtn")) {
            $("certificateBtn").disabled = !eligible;
            $("certificateBtn").innerHTML = eligible ? '<i class="fa-solid fa-award"></i> Buka sertifikat' : '<i class="fa-solid fa-lock"></i> Belum tersedia';
        }
    }

    function renderAll() {
        renderIdentity(); renderToday(); renderPath(); renderInsights(); renderAchievements(); populateManualTopics(); scheduleReminder(); autoCheckMilestones();
    }

    function switchView(name) {
        document.querySelectorAll(".j-view").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === name));
        document.querySelectorAll("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === name));
        history.replaceState(null, "", `#${name}`); window.scrollTo({ top: 0, behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth" });
        if (name === "insights") renderInsights(); if (name === "achievements") renderAchievements();
    }

    function completeTask(taskId) {
        const tasks = taskBlueprints(), task = tasks.find(item => item.id === taskId); if (!task || todayLog().includes(taskId)) return;
        const key = localDateKey(); state.taskLog[key] = [...todayLog(), taskId];
        state.activities.push({ id: crypto.randomUUID?.() || `${Date.now()}`, date: key, minutes: task.minutes, topic: getGoal().topics[Math.min(currentStepIndex(), getGoal().topics.length - 1)], score: taskId === "practice" ? Math.max(55, averageScore() || 70) : undefined, source: "daily-task" });
        if (Number.isInteger(task.pathStep) && !state.completedSteps.includes(task.pathStep)) state.completedSteps.push(task.pathStep);
        playSuccessChime();
        saveState(); renderAll(); toast("Langkah selesai. Progres journey diperbarui.");
    }

    function populateManualTopics() {
        const manualTopicEl = $("manualTopic");
        if (manualTopicEl) manualTopicEl.innerHTML = getGoal().topics.map(topic => `<option>${escapeHTML(topic)}</option>`).join("");
    }

    function saveManualSession() {
        const minutes = Math.max(5, Math.min(180, Number($("manualMinutes").value) || 15)), score = Math.max(30, Math.min(100, Number($("manualScore").value) || 75));
        state.activities.push({ id: crypto.randomUUID?.() || `${Date.now()}`, date: localDateKey(), minutes, topic: $("manualTopic").value, score, source: "manual" });
        playSuccessChime();
        saveState(); $("sessionDialog")?.close(); renderAll(); toast(`${minutes} menit fokus berhasil dicatat.`);
    }

    // Pomodoro Timer Logic
    function openPomodoroModal() {
        if ($("pomodoroTopicLabel")) $("pomodoroTopicLabel").textContent = `Sesi Fokus: ${getGoal().label}`;
        updatePomodoroDisplay();
        $("pomodoroDialog")?.showModal();
    }

    function updatePomodoroDisplay() {
        const mins = Math.floor(pomodoroRemainingSeconds / 60);
        const secs = pomodoroRemainingSeconds % 60;
        const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        if ($("pomodoroClock")) $("pomodoroClock").textContent = timeStr;
        const pct = pomodoroTotalSeconds ? Math.round((pomodoroRemainingSeconds / pomodoroTotalSeconds) * 100) : 100;
        if ($("pomodoroRing")) $("pomodoroRing").style.setProperty("--val", pct);

        const pillStatus = $("topPomodoroStatus");
        const pillBtn = $("openPomodoroBtn");
        if (isPomodoroRunning) {
            if ($("pomodoroStatusLabel")) $("pomodoroStatusLabel").textContent = "Fokus Sedang Berjalan...";
            if ($("togglePomodoroBtn")) $("togglePomodoroBtn").innerHTML = '<i class="fa-solid fa-pause"></i><span>Jeda Sesi</span>';
            if ($("resetPomodoroBtn")) $("resetPomodoroBtn").disabled = false;
            if ($("finishEarlyPomodoroBtn")) $("finishEarlyPomodoroBtn").hidden = false;
            if (pillStatus) pillStatus.textContent = `Fokus ${timeStr}`;
            if (pillBtn) pillBtn.classList.add("active-running");
        } else {
            if ($("pomodoroStatusLabel")) $("pomodoroStatusLabel").textContent = pomodoroRemainingSeconds < pomodoroTotalSeconds ? "Sesi Dijeda" : "Siap Dimulai";
            if ($("togglePomodoroBtn")) $("togglePomodoroBtn").innerHTML = '<i class="fa-solid fa-play"></i><span>Mulai Fokus</span>';
            if ($("resetPomodoroBtn")) $("resetPomodoroBtn").disabled = (pomodoroRemainingSeconds === pomodoroTotalSeconds);
            if ($("finishEarlyPomodoroBtn")) $("finishEarlyPomodoroBtn").hidden = (pomodoroRemainingSeconds === pomodoroTotalSeconds);
            if (pillStatus) pillStatus.textContent = "Sesi Fokus Langsung";
            if (pillBtn) pillBtn.classList.remove("active-running");
        }
    }

    function togglePomodoroTimer() {
        if (isPomodoroRunning) {
            clearInterval(pomodoroTimerId);
            isPomodoroRunning = false;
            stopAmbientAudio();
            updatePomodoroDisplay();
        } else {
            isPomodoroRunning = true;
            if (activeSoundType !== "off") startAmbientAudio(activeSoundType);
            updatePomodoroDisplay();
            pomodoroTimerId = setInterval(() => {
                if (pomodoroRemainingSeconds > 0) {
                    pomodoroRemainingSeconds--;
                    updatePomodoroDisplay();
                } else {
                    completePomodoroSession(selectedPresetMinutes);
                }
            }, 1000);
        }
    }

    function resetPomodoroTimer() {
        clearInterval(pomodoroTimerId);
        isPomodoroRunning = false;
        pomodoroRemainingSeconds = pomodoroTotalSeconds;
        stopAmbientAudio();
        updatePomodoroDisplay();
    }

    function setPomodoroPreset(minutes) {
        if (isPomodoroRunning) clearInterval(pomodoroTimerId);
        isPomodoroRunning = false;
        selectedPresetMinutes = minutes;
        pomodoroTotalSeconds = minutes * 60;
        pomodoroRemainingSeconds = pomodoroTotalSeconds;
        stopAmbientAudio();
        document.querySelectorAll(".preset-btn").forEach(btn => btn.classList.toggle("active", Number(btn.dataset.time) === minutes));
        updatePomodoroDisplay();
    }

    function completePomodoroSession(minutesSpent) {
        clearInterval(pomodoroTimerId);
        isPomodoroRunning = false;
        stopAmbientAudio();
        pomodoroRemainingSeconds = pomodoroTotalSeconds;
        updatePomodoroDisplay();

        const actualMins = Math.max(5, Math.round(minutesSpent));
        state.activities.push({
            id: crypto.randomUUID?.() || `pomo-${Date.now()}`,
            date: localDateKey(),
            minutes: actualMins,
            topic: getGoal().topics[0],
            score: Math.max(75, averageScore() || 80),
            source: "pomodoro-studio"
        });
        playSuccessChime();
        saveState();
        $("pomodoroDialog")?.close();
        renderAll();
        toast(`🎉 Sesi Fokus ${actualMins} menit selesai! Progres & XP ditambahkan.`);
    }

    // Onboarding
    function openOnboarding(edit = false) {
        onboardingStep = 1; const modal = $("onboarding"); if(!modal) return; modal.inert = false; modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
        if (edit) {
            document.querySelector(`input[name=goal][value="${state.goal}"]`)?.click();
            document.querySelector(`input[name=level][value="${state.level}"]`)?.click();
            if ($("onboardingMinutes")) $("onboardingMinutes").value = String(state.dailyMinutes);
            if ($("onboardingTime")) $("onboardingTime").value = state.reminderTime;
            if ($("onboardingReminder")) $("onboardingReminder").checked = state.reminder;
        }
        renderOnboardingStep(); setTimeout(() => document.querySelector(".j-onboarding-step.active input")?.focus(), 0);
    }
    function closeOnboarding() { const modal = $("onboarding"); if(!modal) return; modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); modal.inert = true; }
    function renderOnboardingStep() {
        document.querySelectorAll(".j-onboarding-step").forEach(step => step.classList.toggle("active", Number(step.dataset.step) === onboardingStep));
        if ($("onboardingProgress")) $("onboardingProgress").style.width = `${onboardingStep / 3 * 100}%`;
        if ($("onboardingStepLabel")) $("onboardingStepLabel").textContent = `Langkah ${onboardingStep} dari 3`;
        if ($("onboardingBack")) $("onboardingBack").hidden = onboardingStep === 1;
        const nextSpan = $("onboardingNext")?.querySelector("span"); if(nextSpan) nextSpan.textContent = onboardingStep === 3 ? "Bangun journey saya" : "Lanjutkan";
    }
    async function finishOnboarding() {
        const form = new FormData($("onboardingForm")); state.goal = String(form.get("goal") || "frontend"); state.level = String(form.get("level") || "beginner"); state.dailyMinutes = Number(form.get("minutes") || 30); state.reminderTime = String(form.get("time") || "19:00"); state.reminder = form.get("reminder") === "on"; state.onboardingComplete = true;
        Account?.updatePreferences?.({ focus: state.goal, dailyGoal: String(state.dailyMinutes), reminderTime: state.reminderTime, reminder: state.reminder }); saveState(); closeOnboarding(); renderAll();
        if (state.reminder && "Notification" in window && Notification.permission === "default") { try { await Notification.requestPermission(); } catch {} }
        toast("Learning Journey personalmu siap.");
    }

    function scheduleReminder() {
        clearTimeout(window.journeyReminderTimer); if (!state.reminder) return;
        const [hours, minutes] = state.reminderTime.split(":").map(Number), now = new Date(), target = new Date(); target.setHours(hours || 19, minutes || 0, 0, 0); if (target <= now) target.setDate(target.getDate() + 1);
        const delay = target - now; if (delay > 2147483647) return;
        window.journeyReminderTimer = setTimeout(() => { const message = `Waktunya ${state.dailyMinutes} menit untuk ${getGoal().label}.`; toast(message); if ("Notification" in window && Notification.permission === "granted") new Notification("Learning Journey", { body: message, icon: "logo-uot-192.png" }); }, delay);
    }
    async function syncNow() {
        const API = window.QuizNationAPI;
        if (!API?.isConfigured?.()) { updateSyncChip("Lokal aman", "fa-hard-drive"); toast("Cloud belum dikonfigurasi. Data tetap aman lokal dan masuk ke backup akun."); return; }
        try { updateSyncChip("Menyinkronkan", "fa-rotate"); const payload = await API.pushLearningState(state); if (payload?.state) state = { ...state, ...payload.state }; saveState(); renderAll(); updateSyncChip("Cloud sinkron", "fa-cloud-arrow-up"); toast("Journey berhasil disinkronkan."); } catch (error) { updateSyncChip("Sync tertunda", "fa-triangle-exclamation"); toast(error.message || "Sinkronisasi belum berhasil."); }
    }
    function initTheme() { const dark = localStorage.getItem("eduquest_theme") === "dark"; document.body.classList.toggle("dark-theme", dark); if ($("themeToggle")) $("themeToggle").innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}"></i>`; }

    function bindEvents() {
        document.addEventListener("click", event => {
            const view = event.target.closest("[data-view]")?.dataset.view; if (view) switchView(view);
            const jump = event.target.closest("[data-view-jump]")?.dataset.viewJump; if (jump) switchView(jump);
            const task = event.target.closest("[data-complete-task]")?.dataset.completeTask; if (task) completeTask(task);
            const drawerIdx = event.target.closest("[data-open-drawer]")?.dataset.openDrawer; if (drawerIdx !== undefined) openMilestoneDrawer(Number(drawerIdx));
            const delNoteId = event.target.closest("[data-delete-note]")?.dataset.deleteNote; if (delNoteId) deleteNote(delNoteId);
        });

        $("themeToggle")?.addEventListener("click", () => { const dark = !document.body.classList.contains("dark-theme"); document.body.classList.toggle("dark-theme", dark); localStorage.setItem("eduquest_theme", dark ? "dark" : "light"); initTheme(); });
        $("editPlanBtn")?.addEventListener("click", () => openOnboarding(true));
        $("onboardingNext")?.addEventListener("click", () => { if (onboardingStep < 3) { onboardingStep += 1; renderOnboardingStep(); } else finishOnboarding(); });
        $("onboardingBack")?.addEventListener("click", () => { onboardingStep = Math.max(1, onboardingStep - 1); renderOnboardingStep(); });
        
        $("completeSessionBtn")?.addEventListener("click", () => $("sessionDialog")?.showModal());
        $("manualScore")?.addEventListener("input", event => { if ($("manualScoreOutput")) $("manualScoreOutput").textContent = `${event.target.value}%`; });
        $("saveSessionBtn")?.addEventListener("click", saveManualSession);
        $("syncNowBtn")?.addEventListener("click", syncNow);
        
        $("certificateBtn")?.addEventListener("click", () => { if (!$("certificateBtn")?.disabled) location.href = "learning-path.html"; });

        // Pomodoro events
        $("openPomodoroBtn")?.addEventListener("click", openPomodoroModal);
        $("startPomodoroNextBtn")?.addEventListener("click", openPomodoroModal);
        $("closePomodoroBtn")?.addEventListener("click", () => $("pomodoroDialog")?.close());
        $("togglePomodoroBtn")?.addEventListener("click", togglePomodoroTimer);
        $("resetPomodoroBtn")?.addEventListener("click", resetPomodoroTimer);
        $("finishEarlyPomodoroBtn")?.addEventListener("click", () => {
            const elapsedSeconds = pomodoroTotalSeconds - pomodoroRemainingSeconds;
            const elapsedMins = Math.max(5, Math.round(elapsedSeconds / 60));
            completePomodoroSession(elapsedMins);
        });

        document.querySelectorAll(".preset-btn").forEach(btn => {
            btn.addEventListener("click", () => setPomodoroPreset(Number(btn.dataset.time)));
        });
        document.querySelectorAll(".ambient-btn").forEach(btn => {
            btn.addEventListener("click", () => toggleAmbientAudio(btn.dataset.sound));
        });

        // Notes events
        $("openNoteDialogBtn")?.addEventListener("click", () => $("noteDialog")?.showModal());
        $("saveNoteBtn")?.addEventListener("click", saveNewNote);
        document.querySelectorAll("#noteFilterButtons button").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("#noteFilterButtons button").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderAllNotesArchive(btn.dataset.filter);
            });
        });

        // Milestone checklist drawer events
        $("drawerMarkDoneBtn")?.addEventListener("click", markMilestoneCompleteFromDrawer);
        document.addEventListener("change", event => {
            const checkItem = event.target.closest(".j-checklist-item");
            if (checkItem && checkItem.dataset.checkIdx !== undefined) {
                toggleSubtaskItem(Number(checkItem.dataset.checkIdx), event.target.checked);
            }
        });

        document.addEventListener("keydown", event => { if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName || "")) return; if (["1", "2", "3", "4"].includes(event.key)) switchView(["today", "path", "insights", "achievements"][Number(event.key) - 1]); });
        window.addEventListener("storage", event => { if (event.key === STORAGE_KEY) { state = readState(); renderAll(); } });
    }

    initTheme(); bindEvents(); renderAll(); const initialView = location.hash.slice(1); if (["today", "path", "insights", "achievements"].includes(initialView)) switchView(initialView); if (!state.onboardingComplete) openOnboarding(false);
})();
