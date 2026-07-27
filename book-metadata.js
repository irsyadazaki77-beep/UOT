(function () {
    "use strict";
    if (typeof BOOKS === "undefined" || !Array.isArray(BOOKS)) return;

    const metadata = {
        "js-basic": ["Pelajari cara berpikir komputasional melalui sintaks, kontrol alur, fungsi, dan praktik JavaScript modern.", ["JavaScript", "logika", "fungsi", "web"], ["Menulis program JavaScript dasar", "Memecah masalah menjadi fungsi", "Menguji kasus normal dan kasus batas"]],
        "sql-join": ["Bangun fondasi database relasional dari pemodelan data hingga query JOIN yang akurat dan efisien.", ["SQL", "database", "JOIN", "relasional"], ["Merancang tabel dan relasi", "Menulis query multi-tabel", "Menjaga integritas data"]],
        "ui-heuristic": ["Rancang antarmuka yang jelas, inklusif, dan mudah diuji dengan prinsip user-centered design.", ["UI", "UX", "usability", "aksesibilitas"], ["Menyusun hierarki informasi", "Mengevaluasi usability", "Membuat keputusan desain berbasis bukti"]],
        "analytics-kpi": ["Kenali ancaman, kontrol, dan pola pertahanan berlapis untuk menjaga sistem digital tetap aman.", ["cybersecurity", "risiko", "enkripsi", "incident response"], ["Mengidentifikasi aset dan ancaman", "Memilih kontrol keamanan", "Menyusun respons insiden dasar"]],
        "web-semantic": ["Bangun dokumen web semantik yang responsif, aksesibel, dan tahan terhadap perubahan perangkat.", ["HTML5", "semantik", "aksesibilitas", "responsive web"], ["Menyusun struktur HTML bermakna", "Meningkatkan aksesibilitas halaman", "Menerapkan progressive enhancement"]],
        "flash-snbt": ["Kuasai limit, turunan, dan integral melalui penalaran visual serta latihan bertahap untuk SNBT/TKA.", ["kalkulus", "SNBT", "limit", "integral"], ["Menjelaskan konsep perubahan", "Menyelesaikan soal kalkulus", "Memeriksa kewajaran hasil"]],
        "learning-psychology": ["Pahami cara perhatian, memori, motivasi, dan kebiasaan membentuk proses belajar yang efektif.", ["psikologi", "memori", "kebiasaan", "belajar"], ["Merancang kebiasaan belajar", "Menggunakan active recall", "Mengevaluasi strategi belajar"]],
        "micro-economics": ["Gunakan konsep kelangkaan, insentif, dan pasar untuk membaca keputusan ekonomi sehari-hari.", ["ekonomi mikro", "pasar", "insentif", "elastisitas"], ["Menghitung biaya peluang", "Menganalisis perubahan pasar", "Menilai dampak insentif"]],
        "indonesia-history": ["Telusuri perubahan sosial, politik, dan ekonomi Indonesia modern melalui sumber dan perspektif beragam.", ["sejarah", "Indonesia", "sumber primer", "modern"], ["Menyusun kronologi", "Membandingkan sumber", "Menjelaskan sebab dan akibat"]],
        "biology-cell": ["Jelajahi struktur sel, DNA, pembelahan, dan pewarisan sebagai fondasi ilmu kehidupan.", ["biologi", "sel", "DNA", "genetika"], ["Menjelaskan fungsi organel", "Menghubungkan DNA dan protein", "Membedakan mitosis dan meiosis"]],
        "world-literature": ["Baca sastra dunia dengan perhatian pada narasi, bahasa, konteks budaya, dan ragam interpretasi.", ["sastra", "narasi", "kritik", "budaya"], ["Menganalisis unsur naratif", "Menggunakan bukti tekstual", "Membandingkan interpretasi"]],
        "constitutional-law": ["Pahami negara hukum, konstitusi, kewenangan lembaga, serta hubungan hak dan kewajiban warga.", ["hukum", "konstitusi", "negara", "hak warga"], ["Mengidentifikasi sumber hukum", "Menganalisis isu konstitusional", "Menyusun argumen hukum dasar"]],
        "education-assessment": ["Selaraskan tujuan, aktivitas, asesmen, dan umpan balik untuk pembelajaran yang bermakna.", ["pendidikan", "asesmen", "pedagogi", "feedback"], ["Menulis tujuan terukur", "Membuat asesmen formatif", "Memberi umpan balik efektif"]],
        "public-health": ["Pelajari determinan kesehatan, pencegahan, epidemiologi, dan kebiasaan hidup dari sudut populasi.", ["kesehatan publik", "epidemiologi", "gaya hidup", "pencegahan"], ["Membaca ukuran risiko", "Mengevaluasi klaim kesehatan", "Merancang intervensi sederhana"]],
        "climate-environment": ["Hubungkan iklim, energi, keanekaragaman hayati, dan pilihan manusia dalam sistem lingkungan.", ["iklim", "lingkungan", "energi", "keberlanjutan"], ["Menjelaskan sistem iklim", "Menilai dampak lingkungan", "Membedakan mitigasi dan adaptasi"]],
        "business-strategy": ["Uji proposisi nilai, model bisnis, operasi, dan pertumbuhan dengan bukti dari pelanggan.", ["bisnis", "strategi", "wirausaha", "model bisnis"], ["Menyusun proposisi nilai", "Menguji asumsi pelanggan", "Membaca unit economics"]],
        "ai-practical": ["Gunakan model AI secara terukur melalui prompt yang jelas, evaluasi, guardrail, dan deployment bertanggung jawab.", ["AI", "prompt", "evaluasi", "responsible AI"], ["Menulis prompt terukur", "Membangun evaluation set", "Merancang guardrail berlapis"]],
        "cloud-devops": ["Bawa aplikasi dari build ke operasi melalui container, CI/CD, observability, keamanan, dan kontrol biaya.", ["cloud", "DevOps", "CI/CD", "observability"], ["Menyusun pipeline rilis", "Merancang strategi rollback", "Membaca sinyal layanan"]],
        "product-tech": ["Kelola produk teknologi dari discovery masalah hingga strategi, prioritas, delivery, dan eksperimen.", ["product management", "discovery", "roadmap", "eksperimen"], ["Menulis problem statement", "Memprioritaskan peluang", "Mengukur outcome produk"]],
        "data-science-foundations": ["Kenali alur data science dari pertanyaan, kualitas data, eksplorasi, hingga komunikasi insight.", ["data science", "EDA", "insight", "data literacy"], ["Merumuskan pertanyaan data", "Menilai kualitas dataset", "Mengkomunikasikan insight"]],
        "python-data-analysis": ["Olah dan analisis data secara reproduktif menggunakan Python, NumPy, dan Pandas.", ["Python", "Pandas", "NumPy", "data cleaning"], ["Mengolah DataFrame", "Membersihkan data", "Mendokumentasikan transformasi"]],
        "statistics-for-data": ["Gunakan distribusi, sampling, interval kepercayaan, dan uji hipotesis untuk keputusan yang jujur.", ["statistika", "sampling", "hipotesis", "probabilitas"], ["Meringkas distribusi", "Menilai bias sampel", "Menafsirkan hasil uji"]],
        "machine-learning-starter": ["Mulai machine learning dari definisi masalah, data latih, pemilihan model, dan evaluasi generalisasi.", ["machine learning", "klasifikasi", "regresi", "evaluasi model"], ["Membedakan jenis pembelajaran", "Memisahkan data dengan benar", "Memilih metrik evaluasi"]],
        "data-visualization-story": ["Ubah data menjadi visual yang jujur dan narasi yang menghubungkan insight dengan tindakan.", ["visualisasi", "storytelling", "chart", "komunikasi data"], ["Memilih bentuk grafik", "Menghindari visual menyesatkan", "Menyusun narasi insight"]],
        "robotics-foundations": ["Pahami robot sebagai sistem sensor, pengendali, aktuator, umpan balik, dan keselamatan.", ["robotika", "sensor", "aktuator", "kontrol"], ["Memetakan sistem robot", "Menjelaskan loop umpan balik", "Mengidentifikasi risiko keselamatan"]],
        "arduino-sensors": ["Bangun prototipe fisik dengan Arduino, input sensor, output aktuator, dan suplai daya yang aman.", ["Arduino", "mikrokontroler", "sensor", "prototyping"], ["Membaca input analog/digital", "Mengendalikan aktuator", "Merakit prototipe stabil"]],
        "robot-motion-control": ["Pelajari kinematika dan kendali PID untuk menghasilkan gerak robot yang akurat dan stabil.", ["kinematika", "PID", "motion control", "robot arm"], ["Menghitung pose dasar", "Menjelaskan kontrol PID", "Mengevaluasi error gerak"]],
        "robot-computer-vision": ["Berikan kemampuan melihat pada robot melalui pemrosesan citra, kalibrasi, dan deteksi real-time.", ["computer vision", "kamera", "deteksi objek", "robotika"], ["Menjelaskan citra digital", "Melakukan kalibrasi dasar", "Menilai akurasi dan latensi"]],
        "autonomous-robot-navigation": ["Gabungkan lokalisasi, pemetaan, SLAM, dan perencanaan jalur untuk navigasi otonom.", ["SLAM", "navigasi", "lokalisasi", "path planning"], ["Menjelaskan lokalisasi", "Membedakan planner global dan lokal", "Merancang kondisi berhenti aman"]]
    };

    const featuredIds = new Set(["js-basic", "sql-join", "ai-practical", "data-science-foundations", "robotics-foundations", "product-tech"]);
    const advancedIds = new Set(["analytics-kpi", "statistics-for-data", "machine-learning-starter", "robot-motion-control", "robot-computer-vision", "autonomous-robot-navigation"]);
    const beginnerIds = new Set(["js-basic", "web-semantic", "flash-snbt", "learning-psychology", "biology-cell", "world-literature", "data-science-foundations", "robotics-foundations", "arduino-sensors"]);

    BOOKS.forEach((book, index) => {
        const entry = metadata[book.id];
        if (!entry) return;
        book.synopsis = entry[0];
        book.tags = entry[1];
        book.learningOutcomes = entry[2];
        book.level = advancedIds.has(book.id) ? "Lanjutan" : beginnerIds.has(book.id) ? "Pemula" : "Menengah";
        book.publishedAt = `2026-${String((index % 6) + 1).padStart(2, "0")}-${String((index % 24) + 1).padStart(2, "0")}`;
        book.featured = featuredIds.has(book.id);
    });
})();
