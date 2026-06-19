/* JavaScript khusus untuk logika interaktif Halaman TKA (snbt.html) */

document.addEventListener("DOMContentLoaded", () => {
    initTkaTabs();
    initTkaAccordion();
    initIrtSimulator();
});

/**
 * Logika Penggantian Tab Informasi Utama TKA
 */
function initTkaTabs() {
    const tabButtons = document.querySelectorAll(".tka-tab-btn");
    const tabContents = document.querySelectorAll(".tka-tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;
            if (!targetId) return;

            // Nonaktifkan semua tombol tab
            tabButtons.forEach(t => t.classList.remove("active"));
            // Sembunyikan semua konten tab
            tabContents.forEach(c => {
                c.classList.add("hidden");
                c.style.display = "none";
            });

            // Aktifkan tombol yang diklik
            btn.classList.add("active");

            // Tampilkan konten tab target
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = "block";
                // Trigger reflow untuk animasi fade-in
                targetContent.offsetHeight;
                targetContent.classList.remove("hidden");
            }
        });
    });
}

/**
 * Logika Buka/Tutup Accordion Silabus TKA
 */
function initTkaAccordion() {
    const accordionHeaders = document.querySelectorAll(".tka-accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".tka-accordion-item");
            const body = item.querySelector(".tka-accordion-body");
            const isActive = item.classList.contains("active");

            // Tutup semua akordeon lain di kolom yang sama untuk kebersihan visual
            const column = item.closest(".tka-accordion");
            column.querySelectorAll(".tka-accordion-item").forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".tka-accordion-body").style.maxHeight = "0px";
                }
            });

            // Toggle item yang diklik
            if (isActive) {
                item.classList.remove("active");
                body.style.maxHeight = "0px";
            } else {
                item.classList.add("active");
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });

    // Buka akordeon pertama secara default untuk memberikan petunjuk visual ke user
    document.querySelectorAll(".tka-accordion").forEach(acc => {
        const firstItem = acc.querySelector(".tka-accordion-item");
        if (firstItem) {
            const firstHeader = firstItem.querySelector(".tka-accordion-header");
            if (firstHeader) firstHeader.click();
        }
    });
}

/**
 * Logika Simulator Skor IRT Interaktif
 */
function initIrtSimulator() {
    const slider = document.getElementById("irtCorrectRange");
    const sliderVal = document.getElementById("irtCorrectVal");
    const diffButtons = document.querySelectorAll(".irt-sim-option-btn");
    const scoreVal = document.getElementById("irtScoreVal");
    const scoreRing = document.getElementById("irtScoreRing");
    const verdict = document.getElementById("irtVerdict");
    const desc = document.getElementById("irtDesc");

    if (!slider || !sliderVal || !scoreVal) return;

    let correctCount = parseInt(slider.value) || 10;
    let difficultyMultiplier = 1.0; // Default: Sedang

    // Update Slider Label
    slider.addEventListener("input", (e) => {
        correctCount = parseInt(e.target.value);
        sliderVal.textContent = correctCount;
        calculateIrtScore();
    });

    // Update Difficulty Buttons
    diffButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            diffButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const level = btn.dataset.difficulty;
            if (level === "mudah") {
                difficultyMultiplier = 0.85;
            } else if (level === "sedang") {
                difficultyMultiplier = 1.0;
            } else if (level === "sulit") {
                difficultyMultiplier = 1.25;
            }
            calculateIrtScore();
        });
    });

    // Mesin perhitungan skor IRT
    function calculateIrtScore() {
        // Base score min 400, max 900
        const totalQuestions = 20;
        let score = 400 + Math.round((correctCount / totalQuestions) * 400 * difficultyMultiplier);
        
        // Batasi nilai agar tetap dalam range 400 - 900
        score = Math.max(400, Math.min(900, score));

        // Update nilai teks skor
        scoreVal.textContent = score;

        // Hitung persentase untuk lingkaran progress
        const pct = ((score - 400) / 500) * 100;
        scoreRing.style.setProperty("--score-pct", `${pct}%`);

        // Tentukan status kelulusan (verdict) dan deskripsi
        let verdictText = "";
        let descText = "";

        if (score >= 800) {
            verdictText = "Sangat Istimewa (Top 1%)";
            descText = "Peluang lolos sangat tinggi pada program studi dengan tingkat keketatan ekstrem seperti Kedokteran UI/UGM, STEI ITB, atau Aktuaria.";
        } else if (score >= 700) {
            verdictText = "Sangat Siap & Kompetitif";
            descText = "Peluang tinggi untuk masuk prodi terfavorit (Teknik Informatika, Hukum, Psikologi, FEB) di PTN Kluster 1 (UI, ITB, UGM, Unair).";
        } else if (score >= 600) {
            verdictText = "Cukup Aman & Stabil";
            descText = "Peluang baik pada program studi rumpun Saintek/Soshum menengah ke atas di PTN Kluster 2 atau prodi umum PTN Kluster 1.";
        } else if (score >= 500) {
            verdictText = "Butuh Penguatan Konsep";
            descText = "Nilai Anda berada di rata-rata nasional. Fokuskan belajar pada mata pelajaran dengan akurasi terlemah untuk mendongkrak skor.";
        } else {
            verdictText = "Tahap Fondasi Awal";
            descText = "Skor Anda di bawah rata-rata. Direkomendasikan mempelajari kembali materi fundamental dasar sebelum mencoba simulasi berwaktu.";
        }

        verdict.textContent = verdictText;
        desc.textContent = descText;
    }

    // Jalankan kalkulasi pertama kali
    calculateIrtScore();
}
