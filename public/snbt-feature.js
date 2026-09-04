import { storage, showToast } from "./shared-utilities.js";

export function initTKAPage() {
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

    function safeSetText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function updateStats() {
        const done = Number(stats.done) || 0;
        const correct = Number(stats.correct) || 0;
        const accuracy = done > 0 ? Math.round((correct / done) * 100) : 0;
        safeSetText("snbtDone", done);
        safeSetText("snbtAccuracy", `${accuracy}%`);
        safeSetText("snbtLevel", accuracy >= 80 ? "Siap" : accuracy >= 60 ? "Stabil" : accuracy >= 40 ? "Naik" : "Fondasi");
        if (ring) ring.style.setProperty("--progress", `${Math.min(accuracy, 100)}%`);
        if (ringText) ringText.textContent = `${accuracy}%`;
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
    const buildPlanBtn = document.getElementById("buildTKAPlan");
    if (buildPlanBtn) buildPlanBtn.addEventListener("click", buildPlan);
    
    buildPlan();
    renderQuestion("indonesia");
    updateStats();
}

// Global scope attachment for backward compatibility
window.initTKAPage = initTKAPage;
