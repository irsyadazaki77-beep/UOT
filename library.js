/**
 * Universe Of Tech - Perpustakaan Digital Universitas JS
 */

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

// DATABASE BUKU DIGITAL UNIVERSITAS (Diimpor dari book-data.js)

// STATE HALAMAN
let borrowedIds = storage.get("library_borrowed", []);
let bookmarks = storage.get("library_bookmarks", {}); // { bookId: chapterIndex }
let activeFilter = "all";
let searchQuery = "";

// INVENTARISASI DOM ELEMENTS
const el = {
    statTotalBooks: document.getElementById("statTotalBooks"),
    statDeskBooks: document.getElementById("statDeskBooks"),
    statNotesCount: document.getElementById("statNotesCount"),
    
    readingDeskList: document.getElementById("readingDeskList"),
    librarySearch: document.getElementById("librarySearch"),
    resourceGrid: document.getElementById("resourceGrid"),
    
    chatHistory: document.getElementById("chatHistory"),
    chatInput: document.getElementById("chatInput"),
    chatForm: document.getElementById("chatForm"),
    
    libraryNote: document.getElementById("libraryNote"),
    saveLibraryNote: document.getElementById("saveLibraryNote"),
    noteBookSelect: document.getElementById("noteBookSelect"),
    autosaveStatus: document.getElementById("autosaveStatus")
};

// ==========================================================================
// RENDERING DASHBOARD PERPUSTAKAAN & MEJA BACA
// ==========================================================================
function updateDashboardStats() {
    if (el.statTotalBooks) el.statTotalBooks.textContent = BOOKS.length;
    if (el.statDeskBooks) el.statDeskBooks.textContent = borrowedIds.length;
    
    let activeNotes = 0;
    if (storage.get("library_note_general", "").trim()) activeNotes++;
    BOOKS.forEach(b => {
        if (storage.get(`library_note_${b.id}`, "").trim()) {
            activeNotes++;
        }
    });
    // Fallback support for legacy global key
    if (storage.get("library_note", "").trim()) {
        activeNotes = Math.max(activeNotes, 1);
    }
    
    if (el.statNotesCount) el.statNotesCount.textContent = activeNotes;
}

function updateNoteBookSelectOptions(items) {
    if (!el.noteBookSelect) return;
    const currentValue = el.noteBookSelect.value;
    
    el.noteBookSelect.innerHTML = `<option value="general">📝 Catatan Umum (Tidak Terikat Buku)</option>`;
    items.forEach(book => {
        el.noteBookSelect.innerHTML += `<option value="${book.id}">📚 [${book.code}] ${book.title}</option>`;
    });
    
    if ([...el.noteBookSelect.options].some(opt => opt.value === currentValue)) {
        el.noteBookSelect.value = currentValue;
    } else {
        el.noteBookSelect.value = "general";
    }
}

