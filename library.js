/**
 * Universe Of Tech — Library / Digital Reading Room
 * Local-first catalog, reading desk, notes, favorites, and BUBUB assistant.
 */
(() => {
    "use strict";

    const BOOK_COLLECTION = typeof BOOKS !== "undefined" && Array.isArray(BOOKS) ? BOOKS : [];
    const STORAGE_KEYS = {
        borrowed: "library_borrowed",
        bookmarks: "library_bookmarks",
        favorites: "library_favorites",
        viewMode: "library_view_mode",
        sortMode: "library_sort_mode",
        lastRead: "library_last_read"
    };

    const storage = {
        read(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                if (raw === null) return fallback;
                const value = JSON.parse(raw);
                return value ?? fallback;
            } catch (_) {
                return fallback;
            }
        },
        write(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (_) {
                // A private browsing quota or unavailable storage must not block reading.
            }
        },
        readText(key, fallback) {
            try {
                return localStorage.getItem(key) ?? fallback;
            } catch (_) {
                return fallback;
            }
        },
        writeText(key, value) {
            try {
                localStorage.setItem(key, String(value));
            } catch (_) {
                // A private browsing quota or unavailable storage must not block theme changes.
            }
        },
        remove(key) {
            try { localStorage.removeItem(key); } catch (_) { /* optional cleanup */ }
        }
    };

    const state = {
        borrowedIds: normalizeIdArray(storage.read(STORAGE_KEYS.borrowed, [])),
        bookmarks: normalizeObject(storage.read(STORAGE_KEYS.bookmarks, {})),
        favorites: normalizeIdArray(storage.read(STORAGE_KEYS.favorites, [])),
        activeStatus: "all",
        activeCategory: "all",
        query: "",
        sortMode: normalizeChoice(storage.read(STORAGE_KEYS.sortMode, "recommended"), ["recommended", "rating", "title", "duration"], "recommended"),
        viewMode: normalizeChoice(storage.read(STORAGE_KEYS.viewMode, "grid"), ["grid", "list"], "grid")
    };

    const el = {};
    let noteSaveTimeout = null;
    let chatResponseTimer = null;

    function normalizeObject(value) {
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function normalizeIdArray(value) {
        if (!Array.isArray(value)) return [];
        return [...new Set(value.filter((id) => typeof id === "string" && BOOK_COLLECTION.some((book) => book.id === id)))];
    }

    function normalizeChoice(value, choices, fallback) {
        return choices.includes(value) ? value : fallback;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getBook(bookId) {
        return BOOK_COLLECTION.find((book) => book.id === bookId) || null;
    }

    function isBorrowed(bookId) {
        return state.borrowedIds.includes(bookId);
    }

    function isFavorite(bookId) {
        return state.favorites.includes(bookId);
    }

    function getBookProgress(book) {
        if (!book?.chapters?.length || !Object.prototype.hasOwnProperty.call(state.bookmarks, book.id)) return 0;
        const chapterIndex = Number(state.bookmarks[book.id]);
        if (!Number.isFinite(chapterIndex) || chapterIndex < 0) return 0;
        return Math.min(100, Math.round(((Math.min(chapterIndex, book.chapters.length - 1) + 1) / book.chapters.length) * 100));
    }

    function getOverallProgress() {
        const activeBooks = state.borrowedIds.map(getBook).filter(Boolean);
        if (!activeBooks.length) return 0;
        return Math.round(activeBooks.reduce((total, book) => total + getBookProgress(book), 0) / activeBooks.length);
    }

    function getNoteKey(bookId) {
        return bookId === "general" ? "library_note_general" : `library_note_${bookId}`;
    }

    function getNoteCount() {
        let count = storage.read("library_note_general", "").trim() ? 1 : 0;
        BOOK_COLLECTION.forEach((book) => {
            if (storage.read(`library_note_${book.id}`, "").trim()) count += 1;
        });
        if (storage.read("library_note", "").trim()) count = Math.max(count, 1);
        return count;
    }

    function getLastReadBook() {
        const savedId = storage.read(STORAGE_KEYS.lastRead, "");
        const savedBook = getBook(savedId);
        if (savedBook && isBorrowed(savedBook.id)) return savedBook;
        return state.borrowedIds.map(getBook).find(Boolean) || null;
    }

    function showToast(message) {
        if (!el.toast) return;
        el.toast.textContent = message;
        el.toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
    }

    function play(sound) {
        if (typeof window.playSound === "function") window.playSound(sound);
    }

    function setThemeIcon(button) {
        const dark = document.body.classList.contains("dark-theme");
        button.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
        button.setAttribute("aria-label", dark ? "Gunakan tema terang" : "Gunakan tema gelap");
        button.title = dark ? "Tema terang" : "Tema gelap";
    }

    function initTheme() {
        const button = el.themeToggleBtn;
        const savedTheme = storage.readText("eduquest_theme", "light");
        document.body.classList.toggle("dark-theme", savedTheme === "dark");
        if (!button) return;
        setThemeIcon(button);
        button.addEventListener("click", () => {
            const dark = !document.body.classList.contains("dark-theme");
            document.body.classList.toggle("dark-theme", dark);
            storage.writeText("eduquest_theme", dark ? "dark" : "light");
            setThemeIcon(button);
            play("click");
        });
    }

    function updateStats() {
        const overall = getOverallProgress();
        if (el.statTotalBooks) el.statTotalBooks.textContent = String(BOOK_COLLECTION.length);
        if (el.statDeskBooks) el.statDeskBooks.textContent = String(state.borrowedIds.length);
        if (el.statNotesCount) el.statNotesCount.textContent = String(getNoteCount());
        if (el.statReadingProgress) el.statReadingProgress.textContent = `${overall}%`;
        if (el.libraryFavoritesCount) el.libraryFavoritesCount.textContent = String(state.favorites.length);
    }

    function updateNoteBookOptions() {
        if (!el.noteBookSelect) return;
        const previous = el.noteBookSelect.value;
        const borrowedBooks = state.borrowedIds.map(getBook).filter(Boolean);
        el.noteBookSelect.innerHTML = `<option value="general">Catatan umum</option>${borrowedBooks.map((book) => `<option value="${escapeHtml(book.id)}">${escapeHtml(book.code)} · ${escapeHtml(book.title)}</option>`).join("")}`;
        el.noteBookSelect.value = [...el.noteBookSelect.options].some((option) => option.value === previous) ? previous : "general";
    }

    function getProgressMarkup(book, compact = false) {
        const progress = getBookProgress(book);
        if (compact && progress === 0) return "";
        return `<div class="book-progress"><div class="progress-meta"><span>${progress === 100 ? "Selesai dibaca" : "Progress membaca"}</span><strong>${progress}%</strong></div><div class="progress-bar-container"><div class="progress-bar-fill ${progress === 100 ? "is-complete" : ""}" style="width: ${progress}%"></div></div></div>`;
    }

    function renderContinueReading() {
        if (!el.continueReadingCard) return;
        const book = getLastReadBook();
        const cover = el.continueReadingCover;
        const progressWrap = el.continueReadingProgress;
        const progress = book ? getBookProgress(book) : 0;

        if (!book) {
            el.continueReadingCard.classList.add("is-empty");
            el.continueReadingLabel.textContent = "Koleksi pilihan";
            el.continueReadingTitle.textContent = "Pilih bacaan pertama kamu";
            el.continueReadingMeta.textContent = "Pinjam buku dari katalog untuk membangun Meja Baca pribadi.";
            el.continueReadingButton.href = "#katalog";
            el.continueReadingButton.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i> Temukan bacaan';
            progressWrap.hidden = true;
            cover.className = "continue-cover is-empty";
            cover.innerHTML = '<i class="fa-solid fa-book-open" aria-hidden="true"></i>';
            cover.style.removeProperty("background");
            return;
        }

        el.continueReadingCard.classList.remove("is-empty");
        el.continueReadingLabel.textContent = `${book.code} · ${book.categoryLabel}`;
        el.continueReadingTitle.textContent = book.title;
        el.continueReadingMeta.textContent = `${book.author} · ${book.time} · ${book.pages} halaman`;
        el.continueReadingButton.href = `reader.html?book=${encodeURIComponent(book.id)}`;
        el.continueReadingButton.innerHTML = `<i class="fa-solid ${progress === 100 ? "fa-rotate-right" : "fa-play"}" aria-hidden="true"></i> ${progress === 100 ? "Review buku" : "Lanjut membaca"}`;
        progressWrap.hidden = false;
        el.continueReadingProgressValue.textContent = `${progress}%`;
        el.continueReadingProgressFill.style.width = `${progress}%`;
        cover.className = "continue-cover";
        cover.innerHTML = `<span>${escapeHtml(book.code)}</span><i class="fa-solid fa-book-open" aria-hidden="true"></i>`;
        cover.style.background = book.coverGradient;
    }

    function renderReadingDesk() {
        if (!el.readingDeskList) return;
        const books = state.borrowedIds.map(getBook).filter(Boolean);
        updateNoteBookOptions();

        if (!books.length) {
            el.readingDeskList.innerHTML = `<div class="empty-state desk-empty"><span class="empty-state-icon"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span><div><strong>Meja baca masih kosong</strong><span>Pinjam satu buku dari katalog untuk mulai membangun ritme belajarmu.</span></div><a class="btn btn-blue" href="#katalog">Buka katalog</a></div>`;
            return;
        }

        el.readingDeskList.innerHTML = books.map((book) => {
            const progress = getBookProgress(book);
            return `<article class="desk-book-card ${progress === 100 ? "is-complete" : ""}" data-book-id="${escapeHtml(book.id)}">
                <div class="desk-book-main">
                    <div class="mini-cover" data-cover-book="${escapeHtml(book.id)}"><span>${escapeHtml(book.code)}</span></div>
                    <div class="desk-book-meta"><span class="mini-label">${escapeHtml(book.categoryLabel)}</span><strong>${escapeHtml(book.title)}</strong><span>${escapeHtml(book.author)} · ${progress}% selesai</span></div>
                </div>
                <div class="desk-book-actions"><a class="btn btn-blue" data-action="read" data-book-id="${escapeHtml(book.id)}" href="reader.html?book=${encodeURIComponent(book.id)}"><i class="fa-solid fa-book-open" aria-hidden="true"></i><span>Baca</span></a><button class="btn btn-ghost" data-action="return" data-book-id="${escapeHtml(book.id)}" type="button"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i><span>Kembalikan</span></button></div>
                ${getProgressMarkup(book)}
            </article>`;
        }).join("");

        el.readingDeskList.querySelectorAll("[data-cover-book]").forEach((cover) => {
            const book = getBook(cover.dataset.coverBook);
            if (book) cover.style.background = book.coverGradient;
        });
    }

    function getFilteredBooks() {
        const query = state.query.toLowerCase();
        const filtered = BOOK_COLLECTION.filter((book) => {
            const matchesStatus = state.activeStatus === "all" || (state.activeStatus === "borrowed" && isBorrowed(book.id)) || (state.activeStatus === "favorites" && isFavorite(book.id));
            const matchesCategory = state.activeCategory === "all" || book.category.toLowerCase() === state.activeCategory.toLowerCase();
            const searchText = `${book.title} ${book.author} ${book.code} ${book.categoryLabel}`.toLowerCase();
            return matchesStatus && matchesCategory && (!query || searchText.includes(query));
        });

        return filtered.sort((a, b) => {
            if (state.sortMode === "rating") return b.rating - a.rating;
            if (state.sortMode === "title") return a.title.localeCompare(b.title, "id");
            if (state.sortMode === "duration") return parseInt(a.time, 10) - parseInt(b.time, 10);
            const lastRead = storage.read(STORAGE_KEYS.lastRead, "");
            const priority = (book) => (book.id === lastRead ? 3 : isBorrowed(book.id) ? 2 : isFavorite(book.id) ? 1 : 0);
            return priority(b) - priority(a) || b.rating - a.rating || a.title.localeCompare(b.title, "id");
        });
    }

    function renderStars(rating) {
        return Array.from({ length: 5 }, (_, index) => `<i class="fa-${index < Math.round(rating) ? "solid" : "regular"} fa-star" aria-hidden="true"></i>`).join("");
    }

    function renderCatalog() {
        if (!el.resourceGrid) return;
        const books = getFilteredBooks();
        el.resourceGrid.classList.toggle("is-list-view", state.viewMode === "list");
        el.resourceGrid.setAttribute("aria-busy", "true");

        if (el.libraryResultCount) {
            el.libraryResultCount.textContent = `${books.length} ${books.length === 1 ? "koleksi" : "koleksi"}`;
        }

        if (!books.length) {
            const title = state.activeStatus === "favorites" ? "Belum ada buku favorit" : state.query ? "Tidak ada hasil yang cocok" : "Belum ada buku di filter ini";
            const message = state.activeStatus === "favorites" ? "Tekan ikon hati pada kartu buku untuk menyimpannya di sini." : "Coba ubah kata kunci, status, atau bidang yang dipilih.";
            el.resourceGrid.innerHTML = `<div class="empty-state catalog-empty"><span class="empty-state-icon"><i class="fa-solid fa-compass" aria-hidden="true"></i></span><div><strong>${title}</strong><span>${message}</span></div><button class="btn btn-ghost" type="button" data-action="reset-filters">Reset filter</button></div>`;
            el.resourceGrid.setAttribute("aria-busy", "false");
            return;
        }

        el.resourceGrid.innerHTML = books.map((book) => {
            const borrowed = isBorrowed(book.id);
            const favorite = isFavorite(book.id);
            const progress = getBookProgress(book);
            const status = borrowed ? (progress === 100 ? "Selesai dibaca" : "Sedang dibaca") : "Tersedia";
            return `<article class="resource-card ${borrowed ? "is-borrowed" : ""} ${favorite ? "is-favorite" : ""}" data-book-id="${escapeHtml(book.id)}">
                <div class="book-cover" data-cover-book="${escapeHtml(book.id)}">
                    <span class="book-cover-code">${escapeHtml(book.code)}</span>
                    <button class="favorite-button ${favorite ? "is-active" : ""}" data-action="favorite" data-book-id="${escapeHtml(book.id)}" type="button" aria-label="${favorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}" aria-pressed="${favorite}"><i class="fa-${favorite ? "solid" : "regular"} fa-heart" aria-hidden="true"></i></button>
                    <strong class="book-cover-title">${escapeHtml(book.title)}</strong>
                    <span class="book-cover-footer"><span>${escapeHtml(book.categoryLabel)}</span><span>${escapeHtml(book.time)}</span></span>
                </div>
                <div class="resource-card-topline"><span class="category-badge">${escapeHtml(book.categoryLabel)}</span><span class="availability-badge ${borrowed ? "is-active" : ""}"><span aria-hidden="true"></span>${status}</span></div>
                <div class="resource-card-body"><h3>${escapeHtml(book.title)}</h3><p class="book-author">${escapeHtml(book.author)}</p><div class="book-facts"><span class="rating"><span>${renderStars(book.rating)}</span><strong>${escapeHtml(book.rating)}</strong></span><span><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${escapeHtml(book.pages)} hlm</span></div>${borrowed ? getProgressMarkup(book, true) : ""}</div>
                <div class="resource-card-actions">${borrowed ? `<a class="btn btn-blue" data-action="read" data-book-id="${escapeHtml(book.id)}" href="reader.html?book=${encodeURIComponent(book.id)}"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Baca</a><button class="btn btn-ghost" data-action="return" data-book-id="${escapeHtml(book.id)}" type="button">Kembalikan</button>` : `<button class="btn btn-primary" data-action="borrow" data-book-id="${escapeHtml(book.id)}" type="button"><i class="fa-solid fa-plus" aria-hidden="true"></i> Pinjam ke Meja</button>`}</div>
            </article>`;
        }).join("");

        el.resourceGrid.querySelectorAll("[data-cover-book]").forEach((cover) => {
            const book = getBook(cover.dataset.coverBook);
            if (book) cover.style.background = book.coverGradient;
        });
        el.resourceGrid.setAttribute("aria-busy", "false");
    }

    function syncControls() {
        document.querySelectorAll("[data-library-status]").forEach((button) => {
            const active = button.dataset.libraryStatus === state.activeStatus;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll("[data-library-filter]").forEach((button) => {
            const active = button.dataset.libraryFilter.toLowerCase() === state.activeCategory.toLowerCase();
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        if (el.librarySort) el.librarySort.value = state.sortMode;
        [el.libraryViewGrid, el.libraryViewList].forEach((button) => button?.classList.remove("is-active"));
        const activeView = state.viewMode === "list" ? el.libraryViewList : el.libraryViewGrid;
        activeView?.classList.add("is-active");
        [el.libraryViewGrid, el.libraryViewList].forEach((button) => button?.setAttribute("aria-pressed", String(button === activeView)));
        if (el.libraryClearSearch) el.libraryClearSearch.hidden = !state.query;
    }

    function refreshPage() {
        renderContinueReading();
        renderReadingDesk();
        renderCatalog();
        updateStats();
        syncControls();
        updateNoteCount();
    }

    function borrowBook(bookId) {
        if (!getBook(bookId) || isBorrowed(bookId)) return;
        state.borrowedIds.push(bookId);
        storage.write(STORAGE_KEYS.borrowed, state.borrowedIds);
        storage.write(STORAGE_KEYS.lastRead, bookId);
        showToast("Buku ditambahkan ke Meja Baca.");
        play("success");
        refreshPage();
    }

    function returnBook(bookId) {
        if (!isBorrowed(bookId)) return;
        state.borrowedIds = state.borrowedIds.filter((id) => id !== bookId);
        storage.write(STORAGE_KEYS.borrowed, state.borrowedIds);
        if (storage.read(STORAGE_KEYS.lastRead, "") === bookId) storage.remove(STORAGE_KEYS.lastRead);
        showToast("Buku dikembalikan ke katalog.");
        play("click");
        refreshPage();
    }

    function toggleFavorite(bookId) {
        if (!getBook(bookId)) return;
        state.favorites = isFavorite(bookId) ? state.favorites.filter((id) => id !== bookId) : [...state.favorites, bookId];
        storage.write(STORAGE_KEYS.favorites, state.favorites);
        showToast(isFavorite(bookId) ? "Buku disimpan ke favorit." : "Buku dihapus dari favorit.");
        play("click");
        refreshPage();
    }

    function openReader(bookId) {
        if (!getBook(bookId)) return;
        storage.write(STORAGE_KEYS.lastRead, bookId);
        play("cyber");
        window.location.href = `reader.html?book=${encodeURIComponent(bookId)}`;
    }

    const LIBRARIAN_RESPONSES = {
        rekomendasi: `<p>Untuk mulai dengan fondasi yang kuat, coba <strong>Dasar Pemrograman JavaScript (CS-101)</strong>. Setelah itu, lanjutkan ke <strong>Prinsip Sistem Basis Data SQL (DB-202)</strong> untuk memahami cara data bekerja.</p><p>Kalau kamu ingin membangun produk digital, <strong>Panduan Desain Antarmuka UI/UX (DS-303)</strong> adalah pasangan bacaan yang bagus.</p>`,
        sql: `<p><strong>SQL JOIN</strong> menghubungkan baris dari dua tabel menggunakan kolom yang memiliki relasi.</p><ul><li><code>INNER JOIN</code> hanya menampilkan data yang cocok di kedua tabel.</li><li><code>LEFT JOIN</code> mempertahankan seluruh data dari tabel kiri.</li><li>Gunakan alias tabel agar query panjang tetap mudah dibaca.</li></ul><p>Contoh lengkapnya ada di <strong>DB-202</strong>.</p>`,
        ui: `<p>Mulai UI/UX dari tiga hal: pahami pengguna, buat struktur informasi yang jelas, lalu uji prototype dengan pengguna nyata.</p><p>Buku <strong>DS-303</strong> membahas User-Centered Design, aksesibilitas, tipografi, dan heuristik Nielsen.</p>`,
        cyber: `<p>Dasar keamanan informasi sering diringkas sebagai <strong>CIA Triad</strong>: Confidentiality, Integrity, dan Availability.</p><ul><li>Gunakan enkripsi untuk menjaga kerahasiaan.</li><li>Gunakan hashing atau signature untuk memeriksa integritas.</li><li>Siapkan backup dan mitigasi agar layanan tetap tersedia.</li></ul><p>Pelajari contoh teknisnya di <strong>SEC-404</strong>.</p>`,
        math: `<p>Dalam kalkulus, <strong>limit</strong> menggambarkan kecenderungan nilai, <strong>turunan</strong> mengukur laju perubahan, dan <strong>integral</strong> mengukur akumulasi.</p><p><strong>MATH-505</strong> merangkai ketiganya untuk persiapan SNBT/TKA.</p>`,
        html: `<p>HTML semantik membuat struktur halaman lebih mudah dipahami manusia, mesin pencari, dan screen reader.</p><p>Prioritaskan elemen seperti <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;article&gt;</code>, dan <code>&lt;footer&gt;</code> di <strong>WEB-102</strong>.</p>`,
        psychology: `<p>Untuk belajar lebih efektif, gabungkan <strong>active recall</strong>, <strong>spaced repetition</strong>, dan sesi fokus yang realistis.</p><p><strong>PSY-110</strong> membahas cara membangun kebiasaan tanpa mengandalkan motivasi sesaat.</p>`,
        economics: `<p>Mulai ekonomi mikro dari hubungan permintaan, penawaran, harga keseimbangan, dan opportunity cost.</p><p><strong>ECO-210</strong> menghubungkan konsep tersebut dengan pengambilan keputusan bisnis.</p>`,
        history: `<p><strong>HIS-120</strong> membantu melihat sejarah Indonesia sebagai rangkaian perubahan sosial, politik, dan ekonomi—bukan sekadar daftar tanggal.</p>`,
        biology: `<p><strong>BIO-130</strong> membahas sel, DNA, sintesis protein, mitosis, meiosis, serta dasar genetika dengan alur yang terstruktur.</p>`,
        literature: `<p>Untuk membaca sastra secara kritis, perhatikan plot, konflik, penokohan, sudut pandang, dan konteks sosial karya.</p><p>Mulai dari <strong>LIT-310</strong> untuk pengantar teori sastra.</p>`,
        law: `<p><strong>LAW-410</strong> membahas negara hukum, pemisahan kekuasaan, hierarki peraturan, dan prinsip konstitusional di Indonesia.</p>`,
        education: `<p>Asesmen yang baik dimulai dari tujuan belajar yang jelas, bukti pemahaman yang terukur, dan umpan balik yang bisa ditindaklanjuti.</p><p>Rujuk <strong>EDU-610</strong> untuk strategi pembelajaran.</p>`,
        health: `<p>Jadikan kesehatan sebagai sistem sederhana: tidur cukup, bergerak teratur, makan beragam, dan evaluasi kebiasaan secara berkala.</p><p><strong>HLT-710</strong> membahas dasar kesehatan publik.</p>`,
        environment: `<p>Perubahan iklim perlu dibaca melalui hubungan antara emisi, energi, ekosistem, kebijakan, dan perilaku manusia.</p><p>Mulai dari <strong>ENV-801</strong>.</p>`,
        generalStudies: `<p>Kalau belum tahu harus mulai dari mana, pilih buku dengan durasi terpendek lalu tulis tiga hal yang ingin kamu pahami sebelum membaca.</p>`,
        default: `<p>Saya bisa membantu memilih buku, menjelaskan konsep, atau membuat ringkasan singkat.</p><p>Coba tanyakan tentang <strong>SQL</strong>, <strong>UI/UX</strong>, <strong>keamanan siber</strong>, <strong>HTML</strong>, matematika, atau buku favoritmu.</p>`
    };

    function responseKey(query) {
        const q = query.toLowerCase();
        const rules = [
            ["psychology", ["psikologi", "kebiasaan", "fokus", "belajar efektif"]],
            ["economics", ["ekonomi", "bisnis", "wirausaha", "pasar"]],
            ["history", ["sejarah", "reformasi", "indonesia modern"]],
            ["biology", ["biologi", "sel", "gen", "dna"]],
            ["literature", ["sastra", "puisi", "novel", "naratif"]],
            ["law", ["hukum", "undang", "konstitusi"]],
            ["education", ["pendidikan", "pedagogi", "mengajar", "guru"]],
            ["health", ["kesehatan", "nutrisi", "diet", "olahraga", "gizi"]],
            ["environment", ["lingkungan", "iklim", "ekosistem", "polusi", "energi terbarukan"]],
            ["generalStudies", ["non-tech", "umum", "studi umum"]],
            ["rekomendasi", ["rekomendasi", "coding", "pemrograman"]],
            ["sql", ["sql", "join", "database"]],
            ["ui", ["ui", "ux", "desain", "heuristic"]],
            ["cyber", ["keamanan", "siber", "cyber", "kriptografi", "enkripsi"]],
            ["math", ["kalkulus", "matematika", "limit", "integral"]],
            ["html", ["html", "semantik", "web"]]
        ];
        return rules.find(([, words]) => words.some((word) => q.includes(word)))?.[0] || "default";
    }

    function appendChatMessage(sender, content) {
        if (!el.chatHistory) return;
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender}`;
        if (sender === "user") bubble.textContent = content;
        else bubble.innerHTML = content;
        el.chatHistory.appendChild(bubble);
        el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
    }

    function showTypingIndicator() {
        if (!el.chatHistory) return;
        document.getElementById("typingIndicator")?.remove();
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.id = "typingIndicator";
        indicator.setAttribute("aria-label", "BUBUB sedang mengetik");
        indicator.innerHTML = '<span></span><span></span><span></span>';
        el.chatHistory.appendChild(indicator);
        el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
    }

    function processChatQuery(query) {
        const cleanQuery = query.trim();
        if (!cleanQuery) return;
        appendChatMessage("user", cleanQuery);
        if (el.chatInput) el.chatInput.value = "";
        showTypingIndicator();
        clearTimeout(chatResponseTimer);
        chatResponseTimer = setTimeout(() => {
            document.getElementById("typingIndicator")?.remove();
            appendChatMessage("ai", LIBRARIAN_RESPONSES[responseKey(cleanQuery)]);
            play("cyber");
        }, 700);
    }

    function initChat() {
        if (!el.chatHistory) return;
        appendChatMessage("ai", "Halo! Saya BUBUB, pustakawan digitalmu. Saya bisa membantu menemukan buku atau memecah konsep yang terasa rumit.");
        el.chatForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            processChatQuery(el.chatInput?.value || "");
        });
        document.querySelectorAll(".chat-suggest-chip").forEach((button) => button.addEventListener("click", () => processChatQuery(button.dataset.query || "")));
    }

    function updateNoteCount() {
        if (el.libraryNote) el.noteCharCount.textContent = `${el.libraryNote.value.length.toLocaleString("id-ID")} karakter`;
    }

    function loadActiveNote() {
        if (!el.libraryNote || !el.noteBookSelect) return;
        const selected = el.noteBookSelect.value;
        let content = storage.read(getNoteKey(selected), "");
        if (selected === "general" && !content) content = storage.read("library_note", "");
        el.libraryNote.value = content;
        updateNoteCount();
    }

    function setAutosaveStatus(type) {
        if (!el.autosaveStatus) return;
        if (type === "saving") {
            el.autosaveStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Menyimpan...';
            el.autosaveStatus.className = "autosave-status is-saving";
        } else {
            el.autosaveStatus.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Tersimpan otomatis';
            el.autosaveStatus.className = "autosave-status is-saved";
        }
    }

    function saveActiveNote(isAuto = false) {
        if (!el.libraryNote || !el.noteBookSelect) return;
        const selected = el.noteBookSelect.value;
        const content = el.libraryNote.value;
        storage.write(getNoteKey(selected), content);
        if (selected === "general") storage.write("library_note", content);
        updateStats();
        updateNoteCount();
        if (isAuto) setAutosaveStatus("saved");
        else {
            setAutosaveStatus("saved");
            showToast("Catatan berhasil disimpan.");
            play("success");
        }
    }

    function initNotes() {
        if (!el.libraryNote || !el.noteBookSelect) return;
        el.noteBookSelect.addEventListener("change", () => {
            loadActiveNote();
            play("click");
        });
        el.libraryNote.addEventListener("input", () => {
            updateNoteCount();
            setAutosaveStatus("saving");
            clearTimeout(noteSaveTimeout);
            noteSaveTimeout = setTimeout(() => saveActiveNote(true), 650);
        });
        el.saveLibraryNote?.addEventListener("click", () => saveActiveNote(false));
        el.clearLibraryNote?.addEventListener("click", () => {
            if (!el.libraryNote.value || window.confirm("Bersihkan catatan yang sedang dibuka?")) {
                el.libraryNote.value = "";
                saveActiveNote(false);
            }
        });
        loadActiveNote();
    }

    function resetFilters() {
        state.activeStatus = "all";
        state.activeCategory = "all";
        state.query = "";
        if (el.librarySearch) el.librarySearch.value = "";
        refreshPage();
    }

    function handleAction(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;
        const bookId = target.dataset.bookId;
        if (action === "favorite") {
            event.preventDefault();
            toggleFavorite(bookId);
        } else if (action === "borrow") {
            event.preventDefault();
            borrowBook(bookId);
        } else if (action === "return") {
            event.preventDefault();
            returnBook(bookId);
        } else if (action === "read") {
            event.preventDefault();
            openReader(bookId);
        } else if (action === "reset-filters") {
            event.preventDefault();
            resetFilters();
        }
    }

    function initCatalogControls() {
        el.librarySearch?.addEventListener("input", (event) => {
            state.query = event.target.value.trim();
            renderCatalog();
            syncControls();
        });
        el.libraryClearSearch?.addEventListener("click", () => {
            state.query = "";
            if (el.librarySearch) el.librarySearch.value = "";
            renderCatalog();
            syncControls();
            el.librarySearch?.focus();
        });
        el.librarySort?.addEventListener("change", (event) => {
            state.sortMode = normalizeChoice(event.target.value, ["recommended", "rating", "title", "duration"], "recommended");
            storage.write(STORAGE_KEYS.sortMode, state.sortMode);
            renderCatalog();
            play("click");
        });
        el.libraryViewGrid?.addEventListener("click", () => {
            state.viewMode = "grid";
            storage.write(STORAGE_KEYS.viewMode, state.viewMode);
            refreshPage();
        });
        el.libraryViewList?.addEventListener("click", () => {
            state.viewMode = "list";
            storage.write(STORAGE_KEYS.viewMode, state.viewMode);
            refreshPage();
        });
        document.querySelectorAll("[data-library-status]").forEach((button) => button.addEventListener("click", () => {
            state.activeStatus = button.dataset.libraryStatus || "all";
            renderCatalog();
            syncControls();
            play("click");
        }));
        document.querySelectorAll("[data-library-filter]").forEach((button) => button.addEventListener("click", () => {
            state.activeCategory = button.dataset.libraryFilter || "all";
            renderCatalog();
            syncControls();
            play("click");
        }));
        el.resourceGrid?.addEventListener("click", handleAction);
        el.readingDeskList?.addEventListener("click", handleAction);
    }

    function cacheElements() {
        [
            "toast", "themeToggleBtn", "statTotalBooks", "statDeskBooks", "statNotesCount", "statReadingProgress", "libraryFavoritesCount",
            "continueReadingCard", "continueReadingCover", "continueReadingLabel", "continueReadingTitle", "continueReadingMeta", "continueReadingProgress", "continueReadingProgressValue", "continueReadingProgressFill", "continueReadingButton",
            "readingDeskList", "librarySearch", "libraryClearSearch", "libraryResultCount", "librarySort", "libraryViewGrid", "libraryViewList", "resourceGrid",
            "chatHistory", "chatInput", "chatForm", "libraryNote", "saveLibraryNote", "clearLibraryNote", "noteBookSelect", "noteCharCount", "autosaveStatus"
        ].forEach((id) => { el[id] = document.getElementById(id); });
    }

    function init() {
        cacheElements();
        initTheme();
        initCatalogControls();
        initChat();
        initNotes();
        refreshPage();
        window.LibraryPage = {
            getState: () => ({ ...state, borrowedIds: [...state.borrowedIds], favorites: [...state.favorites] }),
            refresh: refreshPage
        };
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();
