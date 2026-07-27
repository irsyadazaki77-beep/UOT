(function () {
    "use strict";

    if (typeof BOOKS === "undefined" || !Array.isArray(BOOKS)) return;

    const tracks = {
        CS: ["Rekayasa Solusi dan Pengujian", "Optimasi, Refactoring, dan Dokumentasi", "program", "test case, hasil eksekusi, dan tinjauan kode"],
        Database: ["Perancangan Skema dan Integritas Data", "Optimasi Query dan Transaksi", "basis data", "diagram relasi, constraint, query, dan execution plan"],
        Design: ["Riset Pengguna dan Prototipe", "Uji Usability dan Aksesibilitas", "antarmuka", "catatan observasi, prototipe, dan temuan usability"],
        Security: ["Threat Modeling dan Kontrol Berlapis", "Respons Insiden dan Pemulihan", "sistem", "daftar aset, jalur serangan, mitigasi, dan runbook"],
        Web: ["Aksesibilitas dan Progressive Enhancement", "Performa Web dan Ketahanan Antarmuka", "halaman web", "audit semantik, pengujian keyboard, dan metrik performa"],
        Math: ["Pemodelan dan Pemilihan Strategi", "Pembuktian, Estimasi, dan Verifikasi", "masalah kuantitatif", "model, langkah perhitungan, estimasi, dan pemeriksaan hasil"],
        Psychology: ["Merancang Perubahan Perilaku", "Eksperimen Kebiasaan dan Evaluasi", "kebiasaan belajar", "hipotesis, jurnal observasi, data perilaku, dan refleksi"],
        Economics: ["Analisis Insentif dan Biaya Peluang", "Evaluasi Kebijakan dan Dampak Distribusi", "keputusan ekonomi", "asumsi, data, analisis pihak terdampak, dan skenario"],
        History: ["Kritik Sumber dan Rekonstruksi Peristiwa", "Historiografi dan Perbandingan Perspektif", "narasi sejarah", "kronologi, kritik sumber, bukti pembanding, dan interpretasi"],
        Biology: ["Eksperimen, Variabel, dan Mekanisme", "Dari Sel ke Sistem Kehidupan", "fenomena biologis", "hipotesis, diagram mekanisme, data observasi, dan kesimpulan"],
        Literature: ["Close Reading dan Bukti Tekstual", "Interpretasi, Konteks, dan Kritik", "teks sastra", "anotasi, kutipan, pola bahasa, dan argumentasi"],
        Law: ["Analisis Kasus dengan Kerangka IRAC", "Penafsiran, Preseden, dan Argumentasi", "kasus hukum", "fakta, isu, aturan, penerapan, dan kesimpulan"],
        Education: ["Desain Pembelajaran yang Selaras", "Asesmen Formatif dan Umpan Balik", "rencana pembelajaran", "tujuan, aktivitas, rubrik, bukti belajar, dan umpan balik"],
        Health: ["Literasi Bukti dan Penilaian Risiko", "Desain Intervensi Kesehatan", "program kesehatan", "populasi sasaran, bukti, indikator hasil, dan mitigasi risiko"],
        Environment: ["Analisis Sistem dan Siklus Hidup", "Mitigasi, Adaptasi, dan Keadilan Iklim", "kegiatan sehari-hari", "peta aliran, dampak langsung, skenario, dan indikator"],
        Business: ["Validasi Masalah dan Proposisi Nilai", "Unit Economics dan Strategi Pertumbuhan", "ide usaha", "hipotesis pelanggan, eksperimen, biaya, pendapatan, dan retensi"],
        AI: ["Evaluasi Model dan Analisis Kegagalan", "Guardrail, Human-in-the-loop, dan Produksi", "fitur AI", "evaluation set, rubrik, error analysis, fallback, dan monitoring"],
        Cloud: ["Observability dan Reliability Engineering", "Delivery Aman, Rollback, dan Pemulihan", "layanan cloud", "SLI/SLO, dashboard, pipeline, runbook, dan hasil simulasi"],
        Product: ["Continuous Discovery dan Prioritas", "Eksperimen Produk dan Pengukuran Outcome", "produk digital", "problem statement, asumsi, eksperimen, outcome, dan guardrail"],
        DataScience: ["Eksplorasi Data dan Kualitas Bukti", "Pemodelan, Evaluasi, dan Komunikasi Insight", "analisis data", "data dictionary, pemeriksaan kualitas, metrik, visualisasi, dan batasan"],
        Robotics: ["Integrasi Sense–Plan–Act", "Keselamatan, Pengujian, dan Pemulihan Robot", "robot", "diagram kendali, log sensor, batas aman, dan hasil pengujian"],
        Astronomy: ["Observasi, Skala, dan Pengukuran Kosmik", "Analisis Data Langit dan Ketidakpastian", "objek astronomi", "catatan observasi, estimasi skala, data, dan analisis ketidakpastian"]
    };
    const fallback = ["Penerapan Konsep pada Kasus Nyata", "Evaluasi Bukti dan Pengembangan Solusi", "persoalan nyata", "model konsep, bukti, evaluasi, dan refleksi"];

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }

    function chapterContent(book, title, subject, evidence, level) {
        const bookTitle = escapeHtml(book.title);
        const chapterTitle = escapeHtml(title);
        const subjectSafe = escapeHtml(subject);
        const evidenceSafe = escapeHtml(evidence);
        const evaluationCopy = level === 0
            ? "Sebuah analisis yang dapat diuji memiliki target dan indikator keberhasilan. Sebelum bekerja, nyatakan hasil yang diharapkan dan kondisi yang akan membuat hipotesis ditolak. Siapkan contoh normal, kasus batas, dan kondisi gagal agar celah yang tidak terlihat pada contoh ideal dapat ditemukan."
            : "Evaluasi bukan tahap untuk membenarkan keputusan awal. Ketika hasil gagal, telusuri apakah penyebabnya berasal dari definisi masalah, kualitas masukan, metode, pelaksanaan, atau indikator. Perbaiki satu variabel penting dalam setiap iterasi agar dampaknya dapat diamati.";
        return `
            <p class="chapter-lead">Bab ini memperluas pembahasan <strong>${bookTitle}</strong> dari pemahaman konsep menuju kemampuan mengambil keputusan. Fokusnya adalah ${chapterTitle.toLowerCase()}, dengan latihan yang dapat dikerjakan menggunakan kasus sederhana di sekitar pembaca.</p>
            <h2>Mengapa topik ini penting?</h2>
            <p>Pengetahuan menjadi berguna ketika seseorang mampu mengenali pola, memilih metode yang sesuai, dan menjelaskan alasan di balik pilihannya. Dalam praktik, sebuah ${subjectSafe} hampir selalu memiliki batasan: waktu, data, sumber daya, kepentingan pengguna, serta risiko. Karena itu, kualitas hasil juga perlu dilihat dari ketepatan asumsi, kekuatan bukti, konsekuensi keputusan, dan kemungkinan perbaikan.</p>
            <p>Pendekatan yang baik dimulai dengan pertanyaan yang jelas. Pisahkan apa yang sudah diketahui, apa yang masih berupa dugaan, dan informasi apa yang perlu dicari. Langkah ini mencegah solusi terburu-buru serta membuat proses belajar dapat ditelusuri kembali.</p>
            <h2>Kerangka kerja lima langkah</h2>
            <ol>
                <li><strong>Tentukan konteks.</strong> Tuliskan tujuan, pihak yang terlibat, kondisi awal, dan batasan utama.</li>
                <li><strong>Buat model.</strong> Ubah situasi menjadi diagram, tabel, urutan proses, atau hubungan sebab-akibat.</li>
                <li><strong>Pilih tindakan.</strong> Bandingkan sedikitnya dua alternatif menggunakan kriteria yang sama.</li>
                <li><strong>Uji hasil.</strong> Gunakan ${evidenceSafe} untuk memeriksa apakah hasil mendukung tujuan awal.</li>
                <li><strong>Refleksikan.</strong> Catat keterbatasan, risiko tersisa, dan satu perubahan untuk iterasi berikutnya.</li>
            </ol>
            <div class="depth-callout"><strong>Prinsip kerja:</strong><p>Mulai dari versi kecil yang dapat diuji. Artefak sederhana dengan bukti yang jelas lebih bernilai daripada solusi besar yang asumsi dan hasilnya tidak dapat diperiksa.</p></div>
            <h2>${level === 0 ? "Menyusun analisis yang dapat diuji" : "Mengevaluasi hasil dan menghadapi kegagalan"}</h2>
            <p>${evaluationCopy}</p>
            <p>Dokumentasi singkat menjaga proses tetap jujur. Rekam alasan pemilihan metode, bukti yang digunakan, perubahan yang dilakukan, dan hasil sesudah perubahan. Catatan tersebut memungkinkan orang lain mengulang proses, memberi masukan spesifik, atau menggunakan pembelajaran pada konteks baru.</p>
            <h2>Contoh mini</h2>
            <p>Bayangkan kamu diminta memperbaiki sebuah ${subjectSafe}. Pengguna memiliki kebutuhan berbeda dan data yang tersedia belum lengkap. Buat dua alternatif, lalu nilai berdasarkan manfaat, biaya, risiko, kemudahan pengujian, serta dampaknya bagi pihak lain. Uji alternatif terbaik pada ruang lingkup kecil, kumpulkan ${evidenceSafe}, kemudian bandingkan hasil dengan target awal.</p>
            <p>Jika hasil belum sesuai, jangan sekadar menambah langkah. Cari asumsi yang paling lemah. Temuan negatif tetap bernilai karena mempersempit ruang pencarian dan mencegah kesalahan yang sama diulang.</p>
            <h2>Pertanyaan untuk berpikir kritis</h2>
            <ul><li>Asumsi mana yang paling menentukan kesimpulan?</li><li>Bukti apa yang dapat mengubah keputusan?</li><li>Siapa yang mendapat manfaat dan siapa yang menanggung risiko?</li><li>Apakah hasil tetap berlaku jika skala atau konteks berubah?</li><li>Bagaimana orang lain dapat memeriksa proses ini?</li></ul>
            <h2>Ringkasan bab</h2>
            <p>${chapterTitle} menghubungkan konsep, tindakan, dan bukti. Gunakan Praktik Terbimbing di akhir bab untuk merumuskan konteks, membandingkan alternatif, menguji hasil, serta mengomunikasikan keterbatasan secara terbuka.</p>`;
    }

    function makeChapter(book, title, level, track) {
        const [, , subject, evidence] = track;
        return {
            title,
            content: chapterContent(book, title, subject, evidence, level),
            summary: ["Mulai dari konteks, tujuan, batasan, dan asumsi yang eksplisit.", "Bandingkan alternatif menggunakan kriteria dan bukti yang sama.", "Uji versi kecil, catat kegagalan, lalu lakukan iterasi terarah."],
            practice: {
                title: level === 0 ? "Studio praktik: dari masalah ke rancangan" : "Studio praktik: uji, analisis, dan perbaiki",
                scenario: `Pilih satu ${subject} sederhana yang dekat dengan kegiatan belajar, rumah, komunitas, atau pekerjaanmu.`,
                task: `${level === 0 ? "Petakan masalah dan buat rancangan awal" : "Uji rancangan, analisis satu kegagalan, lalu lakukan perbaikan"}. Sertakan ${evidence}.`,
                prompts: ["Apa konteks, tujuan, pengguna/pihak terkait, dan batasan utamanya?", "Apa dua alternatif yang mungkin dan mengapa kamu memilih salah satunya?", "Bukti apa yang kamu kumpulkan, apa hasilnya, dan apa perbaikan berikutnya?"],
                checklist: ["Konteks dan tujuan sudah jelas", "Ada minimal dua alternatif", "Ada bukti atau cara pengujian", "Ada refleksi dan langkah berikutnya"]
            },
            quiz: {
                question: `Apa langkah paling tepat saat menerapkan ${title.toLowerCase()}?`,
                options: ["Memilih solusi tercepat tanpa menulis asumsi", "Menetapkan konteks, membandingkan alternatif, lalu menguji hasil", "Mengumpulkan data tanpa pertanyaan", "Menganggap contoh pertama mewakili semua kondisi"],
                correct: 1,
                explanation: "Penerapan yang kuat dimulai dari konteks dan asumsi yang jelas, dilanjutkan perbandingan alternatif, pengujian, serta refleksi."
            },
            __extendedChapter: true
        };
    }

    BOOKS.forEach((book) => {
        if (!Array.isArray(book.chapters) || book.__chapterExtensionApplied) return;
        const track = tracks[book.category] || fallback;
        const existing = new Set(book.chapters.map((chapter) => chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, "").trim().toLowerCase()));
        track.slice(0, 2).forEach((title, level) => {
            if (!existing.has(title.toLowerCase())) book.chapters.push(makeChapter(book, title, level, track));
        });
        book.__chapterExtensionApplied = true;
    });
})();