function renderReadingDesk() {
    if (!el.readingDeskList) return;
    
    const items = borrowedIds.map(id => BOOKS.find(b => b.id === id)).filter(Boolean);
    
    // Update dropdown options
    updateNoteBookSelectOptions(items);
    
    if (items.length === 0) {
        el.readingDeskList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px; font-weight: 700; border: 1px dashed var(--border); border-radius: 18px;">
                <i class="fa-solid fa-book-open" style="font-size: 24px; margin-bottom: 8px; display: block; color: var(--blue);"></i>
                Meja belajar kosong.<br>Silakan pinjam buku dari katalog di bawah.
            </div>
        `;
        return;
    }
    
    el.readingDeskList.innerHTML = items.map(book => {
        const lastReadChapter = bookmarks[book.id] !== undefined ? bookmarks[book.id] : 0;
        const progressPercent = Math.round(((lastReadChapter + 1) / book.chapters.length) * 100);
        
        return `
            <div class="desk-book-card" style="${progressPercent === 100 ? 'border-color: var(--green);' : ''}">
                <div style="display: flex; flex-direction: column; width: 100%; gap: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%;">
                        <div class="desk-book-info">
                            <div class="mini-cover" style="background: ${book.coverGradient}">
                                ${book.code}
                            </div>
                            <div class="desk-book-meta">
                                <strong>${book.title}</strong>
                                <span style="display: flex; align-items: center; gap: 6px;">
                                    Progress: ${progressPercent}% dibaca
                                    ${progressPercent === 100 ? '<span class="mini-tag" style="background: rgba(50, 214, 107, 0.12); color: var(--green-dark); padding: 2px 6px; font-size: 9px;">Selesai</span>' : ''}
                                </span>
                            </div>
                        </div>
                        <div class="desk-book-actions">
                            <button class="btn btn-blue read-book-btn" data-id="${book.id}">Baca</button>
                            <button class="btn btn-ghost return-book-btn" data-id="${book.id}" style="color: #ff4d6d; background: rgba(255, 77, 109, 0.1); padding: 8px 12px;">Kembalikan</button>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%; background: ${progressPercent === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--blue), var(--purple))'};"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
    
    // Bind Event Listeners
    el.readingDeskList.querySelectorAll(".read-book-btn").forEach(btn => {
        btn.addEventListener("click", () => openReader(btn.dataset.id));
    });
    el.readingDeskList.querySelectorAll(".return-book-btn").forEach(btn => {
        btn.addEventListener("click", () => returnBook(btn.dataset.id));
    });
}

function renderCatalog() {
    if (!el.resourceGrid) return;
    
    const filtered = BOOKS.filter(book => {
        const matchFilter = activeFilter === "all" || book.category.toLowerCase() === activeFilter.toLowerCase();
        const matchSearch = `${book.title} ${book.author} ${book.code} ${book.categoryLabel}`.toLowerCase().includes(searchQuery.toLowerCase());
        return matchFilter && matchSearch;
    });
    
    if (filtered.length === 0) {
        el.resourceGrid.innerHTML = `
            <div class="card" style="grid-column: 1/-1; text-align: center; padding: 48px 24px;">
                <h3>Buku tidak ditemukan</h3>
                <p class="muted">Silakan coba kata kunci pencarian atau kategori filter lainnya.</p>
            </div>
        `;
        return;
    }
    
    el.resourceGrid.innerHTML = filtered.map(book => {
        const isBorrowed = borrowedIds.includes(book.id);
        const stars = Array(5).fill("").map((_, i) => {
            return i < Math.floor(book.rating) ? '<i class="fa-solid fa-star" style="color: var(--yellow)"></i>' : '<i class="fa-regular fa-star"></i>';
        }).join("");
        
        const lastReadChapter = bookmarks[book.id] !== undefined ? bookmarks[book.id] : 0;
        const progressPercent = Math.round(((lastReadChapter + 1) / book.chapters.length) * 100);
        
        return `
            <article class="resource-card" style="${isBorrowed ? 'border-color: rgba(79, 140, 255, 0.3);' : ''}">
                <div class="book-cover" style="background: ${book.coverGradient}">
                    <span class="book-cover-code">${book.code}</span>
                    <strong class="book-cover-title">${book.title}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="mini-tag" style="background: rgba(79, 140, 255, 0.08); color: var(--blue); margin-bottom: 0;">${book.categoryLabel}</span>
                    ${isBorrowed 
                        ? `<span class="mini-tag" style="background: rgba(50, 214, 107, 0.12); color: var(--green-dark); margin-bottom: 0;">${progressPercent === 100 ? 'Selesai Dibaca' : 'Sedang Dibaca'}</span>` 
                        : ''
                    }
                </div>
                <h3>${book.title}</h3>
                <div class="book-author">Oleh: ${book.author}</div>
                <div style="font-size: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-flex; gap: 2px;">${stars}</span>
                    <strong style="color: var(--dark); font-weight: 800; margin-left: 4px;">${book.rating}</strong>
                    <span class="muted">(${book.pages} hlm)</span>
                </div>
                
                ${isBorrowed 
                    ? `
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 4px;">
                            <span>Progres Membaca</span>
                            <span>${progressPercent}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progressPercent}%; background: ${progressPercent === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--blue), var(--purple))'};"></div>
                        </div>
                    </div>
                    ` 
                    : ''
                }

                <div style="display: flex; gap: 8px;">
                    ${isBorrowed 
                        ? `<button class="btn btn-ghost return-book-btn" data-id="${book.id}" style="flex:1; justify-content: center; color: #ff4d6d; background: rgba(255, 77, 109, 0.08); padding: 10px;">Kembalikan</button>`
                        : `<button class="btn btn-primary borrow-book-btn" data-id="${book.id}" style="flex:1; justify-content: center;">Pinjam Buku</button>`
                    }
                    ${isBorrowed ? `<button class="btn btn-blue read-book-btn" data-id="${book.id}" style="padding: 10px 16px;"><i class="fa-solid fa-book-open"></i> Baca</button>` : ''}
                </div>
            </article>
        `;
    }).join("");
    
    // Bind Event Listeners
    el.resourceGrid.querySelectorAll(".borrow-book-btn").forEach(btn => {
        btn.addEventListener("click", () => borrowBook(btn.dataset.id));
    });
    el.resourceGrid.querySelectorAll(".return-book-btn").forEach(btn => {
        btn.addEventListener("click", () => returnBook(btn.dataset.id));
    });
    el.resourceGrid.querySelectorAll(".read-book-btn").forEach(btn => {
        btn.addEventListener("click", () => openReader(btn.dataset.id));
    });
}

