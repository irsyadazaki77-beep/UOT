(function () {
    "use strict";

    const CONFIG = {
        name: "BUBUB",
        logo: "bubub-mascot.webp",
        maxHistory: 24,
        mainPages: new Set([
            "index.html",
            "materi.html",
            "materi-basic.html",
            "quiz.html",
            "quiz-session.html",
            "quiz-budaya.html",
            "quiz-budaya-lms.html",
            "bahasa-daerah.html",
            "daerah-detail.html",
            "latihan-bahasa.html",
            "profile.html",
            "learning-path.html",
            "learning-journey.html",
            "snbt.html",
            "tka-lms.html",
            "tka-quiz.html",
            "achievements.html",
            "leaderboard.html",
            "projects.html",
            "library.html",
            "reader.html",
            "payment.html",
            "pro-hub.html",
            "login.html"
        ])
    };

    const state = {
        history: [],
        elements: {},
        page: "index"
    };

    const pageProfiles = {
        index: {
            label: "Beranda",
            chips: ["Mulai dari mana?", "Fitur utama", "Rekomendasi belajar", "Akun Pro"],
            intro: "Kamu sedang di beranda UNIVERSE OF TECH. Aku bisa bantu arahkan ke materi, quiz, bahasa daerah, library, atau profil belajar."
        },
        materi: {
            label: "Materi",
            chips: ["Jelaskan roadmap", "Tanya SQL", "Tanya JavaScript", "Debug konsep", "Tips belajar"],
            intro: "Di halaman materi, aku bisa bantu jelaskan konsep, menyusun urutan belajar, dan mengarahkan ke latihan atau sandbox."
        },
        "materi-basic": {
            label: "Learning Studio",
            chips: ["Penjelasan kode", "Solusi sandbox", "Jalankan latihan", "Saran belajar", "Bab berikutnya"],
            intro: "Di Learning Studio, aku bisa bantu memahami baris kode, menjalankan latihan interaktif, dan mereview jawaban sandbox."
        },
        quiz: {
            label: "Quiz",
            chips: ["Strategi quiz", "Minta hint", "Review konsep", "Mode latihan", "Kenapa salah?"],
            intro: "Di halaman quiz, aku bisa memberi petunjuk belajar dan penjelasan konsep tanpa langsung membocorkan jawaban akhir."
        },
        "quiz-session": {
            label: "Sesi Quiz",
            chips: ["Petunjuk soal", "Eliminasi opsi", "Konsep terkait", "Manajemen waktu", "Fokus latihan"],
            intro: "Di sesi kuis yang sedang berjalan, aku siap memberikan panduan berpikir, tips eliminasi opsi, dan penjelasan konseptual."
        },
        "bahasa-daerah": {
            label: "Bahasa Daerah",
            chips: ["Belajar frasa", "Budaya Nusantara", "Cara latihan", "Rekomendasi daerah", "Mulai region apa?"],
            intro: "Di halaman bahasa daerah, aku bisa bantu mengenal frasa, budaya, tradisi, dan cara latihan yang enak diikuti."
        },
        "daerah-detail": {
            label: "Detail Daerah",
            chips: ["Frasa penting", "Adat istiadat", "Kuliner khas", "Destinasi budaya", "Latihan kosakata"],
            intro: "Di halaman detail daerah ini, kamu bisa mendalami dialek, warisan budaya, dan kosakata autentik setempat."
        },
        "latihan-bahasa": {
            label: "Latihan Bahasa",
            chips: ["Review kartu", "Spaced repetition", "Uji ingatan", "Koreksi lafal", "Tips hafalan"],
            intro: "Di ruang latihan bahasa daerah, aku memandu spaced repetition flashcard untuk mempercepat penguasaan kosakata."
        },
        library: {
            label: "Library",
            chips: ["Rekomendasi buku", "Ringkas UI/UX", "Buku SQL", "Buku pemula", "Topik non-tech"],
            intro: "Di library, aku bisa bantu merekomendasikan buku, menjelaskan isi bab, dan memilih bacaan sesuai kebutuhanmu."
        },
        reader: {
            label: "Reader Studio",
            chips: ["Rangkum bab", "Poin kunci", "Pertanyaan uji", "Catatan penting", "Terapkan konsep"],
            intro: "Di Reader Studio, aku siap membuatkan rangkuman terstruktur, intisari bab, dan kuis pemahaman bacaan."
        },
        projects: {
            label: "Proyek Nyata",
            chips: ["Ide proyek", "Struktur folder", "Tech stack", "Review arsitektur", "Tips portofolio"],
            intro: "Di halaman Proyek, aku bantu mengarahkan implementasi studi kasus nyata untuk membangun portofolio solid."
        },
        leaderboard: {
            label: "Papan Peringkat",
            chips: ["Cara naik peringkat", "Sistem XP", "Misi mingguan", "Strategi konsistensi", "Poin quiz"],
            intro: "Di Leaderboard, pantau posisi peringkat belajarmu dan dapatkan tips mendulang XP secara konsisten."
        },
        "learning-journey": {
            label: "Learning Journey",
            chips: ["Jalur karir", "Roadmap web", "Roadmap data", "Evaluasi skill", "Target pekanan"],
            intro: "Di Learning Journey, rencanakan lintasan karir teknologi terpadu dari tingkat pemula sampai mahir."
        },
        profile: {
            label: "Profil",
            chips: ["Cek progres", "Subscription", "Target belajar", "Lencana", "Langkah berikutnya"],
            intro: "Di profil, aku bisa bantu membaca progres, subscription, target belajar, dan langkah berikutnya."
        },
        "learning-path": {
            label: "Learning Path",
            chips: ["Susun jalur", "Latihan harian", "Evaluasi progres", "Rekomendasi topik", "Project latihan"],
            intro: "Di learning path, aku bisa bantu memilih jalur belajar dan membuat rencana latihan yang realistis."
        },
        snbt: {
            label: "TKA & SNBT",
            chips: ["Strategi TKA", "Pilih mapel", "Diagnosis awal", "Rencana 7 hari", "Review kesalahan"],
            intro: "Di dashboard TKA & SNBT, aku bisa bantu memilih fokus, menyusun latihan, dan merangkum pola belajar."
        },
        "tka-lms": {
            label: "TKA LMS",
            chips: ["Pilih subjek", "Mode ujian", "Analisis hasil", "Tips TKA", "Atur sesi"],
            intro: "Di TKA LMS, aku bisa bantu memilih subjek, mengatur mode latihan, dan memahami hasil belajar."
        },
        achievements: {
            label: "Pencapaian",
            chips: ["Cara buka lencana", "Cek XP saya", "Sertifikat jalur", "Milestone berikutnya", "Papan peringkat"],
            intro: "Di halaman Pencapaian, aku bisa bantu menjelaskan cara membuka lencana, memantau XP, mengklaim sertifikat, dan melihat posisi di papan peringkat."
        },
        payment: {
            label: "Upgrade Pro",
            chips: ["Benefit Pro", "Metode pembayaran", "Akses penuh materi", "Bantuan checkout", "Paket belajar"],
            intro: "Di halaman Upgrade Pro, aku siap menjelaskan keunggulan fitur Pro, sertifikasi, dan akses ujian tak terbatas."
        },
        "pro-hub": {
            label: "Ruang PRO",
            chips: ["Fitur eksklusif", "Materi lanjutan", "Mentoring AI", "Simulasi ujian penuh", "Download modul"],
            intro: "Selamat datang di Ruang PRO! Nikmati akses eksklusif fitur premium, analitik mendalam, dan modul lanjutan."
        },
        login: {
            label: "Login",
            chips: ["Bantuan masuk", "Buat akun", "Lupa password", "Keamanan akun", "Kenapa gagal?"],
            intro: "Di halaman login, aku bisa bantu menjelaskan alur masuk, daftar akun, dan keamanan dasar akun."
        }
    };

    const knowledge = [
        {
            keys: ["mulai", "awal", "bingung", "dari mana"],
            text: "Mulai dari halaman Materi untuk membangun konsep, lanjut ke Quiz untuk menguji pemahaman, lalu buka Library kalau butuh bacaan pendukung. Kalau fokus ujian, pilih SNBT atau TKA LMS."
        },
        {
            keys: ["roadmap", "jalur", "learning path", "urutan"],
            text: "Gunakan roadmap sebagai urutan belajar: pahami konsep inti, kerjakan latihan kecil, catat bagian sulit, lalu ulangi dengan quiz. Jangan lompat topik terlalu cepat kalau dasar belum stabil."
        },
        {
            keys: ["loop", "perulangan", "for", "while"],
            text: "Loop dipakai untuk menjalankan instruksi berulang. Gunakan for saat jumlah pengulangan jelas, while saat pengulangan bergantung pada kondisi.\n```js\nfor (let i = 1; i <= 5; i++) {\n  console.log(\"Latihan ke-\" + i);\n}\n```"
        },
        {
            keys: ["array", "list", "daftar", "map", "filter", "reduce"],
            text: "Array menyimpan daftar nilai berurutan. Gunakan map untuk mengubah setiap item, filter untuk menyaring, dan reduce untuk merangkum nilai.\n```js\nconst skor = [80, 90, 70];\nconst rataRata = skor.reduce((total, nilai) => total + nilai, 0) / skor.length;\n```"
        },
        {
            keys: ["function", "fungsi", "arrow", "parameter", "return"],
            text: "Fungsi adalah blok kode yang bisa dipakai ulang. Parameter adalah input, return adalah output. Buat fungsi kecil dengan nama yang menjelaskan tugasnya.\n```js\nconst hitungNilaiAkhir = (tugas, quiz) => tugas * 0.4 + quiz * 0.6;\n```"
        },
        {
            keys: ["object", "objek", "property", "method"],
            text: "Object menyimpan data dalam pasangan key-value. Cocok untuk mewakili entitas seperti user, buku, soal, atau progress belajar.\n```js\nconst user = { nama: \"Alya\", level: 2, pro: false };\n```"
        },
        {
            keys: ["variabel", "variable", "let", "const"],
            text: "Variabel adalah tempat menyimpan nilai. Pakai const untuk nilai yang tidak diganti, dan let untuk nilai yang berubah selama program berjalan."
        },
        {
            keys: ["debug", "bug", "error", "console", "gagal jalan"],
            text: "Cara debug cepat: baca pesan error pertama, cari file/barisnya, cek nilai dengan console.log, kecilkan kasusnya, lalu uji satu perubahan setiap kali. Jangan ubah banyak hal sekaligus."
        },
        {
            keys: ["algoritma", "big o", "kompleksitas", "sorting", "searching"],
            text: "Algoritma adalah langkah sistematis untuk menyelesaikan masalah. Big O menjelaskan bagaimana jumlah operasi bertambah saat input membesar. Untuk awal, kuasai linear search, binary search, bubble/sort bawaan, dan cara membaca O(n), O(log n), O(n²)."
        },
        {
            keys: ["sql", "database", "join", "query"],
            text: "SQL membantu membaca dan mengolah data tabel. JOIN dipakai untuk menggabungkan data dari tabel yang punya relasi kunci.\n```sql\nSELECT siswa.nama, nilai.skor\nFROM siswa\nJOIN nilai ON nilai.siswa_id = siswa.id;\n```"
        },
        {
            keys: ["where", "group by", "having", "order by", "select"],
            text: "Urutan berpikir query SQL: SELECT kolom yang dibutuhkan, FROM tabel utama, JOIN relasi, WHERE untuk filter baris, GROUP BY untuk ringkasan, HAVING untuk filter agregat, lalu ORDER BY untuk urutan hasil."
        },
        {
            keys: ["normalisasi", "primary key", "foreign key", "relasi"],
            text: "Normalisasi membantu data tidak dobel dan relasi lebih rapi. Primary key mengidentifikasi baris unik, foreign key menghubungkan tabel lain ke baris tersebut."
        },
        {
            keys: ["html", "semantik", "web"],
            text: "HTML semantik membuat struktur halaman lebih jelas untuk browser, mesin pencari, dan pembaca layar. Prioritaskan header, main, section, article, nav, dan footer sesuai fungsi kontennya."
        },
        {
            keys: ["css", "flexbox", "grid", "responsive", "mobile"],
            text: "Untuk layout CSS: pakai flexbox untuk baris/kolom sederhana, grid untuk layout dua dimensi, dan media query/container query untuk responsif. Pastikan ukuran punya min/max agar teks tidak saling tabrak."
        },
        {
            keys: ["dom", "event", "listener", "button", "form"],
            text: "DOM adalah representasi elemen HTML di JavaScript. Event listener dipakai untuk merespons klik, input, submit, dan perubahan UI.\n```js\ndocument.querySelector(\"button\").addEventListener(\"click\", () => {\n  console.log(\"Tombol diklik\");\n});\n```"
        },
        {
            keys: ["ui", "ux", "desain", "heuristik"],
            text: "UI/UX yang baik membantu pengguna menyelesaikan tujuan dengan cepat. Fokus pada hirarki visual, kontras, jarak antar elemen, feedback interaksi, dan teks tombol yang jelas."
        },
        {
            keys: ["aksesibilitas", "accessibility", "a11y", "aria", "kontras"],
            text: "Aksesibilitas berarti UI bisa dipakai lebih banyak orang. Gunakan heading berurutan, label form jelas, kontras cukup, fokus keyboard terlihat, dan aria hanya saat elemen native belum cukup."
        },
        {
            keys: ["cyber", "siber", "keamanan", "password", "mfa", "2fa"],
            text: "Keamanan dasar akun dimulai dari password unik, MFA/2FA, dan kewaspadaan terhadap tautan mencurigakan. Untuk aplikasi, validasi input dan jangan pernah menaruh rahasia di sisi klien."
        },
        {
            keys: ["xss", "csrf", "injection", "validasi input"],
            text: "Risiko web umum: XSS menyisipkan script berbahaya, CSRF memaksa aksi dari sesi aktif, dan injection memanfaatkan input yang tidak divalidasi. Mitigasinya: escape output, token CSRF, query parameterized, dan validasi server-side."
        },
        {
            keys: ["ai", "kecerdasan buatan", "prompt"],
            text: "AI bekerja dengan mengenali pola dari data. Prompt yang baik berisi tujuan, konteks, batasan, format jawaban, dan contoh kalau perlu."
        },
        {
            keys: ["machine learning", "dataset", "model", "training"],
            text: "Machine learning melatih model dari data untuk mengenali pola. Alur dasarnya: kumpulkan data, bersihkan, bagi train/test, latih model, evaluasi, lalu pantau performa saat dipakai."
        },
        {
            keys: ["cloud", "devops", "deploy"],
            text: "Cloud membantu aplikasi berjalan di server online. DevOps mengatur proses build, test, deploy, monitoring, dan rollback agar rilis lebih rapi."
        },
        {
            keys: ["api", "rest", "http", "endpoint", "status code"],
            text: "API REST biasanya memakai endpoint berbasis resource, method HTTP, dan status code. GET untuk baca, POST untuk buat, PUT/PATCH untuk update, DELETE untuk hapus. Status 2xx sukses, 4xx kesalahan request, 5xx error server."
        },
        {
            keys: ["rekomendasi buku", "buku", "library", "perpustakaan"],
            text: "Untuk mulai belajar, pilih buku dasar pemrograman atau HTML jika masih awal. Untuk data, ambil SQL. Untuk desain produk, pilih UI/UX. Untuk persiapan ujian, cari materi matematika, ekonomi, sejarah, biologi, atau psikologi belajar."
        },
        {
            keys: ["ringkas buku", "resume buku", "bab", "chapter"],
            text: "Cara membaca buku cepat: lihat judul bab, cari definisi inti, catat 3 poin utama, ambil 1 contoh, lalu buat 1 pertanyaan latihan dari bab itu. Kalau kamu sebut judul/topik, aku bantu arahkan fokus bacanya."
        },
        {
            keys: ["psikologi", "fokus", "kebiasaan"],
            text: "Untuk belajar efektif, pakai sesi 25 sampai 45 menit, tutup distraksi, akhiri dengan rangkuman singkat, lalu ulangi lewat retrieval practice."
        },
        {
            keys: ["pomodoro", "malas", "menunda", "burnout"],
            text: "Kalau lagi berat mulai belajar, turunkan target jadi 10 menit. Buka satu materi, tulis satu ringkasan, atau jawab satu soal. Momentum kecil lebih penting daripada menunggu mood sempurna."
        },
        {
            keys: ["ekonomi", "bisnis", "wirausaha"],
            text: "Untuk ekonomi dan bisnis, pahami dulu permintaan, penawaran, biaya peluang, model bisnis, validasi pasar, dan cara membaca risiko keputusan."
        },
        {
            keys: ["matematika", "aljabar", "fungsi", "statistika", "peluang"],
            text: "Untuk matematika, pisahkan konsep, rumus, dan pola soal. Tulis diketahui-ditanya, pilih rumus, substitusi angka, lalu cek satuan/masuk akal. Untuk statistika, pahami mean, median, modus, varians, dan interpretasi grafik."
        },
        {
            keys: ["biologi", "kimia", "fisika", "ipa"],
            text: "Untuk sains, jangan hanya hafal istilah. Pahami hubungan sebab-akibat: struktur-fungsi di biologi, partikel-reaksi di kimia, dan besaran-rumus-satuan di fisika."
        },
        {
            keys: ["geografi", "sosiologi", "sejarah indonesia"],
            text: "Untuk rumpun sosial, buat peta sebab-akibat dan contoh nyata. Geografi menekankan ruang/interaksi wilayah, sosiologi menekankan norma/lembaga/kelompok, sejarah menekankan kronologi dan dampak."
        },
        {
            keys: ["sejarah", "budaya", "nusantara", "daerah", "bahasa daerah"],
            text: "Belajar budaya lebih mudah kalau kamu mulai dari sapaan harian, makanan khas, tradisi, lalu coba quiz. Hubungkan tiap daerah dengan cerita dan kebiasaan masyarakatnya."
        },
        {
            keys: ["papua", "jawa", "sunda", "bali", "minang", "batak", "aceh", "betawi", "dayak", "banjar", "bugis", "madura", "lombok", "toraja", "maluku"],
            text: "Untuk belajar daerah tertentu, mulai dari 4 hal: sapaan lokal, tradisi utama, makanan khas, dan satu fakta unik. Setelah itu buka kartu daerahnya dan lanjutkan ke latihan flashcard."
        },
        {
            keys: ["quiz", "ujian", "jawaban", "hint", "petunjuk"],
            text: "Aku bisa bantu dengan petunjuk, bukan membocorkan jawaban final. Baca kata kunci soal, coret opsi yang jelas keliru, lalu jelaskan alasan pilihanmu sebelum submit."
        },
        {
            keys: ["kenapa salah", "salah", "review soal", "pembahasan"],
            text: "Untuk review soal, tulis ulang: konsep yang diuji, opsi yang kamu pilih, opsi benar, dan alasan bedanya. Pola salah biasanya muncul dari salah baca kata kunci, lupa definisi, atau terburu-buru menghitung."
        },
        {
            keys: ["snbt", "tps", "tka"],
            text: "Untuk TKA, bagi latihan jadi tiga bagian: konsep inti, drilling soal, dan review kesalahan. Catat pola salah yang berulang karena itu bahan belajar paling bernilai."
        },
        {
            keys: ["rencana 7 hari", "7 hari", "seminggu", "jadwal belajar"],
            text: "Rencana 7 hari: Hari 1 diagnosis, Hari 2 konsep lemah pertama, Hari 3 drilling ringan, Hari 4 konsep lemah kedua, Hari 5 simulasi mini, Hari 6 review salah, Hari 7 tryout dan evaluasi target berikutnya."
        },
        {
            keys: ["pro", "subscription", "langganan", "premium"],
            text: "Fitur Pro biasanya berhubungan dengan akses belajar lebih lengkap, pengalaman latihan, dan fitur pendukung progres. Buka Profil untuk melihat status akun dan opsi subscription."
        },
        {
            keys: ["login", "masuk", "daftar", "akun"],
            text: "Untuk masuk, gunakan email dan password yang sudah terdaftar. Jika baru pertama kali, daftar akun dulu. Pakai password unik agar progres belajar tetap aman."
        },
        {
            keys: ["lupa password", "reset password", "email tidak masuk"],
            text: "Kalau lupa password, cek tombol bantuan/reset jika tersedia, pastikan email benar, lalu cek inbox dan spam. Jangan bagikan kode OTP atau link reset ke siapa pun."
        }
    ];

    function getFileName() {
        const path = window.location.pathname.split("/").pop();
        return path || "index.html";
    }

    function resolvePage() {
        const datasetPage = document.body?.dataset?.page || "";
        const file = getFileName();
        if (datasetPage === "bahasa") return "bahasa-daerah";
        if (datasetPage && pageProfiles[datasetPage]) return datasetPage;
        if (file === "bahasa-daerah.html") return "bahasa-daerah";
        if (file === "index.html") return "index";
        return file.replace(/\.html$/i, "") || "index";
    }

    function shouldLoad() {
        return CONFIG.mainPages.has(getFileName());
    }

    function storageKey() {
        return `bubub_chat_history:${state.page}`;
    }

    function safePlay(name) {
        if (typeof window.playSound === "function") {
            try {
                window.playSound(name);
            } catch (error) {
                console.warn("BUBUB sound skipped:", error);
            }
        }
    }

    function createEl(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (typeof text === "string") el.textContent = text;
        return el;
    }

    function renderMessageParts(messageEl, text) {
        const parts = String(text).split("```");
        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                if (part) messageEl.appendChild(document.createTextNode(part));
                return;
            }
            const lines = part.replace(/^\w+\n/, "").trim();
            if (!lines) return;
            const code = createEl("code", "bubub-ai-code", lines);
            messageEl.appendChild(code);
        });
    }

    function appendMessage(sender, text, persist = true) {
        const message = createEl("div", `bubub-ai-message ${sender}`);
        if (sender === "assistant") {
            renderMessageParts(message, text);
        } else {
            message.textContent = text;
        }
        state.elements.messages.appendChild(message);
        state.elements.messages.scrollTop = state.elements.messages.scrollHeight;

        if (persist) {
            state.history.push({ sender, text: String(text), at: Date.now() });
            state.history = state.history.slice(-CONFIG.maxHistory);
            saveHistory();
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(storageKey(), JSON.stringify(state.history));
        } catch (error) {
            console.warn("BUBUB history save skipped:", error);
        }
    }

    function loadHistory() {
        try {
            const raw = localStorage.getItem(storageKey());
            const parsed = raw ? JSON.parse(raw) : [];
            const recent = Array.isArray(parsed) ? parsed.slice(-CONFIG.maxHistory) : [];
            if (state.page !== "snbt") return recent;
            return recent.map(entry => ({
                ...entry,
                text: String(entry.text || "").replace(
                    "Di halaman SNBT, aku bisa bantu strategi persiapan, pemilihan latihan, dan ringkasan pola belajar.",
                    "Di dashboard TKA, aku bisa bantu memilih fokus, menyusun latihan, dan merangkum pola belajar."
                )
            }));
        } catch (error) {
            console.warn("BUBUB history load skipped:", error);
            return [];
        }
    }

    function includesAny(text, words) {
        return words.some((word) => text.includes(word));
    }

    function getVisibleText(selector, fallback = "") {
        const el = document.querySelector(selector);
        return el ? (el.textContent || "").replace(/\s+/g, " ").trim() : fallback;
    }

    function getPageFacts() {
        const facts = {
            title: document.title || "",
            heading: getVisibleText("h1"),
            pageLabel: (pageProfiles[state.page] || pageProfiles.index).label,
            activeRegion: getVisibleText("#regionChips .active"),
            cultureResult: getVisibleText("#cultureResultTitle"),
            cultureMeta: getVisibleText("#cultureResultMeta"),
            visibleCultureCards: document.querySelectorAll("#cultureGrid .culture-card-link, #cultureGrid .culture-card").length,
            bookCards: document.querySelectorAll("[data-book-id], .book-card, .library-card").length,
            quizCards: document.querySelectorAll("[data-quiz], .quiz-card, .lms-card, .class-card").length,
            planStatus: getVisibleText("#wonderfulPlanStatus") || getVisibleText("[data-plan-status]") || getVisibleText(".subscription-status"),
            profileName: getVisibleText("#profileDisplayName") || getVisibleText(".profile-name"),
            searchValue: (document.querySelector("#cultureSearch, #bookSearch, input[type='search']")?.value || "").trim()
        };

        if (window.WonderfulData?.places) {
            facts.totalPlaces = window.WonderfulData.places.length;
            facts.placeNames = window.WonderfulData.places.slice(0, 8).map((place) => place.label).join(", ");
        }

        if (window.QNCurriculum?.tracks) {
            facts.trackCount = window.QNCurriculum.tracks.length;
            facts.trackNames = window.QNCurriculum.tracks.slice(0, 6).map((track) => track.title).join(", ");
        }

        if (Array.isArray(window.questionBank)) {
            facts.questionCount = window.questionBank.reduce((total, group) => total + (group.questions?.length || 0), 0);
        }

        return facts;
    }

    function makeList(items) {
        return items.filter(Boolean).map((item) => `- ${item}`).join("\n");
    }

    function getCultureSuggestion(query) {
        const normalized = query.toLowerCase();
        const places = window.WonderfulData?.places || [];
        if (!places.length) return "";

        const place = places.find((item) =>
            [item.id, item.label, item.region, item.food?.[0], item.tradition?.[0]]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalized) || normalized.includes(String(value).toLowerCase()))
        );

        if (!place) {
            const byRegion = places.reduce((groups, item) => {
                groups[item.region] = (groups[item.region] || 0) + 1;
                return groups;
            }, {});
            return `Aku bisa bantu pilih daerah dari data lokal halaman ini. Pilihan cepat:\n${makeList(Object.entries(byRegion).map(([region, count]) => `${region}: ${count} kartu`))}\n\nKalau masih bingung, mulai dari region yang paling kamu penasaran, lalu buka satu kartu dan lanjut flashcard.`;
        }

        const cards = (place.cards || []).slice(0, 3).map((card) => `${card[0]} = ${card[1]}`);
        return `${place.label} cocok dipelajari lewat urutan ini:\n${makeList([
            `Ringkasan: ${place.summary}`,
            place.tradition ? `Tradisi: ${place.tradition[0]} - ${place.tradition[1]}` : "",
            place.food ? `Kuliner: ${place.food[0]} - ${place.food[1]}` : "",
            cards.length ? `Frasa awal: ${cards.join(", ")}` : "",
            "Lanjutkan dengan buka kartu detail, tandai favorit/dikuasai, lalu coba quiz budaya."
        ])}`;
    }

    function getCurriculumSuggestion(query) {
        const normalized = query.toLowerCase();
        const tracks = window.QNCurriculum?.tracks || [];
        if (!tracks.length) return "";

        const track = tracks.find((item) =>
            [item.id, item.title, item.category, item.level, item.summary]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalized) || normalized.includes(String(value).toLowerCase()))
        );

        if (!track) {
            return `Jalur yang tersedia di materi/learning path antara lain: ${tracks.slice(0, 6).map((item) => item.title).join(", ")}. Untuk pemula, mulai dari Dasar Pemrograman atau Web Development; untuk data, pilih Database & SQL; untuk produk, pilih UI/UX atau Business Analytics.`;
        }

        const chapters = (track.chapters || []).slice(0, 4).map((chapter) => chapter.title || chapter[1]).filter(Boolean);
        const projectText = (track.project || "membangun skill praktis").replace(/[.!?]+$/g, "");
        return `${track.title} bagus kalau targetmu ${projectText}.\n${makeList([
            `Level: ${track.level}`,
            `Ringkasan: ${track.summary}`,
            chapters.length ? `Urutan bab: ${chapters.join(" -> ")}` : "",
            "Cara belajar: baca konsep inti, buat catatan 5 baris, lalu kerjakan quiz/topik terkait."
        ])}`;
    }

    function pageReply(query) {
        const profile = pageProfiles[state.page] || pageProfiles.index;
        const normalized = query.toLowerCase();
        const facts = getPageFacts();

        if (includesAny(normalized, ["halaman", "fitur", "bantu apa", "bisa apa", "fungsi"])) {
            const contextBits = makeList([
                facts.heading ? `Fokus halaman: ${facts.heading}` : "",
                facts.activeRegion ? `Region aktif: ${facts.activeRegion}` : "",
                facts.cultureResult ? `Hasil budaya: ${facts.cultureResult}` : "",
                facts.trackNames ? `Jalur tersedia: ${facts.trackNames}` : "",
                facts.questionCount ? `Bank soal lokal terdeteksi: ${facts.questionCount} soal` : "",
                facts.planStatus ? `Status terlihat: ${facts.planStatus}` : ""
            ]);
            return `${profile.intro}\n\nYang bisa kulihat sekarang:\n${contextBits || "- Konteks halaman aktif sudah terbaca."}\n\nTanyakan konsep, minta rencana belajar, minta rekomendasi, atau minta hint latihan.`;
        }

        if (includesAny(normalized, ["rencana", "jadwal", "belajar hari ini", "minggu ini", "target"])) {
            return `Rencana singkat yang aman dipakai:\n${makeList([
                "5 menit: pilih satu topik atau satu region, jangan semuanya.",
                "20-30 menit: baca konsep/kartu utama dan tulis 3 poin.",
                "10-15 menit: kerjakan quiz atau flashcard tanpa melihat catatan.",
                "5 menit: catat salah paham atau kata kunci yang perlu diulang besok."
            ])}`;
        }

        if (state.page === "index") {
            if (includesAny(normalized, ["mulai", "awal", "bingung", "rekomendasi"])) {
                return "Kalau kamu baru mulai, pilih jalur ini: Materi untuk konsep -> Quiz untuk cek pemahaman -> Library untuk bacaan pendukung -> Profil untuk lihat progres. Kalau fokus ujian, langsung ke SNBT atau TKA LMS.";
            }
            if (includesAny(normalized, ["fitur", "menu", "navigasi"])) {
                return "Menu utama: Materi untuk belajar konsep, Quiz untuk latihan, Library untuk buku, Wonderful Indonesia untuk budaya/bahasa daerah, SNBT/TKA untuk persiapan ujian, dan Profil untuk progres akun.";
            }
        }

        if (state.page === "materi" || state.page === "learning-path") {
            const curriculum = getCurriculumSuggestion(query);
            if (curriculum && includesAny(normalized, ["jalur", "roadmap", "materi", "topik", "rekomendasi", "web", "database", "sql", "ui", "ux", "cyber", "ai", "cloud", "backend"])) {
                return curriculum;
            }
            if (includesAny(normalized, ["project", "portofolio", "praktek", "latihan"])) {
                return "Biar tidak cuma membaca, ubah materi jadi project kecil: buat halaman profil, todo app, query laporan sederhana, redesign satu form, atau checklist keamanan login. Satu project kecil per topik sudah cukup untuk mengunci konsep.";
            }
            if (includesAny(normalized, ["susah", "bingung", "tidak paham"])) {
                return "Kalau materi terasa sulit, pecah jadi 3 pertanyaan: istilah apa yang belum paham, contoh mana yang membingungkan, dan output apa yang diharapkan. Kirim salah satunya, nanti aku bantu jelaskan pelan-pelan.";
            }
        }

        if (state.page === "library") {
            if (includesAny(normalized, ["rekomendasi", "buku", "bacaan", "pemula"])) {
                return `Rekomendasi cepat:\n${makeList([
                    "Pemula web: Dasar JavaScript lalu HTML Semantik.",
                    "Data: Prinsip SQL, JOIN, GROUP BY, lalu latihan query.",
                    "Desain produk: UI/UX, heuristic, user flow, dan usability testing.",
                    "Keamanan: Cyber Security dasar, password, MFA, XSS/CSRF.",
                    "Non-tech: psikologi belajar untuk fokus dan kebiasaan."
                ])}`;
            }
            if (includesAny(normalized, ["ringkas", "resume", "bab", "isi"])) {
                return "Untuk merangkum buku, ambil 1 bab lalu cari: definisi utama, 3 poin penting, 1 contoh nyata, dan 1 pertanyaan latihan. Sebut judul buku/topik yang kamu baca, nanti aku bantu buat ringkasan belajar singkat.";
            }
            if (includesAny(normalized, ["cari", "filter", "kategori"])) {
                return "Gunakan pencarian untuk judul/topik, lalu filter kategori kalau tersedia. Kalau belum tahu kata kuncinya, mulai dari tujuan: web, data, desain, keamanan, ujian, atau kebiasaan belajar.";
            }
        }

        if (state.page === "quiz" || state.page === "learning-path" || state.page === "tka-lms") {
            if (normalized.includes("jawaban")) {
                return "Aku tidak akan langsung memberi jawaban final. Kirim konsep atau opsi yang membuatmu ragu, lalu aku bantu pecah kata kunci, eliminasi pilihan, dan alasan berpikirnya.";
            }
            if (includesAny(normalized, ["hint", "petunjuk", "bantu soal"])) {
                return "Pakai pola hint ini: 1) tandai kata kunci soal, 2) tentukan konsep yang diuji, 3) coret opsi yang tidak relevan, 4) pilih opsi yang paling langsung menjawab pertanyaan. Kirim potongan soal kalau mau aku bantu arahkan tanpa membocorkan final.";
            }
            if (includesAny(normalized, ["strategi", "mode", "latihan", "ujian"])) {
                return "Strategi quiz: mulai dari mode latihan untuk pemanasan, lanjut mode campuran, lalu mode ujian saat sudah stabil. Setelah selesai, review 3 soal salah pertama karena biasanya itu pola kelemahan utama.";
            }
            if (includesAny(normalized, ["hasil", "analisis", "nilai", "skor"])) {
                return "Analisis hasil belajar: lihat topik dengan salah terbanyak, bukan hanya skor total. Ulangi konsepnya 15 menit, kerjakan 5 soal sejenis, lalu catat alasan salah yang berulang.";
            }
        }

        if (state.page === "bahasa-daerah") {
            if (includesAny(normalized, ["rekomendasi", "daerah", "region", "mulai", "papua", "jawa", "sunda", "bali", "minang", "batak", "aceh", "betawi", "dayak", "banjar", "bugis", "madura", "lombok", "toraja", "maluku"])) {
                return getCultureSuggestion(query);
            }
            if (includesAny(normalized, ["frasa", "sapaan", "bahasa", "ucapan"])) {
                return "Mulai dari sapaan, arti, dan konteks pemakaian. Pola latihan yang enak: baca frasa -> ucapkan 3 kali -> lihat artinya -> tutup artinya -> ulang dari ingatan -> tandai dikuasai kalau sudah lancar.";
            }
            if (includesAny(normalized, ["budaya", "tradisi", "kuliner", "destinasi"])) {
                return "Untuk memahami budaya daerah, baca kartu dengan urutan: ringkasan -> tradisi -> kuliner -> destinasi -> fakta unik. Setelah itu hubungkan dengan satu cerita singkat supaya mudah diingat.";
            }
            if (includesAny(normalized, ["latihan", "quiz", "flashcard"])) {
                return "Alur terbaik di halaman ini: pilih region di peta/chip, buka kartu budaya, lanjut ke latihan flashcard, lalu quiz budaya. Jangan buru-buru quiz sebelum minimal mengenal 3 frasa dan 1 tradisi.";
            }
        }

        if (state.page === "profile" && (normalized.includes("progres") || normalized.includes("target"))) {
            return "Lihat ringkasan progres dan lencana di profil. Pilih satu target kecil untuk hari ini: lanjut satu materi, review satu quiz, atau pinjam satu buku pendukung.";
        }

        if (state.page === "profile") {
            if (includesAny(normalized, ["subscription", "pro", "basic", "premium", "langganan"])) {
                return "Di profil, cek status Basic/Pro dan benefit yang tersedia. Kalau masih Basic, fokus dulu ke fitur inti: materi, quiz, library, dan progres. Upgrade Pro berguna kalau kamu butuh rencana belajar dan pengalaman latihan yang lebih lengkap.";
            }
            if (includesAny(normalized, ["lencana", "badge", "streak", "xp"])) {
                return "Lencana dan XP bagus untuk motivasi, tapi jadikan efek samping dari belajar. Target harian yang sehat: satu konsep selesai, satu quiz direview, atau satu kartu budaya dikuasai.";
            }
        }

        if (state.page === "snbt") {
            if (includesAny(normalized, ["tps", "literasi", "penalaran", "kuantitatif"])) {
                return "TPS biasanya menilai penalaran, literasi, dan kuantitatif. Latihan terbaik: pahami pola soal, kerjakan dengan timer, lalu review alasan salah. Jangan hanya menghafal jawaban.";
            }
            if (includesAny(normalized, ["strategi", "jadwal", "tryout"])) {
                return "Strategi TKA: 2 hari konsep lemah, 2 hari drilling, 1 hari tryout mini, 1 hari review kesalahan, dan 1 hari simulasi. Simpan daftar salah sebagai bahan remedial utama.";
            }
        }

        if (state.page === "tka-lms") {
            if (includesAny(normalized, ["subjek", "mata pelajaran", "pilih"])) {
                return "Pilih subjek dari yang paling berdampak ke targetmu atau yang skornya paling lemah. Untuk sesi pendek, pilih 10-15 soal; untuk simulasi, pakai timer dan campuran tingkat kesulitan.";
            }
            if (includesAny(normalized, ["atur sesi", "jumlah soal", "timer", "mode"])) {
                return "Atur sesi TKA begini: pilih subjek, tentukan jumlah soal, aktifkan timer kalau ingin simulasi, lalu setelah selesai review pembahasan. Mulai kecil dulu kalau sedang membangun konsistensi.";
            }
        }

        if (state.page === "login" && (normalized.includes("sulit") || normalized.includes("gagal") || normalized.includes("password"))) {
            return "Pastikan email dan password sesuai. Jika baru pertama kali, gunakan alur daftar. Untuk keamanan, jangan pakai password yang sama dengan akun lain.";
        }

        if (state.page === "login") {
            if (includesAny(normalized, ["daftar", "register", "buat akun"])) {
                return "Untuk akun baru, isi data yang diminta, pakai email aktif, dan gunakan password unik. Setelah masuk, progres belajar bisa tersimpan lebih rapi di profil.";
            }
            if (includesAny(normalized, ["aman", "keamanan", "otp", "phishing"])) {
                return "Jaga akun dengan password unik, jangan bagikan OTP/link reset, dan hindari login dari tautan yang mencurigakan. Kalau browser umum, pastikan logout setelah selesai.";
            }
        }

        return "";
    }

    function findKnowledge(query) {
        const normalized = query.toLowerCase();
        return knowledge.find((item) => item.keys.some((key) => normalized.includes(key)));
    }

    function buildResponse(query) {
        const normalized = String(query).toLowerCase();
        const profile = pageProfiles[state.page] || pageProfiles.index;

        if (includesAny(normalized, ["halo", "hai", "hello", "hi ", "pagi", "siang", "malam"])) {
            return `Halo, aku BUBUB. Sekarang aku lagi ikut konteks halaman ${profile.label}. Kamu bisa minta arahan belajar, ringkasan konsep, rekomendasi, hint quiz, atau langkah berikutnya.`;
        }

        if (includesAny(normalized, ["terima kasih", "makasih", "thanks", "thank you"])) {
            return "Sama-sama. Kalau mau lanjut, kirim topik yang sedang kamu kerjakan atau klik salah satu chip cepat. Aku bantu pecah jadi langkah kecil.";
        }

        if (includesAny(normalized, ["jelaskan", "apa itu", "contoh", "bedanya", "perbedaan"])) {
            const contextual = pageReply(query);
            if (contextual) return contextual;
            const matched = findKnowledge(query);
            if (matched) return matched.text;
            return "Bisa. Sebutkan istilah atau topik yang mau dijelaskan, misalnya SQL JOIN, loop JavaScript, UI/UX, TPS, TKA, atau budaya daerah tertentu. Aku akan jawab dengan definisi singkat, contoh, dan cara latihan.";
        }

        const contextual = pageReply(query);
        if (contextual) return contextual;

        const matched = findKnowledge(query);
        if (matched) return matched.text;

        return `Aku menangkap pertanyaanmu. Untuk konteks ${profile.label}, coba pilih salah satu arah ini:\n${makeList([
            "Konsep: minta aku jelaskan topik tertentu.",
            "Latihan: minta strategi, hint, atau review kesalahan.",
            "Rekomendasi: minta jalur belajar, buku, region, atau subjek.",
            "Langkah berikutnya: minta rencana belajar singkat."
        ])}`;
    }

    function sendMessage(raw) {
        const text = String(raw || state.elements.input.value || "").trim();
        if (!text) return;

        state.elements.input.value = "";
        appendMessage("user", text);
        safePlay("click");

        window.setTimeout(() => {
            appendMessage("assistant", buildResponse(text));
            safePlay("success");
        }, 420);
    }

    function setOpen(open) {
        state.elements.widget.classList.toggle("is-open", open);
        state.elements.toggle.setAttribute("aria-expanded", String(open));
        state.elements.panel.setAttribute("aria-hidden", String(!open));
        state.elements.pulse.hidden = true;
        if (open) {
            window.setTimeout(() => state.elements.input.focus(), 80);
        }
    }

    function renderChips() {
        const profile = pageProfiles[state.page] || pageProfiles.index;
        state.elements.chips.textContent = "";
        profile.chips.forEach((label) => {
            const chip = createEl("button", "bubub-ai-chip", label);
            chip.type = "button";
            chip.addEventListener("click", () => sendMessage(label));
            state.elements.chips.appendChild(chip);
        });
    }

    function injectWidget() {
        if (document.getElementById("bububAiWidget")) return;

        state.page = resolvePage();
        const profile = pageProfiles[state.page] || pageProfiles.index;

        const widget = createEl("aside", "bubub-ai-widget");
        widget.id = "bububAiWidget";
        widget.setAttribute("aria-label", "BUBUB asisten belajar UNIVERSE OF TECH");

        const toggle = createEl("button", "bubub-ai-toggle");
        toggle.id = "bububAiToggle";
        toggle.type = "button";
        toggle.setAttribute("aria-label", "Buka BUBUB");
        toggle.setAttribute("aria-expanded", "false");

        const toggleLogo = createEl("img");
        toggleLogo.src = CONFIG.logo;
        toggleLogo.alt = "";
        toggleLogo.setAttribute("aria-hidden", "true");
        const pulse = createEl("span", "bubub-ai-pulse", "1");
        toggle.append(toggleLogo, pulse);

        const panel = createEl("section", "bubub-ai-panel");
        panel.id = "bububAiPanel";
        panel.setAttribute("aria-hidden", "true");

        const header = createEl("div", "bubub-ai-header");
        const identity = createEl("div", "bubub-ai-identity");
        const avatar = createEl("img", "bubub-ai-avatar");
        avatar.src = CONFIG.logo;
        avatar.alt = "Logo BUBUB";
        const titleWrap = createEl("div");
        titleWrap.append(createEl("h2", "bubub-ai-title", "BUBUB"));
        titleWrap.append(createEl("span", "bubub-ai-status", `Online di ${profile.label}`));
        identity.append(avatar, titleWrap);
        const close = createEl("button", "bubub-ai-close", "x");
        close.type = "button";
        close.setAttribute("aria-label", "Tutup BUBUB");
        header.append(identity, close);

        const messages = createEl("div", "bubub-ai-messages");
        messages.id = "bububAiMessages";

        const chips = createEl("div", "bubub-ai-chips");
        const compose = createEl("form", "bubub-ai-compose");
        const input = createEl("input", "bubub-ai-input");
        input.id = "bububAiInput";
        input.type = "text";
        input.placeholder = "Tanya BUBUB tentang halaman ini...";
        input.autocomplete = "off";
        const send = createEl("button", "bubub-ai-send", ">");
        send.type = "submit";
        send.setAttribute("aria-label", "Kirim pesan ke BUBUB");
        const footnote = createEl("div", "bubub-ai-footnote", "BUBUB menjawab dari konteks lokal UNIVERSE OF TECH.");
        compose.append(input, send, footnote);

        panel.append(header, messages, chips, compose);
        widget.append(toggle, panel);
        document.body.appendChild(widget);

        state.elements = { widget, toggle, pulse, panel, close, messages, chips, compose, input, send };
        renderChips();

        state.history = loadHistory();
        if (state.history.length) {
            state.history.forEach((entry) => appendMessage(entry.sender, entry.text, false));
        } else {
            appendMessage("assistant", `Halo! Saya BUBUB, asisten belajar UNIVERSE OF TECH. ${profile.intro}`, true);
        }

        toggle.addEventListener("click", () => {
            setOpen(!widget.classList.contains("is-open"));
            safePlay("click");
        });
        close.addEventListener("click", () => {
            setOpen(false);
            safePlay("click");
        });
        compose.addEventListener("submit", (event) => {
            event.preventDefault();
            sendMessage();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && widget.classList.contains("is-open")) {
                setOpen(false);
            }
        });

        window.BUBUBAI = {
            open: () => setOpen(true),
            close: () => setOpen(false),
            ask: (message) => {
                setOpen(true);
                sendMessage(message);
            }
        };
    }

    function init() {
        if (!shouldLoad()) return;
        injectWidget();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
