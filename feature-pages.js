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

    themeToggleBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        localStorage.setItem("eduquest_theme", isDark ? "dark" : "light");
        themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
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
        const accuracy = Math.round((stats.correct / Math.max(stats.done, 1)) * 100);
        document.getElementById("snbtDone").textContent = stats.done;
        document.getElementById("snbtAccuracy").textContent = `${accuracy}%`;
        document.getElementById("snbtLevel").textContent = accuracy >= 80 ? "Siap" : accuracy >= 60 ? "Stabil" : accuracy >= 40 ? "Naik" : "Fondasi";
        ring.style.setProperty("--progress", `${Math.min(accuracy, 100)}%`);
        ringText.textContent = `${accuracy}%`;
        storage.set("snbt_stats", stats);
        renderDiagnostic(accuracy);
    }

    function buildPlan() {
        const target = Number(targetInput.value || 650);
        const weeks = Number(weeksInput.value || 6);
        const focus = focusSelect.value;
        const electivePair = `${firstElective.value} + ${secondElective.value}`;
        const intensity = target >= 720 ? "intensif" : target >= 650 ? "stabil" : "fondasi";
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
            const subjectAccuracy = Math.round((data.correct / Math.max(data.done, 1)) * 100);
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
            `<button class="answer-btn" data-answer="${index}">${answer}</button>`
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
    const subjectList = document.getElementById("tkaLmsSubjects");
    const difficultyFilters = document.querySelectorAll("[data-tka-difficulty]");
    const typeFilters = document.querySelectorAll("[data-tka-type]");
    const searchInput = document.getElementById("tkaQuestionSearch");
    const questionList = document.getElementById("tkaQuestionList");
    const questionMeta = document.getElementById("tkaLmsQuestionMeta");
    const questionTitle = document.getElementById("tkaLmsQuestionTitle");
    const questionStimulus = document.getElementById("tkaLmsStimulus");
    const answerGrid = document.getElementById("tkaLmsAnswers");
    const explanation = document.getElementById("tkaLmsExplanation");
    const submitButton = document.getElementById("tkaSubmitAnswer");
    const nextButton = document.getElementById("tkaNextQuestion");
    const reviewButton = document.getElementById("tkaMarkReview");
    const resetButton = document.getElementById("tkaResetFilters");
    const progressBar = document.getElementById("tkaLmsProgressBar");
    const doneText = document.getElementById("tkaLmsDone");
    const accuracyText = document.getElementById("tkaLmsAccuracy");
    const streakText = document.getElementById("tkaLmsStreak");
    const weakText = document.getElementById("tkaLmsWeak");
    const sourceText = document.getElementById("tkaLmsSource");
    const modeFilters = document.querySelectorAll("[data-tka-mode]");
    const sessionSizeSelect = document.getElementById("tkaSessionSize");
    const timerDisplay = document.getElementById("tkaTimerDisplay");
    const timerToggle = document.getElementById("tkaTimerToggle");
    const timerReset = document.getElementById("tkaTimerReset");
    const reviewCountText = document.getElementById("tkaLmsReviewCount");
    const masteryText = document.getElementById("tkaLmsMastery");
    const sessionTargetText = document.getElementById("tkaLmsSessionTarget");
    const questionCounter = document.getElementById("tkaQuestionCounter");
    const questionStatus = document.getElementById("tkaQuestionStatus");
    const prevButton = document.getElementById("tkaPrevQuestion");
    const hintButton = document.getElementById("tkaShowHint");
    const noteInput = document.getElementById("tkaQuestionNote");
    const saveNoteButton = document.getElementById("tkaSaveNote");
    const analyticsGrid = document.getElementById("tkaAnalyticsGrid");
    const resetProgressButton = document.getElementById("tkaResetProgress");

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

    const questionBank = [
        {
            id: "ind-01",
            subject: "indonesia",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Ide pokok",
            prompt: "Gagasan utama paragraf tentang kebiasaan membaca singkat setiap hari adalah...",
            stimulus: "Membaca selama 15 menit setiap hari dapat membentuk daya tahan memahami teks. Kebiasaan singkat yang konsisten membuat pembaca lebih mudah mengingat istilah baru daripada membaca lama tetapi jarang.",
            options: ["Membaca lama selalu tidak efektif", "Konsistensi membaca membantu pemahaman", "Istilah baru hanya muncul di buku ilmiah", "Membaca harian tidak perlu jadwal"],
            correct: 1,
            explanation: "Paragraf menekankan kebiasaan singkat yang konsisten dan dampaknya pada pemahaman."
        },
        {
            id: "ind-02",
            subject: "indonesia",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Inferensi",
            prompt: "Simpulan paling aman dari teks adalah...",
            stimulus: "Perpustakaan sekolah memperpanjang jam buka. Setelah dua bulan, kunjungan meningkat dan peminjaman buku nonfiksi naik.",
            options: ["Semua siswa pasti membaca nonfiksi", "Jam buka yang lebih panjang berkaitan dengan naiknya aktivitas baca", "Fiksi tidak lagi dibaca siswa", "Perpustakaan menjadi satu-satunya sumber belajar"],
            correct: 1,
            explanation: "Data hanya menunjukkan hubungan antara jam buka dan aktivitas baca, bukan kepastian mutlak."
        },
        {
            id: "ind-03",
            subject: "indonesia",
            difficulty: "hots",
            type: "multi",
            sourceKind: "pola tka 2025",
            skill: "Evaluasi argumen",
            prompt: "Pilih dua data yang paling relevan untuk menguji klaim bahwa program literasi menaikkan pemahaman bacaan.",
            stimulus: "Klaim: Program literasi 20 menit sebelum pelajaran membuat kemampuan memahami bacaan meningkat.",
            options: ["Nilai pemahaman bacaan sebelum dan sesudah program", "Jumlah poster di kelas", "Kehadiran siswa selama program berjalan", "Warna sampul buku yang dibaca"],
            correct: [0, 2],
            explanation: "Nilai sebelum-sesudah mengukur dampak, sedangkan kehadiran menunjukkan keterpaparan siswa terhadap program."
        },
        {
            id: "ind-04",
            subject: "indonesia",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Validasi pernyataan",
            prompt: "Tentukan benar/salah: Klaim kuat harus didukung data yang langsung berkaitan dengan masalah.",
            stimulus: "Dalam soal TKA, penguatan argumen biasanya meminta data yang relevan, terukur, dan tidak melompat dari konteks.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Klaim akademik harus ditopang data yang relevan dengan variabel yang dibahas."
        },
        {
            id: "ind-05",
            subject: "indonesia",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Makna kata",
            prompt: "Makna kata 'konsisten' pada teks paling dekat dengan...",
            stimulus: "Latihan yang konsisten membuat siswa lebih mudah mengenali pola soal.",
            options: ["Berulang dan teratur", "Sangat cepat", "Tidak berubah sama sekali", "Sulit diprediksi"],
            correct: 0,
            explanation: "Konsisten dalam konteks latihan berarti dilakukan berulang dan teratur."
        },
        {
            id: "ind-06",
            subject: "indonesia",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Hubungan antar kalimat",
            prompt: "Kalimat yang paling tepat untuk melanjutkan teks adalah...",
            stimulus: "Banyak siswa memahami rumus, tetapi keliru ketika membaca soal cerita. Oleh karena itu, latihan literasi numerik perlu...",
            options: ["mengabaikan konteks bacaan", "memadukan pemahaman teks dan operasi hitung", "hanya menghafal rumus", "mengurangi latihan membaca"],
            correct: 1,
            explanation: "Masalahnya ada pada penerjemahan teks ke operasi hitung, jadi solusinya memadukan keduanya."
        },
        {
            id: "ind-07",
            subject: "indonesia",
            difficulty: "hots",
            type: "single",
            sourceKind: "prediksi",
            skill: "Asumsi tersembunyi",
            prompt: "Asumsi yang mendasari argumen pada teks adalah...",
            stimulus: "Sekolah perlu menyediakan ruang baca tenang karena siswa lebih mudah fokus jika lingkungan minim gangguan.",
            options: ["Semua siswa tidak suka membaca", "Lingkungan belajar memengaruhi fokus siswa", "Ruang baca selalu mahal", "Gangguan hanya berasal dari suara"],
            correct: 1,
            explanation: "Argumen mengandaikan bahwa kondisi lingkungan berpengaruh terhadap kemampuan fokus."
        },
        {
            id: "ind-08",
            subject: "indonesia",
            difficulty: "prediksi",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Strategi revisi",
            prompt: "Pilih dua perbaikan yang membuat paragraf laporan lebih akademik.",
            stimulus: "Paragraf laporan harus jelas, berbasis data, dan tidak terlalu emosional.",
            options: ["Menambahkan angka hasil pengamatan", "Menggunakan kata 'paling keren' berkali-kali", "Menjelaskan metode pengumpulan data", "Menghapus semua fakta"],
            correct: [0, 2],
            explanation: "Data dan metode membuat laporan lebih dapat dipertanggungjawabkan."
        },
        {
            id: "mat-01",
            subject: "matematika",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Aljabar",
            prompt: "Jika 4x + 8 = 36, nilai x adalah...",
            stimulus: "Selesaikan persamaan linear satu variabel.",
            options: ["6", "7", "8", "9"],
            correct: 1,
            explanation: "4x = 28 sehingga x = 7."
        },
        {
            id: "mat-02",
            subject: "matematika",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Rasio",
            prompt: "Rasio peserta lulus dan belum lulus adalah 5:3. Jika total peserta 64, jumlah peserta lulus adalah...",
            stimulus: "Gunakan perbandingan bagian terhadap total.",
            options: ["24", "32", "40", "48"],
            correct: 2,
            explanation: "Total bagian 8. Satu bagian 64/8 = 8. Lulus 5 bagian = 40."
        },
        {
            id: "mat-03",
            subject: "matematika",
            difficulty: "hots",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Optimasi sederhana",
            prompt: "Paket A berisi 3 buku dan 2 pena seharga 42 ribu. Paket B berisi 2 buku dan 4 pena seharga 44 ribu. Harga 1 buku adalah...",
            stimulus: "Misalkan buku = b dan pena = p.",
            options: ["8 ribu", "10 ribu", "12 ribu", "14 ribu"],
            correct: 1,
            explanation: "3b + 2p = 42 dan 2b + 4p = 44. Dari eliminasi diperoleh b = 10."
        },
        {
            id: "mat-04",
            subject: "matematika",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Peluang",
            prompt: "Tentukan benar/salah: Peluang mengambil kartu merah dari 5 merah dan 15 total kartu adalah 1/3.",
            stimulus: "Peluang = kejadian yang diinginkan dibagi seluruh kejadian mungkin.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Peluang = 5/15 = 1/3."
        },
        {
            id: "mat-05",
            subject: "matematika",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Persentase",
            prompt: "Harga barang Rp80.000 didiskon 25%. Harga setelah diskon adalah...",
            stimulus: "Diskon 25% berarti membayar 75% dari harga awal.",
            options: ["Rp55.000", "Rp60.000", "Rp65.000", "Rp70.000"],
            correct: 1,
            explanation: "75% x 80.000 = 60.000."
        },
        {
            id: "mat-06",
            subject: "matematika",
            difficulty: "sedang",
            type: "multi",
            sourceKind: "pola tka 2025",
            skill: "Statistika",
            prompt: "Pilih dua pernyataan yang benar untuk data 4, 6, 6, 8, 11.",
            stimulus: "Perhatikan ukuran pemusatan data.",
            options: ["Median adalah 6", "Modus adalah 8", "Rata-rata adalah 7", "Jangkauan adalah 5"],
            correct: [0, 2],
            explanation: "Median nilai tengah adalah 6. Rata-rata = 35/5 = 7."
        },
        {
            id: "mat-07",
            subject: "matematika",
            difficulty: "hots",
            type: "single",
            sourceKind: "prediksi",
            skill: "Fungsi",
            prompt: "Jika f(x) = 2x - 3 dan f(a) = 15, nilai a adalah...",
            stimulus: "Substitusi nilai fungsi ke persamaan.",
            options: ["6", "7", "8", "9"],
            correct: 3,
            explanation: "2a - 3 = 15, maka 2a = 18 dan a = 9."
        },
        {
            id: "mat-08",
            subject: "matematika",
            difficulty: "prediksi",
            type: "single",
            sourceKind: "prediksi",
            skill: "Geometri",
            prompt: "Luas segitiga dengan alas 12 cm dan tinggi 9 cm adalah...",
            stimulus: "Gunakan rumus luas segitiga.",
            options: ["42 cm2", "48 cm2", "54 cm2", "60 cm2"],
            correct: 2,
            explanation: "Luas = 1/2 x 12 x 9 = 54 cm2."
        },
        {
            id: "eng-01",
            subject: "inggris",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Main idea",
            prompt: "The main idea of the text is...",
            stimulus: "Online classes give students flexibility, but they also require discipline because distractions are easy to find at home.",
            options: ["Online learning needs discipline", "Home is always quiet", "Students dislike flexibility", "Distractions never happen online"],
            correct: 0,
            explanation: "The sentence balances flexibility with the need for discipline."
        },
        {
            id: "eng-02",
            subject: "inggris",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Inference",
            prompt: "What can be inferred about Dito?",
            stimulus: "Dito submitted his draft early and asked his teacher which parts needed revision.",
            options: ["He avoided feedback", "He was proactive", "He forgot the task", "He rejected the revision"],
            correct: 1,
            explanation: "Submitting early and asking for revision feedback indicate a proactive attitude."
        },
        {
            id: "eng-03",
            subject: "inggris",
            difficulty: "hots",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Vocabulary",
            prompt: "The word 'significant' is closest in meaning to...",
            stimulus: "The new study showed a significant improvement in students' reading scores.",
            options: ["Tiny", "Important", "Hidden", "Temporary"],
            correct: 1,
            explanation: "Significant means important or large enough to be noticed."
        },
        {
            id: "eng-04",
            subject: "inggris",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Statement check",
            prompt: "True or false: The text suggests that discipline helps online learners manage distractions.",
            stimulus: "Online classes give students flexibility, but they also require discipline because distractions are easy to find at home.",
            options: ["True", "False"],
            correct: 0,
            explanation: "The text directly connects discipline with the presence of distractions at home."
        },
        {
            id: "eng-05",
            subject: "inggris",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Reference",
            prompt: "The word 'they' refers to...",
            stimulus: "Digital notes are easy to update. They can also be shared quickly with classmates.",
            options: ["Classmates", "Digital notes", "Updates", "Teachers"],
            correct: 1,
            explanation: "'They' refers back to digital notes."
        },
        {
            id: "eng-06",
            subject: "inggris",
            difficulty: "sedang",
            type: "multi",
            sourceKind: "pola tka 2025",
            skill: "Detail check",
            prompt: "Choose two statements supported by the text.",
            stimulus: "A school garden project helped students learn biology concepts and encouraged them to reduce plastic waste during lunch.",
            options: ["The project supported biology learning", "Students were encouraged to reduce plastic waste", "The project replaced all classes", "Lunch was cancelled every day"],
            correct: [0, 1],
            explanation: "The text explicitly mentions biology learning and reducing plastic waste."
        },
        {
            id: "eng-07",
            subject: "inggris",
            difficulty: "hots",
            type: "single",
            sourceKind: "prediksi",
            skill: "Purpose",
            prompt: "The author's purpose is most likely to...",
            stimulus: "This notice reminds students to bring reusable bottles to reduce single-use plastic at school events.",
            options: ["Entertain readers with a story", "Persuade students to use reusable bottles", "Describe a historical event", "Compare two school buildings"],
            correct: 1,
            explanation: "The notice asks students to change behavior, so its purpose is persuasive."
        },
        {
            id: "eng-08",
            subject: "inggris",
            difficulty: "prediksi",
            type: "single",
            sourceKind: "prediksi",
            skill: "Tone",
            prompt: "The tone of the announcement is...",
            stimulus: "Please arrive ten minutes before the workshop starts so the session can begin on time.",
            options: ["Polite and instructional", "Angry and sarcastic", "Doubtful and unclear", "Humorous and fictional"],
            correct: 0,
            explanation: "The announcement uses polite instruction to guide behavior."
        },
        {
            id: "fis-01",
            subject: "fisika",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Gerak lurus",
            prompt: "Benda bergerak 60 meter dalam 12 detik. Kelajuan rata-ratanya adalah...",
            stimulus: "Kelajuan rata-rata = jarak / waktu.",
            options: ["3 m/s", "4 m/s", "5 m/s", "6 m/s"],
            correct: 2,
            explanation: "60 / 12 = 5 m/s."
        },
        {
            id: "fis-02",
            subject: "fisika",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Gaya",
            prompt: "Gaya 20 N bekerja pada benda bermassa 4 kg. Percepatan benda adalah...",
            stimulus: "Gunakan Hukum II Newton: F = m a.",
            options: ["2 m/s2", "4 m/s2", "5 m/s2", "8 m/s2"],
            correct: 2,
            explanation: "a = F/m = 20/4 = 5 m/s2."
        },
        {
            id: "fis-03",
            subject: "fisika",
            difficulty: "hots",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Energi",
            prompt: "Pilih dua pernyataan yang benar tentang energi mekanik ideal.",
            stimulus: "Pada sistem tanpa gesekan, energi mekanik merupakan jumlah energi kinetik dan potensial.",
            options: ["Energi mekanik tetap", "Gesekan mengubah sebagian energi menjadi panas", "Energi potensial selalu nol", "Energi kinetik tidak pernah berubah"],
            correct: [0, 1],
            explanation: "Tanpa gesekan energi mekanik kekal; jika ada gesekan, energi dapat berubah menjadi panas."
        },
        {
            id: "fis-04",
            subject: "fisika",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Listrik",
            prompt: "Tentukan benar/salah: Hambatan 6 ohm dialiri arus 2 A memiliki tegangan 12 V.",
            stimulus: "Gunakan V = I R.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "V = 2 x 6 = 12 V."
        },
        {
            id: "kim-01",
            subject: "kimia",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Atom",
            prompt: "Partikel bermuatan negatif dalam atom adalah...",
            stimulus: "Struktur atom terdiri atas proton, neutron, dan elektron.",
            options: ["Proton", "Neutron", "Elektron", "Nukleon"],
            correct: 2,
            explanation: "Elektron bermuatan negatif."
        },
        {
            id: "kim-02",
            subject: "kimia",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Stoikiometri",
            prompt: "Massa molar H2O adalah...",
            stimulus: "Ar H = 1 dan O = 16.",
            options: ["16", "17", "18", "20"],
            correct: 2,
            explanation: "H2O = 2(1) + 16 = 18."
        },
        {
            id: "kim-03",
            subject: "kimia",
            difficulty: "hots",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Larutan",
            prompt: "Pilih dua ciri larutan asam.",
            stimulus: "Larutan asam memiliki sifat khas yang dapat diuji dengan indikator.",
            options: ["pH kurang dari 7", "Mengubah lakmus biru menjadi merah", "pH selalu 14", "Tidak dapat bereaksi dengan logam apa pun"],
            correct: [0, 1],
            explanation: "Asam memiliki pH < 7 dan mengubah lakmus biru menjadi merah."
        },
        {
            id: "kim-04",
            subject: "kimia",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Reaksi",
            prompt: "Tentukan benar/salah: Katalis mempercepat reaksi tanpa habis bereaksi secara permanen.",
            stimulus: "Katalis menurunkan energi aktivasi reaksi.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Katalis mempercepat reaksi dan tidak dikonsumsi permanen."
        },
        {
            id: "bio-01",
            subject: "biologi",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Sel",
            prompt: "Organel yang berperan sebagai tempat respirasi sel adalah...",
            stimulus: "Respirasi sel menghasilkan energi dalam bentuk ATP.",
            options: ["Ribosom", "Mitokondria", "Vakuola", "Dinding sel"],
            correct: 1,
            explanation: "Mitokondria menjadi tempat utama respirasi sel."
        },
        {
            id: "bio-02",
            subject: "biologi",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Ekologi",
            prompt: "Hubungan lebah dan bunga saat penyerbukan termasuk...",
            stimulus: "Lebah memperoleh nektar, bunga terbantu penyerbukannya.",
            options: ["Parasitisme", "Mutualisme", "Komensalisme", "Predasi"],
            correct: 1,
            explanation: "Keduanya memperoleh keuntungan, sehingga termasuk mutualisme."
        },
        {
            id: "bio-03",
            subject: "biologi",
            difficulty: "hots",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Metode ilmiah",
            prompt: "Pilih dua komponen yang perlu dikontrol dalam percobaan pengaruh cahaya terhadap pertumbuhan tanaman.",
            stimulus: "Peneliti ingin menguji apakah intensitas cahaya memengaruhi tinggi tanaman.",
            options: ["Jenis tanaman", "Jumlah air", "Warna label pot", "Nama peneliti"],
            correct: [0, 1],
            explanation: "Jenis tanaman dan jumlah air perlu dikontrol agar pengaruh cahaya dapat diamati lebih jelas."
        },
        {
            id: "bio-04",
            subject: "biologi",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Genetika",
            prompt: "Tentukan benar/salah: Gen merupakan unit pewarisan sifat.",
            stimulus: "Materi genetik membawa informasi sifat organisme.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Gen adalah unit pewarisan sifat."
        },
        {
            id: "eko-01",
            subject: "ekonomi",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Permintaan",
            prompt: "Jika harga naik dan faktor lain tetap, jumlah barang yang diminta cenderung...",
            stimulus: "Gunakan hukum permintaan.",
            options: ["Naik", "Turun", "Tetap selalu", "Tidak terukur"],
            correct: 1,
            explanation: "Menurut hukum permintaan, harga dan jumlah diminta bergerak berlawanan."
        },
        {
            id: "eko-02",
            subject: "ekonomi",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Biaya peluang",
            prompt: "Seseorang memilih kursus desain dan melepas kesempatan kerja paruh waktu. Upah paruh waktu yang hilang disebut...",
            stimulus: "Biaya peluang adalah nilai alternatif terbaik yang dikorbankan.",
            options: ["Laba bersih", "Biaya peluang", "Modal tetap", "Pajak langsung"],
            correct: 1,
            explanation: "Alternatif terbaik yang dikorbankan adalah biaya peluang."
        },
        {
            id: "eko-03",
            subject: "ekonomi",
            difficulty: "hots",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Inflasi",
            prompt: "Pilih dua dampak inflasi tinggi yang mungkin terjadi.",
            stimulus: "Inflasi tinggi berarti kenaikan harga umum berlangsung cepat.",
            options: ["Daya beli menurun", "Ketidakpastian usaha meningkat", "Semua harga pasti turun", "Nilai uang selalu naik"],
            correct: [0, 1],
            explanation: "Inflasi tinggi menekan daya beli dan membuat pelaku usaha sulit memperkirakan biaya."
        },
        {
            id: "eko-04",
            subject: "ekonomi",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Pasar",
            prompt: "Tentukan benar/salah: Keseimbangan pasar terjadi saat jumlah diminta sama dengan jumlah ditawarkan.",
            stimulus: "Keseimbangan pasar menunjukkan titik temu permintaan dan penawaran.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Keseimbangan terjadi ketika kuantitas diminta sama dengan kuantitas ditawarkan."
        },
        {
            id: "sos-01",
            subject: "sosiologi",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Interaksi sosial",
            prompt: "Syarat utama terjadinya interaksi sosial adalah...",
            stimulus: "Interaksi sosial melibatkan hubungan timbal balik antarpelaku.",
            options: ["Kontak dan komunikasi", "Konflik dan hukuman", "Mobilitas dan urbanisasi", "Norma dan sanksi saja"],
            correct: 0,
            explanation: "Interaksi sosial mensyaratkan kontak sosial dan komunikasi."
        },
        {
            id: "sos-02",
            subject: "sosiologi",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Mobilitas sosial",
            prompt: "Seorang siswa dari keluarga petani menjadi dokter setelah menempuh pendidikan tinggi. Contoh ini menunjukkan...",
            stimulus: "Perubahan status sosial dapat terjadi melalui pendidikan.",
            options: ["Mobilitas vertikal naik", "Mobilitas horizontal", "Disintegrasi", "Penyimpangan primer"],
            correct: 0,
            explanation: "Status sosial meningkat, sehingga termasuk mobilitas vertikal naik."
        },
        {
            id: "sos-03",
            subject: "sosiologi",
            difficulty: "hots",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Pengendalian sosial",
            prompt: "Pilih dua contoh pengendalian sosial preventif.",
            stimulus: "Preventif berarti mencegah pelanggaran sebelum terjadi.",
            options: ["Sosialisasi tata tertib", "Penyuluhan bahaya perundungan", "Denda setelah pelanggaran", "Sidang setelah kasus"],
            correct: [0, 1],
            explanation: "Sosialisasi dan penyuluhan mencegah pelanggaran sebelum terjadi."
        },
        {
            id: "sos-04",
            subject: "sosiologi",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Norma",
            prompt: "Tentukan benar/salah: Norma sosial membantu mengatur perilaku anggota masyarakat.",
            stimulus: "Norma menjadi pedoman tentang perilaku yang dianggap pantas.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Norma sosial berfungsi sebagai pedoman dan pengendali perilaku."
        },
        {
            id: "geo-01",
            subject: "geografi",
            difficulty: "dasar",
            type: "single",
            sourceKind: "adaptasi resmi",
            skill: "Peta",
            prompt: "Skala 1:100.000 berarti 1 cm pada peta mewakili jarak sebenarnya...",
            stimulus: "100.000 cm = 1 km.",
            options: ["100 m", "1 km", "10 km", "100 km"],
            correct: 1,
            explanation: "1 cm di peta = 100.000 cm = 1 km di lapangan."
        },
        {
            id: "geo-02",
            subject: "geografi",
            difficulty: "sedang",
            type: "single",
            sourceKind: "pola tka 2025",
            skill: "Mitigasi",
            prompt: "Contoh mitigasi nonstruktural bencana adalah...",
            stimulus: "Mitigasi nonstruktural tidak berupa bangunan fisik.",
            options: ["Membangun tanggul", "Pendidikan evakuasi", "Memasang beton penahan", "Membuat saluran drainase"],
            correct: 1,
            explanation: "Pendidikan evakuasi adalah mitigasi nonstruktural karena berupa peningkatan pengetahuan."
        },
        {
            id: "geo-03",
            subject: "geografi",
            difficulty: "hots",
            type: "multi",
            sourceKind: "prediksi",
            skill: "Penginderaan jauh",
            prompt: "Pilih dua manfaat citra satelit dalam kajian wilayah.",
            stimulus: "Citra satelit membantu pengamatan permukaan bumi secara luas.",
            options: ["Memantau perubahan tutupan lahan", "Mendeteksi sebaran banjir", "Menghapus kebutuhan survei apa pun", "Menjamin cuaca selalu cerah"],
            correct: [0, 1],
            explanation: "Citra satelit berguna untuk memantau tutupan lahan dan sebaran banjir."
        },
        {
            id: "geo-04",
            subject: "geografi",
            difficulty: "prediksi",
            type: "truefalse",
            sourceKind: "prediksi",
            skill: "Atmosfer",
            prompt: "Tentukan benar/salah: Kelembapan udara berkaitan dengan kandungan uap air di udara.",
            stimulus: "Unsur cuaca meliputi suhu, tekanan, angin, awan, hujan, dan kelembapan.",
            options: ["Benar", "Salah"],
            correct: 0,
            explanation: "Kelembapan menyatakan banyaknya uap air di udara."
        }
    ];

    const progress = storage.get("tka_lms_progress", { answers: {}, streak: 0, elapsedSeconds: 0, timerRunning: false });
    progress.answers = progress.answers || {};
    progress.elapsedSeconds = Number(progress.elapsedSeconds || 0);
    progress.timerRunning = Boolean(progress.timerRunning);
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

    function getSubject(id) {
        return subjects.find(subject => subject.id === id) || subjects[0];
    }

    function getFilteredQuestions() {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = questionBank.filter(question => {
            const saved = progress.answers[question.id];
            const matchSubject = question.subject === activeSubject;
            const matchDifficulty = activeDifficulty === "all" || question.difficulty === activeDifficulty;
            const matchType = activeType === "all" || question.type === activeType;
            const matchMode = activeMode === "all"
                || (activeMode === "unanswered" && !saved?.submitted)
                || (activeMode === "wrong" && saved?.submitted && !saved.correct)
                || (activeMode === "review" && saved?.review);
            const searchable = `${question.prompt} ${question.stimulus} ${question.skill} ${question.sourceKind}`.toLowerCase();
            return matchSubject && matchDifficulty && matchType && matchMode && searchable.includes(query);
        });
        if (sessionSize === "all") return filtered;
        return filtered.slice(0, Number(sessionSize || 10));
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
        storage.set("tka_lms_preferences", {
            subject: activeSubject,
            difficulty: activeDifficulty,
            type: activeType,
            mode: activeMode,
            sessionSize,
            query: searchInput.value
        });
    }

    function saveProgress() {
        storage.set("tka_lms_progress", progress);
    }

    function renderSubjects() {
        subjectList.innerHTML = subjects.map(subject => {
            const total = questionBank.filter(question => question.subject === subject.id).length;
            const stats = getSubjectAccuracy(subject.id);
            return `
                <button class="lms-subject ${subject.id === activeSubject ? "active" : ""}" data-tka-subject="${subject.id}">
                    <span>${subject.mark}</span>
                    <div>
                        <strong>${subject.name}</strong>
                        <small>${subject.group} - ${stats.done}/${total} selesai - ${stats.accuracy}%</small>
                    </div>
                </button>
            `;
        }).join("");
        subjectList.querySelectorAll("[data-tka-subject]").forEach(button => {
            button.addEventListener("click", () => {
                activeSubject = button.dataset.tkaSubject;
                selectedQuestionId = "";
                updatePreferences();
                renderAll();
            });
        });
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

    function renderQuestionList() {
        const filtered = getFilteredQuestions();
        if (!filtered.some(question => question.id === selectedQuestionId)) {
            selectedQuestionId = filtered[0]?.id || "";
        }
        questionList.innerHTML = filtered.map((question, index) => {
            const answer = progress.answers[question.id];
            const status = answer?.submitted ? (answer.correct ? "Benar" : "Review") : "Belum";
            return `
                <button class="lms-question-item ${question.id === selectedQuestionId ? "active" : ""}" data-tka-question="${question.id}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <div>
                        <strong>${question.skill}</strong>
                        <small>${labels[question.difficulty]} - ${labels[question.type]} - ${status}</small>
                    </div>
                </button>
            `;
        }).join("") || `<div class="empty-state">Tidak ada soal untuk filter ini. Ubah mapel, tingkat, atau kata kunci.</div>`;
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
        doneText.textContent = `${stats.done}/${questionBank.length}`;
        accuracyText.textContent = `${stats.accuracy}%`;
        streakText.textContent = progress.streak || 0;
        weakText.textContent = weakSubject ? weakSubject.name : "Belum ada";
        reviewCountText.textContent = stats.review;
        masteryText.textContent = `${Math.round((stats.correct / questionBank.length) * 100)}%`;
        sessionTargetText.textContent = `${filteredDone}/${filtered.length || 0}`;
        progressBar.style.width = `${Math.round((stats.done / questionBank.length) * 100)}%`;
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
                    <div class="lms-analytics-row"><span>Selesai</span><strong>${done}/${total}</strong></div>
                    <div class="lms-analytics-row"><span>Akurasi</span><strong>${accuracy}%</strong></div>
                    <div class="lms-analytics-row"><span>Review</span><strong>${review}</strong></div>
                    <div class="lms-progress-track"><div style="width:${completion}%"></div></div>
                </article>
            `;
        }).join("");
    }

    function formatTimer(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${minutes}:${remaining}`;
    }

    function renderTimer() {
        timerDisplay.textContent = formatTimer(progress.elapsedSeconds);
        timerToggle.textContent = progress.timerRunning ? "Pause Timer" : "Mulai Timer";
    }

    function startTimerLoop() {
        clearInterval(timerId);
        if (!progress.timerRunning) return;
        timerId = setInterval(() => {
            progress.elapsedSeconds += 1;
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
            return;
        }
        const saved = progress.answers[question.id];
        if (lastRenderedQuestionId !== question.id || saved?.submitted) {
            selectedAnswers = saved?.chosen ? [...saved.chosen] : [];
            lastRenderedQuestionId = question.id;
        }
        const subject = getSubject(question.subject);
        questionMeta.innerHTML = `
            <span>${subject.name}</span>
            <span>${labels[question.difficulty]}</span>
            <span>${labels[question.type]}</span>
            <span>${question.sourceKind}</span>
        `;
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
            const stateClass = saved?.submitted && correct ? "correct" : saved?.submitted && selected && !correct ? "wrong" : "";
            return `<button class="answer-btn ${selected ? "selected" : ""} ${stateClass}" data-lms-answer="${index}" ${saved?.submitted ? "disabled" : ""}>${option}</button>`;
        }).join("");
        explanation.innerHTML = saved?.submitted
            ? `<strong>${saved.correct ? "Jawaban benar." : "Perlu review."}</strong><p>${question.explanation}</p>`
            : `<p class="muted">${question.type === "multi" ? "Pilih semua jawaban yang benar, lalu tekan Submit." : "Pilih satu jawaban, lalu tekan Submit."}</p>`;
        submitButton.disabled = Boolean(saved?.submitted);
        nextButton.disabled = false;
        prevButton.disabled = false;
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
                renderActiveQuestion();
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

    function moveQuestion(direction = 1) {
        const filtered = getFilteredQuestions();
        if (!filtered.length) return;
        const index = filtered.findIndex(question => question.id === selectedQuestionId);
        selectedQuestionId = filtered[(index + direction + filtered.length) % filtered.length].id;
        renderActiveQuestion();
        renderQuestionList();
    }

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
            progress.timerRunning = false;
            saveProgress();
            renderTimer();
            startTimerLoop();
        });
    }

    function renderAll() {
        renderSubjects();
        renderFilters();
        renderQuestionList();
        renderActiveQuestion();
        renderMetrics();
        renderAnalytics();
        renderTimer();
    }

    searchInput.value = preferences.query || "";
    sessionSizeSelect.value = sessionSize;
    bindFilters();
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
    const regions = ["Semua", "Sumatra", "Jawa", "Kalimantan", "Sulawesi", "Bali-Nusa", "Papua"];
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
            id: "papua",
            label: "Papua",
            region: "Papua",
            mark: "PP",
            summary: "Papua memiliki lanskap alam luar biasa, honai, tifa, noken, dan keragaman bahasa yang sangat besar.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum."], ["Wa wa wa", "Salam hangat", "Sapaan ramah di beberapa konteks lokal."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Saya mau belajar.", "Saya ingin belajar."], ["Mari jaga alam.", "Ajakan merawat lingkungan."], ["Kita saudara.", "Ungkapan kebersamaan."]],
            destination: ["Raja Ampat", "Kepulauan dengan laut jernih, karang, dan biodiversitas tinggi."],
            food: ["Papeda", "Olahan sagu bertekstur kenyal yang sering disantap dengan ikan kuah kuning."],
            tradition: ["Noken", "Tas rajut tradisional Papua yang dipakai untuk membawa barang dan simbol kehidupan."],
            fact: "Papua adalah salah satu wilayah dengan keragaman bahasa lokal terbesar di dunia.",
            quiz: { q: "Makanan khas Papua berbahan sagu yang terkenal adalah...", answers: ["Papeda", "Rendang", "Gudeg", "Kerak Telor"], correct: 0 }
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
    let currentIndex = 0;
    let showingMeaning = false;
    let selectedRegion = storage.get("wonder_region", "Semua");
    let selectedPlaceId = storage.get("wonder_place", "jawa");
    const progress = storage.get("bahasa_progress", { reviewed: 9, correct: 6, explored: ["jawa"], quizDone: 0 });

    if (!regions.includes(selectedRegion)) selectedRegion = "Semua";
    if (!places.some(place => place.id === selectedPlaceId)) selectedPlaceId = "jawa";
    languageSelect.innerHTML = places.map(place => `<option value="${place.id}">${place.label}</option>`).join("");
    languageSelect.value = selectedPlaceId;

    function getSelectedPlace() {
        return places.find(place => place.id === selectedPlaceId) || places[0];
    }

    function getFilteredPlaces() {
        return selectedRegion === "Semua" ? places : places.filter(place => place.region === selectedRegion);
    }

    function updateMetrics() {
        const exploredCount = new Set(progress.explored || []).size;
        const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
        document.getElementById("languageReviewed").textContent = progress.reviewed;
        document.getElementById("languageCorrect").textContent = `${accuracy}%`;
        document.getElementById("languageTotal").textContent = places.length;
        document.getElementById("missionCount").textContent = `${exploredCount}/${places.length}`;
        document.getElementById("missionBar").style.width = `${Math.round((exploredCount / places.length) * 100)}%`;

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
        document.getElementById("phoneRegionTitle").textContent = `${getFilteredPlaces().length} pilihan`;
        document.getElementById("phoneRegionText").textContent = selectedRegion === "Semua" ? "Jelajah semua region Indonesia." : `Fokus region ${selectedRegion}.`;
        storage.set("bahasa_progress", progress);
        storage.set("wonder_region", selectedRegion);
        storage.set("wonder_place", selectedPlaceId);
    }

    function markExplored(placeId) {
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
        selectedRegion = region;
        const firstPlace = getFilteredPlaces()[0];
        if (firstPlace) selectedPlaceId = firstPlace.id;
        currentIndex = 0;
        languageSelect.value = selectedPlaceId;
        renderAll();
    }

    function syncIndonesiaMap() {
        document.querySelectorAll(".map-region").forEach(regionEl => {
            regionEl.classList.toggle("active", regionEl.dataset.region === selectedRegion);
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
        cultureGrid.innerHTML = getFilteredPlaces().map(place => `
            <button class="culture-card ${place.id === selectedPlaceId ? "active" : ""}" data-place="${place.id}">
                <span class="culture-mark">${place.mark}</span>
                <div>
                    <strong>${place.label}</strong>
                    <p>${place.summary}</p>
                    <small>${place.region} - ${place.destination[0]} - ${explored.has(place.id) ? "Sudah dijelajahi" : "Belum dibuka"}</small>
                </div>
            </button>
        `).join("");
        cultureGrid.querySelectorAll(".culture-card").forEach(card => {
            card.addEventListener("click", () => {
                selectedPlaceId = card.dataset.place;
                languageSelect.value = selectedPlaceId;
                currentIndex = 0;
                markExplored(selectedPlaceId);
                renderAll();
            });
        });
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
    }

    function renderLanguageQuiz() {
        const selected = getSelectedPlace();
        const correctAnswer = selected.quiz.answers[selected.quiz.correct];
        const answers = [...selected.quiz.answers].sort(() => Math.random() - 0.5);
        quizQuestion.textContent = selected.quiz.q;
        answerGrid.innerHTML = answers.map(answer => `<button class="answer-btn">${answer}</button>`).join("");
        answerGrid.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                progress.reviewed += 1;
                progress.quizDone = (progress.quizDone || 0) + 1;
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
        flashcard.innerHTML = `<small>${selected.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
        phraseGrid.innerHTML = selected.phrases.map(item => `
            <article class="phrase-card"><strong>${item[0]}</strong><p class="muted">${item[1]}</p></article>
        `).join("");
        vocabList.innerHTML = selected.cards.map(item => `
            <div class="vocab-item"><div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div><span class="mini-tag">Kosakata</span></div>
        `).join("");
        renderCultureDetails();
        renderLanguageQuiz();
    }

    function renderAll() {
        renderRegionChips();
        syncIndonesiaMap();
        renderCultureGrid();
        renderLanguage();
        updateMetrics();
    }

    flashcard.addEventListener("click", () => {
        const selected = getSelectedPlace();
        const card = selected.cards[currentIndex % selected.cards.length];
        showingMeaning = !showingMeaning;
        flashcard.innerHTML = showingMeaning
            ? `<small>Arti</small><strong>${card[1]}</strong><span>${card[0]}</span>`
            : `<small>${selected.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
    });
    document.getElementById("nextWord").addEventListener("click", () => {
        currentIndex += 1;
        progress.reviewed += 1;
        markExplored(selectedPlaceId);
        renderAll();
        updateMetrics();
    });
    languageSelect.addEventListener("change", () => {
        selectedPlaceId = languageSelect.value;
        selectedRegion = getSelectedPlace().region;
        currentIndex = 0;
        markExplored(selectedPlaceId);
        renderAll();
    });

    bindIndonesiaMap();
    renderAll();
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    const page = document.body.dataset.page;
    if (page === "snbt") initTKAPage();
    if (page === "tka-lms") initTKALMSPage();
    if (page === "library") initLibraryPage();
    if (page === "bahasa") initBahasaPage();
});