// LOGIKA PEMINJAMAN
function borrowBook(bookId) {
    if (borrowedIds.includes(bookId)) return;
    
    borrowedIds.push(bookId);
    storage.set("library_borrowed", borrowedIds);
    
    showToast("Buku berhasil dipinjam ke Meja Baca! 📚");
    if (window.playSound) playSound("success");
    
    renderReadingDesk();
    renderCatalog();
    updateDashboardStats();
}

function returnBook(bookId) {
    const idx = borrowedIds.indexOf(bookId);
    if (idx < 0) return;
    
    borrowedIds.splice(idx, 1);
    storage.set("library_borrowed", borrowedIds);
    
    showToast("Buku dikembalikan ke katalog.");
    if (window.playSound) playSound("click");
    
    renderReadingDesk();
    renderCatalog();
    updateDashboardStats();
}

function openReader(bookId) {
    if (window.playSound) playSound("cyber");
    // Redirect ke halaman baru agar pengguna bisa membaca dengan fokus
    window.location.href = `reader.html?book=${bookId}`;
}

// ==========================================================================
// ASISTEN PUSTAKAWAN AI CHATBOT LOGIC
// ==========================================================================
const LIBRARIAN_RESPONSES = {
    rekomendasi: `
        Berikut adalah buku rekomendasi di perpustakaan kami berdasarkan kategori bidang pemrograman dan siber:
        <br><br>
        1. <strong>Dasar Pemrograman JavaScript (CS-101)</strong> - Sangat bagus untuk memulai karir Web Developer (Ulasan: 4.8/5).
        <br>
        2. <strong>Prinsip Sistem Basis Data SQL (DB-202)</strong> - Panduan query relasional komprehensif bagi Anda yang ingin menjadi Data Engineer.
        <br>
        3. <strong>Keamanan Siber & Defisit Sistem (SEC-404)</strong> - Membedah kriptografi siber dan celah keamanan jaringan.
        <br><br>
        Silakan klik <em>Pinjam Buku</em> pada katalog untuk meletakkannya di meja baca Anda!
    `,
    sql: `
        Di buku <strong>Prinsip Sistem Basis Data SQL (DB-202) Bab 3</strong>, kami membedah secara visual bagaimana perintah <code>JOIN</code> menyatukan tabel-tabel berelasi:
        <br><br>
        • <code>INNER JOIN</code>: Mengambil baris data jika ada kecocokan kunci di kedua tabel.
        <br>
        • <code>LEFT JOIN</code>: Mengambil seluruh data dari tabel sebelah kiri, ditambah data tabel kanan yang berelasi cocok saja (data kosong di kanan diisi nilai NULL).
        <br><br>
        Anda dapat meminjam buku <strong>DB-202</strong> dan membaca Bab 3 langsung di modal pembaca kami yang nyaman!
    `,
    ui: `
        Buku <strong>Panduan Desain Antarmuka UI/UX (DS-303)</strong> mengulas filosofi kegunaan digital:
        <br><br>
        • <strong>Bab 1</strong>: Menjelaskan User-Centered Design (Desain Berpusat Pengguna) dan tahap riset empati.
        <br>
        • <strong>Bab 2</strong>: Membahas pentingnya tipografi kontras serta kepatuhan kontras warna teks WCAG 2.0 (rasio minimal 4.5:1).
        <br>
        • <strong>Bab 3</strong>: Memaparkan 10 Aturan Heuristik Usabilitas Jakob Nielsen untuk mengevaluasi aplikasi.
    `,
    cyber: `
        Buku <strong>Keamanan Siber & Defisit Sistem (SEC-404)</strong> adalah bacaan utama untuk memahami perlindungan sistem:
        <br><br>
        • <strong>Kriptografi Simetris</strong>: Menggunakan satu kunci (AES) untuk kunci/buka data dengan cepat.
        <br>
        • <strong>Kriptografi Asimetris</strong>: Memakai sepasang kunci (Kunci Publik & Kunci Privat) untuk pertukaran data jarak jauh secara aman.
        <br>
        • <strong>Hashing</strong>: Mengubah input sandi menjadi cipher satu arah (SHA-256) untuk validasi login database.
    `,
    math: `
        Buku <strong>Kalkulus Adaptif untuk SNBT/TKA (MATH-505)</strong> dirancang khusus untuk persiapan ujian akademik universitas:
        <br><br>
        • <strong>Bab 1</strong>: Konsep limit fungsi aljabar, limit tak terhingga, dan kontinuitas titik fungsi.
        <br>
        • <strong>Bab 2</strong>: Turunan diferensial dasar (aturan rantai) dan penerapannya untuk mencari titik optimal.
        <br>
        • <strong>Bab 3</strong>: Integral dasar serta hitungan luas daerah di bawah grafik kurva koordinat.
    `,
    html: `
        Buku <strong>Esensi HTML5 & Struktur Web Modern (WEB-102)</strong> adalah modul wajib dasar rekayasa web:
        <br><br>
        • Tag semantik (<code>&lt;header&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>) membantu mesin pencari melakukan indeksing SEO yang baik dan mempermudah screen reader bagi penyandang disabilitas.
    `,
    default: `
        Maaf, saya tidak memahami pertanyaan itu secara spesifik. Sebagai BUBUB, Anda dapat menanyakan topik berikut kepada saya:
        <br><br>
        • <strong>rekomendasi</strong> buku atau materi
        <br>
        • penjelasan <strong>SQL Join</strong> database
        <br>
        • materi ringkasan <strong>UI/UX Design</strong> atau <strong>HTML5</strong>
        <br>
        • konsep <strong>keamanan siber</strong> (kriptografi/sandi)
        <br>
        • bab pelajaran <strong>Matematika / Kalkulus</strong> SNBT.
    `
};

