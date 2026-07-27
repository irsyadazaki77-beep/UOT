(function () {
    "use strict";

    const STORE_KEY = "uot_exam_hub_v2";
    const STORE_VERSION = 2;
    const TRACK_LABELS = { snbt: "UTBK-SNBT", tka: "TKA SMA" };
    const ELECTIVES = ["Matematika Tingkat Lanjut", "Fisika", "Kimia", "Biologi", "Ekonomi", "Sosiologi", "Geografi", "Sejarah", "Antropologi", "Pendidikan Pancasila", "Bahasa Indonesia Tingkat Lanjut", "Bahasa Inggris Tingkat Lanjut"];

    const SUBJECTS = {
        snbt: [
            { id: "pu", short: "PU", name: "Penalaran Umum", icon: "fa-diagram-project", topics: ["Penalaran induktif", "Penalaran deduktif", "Penalaran kuantitatif"] },
            { id: "ppu", short: "PPU", name: "Pengetahuan & Pemahaman Umum", icon: "fa-lightbulb", topics: ["Makna kata dan istilah", "Kepaduan wacana", "Hubungan antargagasan"] },
            { id: "pbm", short: "PBM", name: "Pemahaman Bacaan & Menulis", icon: "fa-file-pen", topics: ["Kalimat efektif", "Struktur paragraf", "Ejaan dan konjungsi"] },
            { id: "pk", short: "PK", name: "Pengetahuan Kuantitatif", icon: "fa-calculator", topics: ["Aritmetika", "Aljabar dasar", "Analisis data"] },
            { id: "lbi", short: "LBI", name: "Literasi Bahasa Indonesia", icon: "fa-book-open", topics: ["Informasi eksplisit", "Inferensi teks", "Evaluasi argumen"] },
            { id: "lbe", short: "LBE", name: "Literasi Bahasa Inggris", icon: "fa-language", topics: ["Main idea", "Inference", "Author's purpose"] },
            { id: "pm", short: "PM", name: "Penalaran Matematika", icon: "fa-chart-line", topics: ["Pemodelan masalah", "Interpretasi grafik", "Penalaran peluang"] }
        ],
        tka: [
            { id: "indonesia", short: "B. Indonesia", name: "Bahasa Indonesia", icon: "fa-book", topics: ["Pemahaman tekstual", "Inferensi", "Evaluasi dan apresiasi"] },
            { id: "matematika", short: "Matematika", name: "Matematika", icon: "fa-square-root-variable", topics: ["Bilangan dan aljabar", "Geometri dan pengukuran", "Data, peluang, dan trigonometri"] },
            { id: "inggris", short: "B. Inggris", name: "Bahasa Inggris", icon: "fa-language", topics: ["Informasi tersurat", "Inferensi", "Evaluasi teks"] },
            { id: "pilihan1", short: "Pilihan 1", name: "Mapel Pilihan 1", icon: "fa-flask", topics: ["Konsep inti", "Penerapan", "Penalaran tingkat lanjut"] },
            { id: "pilihan2", short: "Pilihan 2", name: "Mapel Pilihan 2", icon: "fa-earth-asia", topics: ["Konsep inti", "Penerapan", "Analisis kontekstual"] }
        ]
    };

    const QUESTIONS = [
        q("snbt-pu-1", "snbt", "pu", "Penalaran Induktif", "dasar", "2, 5, 10, 17, 26, ... Angka berikutnya adalah...", ["33", "35", "37", "39"], [2], "Selisihnya 3, 5, 7, 9, lalu 11. Jadi 26 + 11 = 37.", 90),
        q("snbt-pu-2", "snbt", "pu", "Penalaran Deduktif", "sedang", "Semua peserta yang disiplin menyelesaikan latihan. Sebagian anggota Kelompok A disiplin. Simpulan yang pasti benar adalah...", ["Semua anggota Kelompok A menyelesaikan latihan", "Sebagian anggota Kelompok A menyelesaikan latihan", "Tidak ada anggota Kelompok A yang gagal", "Hanya Kelompok A yang disiplin"], [1], "Anggota Kelompok A yang termasuk disiplin pasti menyelesaikan latihan; tidak cukup informasi untuk menyimpulkan seluruh kelompok.", 100),
        q("snbt-pu-3", "snbt", "pu", "Penalaran Kuantitatif", "hots", "Nilai Raka lebih tinggi dari Sinta. Nilai Sinta lebih tinggi dari Dimas, sedangkan Nia lebih tinggi dari Raka. Urutan dua nilai tertinggi adalah...", ["Nia, Raka", "Raka, Nia", "Nia, Sinta", "Sinta, Raka"], [0], "Hubungan yang diberikan menghasilkan Nia > Raka > Sinta > Dimas.", 90),

        q("snbt-ppu-1", "snbt", "ppu", "Makna Kata", "dasar", "Dalam kalimat 'Kebijakan itu bersifat tentatif', kata tentatif paling dekat maknanya dengan...", ["Pasti", "Sementara", "Rahasia", "Mendesak"], [1], "Tentatif berarti belum pasti atau masih dapat berubah.", 75),
        q("snbt-ppu-2", "snbt", "ppu", "Kepaduan Wacana", "sedang", "Kalimat manakah yang paling tepat menjadi penutup paragraf tentang pentingnya tidur bagi konsentrasi belajar?", ["Banyak siswa menyukai musik", "Karena itu, durasi tidur yang cukup perlu menjadi bagian dari strategi belajar", "Sekolah dimulai pada pagi hari", "Konsentrasi adalah sebuah kata benda"], [1], "Kalimat tersebut merangkum hubungan tidur dan strategi belajar secara logis.", 85),
        q("snbt-ppu-3", "snbt", "ppu", "Hubungan Gagasan", "hots", "Hubungan kata 'diagnosis : gejala' paling setara dengan...", ["prediksi : data", "lukisan : warna", "sekolah : siswa", "buku : halaman"], [0], "Diagnosis dibangun dari gejala sebagaimana prediksi dibangun dari data.", 90),

        q("snbt-pbm-1", "snbt", "pbm", "Kalimat Efektif", "dasar", "Kalimat yang paling efektif adalah...", ["Para siswa-siswa sedang belajar bersama-sama", "Siswa sedang belajar bersama", "Siswa-siswa semuanya sedang belajar bersama", "Para siswa sedang belajar bersama-sama sekali"], [1], "Kalimat itu tidak mengandung penanda jamak atau keterangan yang berlebihan.", 75),
        q("snbt-pbm-2", "snbt", "pbm", "Struktur Paragraf", "sedang", "Urutan yang logis untuk paragraf laporan adalah...", ["Simpulan–data–masalah", "Masalah–data pendukung–simpulan", "Data–judul–masalah", "Simpulan–judul–contoh"], [1], "Alur masalah, bukti, lalu simpulan menghasilkan paragraf yang runtut.", 80),
        q("snbt-pbm-3", "snbt", "pbm", "Konjungsi", "hots", "Rina telah berlatih konsisten; ..., ia tetap mengevaluasi setiap kesalahan. Konjungsi yang tepat adalah...", ["namun", "karena", "bahkan", "sehingga"], [2], "'Bahkan' menambahkan informasi yang menguatkan tindakan sebelumnya.", 80),

        q("snbt-pk-1", "snbt", "pk", "Persentase", "dasar", "Harga buku Rp80.000 mendapat diskon 15%. Harga setelah diskon adalah...", ["Rp68.000", "Rp70.000", "Rp72.000", "Rp74.000"], [0], "Diskon 15% × 80.000 = 12.000, sehingga harga akhir Rp68.000.", 80),
        q("snbt-pk-2", "snbt", "pk", "Sistem Persamaan", "sedang", "Dua buku dan satu pena berharga Rp25.000. Satu buku dan satu pena Rp15.000. Harga satu buku adalah...", ["Rp5.000", "Rp8.000", "Rp10.000", "Rp12.000"], [2], "Kurangkan persamaan pertama dengan kedua sehingga harga satu buku Rp10.000.", 95),
        q("snbt-pk-3", "snbt", "pk", "Analisis Data", "hots", "Rata-rata empat nilai adalah 78. Setelah satu nilai tambahan dimasukkan, rata-ratanya menjadi 80. Nilai tambahan tersebut adalah...", ["82", "84", "86", "88"], [3], "Jumlah awal 4 × 78 = 312. Jumlah baru 5 × 80 = 400, sehingga nilai tambahan 88.", 105),

        q("snbt-lbi-1", "snbt", "lbi", "Informasi Eksplisit", "dasar", "Teks menyebutkan bahwa taman kota menurunkan suhu lingkungan dan menyediakan ruang interaksi. Manfaat yang dinyatakan langsung adalah...", ["Menaikkan harga rumah", "Menurunkan suhu dan menyediakan ruang interaksi", "Mengurangi seluruh polusi", "Menggantikan transportasi umum"], [1], "Jawaban mengulang dua informasi yang secara eksplisit disebutkan.", 75),
        q("snbt-lbi-2", "snbt", "lbi", "Inferensi Teks", "sedang", "Setelah sekolah menyediakan pojok baca, jumlah peminjaman buku meningkat selama tiga bulan. Inferensi paling aman adalah...", ["Pojok baca pasti menaikkan semua nilai", "Akses bacaan yang lebih mudah berkaitan dengan peningkatan peminjaman", "Siswa tidak lagi memakai internet", "Semua siswa membaca setiap hari"], [1], "Data menunjukkan hubungan dengan peminjaman, bukan sebab tunggal atau dampak pada semua nilai.", 100),
        q("snbt-lbi-3", "snbt", "lbi", "Evaluasi Bukti", "hots", "Data mana yang paling kuat untuk menilai efektivitas program sarapan sekolah terhadap konsentrasi?", ["Menu favorit siswa", "Perbandingan tes konsentrasi sebelum dan sesudah program dengan kelompok pembanding", "Warna ruang makan", "Jumlah guru piket"], [1], "Perbandingan sebelum-sesudah dan kelompok pembanding paling langsung menguji dampak program.", 110),

        q("snbt-lbe-1", "snbt", "lbe", "Main Idea", "dasar", "Text: Digital notes are easy to search and carry, but handwritten notes may support deeper processing. The main idea is...", ["Digital notes are always superior", "Both note-taking methods have different advantages", "Handwriting is outdated", "Students should stop taking notes"], [1], "The text contrasts a benefit of each method without declaring one universally better.", 85),
        q("snbt-lbe-2", "snbt", "lbe", "Inference", "sedang", "Maya arrived early, checked every cable, and tested the slides twice. We can infer that Maya was...", ["careless", "well-prepared", "confused", "uninterested"], [1], "Her repeated checks and early arrival indicate careful preparation.", 80),
        q("snbt-lbe-3", "snbt", "lbe", "Author's Purpose", "hots", "An article presents energy-use data, explains household waste, and ends with practical reduction steps. The author's primary purpose is to...", ["entertain with a fictional story", "inform and encourage action", "criticize one household", "advertise an appliance"], [1], "The combination of evidence, explanation, and actionable steps aims to inform and persuade readers to act.", 105),

        q("snbt-pm-1", "snbt", "pm", "Pemodelan", "dasar", "Sebuah kendaraan menempuh 120 km dalam 3 jam dengan kecepatan tetap. Model jarak d setelah t jam adalah...", ["d = 3t", "d = 40t", "d = 120t", "d = 40 + t"], [1], "Kecepatan 120 ÷ 3 = 40 km/jam, sehingga d = 40t.", 85),
        q("snbt-pm-2", "snbt", "pm", "Interpretasi Grafik", "sedang", "Grafik biaya terhadap jumlah barang berupa garis melalui titik (0, 20) dan (5, 70). Biaya tetap dan biaya per barang berturut-turut adalah...", ["20 dan 10", "10 dan 20", "20 dan 14", "0 dan 14"], [0], "Titik potong 20 adalah biaya tetap; gradien (70−20)/5 = 10 adalah biaya per barang.", 110),
        q("snbt-pm-3", "snbt", "pm", "Penalaran Peluang", "hots", "Dari kartu bernomor 1–6 diambil satu kartu. Pernyataan yang benar adalah...", ["Peluang genap = 1/2", "Peluang lebih dari 4 = 1/3", "Peluang prima = 1/2", "Peluang kurang dari 6 = 2/3"], [0, 1, 2], "Genap {2,4,6}, lebih dari 4 {5,6}, dan prima {2,3,5}; ketiganya benar. Ini soal pilihan ganda kompleks.", 120),

        q("tka-ind-1", "tka", "indonesia", "Inferensi Teks", "dasar", "Sebuah artikel menjelaskan bahwa membaca singkat setiap hari lebih efektif daripada membaca lama tetapi jarang. Simpulan paling tepat adalah...", ["Durasi belajar tidak penting", "Konsistensi latihan membantu pemahaman", "Membaca lama selalu buruk", "Artikel hanya membahas fiksi"], [1], "Gagasan utama menekankan manfaat konsistensi, bukan menolak durasi belajar.", 80),
        q("tka-ind-2", "tka", "indonesia", "Evaluasi Argumen", "sedang", "Sekolah perlu menambah jam literasi karena nilai membaca turun. Data yang paling memperkuat usulan adalah...", ["Jumlah kantin", "Perbandingan hasil sebelum dan sesudah program literasi", "Warna seragam", "Jumlah lapangan"], [1], "Data yang langsung menguji dampak program memberikan dukungan paling relevan.", 95),
        q("tka-ind-3", "tka", "indonesia", "Pilihan Ganda Kompleks", "hots", "Pilih ciri sumber informasi yang layak dipercaya.", ["Mencantumkan data yang dapat diperiksa", "Menjelaskan metode pengumpulan data", "Mengandalkan komentar anonim saja", "Membedakan fakta dan opini"], [0, 1, 3], "Sumber kredibel transparan tentang data, metode, dan batas antara fakta serta opini.", 110),
        q("tka-mat-1", "tka", "matematika", "Aljabar Kontekstual", "dasar", "Biaya langganan Rp12.000 ditambah Rp3.000 per fitur. Jika total Rp30.000, banyak fitur adalah...", ["4", "5", "6", "7"], [2], "12.000 + 3.000x = 30.000 menghasilkan x = 6.", 85),
        q("tka-mat-2", "tka", "matematika", "Peluang", "sedang", "Dalam kotak ada 4 kartu merah, 3 biru, dan 5 hijau. Peluang mengambil kartu biru adalah...", ["1/4", "1/3", "5/12", "7/12"], [0], "Terdapat 3 kartu biru dari 12 kartu, jadi peluangnya 3/12 = 1/4.", 90),
        q("tka-mat-3", "tka", "matematika", "Rasio Data", "hots", "Rasio siswa lulus dan belum lulus 7:5. Jika 20 siswa belum lulus, jumlah siswa yang lulus adalah...", ["24", "26", "28", "30"], [2], "Satu bagian adalah 20/5 = 4, maka yang lulus 7 × 4 = 28.", 100),
        q("tka-ing-1", "tka", "inggris", "Main Idea", "dasar", "Online learning is flexible, but students need discipline to avoid distractions. The main idea is...", ["It has no benefits", "Discipline is needed in flexible online learning", "Students never get distracted", "Offline class is always better"], [1], "The sentence balances flexibility with the need for discipline.", 80),
        q("tka-ing-2", "tka", "inggris", "Inference", "sedang", "Rina submitted the report two days early and asked for feedback. What can be inferred?", ["She ignored the task", "She was proactive", "The report was rejected", "The teacher was absent"], [1], "Submitting early and requesting feedback demonstrate proactive behavior.", 90),
        q("tka-ing-3", "tka", "inggris", "Vocabulary", "hots", "In the sentence 'The evidence was compelling,' compelling is closest in meaning to...", ["Confusing", "Convincing", "Ordinary", "Hidden"], [1], "Compelling evidence is strong and convincing.", 90),
        q("tka-pil-1", "tka", "pilihan", "Sains", "sedang", "Tanaman A diberi cahaya cukup dan tanaman B disimpan gelap. Variabel bebas percobaan adalah...", ["Jenis tanaman", "Jumlah daun", "Paparan cahaya", "Tinggi akhir"], [2], "Variabel bebas adalah faktor yang sengaja diubah, yaitu paparan cahaya.", 95),
        q("tka-pil-2", "tka", "pilihan", "Ekonomi", "sedang", "Ketika harga barang naik dan jumlah yang diminta turun, konsep yang ditunjukkan adalah...", ["Hukum permintaan", "Inflasi biaya", "Kelangkaan mutlak", "Mobilitas sosial"], [0], "Hukum permintaan menyatakan harga dan jumlah diminta bergerak berlawanan, ceteris paribus.", 90),
        q("tka-pil-3", "tka", "pilihan", "Analisis Data", "hots", "Suhu kota meningkat sejalan dengan berkurangnya ruang hijau. Pernyataan paling hati-hati adalah...", ["Ruang hijau pasti satu-satunya penyebab", "Ada hubungan yang perlu diuji lebih lanjut", "Suhu tidak terkait lingkungan", "Semua kota bersuhu sama"], [1], "Korelasi tidak otomatis membuktikan sebab tunggal.", 105)
    ];

    function q(id, track, subject, topic, difficulty, prompt, choices, correctIndexes, explanation, estimatedSeconds) {
        return { id, track, subject, topic, difficulty, prompt, choices, correctIndexes, explanation, estimatedSeconds };
    }

    const byId = new Map(QUESTIONS.map(item => [item.id, item]));
    const $ = id => document.getElementById(id);
    const all = selector => Array.from(document.querySelectorAll(selector));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
    const todayWeek = () => {
        const now = new Date();
        const first = new Date(now.getFullYear(), 0, 1);
        return `${now.getFullYear()}-${Math.ceil((((now - first) / 86400000) + first.getDay() + 1) / 7)}`;
    };

    function freshTrack() {
        return {
            stats: { done: 0, correct: 0, bySubject: {} },
            materialDone: {}, bookmarks: [], mistakes: {},
            planner: { university: "", program: "", weeks: 6, weeklyGoal: 20, firstElective: ELECTIVES[0], secondElective: ELECTIVES[1] },
            weekly: { stamp: todayWeek(), count: 0 }, lastActivity: ""
        };
    }

    function freshState() {
        return { version: STORE_VERSION, activeTrack: "snbt", migratedLegacy: false, tracks: { snbt: freshTrack(), tka: freshTrack() } };
    }

    function safeParse(value, fallback) {
        try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
    }

    function normalizeTrack(input) {
        const base = freshTrack();
        const source = input && typeof input === "object" ? input : {};
        const stats = source.stats && typeof source.stats === "object" ? source.stats : {};
        base.stats.done = clamp(stats.done, 0, 100000);
        base.stats.correct = clamp(stats.correct, 0, base.stats.done);
        base.stats.bySubject = stats.bySubject && typeof stats.bySubject === "object" ? stats.bySubject : {};
        base.materialDone = source.materialDone && typeof source.materialDone === "object" ? source.materialDone : {};
        base.bookmarks = Array.isArray(source.bookmarks) ? source.bookmarks.filter(id => byId.has(id)).slice(0, 500) : [];
        base.mistakes = source.mistakes && typeof source.mistakes === "object" ? Object.fromEntries(Object.entries(source.mistakes).filter(([id]) => byId.has(id))) : {};
        base.planner = { ...base.planner, ...(source.planner && typeof source.planner === "object" ? source.planner : {}) };
        base.planner.weeks = clamp(base.planner.weeks, 2, 24) || 6;
        base.planner.weeklyGoal = clamp(base.planner.weeklyGoal, 5, 200) || 20;
        if (!ELECTIVES.includes(base.planner.firstElective)) base.planner.firstElective = ELECTIVES[0];
        if (!ELECTIVES.includes(base.planner.secondElective)) base.planner.secondElective = ELECTIVES[1];
        base.weekly = source.weekly && typeof source.weekly === "object" ? source.weekly : base.weekly;
        if (base.weekly.stamp !== todayWeek()) base.weekly = { stamp: todayWeek(), count: 0 };
        base.weekly.count = clamp(base.weekly.count, 0, 100000);
        base.lastActivity = typeof source.lastActivity === "string" ? source.lastActivity.slice(0, 160) : "";
        return base;
    }

    function loadState() {
        const raw = safeParse(localStorage.getItem(STORE_KEY), null);
        const state = freshState();
        if (raw && raw.version === STORE_VERSION && raw.tracks) {
            state.activeTrack = raw.activeTrack === "tka" ? "tka" : "snbt";
            state.migratedLegacy = Boolean(raw.migratedLegacy);
            state.tracks.snbt = normalizeTrack(raw.tracks.snbt);
            state.tracks.tka = normalizeTrack(raw.tracks.tka);
        }
        if (!state.migratedLegacy) migrateLegacy(state);
        return state;
    }

    function applyLegacy(targetState, legacyStats, legacyBookmarks, legacyPlanner) {
        const target = targetState && targetState.tracks ? targetState : freshState();
        if (legacyStats && typeof legacyStats === "object" && target.tracks.tka.stats.done === 0) {
            target.tracks.tka.stats.done = clamp(legacyStats.done, 0, 100000);
            target.tracks.tka.stats.correct = clamp(legacyStats.correct, 0, target.tracks.tka.stats.done);
            target.tracks.tka.stats.bySubject = legacyStats.bySubject && typeof legacyStats.bySubject === "object" ? legacyStats.bySubject : {};
            target.tracks.tka.lastActivity = "Progres TKA lama berhasil dipulihkan";
        }
        if (Array.isArray(legacyBookmarks)) {
            const ids = legacyBookmarks.map(item => typeof item === "string" ? item : item?.id).filter(id => byId.has(id));
            target.tracks.tka.bookmarks = Array.from(new Set(ids));
        }
        if (legacyPlanner && typeof legacyPlanner === "object") {
            const planner = target.tracks.tka.planner;
            planner.university = String(legacyPlanner.targetPtn || planner.university).slice(0, 80);
            planner.program = String(legacyPlanner.targetProdi || planner.program).slice(0, 80);
            planner.weeks = clamp(legacyPlanner.studyWeeks || planner.weeks, 2, 24);
            if (ELECTIVES.includes(legacyPlanner.firstElective)) planner.firstElective = legacyPlanner.firstElective;
            if (ELECTIVES.includes(legacyPlanner.secondElective)) planner.secondElective = legacyPlanner.secondElective;
        }
        target.migratedLegacy = true;
        return target;
    }

    function migrateLegacy(state) {
        const legacyStats = safeParse(localStorage.getItem("snbt_stats"), null);
        const legacyBookmarks = safeParse(localStorage.getItem("tka_bookmarks"), []);
        const legacyPlanner = safeParse(localStorage.getItem("tka_planner_prefs"), null);
        applyLegacy(state, legacyStats, legacyBookmarks, legacyPlanner);
        saveState(state);
    }

    function saveState(nextState = state) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(nextState));
            const tka = nextState.tracks.tka;
            localStorage.setItem("snbt_stats", JSON.stringify(tka.stats));
            localStorage.setItem("tka_planner_prefs", JSON.stringify({ targetPtn: tka.planner.university, targetProdi: tka.planner.program, studyWeeks: tka.planner.weeks, firstElective: tka.planner.firstElective, secondElective: tka.planner.secondElective }));
        } catch (_) { showToast("Penyimpanan perangkat tidak tersedia."); }
    }

    const hasDOM = typeof document !== "undefined" && typeof localStorage !== "undefined";
    let state = hasDOM ? loadState() : freshState();
    let activeSubject = SUBJECTS[state.activeTrack][0].id;
    let practiceMode = "practice";
    let currentQuestion = null;
    let currentSubmitted = false;
    let selectedAnswers = new Set();
    let practiceIndex = 0;
    let tryoutQuestions = [];
    let tryoutResponses = {};
    let questionSeconds = 0;
    let questionTimerId = null;
    let focusSeconds = 25 * 60;
    let focusTimerId = null;
    let pendingReset = null;

    function trackState() { return state.tracks[state.activeTrack]; }
    function trackSubjects() {
        const list = SUBJECTS[state.activeTrack].map(item => ({ ...item }));
        if (state.activeTrack === "tka") {
            list[3].name = trackState().planner.firstElective;
            list[4].name = trackState().planner.secondElective;
        }
        return list;
    }
    function questionSubject(id) {
        if (state.activeTrack === "tka" && (id === "pilihan1" || id === "pilihan2")) return "pilihan";
        return id;
    }
    function questionsFor(subject = activeSubject) {
        const mapped = questionSubject(subject);
        return QUESTIONS.filter(item => item.track === state.activeTrack && item.subject === mapped);
    }
    function subjectLabel(id) {
        const match = trackSubjects().find(item => item.id === id || (item.id.startsWith("pilihan") && id === "pilihan"));
        return match ? match.name : id;
    }

    function init() {
        setupTheme();
        setupTabs();
        setupTrackPicker();
        setupPractice();
        setupPlanner();
        setupDialogs();
        setupUtilities();
        renderAll();
    }

    function setupTheme() {
        const saved = localStorage.getItem("eduquest_theme");
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const apply = dark => {
            document.documentElement.dataset.theme = dark ? "dark" : "light";
            document.body.classList.toggle("dark-mode", dark);
            const button = $("themeToggleBtn");
            button.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
            button.setAttribute("aria-label", dark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
            document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0f1918" : "#f4f8f7");
        };
        apply(saved ? saved === "dark" : prefersDark);
        $("themeToggleBtn").addEventListener("click", () => {
            const dark = document.documentElement.dataset.theme !== "dark";
            localStorage.setItem("eduquest_theme", dark ? "dark" : "light");
            apply(dark);
        });
    }

    function setupTabs() {
        const tabs = all(".workspace-tab");
        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => openTab(tab.getAttribute("aria-controls").replace("panel-", "")));
            tab.addEventListener("keydown", event => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                let next = index;
                if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                tabs[next].focus();
                tabs[next].click();
            });
        });
        all("[data-open-tab]").forEach(button => button.addEventListener("click", () => openTab(button.dataset.openTab)));
        $("heroNextAction").addEventListener("click", () => openTab("practice"));
        $("overviewNextAction").addEventListener("click", () => openTab("practice"));
    }

    function openTab(name) {
        all(".workspace-tab").forEach(tab => {
            const selected = tab.getAttribute("aria-controls") === `panel-${name}`;
            tab.classList.toggle("active", selected);
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        all(".workspace-panel").forEach(panel => { panel.hidden = panel.id !== `panel-${name}`; });
        if (name === "practice" && !currentQuestion) loadPracticeQuestion();
    }

    function setupTrackPicker() {
        const options = all(".track-option");
        options.forEach((button, index) => {
            button.addEventListener("click", () => switchTrack(button.dataset.track));
            button.addEventListener("keydown", event => {
                if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
                event.preventDefault();
                options[(index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus();
            });
        });
    }

    function switchTrack(track) {
        if (!state.tracks[track] || state.activeTrack === track) return;
        stopQuestionTimer();
        state.activeTrack = track;
        activeSubject = SUBJECTS[track][0].id;
        currentQuestion = null;
        tryoutQuestions = [];
        practiceMode = "practice";
        saveState();
        renderAll();
        showToast(`Jalur ${TRACK_LABELS[track]} aktif.`);
    }

    function renderAll() {
        renderTrackChrome();
        renderOverview();
        renderMaterials();
        renderSubjectFilter();
        renderReviewLists();
        loadPlanner();
        renderRoadmap();
        renderFormula();
        if (!$("panel-practice").hidden) loadPracticeQuestion();
    }

    function renderTrackChrome() {
        all(".track-option").forEach(button => {
            const active = button.dataset.track === state.activeTrack;
            button.classList.toggle("active", active);
            button.setAttribute("aria-checked", String(active));
        });
        const snbt = state.activeTrack === "snbt";
        $("officialTitle").textContent = snbt ? "Struktur UTBK-SNBT 2026" : "Struktur TKA SMA";
        $("officialText").textContent = snbt ? "Materi terdiri atas Tes Potensi Skolastik dan Tes Literasi. Analitik di halaman ini adalah estimasi belajar internal, bukan skor resmi." : "TKA SMA mencakup Bahasa Indonesia, Matematika, Bahasa Inggris, dan dua mata pelajaran pilihan. Indeks kesiapan di halaman ini bukan hasil TKA resmi.";
        $("officialLink").href = snbt ? "https://www.snpmb.id/utbk-snbt/informasi-umum" : "https://pusmendik.kemdikbud.go.id/tka/";
    }

    function calculateReadiness(data = trackState()) {
        const stats = data.stats;
        const accuracy = stats.done ? (stats.correct / stats.done) * 100 : 0;
        const subjects = trackSubjects();
        const covered = subjects.filter(subject => {
            const key = questionSubject(subject.id);
            return Number(stats.bySubject[key]?.done || 0) > 0;
        }).length;
        const coverage = subjects.length ? (covered / subjects.length) * 100 : 0;
        return { score: Math.round((accuracy * .7) + (coverage * .3)), accuracy: Math.round(accuracy), covered, total: subjects.length };
    }

    function gradeAnswer(question, selected) {
        if (!question || !Array.isArray(question.correctIndexes) || !Array.isArray(selected)) return false;
        const actual = [...new Set(selected)].sort((a, b) => a - b);
        const expected = [...question.correctIndexes].sort((a, b) => a - b);
        return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
    }

    function renderOverview() {
        const data = trackState();
        const readiness = calculateReadiness(data);
        $("readinessValue").textContent = readiness.score;
        $("readinessRing").style.setProperty("--value", `${readiness.score * 3.6}deg`);
        $("metricAnswered").textContent = data.stats.done;
        $("metricAccuracy").textContent = `${readiness.accuracy}%`;
        $("metricCoverage").textContent = `${readiness.covered}/${readiness.total}`;
        let label = "Mulai dari fondasi";
        let description = "Kerjakan beberapa soal agar rekomendasi menjadi lebih personal.";
        if (readiness.score >= 80) { label = "Siap simulasi"; description = "Pertahankan konsistensi dan berlatih dalam batas waktu."; }
        else if (readiness.score >= 60) { label = "Ritme sudah stabil"; description = "Perkuat kompetensi dengan akurasi paling rendah."; }
        else if (readiness.score >= 35) { label = "Sedang bertumbuh"; description = "Lanjutkan paket pendek dan review setiap kesalahan."; }
        $("readinessLabel").textContent = label;
        $("readinessDescription").textContent = description;

        const performance = trackSubjects().map(subject => {
            const key = questionSubject(subject.id);
            const row = data.stats.bySubject[key] || { done: 0, correct: 0 };
            const accuracy = row.done ? Math.round((row.correct / row.done) * 100) : 0;
            return { ...subject, accuracy, done: row.done || 0 };
        });
        const weakest = performance.filter(item => item.done).sort((a, b) => a.accuracy - b.accuracy)[0];
        $("nextTitle").textContent = weakest ? `Perkuat ${weakest.name}` : "Mulai diagnosis singkat";
        $("nextDescription").textContent = weakest ? `Akurasi ${weakest.accuracy}%. Kerjakan satu set terarah lalu tinjau alasan jawaban.` : "Kerjakan latihan awal untuk menemukan fokus belajar pertamamu.";
        $("competencyPerformance").innerHTML = performance.map(item => `<div class="competency-row"><span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><div class="competency-bar"><div style="width:${item.accuracy}%"></div></div><strong>${item.done ? `${item.accuracy}%` : "—"}</strong></div>`).join("");
        const goal = data.planner.weeklyGoal;
        const weeklyPct = Math.min(100, Math.round((data.weekly.count / goal) * 100));
        $("weeklyProgressFill").style.width = `${weeklyPct}%`;
        $("weeklyProgressText").textContent = `${data.weekly.count} dari ${goal} soal`;
        $("lastActivity").textContent = data.lastActivity || "Belum ada aktivitas";
    }

    function renderMaterials() {
        const data = trackState();
        const subjects = trackSubjects();
        $("materialsTitle").textContent = `Materi ${TRACK_LABELS[state.activeTrack]}`;
        $("materialsDescription").textContent = state.activeTrack === "snbt" ? "Tujuh subtes resmi dipetakan menjadi topik kecil yang dapat ditandai dan dilatih." : "Tiga mapel wajib dan dua mapel pilihan tersusun berdasarkan kompetensi inti.";
        let total = 0, done = 0;
        subjects.forEach(subject => subject.topics.forEach((_, index) => { total += 1; if (data.materialDone[`${subject.id}:${index}`]) done += 1; }));
        $("materialProgress").textContent = `${total ? Math.round((done / total) * 100) : 0}%`;
        $("materialsGrid").innerHTML = subjects.map(subject => {
            const checked = subject.topics.filter((_, index) => data.materialDone[`${subject.id}:${index}`]).length;
            return `<details class="material-card"><summary><span class="material-icon"><i class="fa-solid ${subject.icon}" aria-hidden="true"></i></span><div><h3>${escapeHtml(subject.name)}</h3><p>${checked} dari ${subject.topics.length} topik selesai</p></div><div class="material-progress"><strong>${Math.round((checked / subject.topics.length) * 100)}%</strong><span>${escapeHtml(subject.short)}</span></div></summary><div class="material-body"><div class="topic-checklist">${subject.topics.map((topic, index) => `<label><input type="checkbox" data-material-key="${subject.id}:${index}" ${data.materialDone[`${subject.id}:${index}`] ? "checked" : ""}> <span>${escapeHtml(topic)}</span></label>`).join("")}</div><div class="material-actions"><button class="secondary-button" type="button" data-practice-subject="${subject.id}">Latihan ${escapeHtml(subject.short)}</button></div></div></details>`;
        }).join("");
        all("[data-material-key]").forEach(input => input.addEventListener("change", () => {
            data.materialDone[input.dataset.materialKey] = input.checked;
            data.lastActivity = `${input.checked ? "Menuntaskan" : "Memperbarui"} materi ${input.nextElementSibling.textContent}`;
            saveState(); renderMaterials(); renderOverview();
        }));
        all("[data-practice-subject]").forEach(button => button.addEventListener("click", () => {
            activeSubject = button.dataset.practiceSubject; practiceMode = "practice"; openTab("practice"); renderSubjectFilter(); loadPracticeQuestion();
        }));
    }

    function setupPractice() {
        all("[data-practice-mode]").forEach(button => button.addEventListener("click", () => setPracticeMode(button.dataset.practiceMode)));
        $("practiceTimer").addEventListener("change", () => currentQuestion && startQuestionTimer());
        $("submitAnswer").addEventListener("click", () => submitCurrentAnswer(false));
        $("nextQuestion").addEventListener("click", nextQuestion);
        $("bookmarkQuestion").addEventListener("click", toggleBookmark);
        $("mistakeSearch").addEventListener("input", renderReviewLists);
    }

    function setPracticeMode(mode) {
        practiceMode = mode === "tryout" ? "tryout" : "practice";
        all("[data-practice-mode]").forEach(button => button.classList.toggle("active", button.dataset.practiceMode === practiceMode));
        $("subjectFilter").hidden = practiceMode === "tryout";
        $("navigatorCard").hidden = practiceMode !== "tryout";
        $("tryoutProgress").hidden = practiceMode !== "tryout";
        if (practiceMode === "tryout") startMiniTryout();
        else { tryoutQuestions = []; practiceIndex = 0; loadPracticeQuestion(); }
    }

    function renderSubjectFilter() {
        const subjects = trackSubjects();
        if (!subjects.some(item => item.id === activeSubject)) activeSubject = subjects[0].id;
        $("subjectFilter").innerHTML = subjects.map(subject => `<button class="subject-chip ${subject.id === activeSubject ? "active" : ""}" type="button" data-subject="${subject.id}">${escapeHtml(subject.short)}</button>`).join("");
        all("[data-subject]").forEach(button => button.addEventListener("click", () => {
            activeSubject = button.dataset.subject; practiceIndex = 0; renderSubjectFilter(); loadPracticeQuestion();
        }));
    }

    function startMiniTryout() {
        const pool = shuffle(QUESTIONS.filter(item => item.track === state.activeTrack));
        const subjects = Array.from(new Set(pool.map(item => item.subject)));
        const chosen = subjects.map(subject => pool.find(item => item.subject === subject)).filter(Boolean);
        pool.forEach(item => { if (chosen.length < 10 && !chosen.includes(item)) chosen.push(item); });
        tryoutQuestions = chosen.slice(0, 10);
        tryoutResponses = {};
        practiceIndex = 0;
        renderNavigator();
        loadPracticeQuestion();
        showToast("Mini tryout dimulai. Jawaban dapat diperiksa satu per satu.");
    }

    function loadPracticeQuestion() {
        stopQuestionTimer();
        const pool = practiceMode === "tryout" ? tryoutQuestions : questionsFor();
        if (!pool.length) return;
        currentQuestion = pool[practiceIndex % pool.length];
        currentSubmitted = Boolean(practiceMode === "tryout" && tryoutResponses[currentQuestion.id]?.submitted);
        selectedAnswers = new Set(practiceMode === "tryout" ? (tryoutResponses[currentQuestion.id]?.selected || []) : []);
        $("questionMeta").textContent = `${TRACK_LABELS[state.activeTrack]} · ${subjectLabel(currentQuestion.subject)} · ${currentQuestion.topic} · ${currentQuestion.difficulty}`;
        $("questionPrompt").textContent = currentQuestion.prompt;
        $("questionInstruction").textContent = currentQuestion.correctIndexes.length > 1 ? "Pilih semua jawaban yang benar." : "Pilih satu jawaban yang paling tepat.";
        $("questionFeedback").hidden = !currentSubmitted;
        $("mistakeNoteWrap").hidden = true;
        $("mistakeNote").value = trackState().mistakes[currentQuestion.id]?.note || "";
        renderAnswers();
        updateBookmarkButton();
        $("submitAnswer").disabled = currentSubmitted;
        $("nextQuestion").disabled = !currentSubmitted;
        if (currentSubmitted) showStoredFeedback();
        if (practiceMode === "tryout") {
            $("tryoutProgressFill").style.width = `${((practiceIndex + 1) / tryoutQuestions.length) * 100}%`;
            renderNavigator();
        }
        startQuestionTimer();
    }

    function renderAnswers() {
        $("answerList").innerHTML = currentQuestion.choices.map((choice, index) => {
            const selected = selectedAnswers.has(index);
            const correct = currentSubmitted && currentQuestion.correctIndexes.includes(index);
            const wrong = currentSubmitted && selected && !correct;
            const classes = ["answer-option", selected ? "selected" : "", correct ? "correct" : "", wrong ? "wrong" : ""].filter(Boolean).join(" ");
            return `<button class="${classes}" type="button" data-answer-index="${index}" ${currentSubmitted ? "disabled" : ""} aria-pressed="${selected}"><span class="answer-marker">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(choice)}</span></button>`;
        }).join("");
        all("[data-answer-index]").forEach(button => button.addEventListener("click", () => selectAnswer(Number(button.dataset.answerIndex))));
    }

    function selectAnswer(index) {
        if (currentSubmitted) return;
        if (currentQuestion.correctIndexes.length === 1) selectedAnswers = new Set([index]);
        else if (selectedAnswers.has(index)) selectedAnswers.delete(index); else selectedAnswers.add(index);
        renderAnswers();
    }

    function submitCurrentAnswer(fromTimeout = false) {
        if (currentSubmitted || !currentQuestion) return;
        if (!selectedAnswers.size && !fromTimeout) { showToast("Pilih jawaban terlebih dahulu."); return; }
        stopQuestionTimer();
        currentSubmitted = true;
        const selected = Array.from(selectedAnswers).sort((a, b) => a - b);
        const correct = gradeAnswer(currentQuestion, selected);
        const data = trackState();
        const key = currentQuestion.subject;
        data.stats.done += 1;
        data.stats.bySubject[key] = data.stats.bySubject[key] || { done: 0, correct: 0 };
        data.stats.bySubject[key].done += 1;
        if (correct) { data.stats.correct += 1; data.stats.bySubject[key].correct += 1; }
        data.weekly.count += 1;
        data.lastActivity = `${correct ? "Menjawab benar" : "Meninjau kesalahan"} · ${currentQuestion.topic}`;
        if (!correct) data.mistakes[currentQuestion.id] = { selected, note: data.mistakes[currentQuestion.id]?.note || "", updatedAt: new Date().toISOString() };
        else delete data.mistakes[currentQuestion.id];
        if (practiceMode === "tryout") tryoutResponses[currentQuestion.id] = { selected, correct, submitted: true };
        saveState();
        renderAnswers();
        showFeedback(correct, fromTimeout);
        $("submitAnswer").disabled = true;
        $("nextQuestion").disabled = false;
        $("mistakeNoteWrap").hidden = correct;
        if (!correct) $("mistakeNote").addEventListener("change", saveMistakeNote, { once: true });
        renderOverview(); renderReviewLists(); renderNavigator();
    }

    function showFeedback(correct, timedOut) {
        const box = $("questionFeedback");
        box.hidden = false;
        box.className = `feedback-box ${correct ? "correct" : "wrong"}`;
        box.innerHTML = `<strong>${timedOut ? "Waktu habis." : correct ? "Tepat." : "Belum tepat."}</strong> ${escapeHtml(currentQuestion.explanation)}`;
    }

    function showStoredFeedback() {
        const response = tryoutResponses[currentQuestion.id];
        if (!response) return;
        showFeedback(response.correct, false);
        $("mistakeNoteWrap").hidden = response.correct;
    }

    function saveMistakeNote() {
        const entry = trackState().mistakes[currentQuestion.id];
        if (!entry) return;
        entry.note = $("mistakeNote").value.trim().slice(0, 500);
        entry.updatedAt = new Date().toISOString();
        saveState(); renderReviewLists(); showToast("Catatan evaluasi disimpan.");
    }

    function nextQuestion() {
        if (!currentSubmitted) return;
        saveMistakeNote();
        const pool = practiceMode === "tryout" ? tryoutQuestions : questionsFor();
        if (practiceMode === "tryout" && practiceIndex === pool.length - 1) {
            const completed = Object.values(tryoutResponses).filter(item => item.submitted).length;
            const correct = Object.values(tryoutResponses).filter(item => item.correct).length;
            if (completed === pool.length) {
                $("questionFeedback").hidden = false;
                $("questionFeedback").className = "feedback-box correct";
                $("questionFeedback").innerHTML = `<strong>Mini tryout selesai.</strong> ${correct} dari ${completed} jawaban benar (${Math.round((correct / completed) * 100)}%). Buka catatan salah untuk menentukan sesi berikutnya.`;
                $("nextQuestion").disabled = true;
                trackState().lastActivity = `Menyelesaikan mini tryout · ${correct}/${completed} benar`;
                saveState(); renderOverview(); return;
            }
        }
        practiceIndex = (practiceIndex + 1) % pool.length;
        loadPracticeQuestion();
    }

    function startQuestionTimer() {
        stopQuestionTimer();
        const configured = Number($("practiceTimer").value);
        questionSeconds = configured || 0;
        renderQuestionTimer();
        if (!configured || currentSubmitted) return;
        questionTimerId = window.setInterval(() => {
            questionSeconds -= 1;
            renderQuestionTimer();
            if (questionSeconds <= 0) { stopQuestionTimer(); submitCurrentAnswer(true); }
        }, 1000);
    }
    function stopQuestionTimer() { if (questionTimerId) clearInterval(questionTimerId); questionTimerId = null; }
    function renderQuestionTimer() {
        const badge = $("questionTimer");
        badge.innerHTML = `<i class="fa-regular fa-clock" aria-hidden="true"></i> ${questionSeconds ? formatTime(questionSeconds) : "—"}`;
        badge.classList.toggle("urgent", questionSeconds > 0 && questionSeconds <= 15);
    }

    function renderNavigator() {
        if (practiceMode !== "tryout") return;
        $("questionNavigator").innerHTML = tryoutQuestions.map((question, index) => `<button type="button" data-nav-index="${index}" class="${index === practiceIndex ? "active" : ""} ${tryoutResponses[question.id]?.submitted ? "answered" : ""}" aria-label="Buka soal ${index + 1}">${index + 1}</button>`).join("");
        all("[data-nav-index]").forEach(button => button.addEventListener("click", () => { practiceIndex = Number(button.dataset.navIndex); loadPracticeQuestion(); }));
    }

    function toggleBookmark() {
        if (!currentQuestion) return;
        const bookmarks = trackState().bookmarks;
        const index = bookmarks.indexOf(currentQuestion.id);
        if (index >= 0) bookmarks.splice(index, 1); else bookmarks.push(currentQuestion.id);
        saveState(); updateBookmarkButton(); renderReviewLists(); showToast(index >= 0 ? "Bookmark dihapus." : "Soal disimpan.");
    }
    function updateBookmarkButton() {
        const saved = currentQuestion && trackState().bookmarks.includes(currentQuestion.id);
        $("bookmarkQuestion").setAttribute("aria-pressed", String(Boolean(saved)));
        $("bookmarkQuestion").innerHTML = `<i class="${saved ? "fa-solid" : "fa-regular"} fa-bookmark" aria-hidden="true"></i>`;
    }

    function renderReviewLists() {
        const data = trackState();
        const query = $("mistakeSearch").value.trim().toLowerCase();
        const mistakes = Object.entries(data.mistakes).map(([id, entry]) => ({ question: byId.get(id), entry })).filter(item => item.question && (!query || `${item.question.prompt} ${item.entry.note || ""}`.toLowerCase().includes(query)));
        $("mistakeCount").textContent = Object.keys(data.mistakes).length;
        $("mistakeList").innerHTML = mistakes.length ? mistakes.map(item => `<div class="review-item"><strong>${escapeHtml(item.question.topic)}</strong><span>${escapeHtml(item.entry.note || item.question.prompt)}</span><button type="button" data-review-question="${item.question.id}">Latih ulang</button></div>`).join("") : `<p class="review-empty">Belum ada jawaban salah pada jalur ini.</p>`;
        const bookmarks = data.bookmarks.map(id => byId.get(id)).filter(Boolean);
        $("bookmarkCount").textContent = bookmarks.length;
        $("bookmarkList").innerHTML = bookmarks.length ? bookmarks.map(item => `<div class="review-item"><strong>${escapeHtml(item.topic)}</strong><span>${escapeHtml(item.prompt)}</span><button type="button" data-review-question="${item.id}">Buka soal</button></div>`).join("") : `<p class="review-empty">Belum ada soal yang disimpan.</p>`;
        all("[data-review-question]").forEach(button => button.addEventListener("click", () => openQuestionById(button.dataset.reviewQuestion)));
    }

    function openQuestionById(id) {
        const question = byId.get(id);
        if (!question || question.track !== state.activeTrack) return;
        practiceMode = "practice";
        activeSubject = question.subject === "pilihan" ? "pilihan1" : question.subject;
        const pool = questionsFor(activeSubject);
        practiceIndex = Math.max(0, pool.findIndex(item => item.id === id));
        all("[data-practice-mode]").forEach(button => button.classList.toggle("active", button.dataset.practiceMode === "practice"));
        $("subjectFilter").hidden = false; $("navigatorCard").hidden = true; $("tryoutProgress").hidden = true;
        renderSubjectFilter(); openTab("practice"); loadPracticeQuestion();
    }

    function setupPlanner() {
        ELECTIVES.forEach(value => {
            $("firstElective").add(new Option(value, value));
            $("secondElective").add(new Option(value, value));
        });
        $("plannerForm").addEventListener("submit", event => { event.preventDefault(); savePlanner(); });
        $("firstElective").addEventListener("change", validateElectives);
        $("secondElective").addEventListener("change", validateElectives);
        $("focusStart").addEventListener("click", toggleFocusTimer);
        $("focusReset").addEventListener("click", resetFocusTimer);
        $("printPlan").addEventListener("click", () => window.print());
    }

    function loadPlanner() {
        const planner = trackState().planner;
        $("targetUniversity").value = planner.university;
        $("targetProgram").value = planner.program;
        $("studyWeeks").value = planner.weeks;
        $("weeklyGoal").value = planner.weeklyGoal;
        $("firstElective").value = planner.firstElective;
        $("secondElective").value = planner.secondElective;
        $("firstElectiveWrap").hidden = state.activeTrack !== "tka";
        $("secondElectiveWrap").hidden = state.activeTrack !== "tka";
        validateElectives();
    }

    function validateElectives() {
        const duplicate = state.activeTrack === "tka" && $("firstElective").value === $("secondElective").value;
        $("plannerValidation").textContent = duplicate ? "Pilih dua mata pelajaran yang berbeda." : "";
        return !duplicate;
    }

    function savePlanner() {
        if (!validateElectives()) return;
        const planner = trackState().planner;
        planner.university = $("targetUniversity").value.trim().slice(0, 80);
        planner.program = $("targetProgram").value.trim().slice(0, 80);
        planner.weeks = clamp($("studyWeeks").value, 2, 24);
        planner.weeklyGoal = clamp($("weeklyGoal").value, 5, 200);
        planner.firstElective = $("firstElective").value;
        planner.secondElective = $("secondElective").value;
        trackState().lastActivity = `Memperbarui planner ${TRACK_LABELS[state.activeTrack]}`;
        saveState(); renderRoadmap(); renderMaterials(); renderSubjectFilter(); renderOverview(); showToast("Rencana belajar diperbarui.");
    }

    function renderRoadmap() {
        const planner = trackState().planner;
        const subjects = trackSubjects();
        const performance = subjects.map(subject => {
            const row = trackState().stats.bySubject[questionSubject(subject.id)] || { done: 0, correct: 0 };
            return { name: subject.name, accuracy: row.done ? row.correct / row.done : 0, done: row.done || 0 };
        });
        const weakest = performance.filter(item => item.done).sort((a, b) => a.accuracy - b.accuracy)[0]?.name || subjects[0].name;
        const firstEnd = Math.max(1, Math.ceil(planner.weeks / 3));
        const secondEnd = Math.max(firstEnd + 1, Math.ceil(planner.weeks * 2 / 3));
        $("roadmapTitle").textContent = `Rencana ${planner.weeks} minggu${planner.program ? ` · ${planner.program}` : ""}`;
        const items = [
            [`Minggu 1–${firstEnd}`, "Bangun fondasi", `Prioritaskan ${weakest}, tandai materi inti, dan tulis alasan setiap jawaban salah.`],
            [`Minggu ${firstEnd + 1}–${secondEnd}`, "Perluas cakupan", `Capai ${planner.weeklyGoal} soal per minggu dan seimbangkan latihan lintas kompetensi.`],
            [`Minggu ${secondEnd + 1}–${planner.weeks}`, "Simulasi dan review", "Kerjakan mini tryout dengan timer, lalu ulangi soal salah setelah jeda belajar."]
        ];
        $("roadmapList").innerHTML = items.map(([week, title, body]) => `<article class="roadmap-item"><span>${week}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></article>`).join("");
    }

    function toggleFocusTimer() {
        if (focusTimerId) {
            clearInterval(focusTimerId); focusTimerId = null;
            $("focusStart").innerHTML = `<i class="fa-solid fa-play" aria-hidden="true"></i> Lanjutkan`;
            $("focusStatus").textContent = "Sesi dijeda.";
            return;
        }
        $("focusStart").innerHTML = `<i class="fa-solid fa-pause" aria-hidden="true"></i> Jeda`;
        $("focusStatus").textContent = "Fokus pada satu target kecil.";
        focusTimerId = window.setInterval(() => {
            focusSeconds -= 1; $("focusTimer").textContent = formatTime(focusSeconds);
            if (focusSeconds <= 0) {
                clearInterval(focusTimerId); focusTimerId = null; focusSeconds = 25 * 60;
                $("focusTimer").textContent = "25:00"; $("focusStart").innerHTML = `<i class="fa-solid fa-play" aria-hidden="true"></i> Mulai`;
                $("focusStatus").textContent = "Sesi selesai. Ambil jeda singkat.";
                trackState().lastActivity = "Menyelesaikan sesi fokus 25 menit"; saveState(); renderOverview(); showToast("Sesi fokus selesai. Bagus!");
            }
        }, 1000);
    }
    function resetFocusTimer() { if (focusTimerId) clearInterval(focusTimerId); focusTimerId = null; focusSeconds = 25 * 60; $("focusTimer").textContent = "25:00"; $("focusStart").innerHTML = `<i class="fa-solid fa-play" aria-hidden="true"></i> Mulai`; $("focusStatus").textContent = "Siap memulai sesi fokus."; }

    function setupDialogs() {
        $("openFormulaBtn").addEventListener("click", () => $("formulaDialog").showModal());
        $("closeFormulaBtn").addEventListener("click", () => $("formulaDialog").close());
        $("formulaDialog").addEventListener("click", event => { if (event.target === $("formulaDialog")) $("formulaDialog").close(); });
        $("cancelConfirm").addEventListener("click", () => { pendingReset = null; $("confirmDialog").close(); });
        $("acceptConfirm").addEventListener("click", performReset);
    }

    function renderFormula() {
        const blocks = state.activeTrack === "snbt" ? [
            ["Penalaran", "Pisahkan informasi pasti, asumsi, dan simpulan. Uji apakah simpulan tetap benar pada semua kondisi yang diberikan."],
            ["Kuantitatif", "Persentase perubahan = (nilai baru − nilai lama) / nilai lama × 100%. Selalu cek satuan dan kewajaran hasil."],
            ["Literasi", "Bedakan informasi eksplisit, inferensi yang didukung teks, dan opini yang melampaui bukti."]
        ] : [
            ["Matematika", "Gradien: <code>m = (y₂ − y₁)/(x₂ − x₁)</code>. Peluang: <code>P(A) = n(A)/n(S)</code>."],
            ["Bahasa", "Temukan gagasan utama, hubungan antarparagraf, bukti yang mendukung klaim, dan makna kata dalam konteks."],
            ["Mapel Pilihan", "Mulai dari konsep kurikulum, lanjutkan penerapan, lalu kerjakan masalah kontekstual dan penalaran tingkat lanjut."]
        ];
        $("formulaTitle").textContent = `Ringkasan konsep ${TRACK_LABELS[state.activeTrack]}`;
        $("formulaContent").innerHTML = blocks.map(([title, body]) => `<section class="formula-block"><h3>${title}</h3><p>${body}</p></section>`).join("");
    }

    function setupUtilities() {
        $("exportProgress").addEventListener("click", exportProgress);
        $("importProgress").addEventListener("change", importProgress);
        $("resetTrack").addEventListener("click", () => askReset("track"));
        $("resetAll").addEventListener("click", () => askReset("all"));
    }

    function exportProgress() {
        const payload = { app: "universe-of-tech-exam-hub", version: STORE_VERSION, exportedAt: new Date().toISOString(), state };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `progres-snbt-tka-${new Date().toISOString().slice(0, 10)}.json`; link.click();
        URL.revokeObjectURL(url); showToast("Cadangan progres dibuat.");
    }

    async function importProgress(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || file.size > 2_000_000) { showToast("File tidak valid atau terlalu besar."); return; }
        try {
            const payload = JSON.parse(await file.text());
            if (!validateImportPayload(payload)) throw new Error("schema");
            const imported = freshState();
            imported.activeTrack = payload.state.activeTrack === "tka" ? "tka" : "snbt";
            imported.migratedLegacy = true;
            imported.tracks.snbt = normalizeTrack(payload.state.tracks.snbt);
            imported.tracks.tka = normalizeTrack(payload.state.tracks.tka);
            state = imported; activeSubject = SUBJECTS[state.activeTrack][0].id; currentQuestion = null;
            saveState(); renderAll(); showToast("Progres berhasil diimpor.");
        } catch (_) { showToast("File progres tidak dikenali atau rusak."); }
    }

    function askReset(scope) {
        pendingReset = scope;
        $("confirmTitle").textContent = scope === "all" ? "Reset semua progres?" : `Reset progres ${TRACK_LABELS[state.activeTrack]}?`;
        $("confirmText").textContent = scope === "all" ? "Progres SNBT dan TKA di perangkat ini akan dihapus." : "Hanya statistik, materi, planner, bookmark, dan catatan jalur aktif yang akan dihapus.";
        $("confirmDialog").showModal();
    }

    function performReset() {
        if (pendingReset === "all") {
            const active = state.activeTrack; state = freshState(); state.activeTrack = active; state.migratedLegacy = true;
        } else if (pendingReset === "track") state.tracks[state.activeTrack] = freshTrack();
        pendingReset = null; currentQuestion = null; activeSubject = SUBJECTS[state.activeTrack][0].id;
        saveState(); $("confirmDialog").close(); renderAll(); showToast("Progres berhasil direset.");
    }

    function shuffle(items) {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
        return copy;
    }
    function formatTime(seconds) { const safe = Math.max(0, seconds); return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`; }
    function escapeHtml(value) { return String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }
    function showToast(message) { const toast = $("toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400); }

    function validateImportPayload(payload) {
        return Boolean(payload && payload.app === "universe-of-tech-exam-hub" && payload.version === STORE_VERSION && payload.state && payload.state.tracks && payload.state.tracks.snbt && payload.state.tracks.tka);
    }

    const publicApi = { QUESTIONS, SUBJECTS, ELECTIVES, freshState, normalizeTrack, applyLegacy, gradeAnswer, validateImportPayload };
    if (typeof module !== "undefined" && module.exports) module.exports = publicApi;
    if (typeof window !== "undefined") window.ExamHub = publicApi;
    if (hasDOM) {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
    }
})();