Object.assign(LIBRARIAN_RESPONSES, {
    psychology: `
        Untuk topik psikologi, mulai dari <strong>Psikologi Belajar dan Kebiasaan Efektif (PSY-110)</strong>.
        <br><br>
        Buku ini cocok untuk memahami cara otak membentuk ingatan, mengelola fokus, dan membangun kebiasaan belajar yang konsisten.
    `,
    economics: `
        Untuk ekonomi dan bisnis, saya sarankan <strong>Ekonomi Mikro untuk Pengambilan Keputusan (ECO-210)</strong> dan <strong>Strategi Bisnis dan Kewirausahaan (BUS-220)</strong>.
        <br><br>
        Keduanya membantu memahami harga, permintaan, penawaran, model bisnis, validasi pasar, dan pertumbuhan usaha.
    `,
    history: `
        Untuk sejarah dan budaya, pilih <strong>Sejarah Indonesia Modern (HIS-120)</strong>.
        <br><br>
        Buku ini membahas pergerakan nasional, proklamasi, awal republik, reformasi, dan tantangan demokrasi kontemporer.
    `,
    biology: `
        Untuk sains hayati, baca <strong>Biologi Sel dan Genetika Dasar (BIO-130)</strong>.
        <br><br>
        Topiknya meliputi struktur sel, DNA, gen, pewarisan sifat, ekspresi gen, dan peran protein dalam tubuh.
    `,
    generalStudies: `
        Katalog sekarang tidak hanya berisi tech. Ada pilihan Psikologi, Ekonomi, Sejarah, Biologi, Sastra, Hukum, Pendidikan, Kesehatan, Lingkungan, dan Bisnis.
        <br><br>
        Gunakan chip kategori di katalog untuk memilih bidang, lalu klik <em>Pinjam Buku</em> agar masuk ke Meja Baca.
    `
});

function appendChatMessage(sender, text) {
    if (!el.chatHistory) return;
    
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = text;
    
    el.chatHistory.appendChild(bubble);
    
    // Auto scroll ke bawah
    el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
}

function handleLibrarianChat(event) {
    if (event) event.preventDefault();
    if (!el.chatInput) return;
    
    const query = el.chatInput.value.trim();
    if (!query) return;
    
    el.chatInput.value = "";
    processChatQuery(query);
}

function processChatQuery(query) {
    // Tambahkan pesan User ke chatbox
    appendChatMessage("user", query);
    
    // Cari respon AI yang sesuai dengan kata kunci
    const qLower = query.toLowerCase();
    let responseText = LIBRARIAN_RESPONSES.default;
    
    if (qLower.includes("psikologi") || qLower.includes("kebiasaan") || qLower.includes("belajar efektif") || qLower.includes("fokus")) {
        responseText = LIBRARIAN_RESPONSES.psychology;
    } else if (qLower.includes("ekonomi") || qLower.includes("bisnis") || qLower.includes("wirausaha") || qLower.includes("pasar")) {
        responseText = LIBRARIAN_RESPONSES.economics;
    } else if (qLower.includes("sejarah") || qLower.includes("budaya") || qLower.includes("indonesia modern") || qLower.includes("reformasi")) {
        responseText = LIBRARIAN_RESPONSES.history;
    } else if (qLower.includes("biologi") || qLower.includes("sel") || qLower.includes("gen") || qLower.includes("dna")) {
        responseText = LIBRARIAN_RESPONSES.biology;
    } else if (qLower.includes("non-tech") || qLower.includes("non tech") || qLower.includes("umum") || qLower.includes("sastra") || qLower.includes("hukum") || qLower.includes("pendidikan") || qLower.includes("kesehatan") || qLower.includes("lingkungan")) {
        responseText = LIBRARIAN_RESPONSES.generalStudies;
    } else if (qLower.includes("rekomendasi") || qLower.includes("buku pemrograman") || qLower.includes("coding") || qLower.includes("rekomendasi pemrograman")) {
        responseText = LIBRARIAN_RESPONSES.rekomendasi;
    } else if (qLower.includes("sql") || qLower.includes("join") || qLower.includes("database")) {
        responseText = LIBRARIAN_RESPONSES.sql;
    } else if (qLower.includes("ui") || qLower.includes("ux") || qLower.includes("desain") || qLower.includes("heuristic")) {
        responseText = LIBRARIAN_RESPONSES.ui;
    } else if (qLower.includes("keamanan") || qLower.includes("siber") || qLower.includes("cyber") || qLower.includes("kriptografi") || qLower.includes("enkripsi")) {
        responseText = LIBRARIAN_RESPONSES.cyber;
    } else if (qLower.includes("kalkulus") || qLower.includes("matematika") || qLower.includes("math") || qLower.includes("limit") || qLower.includes("integral")) {
        responseText = LIBRARIAN_RESPONSES.math;
    } else if (qLower.includes("html") || qLower.includes("semantik") || qLower.includes("web")) {
        responseText = LIBRARIAN_RESPONSES.html;
    }
    
    // Tampilkan animasi mengetik singkat (delay 1000ms)
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        appendChatMessage("ai", responseText);
        if (window.playSound) playSound("cyber");
    }, 1000);
}

function initChatSuggestions() {
    document.querySelectorAll(".chat-suggest-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const query = chip.dataset.query;
            processChatQuery(query);
        });
    });
}

function showTypingIndicator() {
    if (!el.chatHistory) return;
    removeTypingIndicator();
    
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    indicator.id = "typingIndicator";
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    el.chatHistory.appendChild(indicator);
    el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
}

function initLibrarianChat() {
    if (!el.chatHistory) return;
    el.chatHistory.innerHTML = "";
    appendChatMessage("ai", "Halo! Saya BUBUB, pustakawan digital Anda. Tanyakan tentang rekomendasi buku, materi SQL JOIN, UI/UX, keamanan siber, atau materi lainnya.");
}

// ==========================================================================
// STUDY NOTES LOGIC
// ==========================================================================
let noteSaveTimeout = null;

function getNoteKey(bookId) {
    return bookId === "general" ? "library_note_general" : `library_note_${bookId}`;
}

function loadActiveNote() {
    if (!el.libraryNote || !el.noteBookSelect) return;
    const selectedBook = el.noteBookSelect.value;
    const noteKey = getNoteKey(selectedBook);
    
    let content = storage.get(noteKey, "");
    if (selectedBook === "general" && !content) {
        content = storage.get("library_note", "");
    }
    el.libraryNote.value = content;
}

function saveActiveNote(isAuto = false) {
    if (!el.libraryNote || !el.noteBookSelect) return;
    const selectedBook = el.noteBookSelect.value;
    const noteKey = getNoteKey(selectedBook);
    const content = el.libraryNote.value;
    
    storage.set(noteKey, content);
    if (selectedBook === "general") {
        storage.set("library_note", content);
    }
    
    updateDashboardStats();
    
    if (isAuto) {
        showAutosaveStatus("saved");
    } else {
        showToast("Catatan berhasil disimpan! 📝");
        if (window.playSound) playSound("success");
    }
}

function showAutosaveStatus(state) {
    if (!el.autosaveStatus) return;
    el.autosaveStatus.style.opacity = "1";
    if (state === "saving") {
        el.autosaveStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color: var(--blue);"></i> Menyimpan...`;
    } else if (state === "saved") {
        el.autosaveStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--green);"></i> Tersimpan otomatis`;
        setTimeout(() => {
            if (el.autosaveStatus && el.autosaveStatus.innerHTML.includes("circle-check")) {
                el.autosaveStatus.style.opacity = "0.5";
            }
        }, 2000);
    }
}

function initStudyNotes() {
    if (!el.libraryNote || !el.noteBookSelect) return;
    
    loadActiveNote();
    
    el.noteBookSelect.addEventListener("change", () => {
        loadActiveNote();
        if (window.playSound) playSound("click");
    });
    
    if (el.saveLibraryNote) {
        el.saveLibraryNote.addEventListener("click", () => {
            saveActiveNote(false);
        });
    }
    
    el.libraryNote.addEventListener("input", () => {
        showAutosaveStatus("saving");
        clearTimeout(noteSaveTimeout);
        noteSaveTimeout = setTimeout(() => {
            saveActiveNote(true);
        }, 600);
    });
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    
    if (el.librarySearch) {
        el.librarySearch.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderCatalog();
        });
    }
    
    document.querySelectorAll("[data-library-filter]").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("[data-library-filter]").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activeFilter = chip.dataset.libraryFilter;
            renderCatalog();
            if (window.playSound) playSound("click");
        });
    });
    
    if (el.chatForm) {
        el.chatForm.addEventListener("submit", handleLibrarianChat);
    }
    
    renderReadingDesk();
    renderCatalog();
    updateDashboardStats();
    
    initLibrarianChat();
    initChatSuggestions();
    initStudyNotes();
});
