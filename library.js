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
    rekomendasi: [
        `Berikut adalah buku rekomendasi di perpustakaan kami berdasarkan kategori bidang pemrograman dan siber:
        <br><br>
        1. <strong>Dasar Pemrograman JavaScript (CS-101)</strong> - Sangat bagus untuk memulai karir Web Developer (Ulasan: 4.8/5).
        <br>
        2. <strong>Prinsip Sistem Basis Data SQL (DB-202)</strong> - Panduan query relasional komprehensif bagi Anda yang ingin menjadi Data Engineer.
        <br>
        3. <strong>Keamanan Siber & Defisit Sistem (SEC-404)</strong> - Membedah kriptografi siber dan celah keamanan jaringan.
        <br><br>
        Silakan klik <em>Pinjam Buku</em> pada katalog untuk meletakkannya di meja baca Anda!`,
        `Ingin rekomendasi belajar? Coba intip koleksi unggulan kami ini:
        <br><br>
        • Bidang UI/UX: <strong>Panduan Desain Antarmuka UI/UX (DS-303)</strong>. Memandu Anda memahami riset pengguna dan aturan Heuristik.
        <br>
        • Bidang Web: <strong>Esensi HTML5 & Struktur Web Modern (WEB-102)</strong>. Sempurna untuk dasar SEO dan layout semantik.
        <br>
        • Bidang Ujian SNBT: <strong>Kalkulus Adaptif (MATH-505)</strong>. Sangat membantu penguasaan limit, turunan, dan integral.`,
        `Halo! Di perpustakaan digital ini, Anda bisa meminjam beberapa buku rekomendasi berikut untuk meningkatkan keahlian Anda:
        <br><br>
        • <strong>Psikologi Belajar dan Kebiasaan Efektif (PSY-110)</strong>: Pelajari cara kerja memori, manajemen fokus, dan teknik belajar aktif.
        <br>
        • <strong>Keamanan Siber & Defisit Sistem (SEC-404)</strong>: Pahami kriptografi simetris/asimetris untuk proteksi data.
        <br>
        • <strong>Ekonomi Mikro (ECO-210)</strong>: Pelajari teori harga pasar, hukum penawaran, serta analisis keputusan bisnis.`
    ],
    sql: [
        `Di buku <strong>Prinsip Sistem Basis Data SQL (DB-202) Bab 3</strong>, kami membedah secara visual bagaimana perintah <code>JOIN</code> menyatukan tabel-tabel berelasi:
        <br><br>
        • <code>INNER JOIN</code>: Mengambil baris data jika ada kecocokan kunci di kedua tabel.
        <br>
        • <code>LEFT JOIN</code>: Mengambil seluruh data dari tabel sebelah kiri, ditambah data tabel kanan yang berelasi cocok saja (data kosong di kanan diisi nilai NULL).
        <br><br>
        Anda dapat meminjam buku <strong>DB-202</strong> dan membaca Bab 3 langsung di modal pembaca kami yang nyaman!`,
        `Ingin paham SQL JOIN? Berikut penjelasan ringkasnya:
        <br><br>
        • <code>INNER JOIN</code> menyaring data dan hanya menampilkan baris yang memiliki nilai kunci cocok di kedua tabel.
        <br>
        • <code>RIGHT JOIN</code> berkebalikan dengan LEFT JOIN, yaitu mengambil seluruh baris dari tabel kanan dan baris tabel kiri yang cocok saja.
        <br>
        • <code>FULL JOIN</code> menggabungkan semua data dari kedua tabel, mengisi kolom dengan NULL jika tidak ada relasi yang cocok di salah satu sisi.
        <br><br>
        Materi ini dibahas lengkap dengan studi kasus di buku <strong>Prinsip Sistem Basis Data SQL (DB-202)</strong>.`,
        `SQL JOIN digunakan untuk menggabungkan kolom dari satu atau beberapa tabel berdasarkan nilai kolom yang terkait di antara keduanya.
        <br><br>
        Contoh Query Inner Join:
        <br>
        <code>SELECT users.name, orders.amount FROM users INNER JOIN orders ON users.id = orders.user_id;</code>
        <br><br>
        Query di atas akan menampilkan nama pengguna beserta jumlah belanjaan mereka jika data belanjanya tersedia. Silakan baca detail teorinya di buku <strong>DB-202</strong>!`
    ],
    ui: [
        `Buku <strong>Panduan Desain Antarmuka UI/UX (DS-303)</strong> mengulas filosofi kegunaan digital:
        <br><br>
        • <strong>Bab 1</strong>: Menjelaskan User-Centered Design (Desain Berpusat Pengguna) dan tahap riset empati.
        <br>
        • <strong>Bab 2</strong>: Membahas pentingnya tipografi kontras serta kepatuhan kontras warna teks WCAG 2.0 (rasio minimal 4.5:1).
        <br>
        • <strong>Bab 3</strong>: Memaparkan 10 Aturan Heuristik Usabilitas Jakob Nielsen untuk mengevaluasi aplikasi.`,
        `Mendesain aplikasi yang ramah pengguna memerlukan pemahaman UI/UX. Di buku <strong>DS-303</strong>, dibahas beberapa konsep kunci:
        <br><br>
        • <strong>Aksesibilitas (A11y)</strong>: Memastikan aplikasi dapat digunakan oleh siapa saja, termasuk penyandang disabilitas (misal: memberikan tag alt pada gambar).
        <br>
        • <strong>Wireframing</strong>: Membuat sketsa layout hitam-putih sebelum masuk ke tahap pewarnaan untuk menguji efisiensi navigasi.
        <br>
        • <strong>Prototyping</strong>: Membuat alur interaktif simulasi produk untuk diujikan kepada pengguna nyata.`,
        `Desain antarmuka yang baik didasarkan pada kebiasaan mental pengguna. Menurut buku <strong>Panduan Desain Antarmuka UI/UX (DS-303)</strong>:
        <br><br>
        • Hindari membebani memori jangka pendek pengguna (gunakan ikon standar, petunjuk yang jelas, dan alur terprediksi).
        <br>
        • Gunakan visual hirarki (ukuran font, berat teks, dan jarak) untuk mengarahkan mata pengguna ke elemen terpenting terlebih dahulu.`
    ],
    cyber: [
        `Buku <strong>Keamanan Siber & Defisit Sistem (SEC-404)</strong> adalah bacaan utama untuk memahami perlindungan sistem:
        <br><br>
        • <strong>Kriptografi Simetris</strong>: Menggunakan satu kunci (AES) untuk kunci/buka data dengan cepat.
        <br>
        • <strong>Kriptografi Asimetris</strong>: Memakai sepasang kunci (Kunci Publik & Kunci Privat) untuk pertukaran data jarak jauh secara aman.
        <br>
        • <strong>Hashing</strong>: Mengubah input sandi menjadi cipher satu arah (SHA-256) untuk validasi login database.`,
        `Kunci utama dari keamanan siber adalah CIA Triad (Confidentiality, Integrity, Availability):
        <br><br>
        • <strong>Confidentiality (Kerahasiaan)</strong>: Data hanya bisa diakses oleh pihak berwenang melalui enkripsi.
        <br>
        • <strong>Integrity (Integritas)</strong>: Menjamin data tidak diubah di tengah jalan dengan menggunakan tanda tangan digital atau checksum hash.
        <br>
        • <strong>Availability (Ketersediaan)</strong>: Memastikan sistem dapat diakses saat dibutuhkan dengan mitigasi serangan DDoS.
        <br><br>
        Silakan pinjam buku <strong>Keamanan Siber & Defisit Sistem (SEC-404)</strong> untuk pembahasan mendalam!`,
        `Dalam dunia keamanan siber, proteksi data dikerjakan melalui algoritma sandi. Di buku <strong>SEC-404</strong>, Anda akan mempelajari:
        <br><br>
        • Cara kerja protokol HTTPS dalam mengamankan lalu lintas web menggunakan enkripsi TLS/SSL.
        <br>
        • Konsep enkripsi ujung-ke-ujung (*End-to-End Encryption*) yang memastikan pesan hanya bisa dibaca oleh pengirim dan penerima akhir.`
    ],
    math: [
        `Buku <strong>Kalkulus Adaptif untuk SNBT/TKA (MATH-505)</strong> dirancang khusus untuk persiapan ujian akademik universitas:
        <br><br>
        • <strong>Bab 1</strong>: Konsep limit fungsi aljabar, limit tak terhingga, dan kontinuitas titik fungsi.
        <br>
        • <strong>Bab 2</strong>: Turunan diferensial dasar (aturan rantai) dan penerapannya untuk mencari titik optimal.
        <br>
        • <strong>Bab 3</strong>: Integral dasar serta hitungan luas daerah di bawah grafik kurva koordinat.`,
        `Materi Matematika SNBT/TKA berfokus pada penalaran matematis. Di buku <strong>MATH-505</strong>, Anda akan dilatih:
        <br><br>
        • Memahami aplikasi turunan untuk mencari nilai maksimum dan minimum pada soal cerita optimasi ekonomi.
        <br>
        • Menguasai metode substitusi aljabar untuk menyederhanakan penyelesaian integral yang kompleks.
        <br><br>
        Pinjam buku <strong>MATH-505</strong> ke Meja Baca Anda agar persiapan belajar lebih terstruktur!`,
        `Kalkulus adalah dasar penalaran sains dan rekayasa. Menurut rangkuman materi di buku <strong>Kalkulus Adaptif (MATH-505)</strong>:
        <br><br>
        • Limit menggambarkan kecenderungan nilai fungsi saat mendekati titik tertentu.
        <br>
        • Turunan mengukur laju perubahan seketika (kemiringan garis singgung kurva).
        <br>
        • Integral mengukur akumulasi total (luas daerah di bawah kurva).`
    ],
    html: [
        `Buku <strong>Esensi HTML5 & Struktur Web Modern (WEB-102)</strong> adalah modul wajib dasar rekayasa web:
        <br><br>
        • Tag semantik (<code>&lt;header&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>) membantu mesin pencari melakukan indeksing SEO yang baik dan mempermudah screen reader bagi penyandang disabilitas.`,
        `Mengapa HTML semantik penting? Buku <strong>WEB-102</strong> menjelaskan:
        <br><br>
        • Menghindari *div soup* (penggunaan tag div berlebihan tanpa makna) yang mempersulit pemeliharaan kode.
        <br>
        • Meningkatkan skor SEO karena algoritma Google dapat mengidentifikasi bagian mana yang merupakan konten utama (` + "`<main>`" + `) dan navigasi (` + "`<nav>`" + `).
        <br><br>
        Pelajari cara menulis struktur web standar W3C di buku <strong>Esensi HTML5 (WEB-102)</strong>.`,
        `Struktur HTML5 yang kokoh adalah pondasi web engineering. Di buku <strong>WEB-102</strong>, Anda akan belajar:
        <br><br>
        • Form kontrol baru (input type email, date, number) yang meminimalkan validasi sisi klien menggunakan JavaScript.
        <br>
        • Penggunaan tag ` + "`<aside>`" + ` untuk konten sampingan (sidebar) yang melengkapi artikel utama.`
    ],
    psychology: [
        `Untuk topik psikologi, Anda bisa mulai membaca <strong>Psikologi Belajar dan Kebiasaan Efektif (PSY-110)</strong>:
        <br><br>
        • Buku ini sangat direkomendasikan untuk memahami cara otak membentuk ingatan jangka panjang, mengelola kelelahan fokus, dan membangun kebiasaan belajar yang konsisten secara ilmiah.`,
        `Psikologi kognitif menjelaskan bagaimana kita menyerap informasi baru. Buku <strong>PSY-110</strong> mengulas:
        <br><br>
        • <strong>Teknik Pomodoro</strong>: Belajar fokus selama 25 menit diikuti istirahat 5 menit untuk menjaga kesegaran otak.
        <br>
        • <strong>Spaced Repetition</strong>: Mengulang materi pada interval waktu tertentu untuk memindahkan memori dari jangka pendek ke jangka panjang.`,
        `Belajar secara efektif membutuhkan pemahaman diri. Di buku <strong>Psikologi Belajar (PSY-110)</strong>, dibahas tentang:
        <br><br>
        • **Active Recall**: Menguji diri sendiri menggunakan flashcard atau ringkasan alih-alih hanya membaca ulang buku secara pasif.
        <br>
        • **Feynman Technique**: Menjelaskan konsep sulit dengan bahasa sederhana seolah mengajarkannya kepada anak kecil.`
    ],
    economics: [
        `Untuk bidang ekonomi dan manajemen bisnis, kami memiliki koleksi berikut:
        <br><br>
        • <strong>Ekonomi Mikro untuk Pengambilan Keputusan (ECO-210)</strong>: Mengulas elastisitas harga, alokasi sumber daya, dan struktur pasar.
        <br>
        • <strong>Strategi Bisnis dan Kewirausahaan (BUS-220)</strong>: Panduan merancang model bisnis (Lean Canvas) dan riset produk pasar.`,
        `Pahami dinamika pasar melalui buku ekonomi kami:
        <br><br>
        • Di buku <strong>ECO-210</strong>, Anda mempelajari bagaimana analisis biaya oportunitas (*opportunity cost*) membantu manajer memilih keputusan investasi terbaik.
        <br>
        • Di buku <strong>BUS-220</strong>, Anda diajarkan cara memvalidasi ide produk melalui pengembangan produk minimum yang layak (MVP) untuk menghemat biaya modal.`,
        `Koleksi ekonomi kami, khususnya <strong>ECO-210</strong>, membedah hukum dasar pasar:
        <br><br>
        • Hukum Permintaan & Penawaran yang menentukan titik harga keseimbangan.
        <br>
        • Jenis pasar (monopoli, oligopoli, persaingan sempurna) beserta dampaknya pada konsumen dan harga barang.`
    ],
    history: [
        `Untuk sejarah, buku utama kami adalah <strong>Sejarah Indonesia Modern (HIS-120)</strong>:
        <br><br>
        • Membahas secara mendalam garis waktu penting mulai dari kebangkitan nasional awal abad ke-20, proklamasi kemerdekaan, periode revolusi fisik, era reformasi, hingga tantangan sosial politik kontemporer.`,
        `Mempelajari sejarah membantu kita memahami dinamika masa kini. Buku <strong>Sejarah Indonesia Modern (HIS-120)</strong> mengulas:
        <br><br>
        • Dampak geopolitik perang dingin terhadap transisi pemerintahan Indonesia di pertengahan dekade 1960-an.
        <br>
        • Lahirnya gerakan mahasiswa tahun 1998 yang mendorong demokratisasi dan otonomi daerah di Indonesia.`,
        `Sejarah Indonesia Modern (buku <strong>HIS-120</strong>) memaparkan materi penting:
        <br><br>
        • Lahirnya Sumpah Pemuda tahun 1928 sebagai tonggak persatuan kebangsaan.
        <br>
        • Perundingan diplomatik (Linggadjati, Renville, KMB) dalam memenangkan pengakuan kedaulatan Indonesia secara hukum internasional.`
    ],
    biology: [
        `Untuk sains hayati, silakan baca <strong>Biologi Sel dan Genetika Dasar (BIO-130)</strong>:
        <br><br>
        • Buku ini membedah sel sebagai unit fungsional terkecil makhluk hidup, struktur kromosom, susunan rantai ganda DNA, sintesis protein, serta penerapan bioteknologi modern seperti kloning dan rekayasa genetik.`,
        `Pahami rahasia kehidupan melalui buku biologi kami:
        <br><br>
        • Di buku <strong>BIO-130</strong>, dipaparkan proses pembelahan sel (mitosis dan meiosis) serta dampaknya pada variasi makhluk hidup.
        <br>
        • Anda juga akan belajar hukum pewarisan sifat Mendel untuk memprediksi probabilitas karakteristik keturunan genetik.`,
        `Struktur asam nukleat (DNA & RNA) dibahas lengkap pada buku <strong>Biologi Sel dan Genetika Dasar (BIO-130)</strong>:
        <br><br>
        • Bagaimana urutan basa nitrogen (Adenin, Timin, Guanin, Sitosin) menyandi asam amino pembentuk protein tubuh.
        <br>
        • Teknik rekayasa genetika CRISPR yang memungkinkan penyuntingan DNA secara presisi untuk pengobatan medis.`
    ],
    literature: [
        `Untuk sastra dan penulisan kreatif, kami merekomendasikan buku <strong>Pengantar Teori Sastra dan Penulisan Kreatif (LIT-310)</strong>:
        <br><br>
        • Buku ini memandu Anda memahami struktur naratif (plot, konflik, penokohan), analisis gaya bahasa, metafora dalam puisi, serta metode menyusun esai sastra yang kritis.`,
        `Sastra adalah cermin peradaban. Di buku <strong>LIT-310</strong>, Anda akan mempelajari:
        <br><br>
        • Perbedaan genre sastra klasik dan kontemporer.
        <br>
        • Teknik *Show, Don't Tell* dalam prosa untuk mendeskripsikan emosi tokoh melalui aksi konkrit, bukan penjelasan langsung penulis.`,
        `Menulis karya sastra yang memikat membutuhkan penguasaan bahasa secara artistik. Menurut buku sastra <strong>LIT-310</strong>:
        <br><br>
        • Pelajari cara menganalisis tema tersembunyi pada karya puisi menggunakan pendekatan strukturalisme.
        <br>
        • Pahami unsur intrinsik dan ekstrinsik yang melatarbelakungi penulisan novel fiksi sejarah.`
    ],
    law: [
        `Untuk bidang hukum, buku pegangan utama kami adalah <strong>Asas-Asas Hukum dan Tata Negara (LAW-410)</strong>:
        <br><br>
        • Membahas fondasi hukum publik dan privat, tata urutan peraturan perundang-undangan di Indonesia, fungsi lembaga yudikatif, serta prinsip dasar negara hukum konstitusional.`,
        `Ingin mempelajari dasar-dasar hukum konstitusi? Buku <strong>LAW-410</strong> mengulas:
        <br><br>
        • Pemisahan kekuasaan negara (Legislatif, Eksekutif, Yudikatif) untuk mencegah penumpukan kekuasaan secara mutlak.
        <br>
        • Hak Asasi Manusia (HAM) dalam jaminan hukum konstitusi negara, serta tata cara uji materi undang-undang di Mahkamah Konstitusi.`,
        `Hukum mengikat ketertiban hidup bermasyarakat. Buku <strong>Asas-Asas Hukum (LAW-410)</strong> menjelaskan:
        <br><br>
        • Pengenalan sumber-sumber hukum formal (Undang-Undang, Kebiasaan, Yurisprudensi, Traktat, Doktrin).
        <br>
        • Perbedaan mendasar antara hukum pidana (pelanggaran terhadap kepentingan umum) dan hukum perdata (sengketa kepentingan antar individu).`
    ],
    education: [
        `Untuk metode pengajaran dan pedagogi, Anda dapat merujuk ke buku <strong>Metodologi Pendidikan dan Evaluasi Belajar (EDU-150)</strong>:
        <br><br>
        • Buku ini memaparkan teori-teori belajar (behavioristik, kognitif, konstruktif), desain kurikulum, teknik evaluasi autentik, serta manajemen kelas inklusif.`,
        `Pendidikan modern berpusat pada keaktifan siswa. Menurut buku <strong>EDU-150</strong>:
        <br><br>
        • **Project-Based Learning**: Siswa memecahkan masalah nyata melalui proyek kerja kelompok untuk mengasah pemikiran kritis.
        <br>
        • **Flipped Classroom**: Siswa mempelajari materi dasar di rumah secara mandiri (melalui video/buku), lalu kelas tatap muka difokuskan untuk diskusi kelompok.`,
        `Bagaimana cara mengevaluasi efektivitas pembelajaran? Di buku <strong>EDU-150</strong> dibahas tentang:
        <br><br>
        • Asesmen formatif (kuis berkala di tengah pelajaran untuk memantau progres pemahaman siswa).
        <br>
        • Asesmen sumatif (ujian akhir semester untuk mengukur ketercapaian kompetensi belajar lulusan).`
    ],
    health: [
        `Untuk sains kesehatan dan nutrisi, baca buku <strong>Kesehatan Masyarakat dan Nutrisi Seimbang (HLT-250)</strong>:
        <br><br>
        • Membahas keseimbangan makronutrien dan mikronutrien, pencegahan penyakit epidemiologi, pentingnya sanitasi lingkungan, serta panduan kesehatan mental di era modern.`,
        `Gaya hidup sehat didasarkan pada keputusan nutrisi ilmiah. Buku <strong>HLT-250</strong> mengulas:
        <br><br>
        • Peran serat makanan dan air bagi pencernaan, serta pencegahan penyakit kardiovaskular melalui diet rendah garam dan lemak jenuh.
        <br>
        • Manfaat aktivitas fisik teratur dalam menstimulasi pelepasan hormon endorfin yang meningkatkan kebahagiaan mental.`,
        `Kesehatan mental dan fisik saling berkaitan secara holistik. Menurut buku <strong>HLT-250</strong>:
        <br><br>
        • Manajemen stres dapat dicapai melalui teknik mindfulness dan istirahat tidur yang cukup (7-8 jam per hari).
        <br>
        • Pahami bahaya konsumsi gula berlebih yang meningkatkan risiko diabetes tipe-2 di usia muda.`
    ],
    environment: [
        `Untuk ilmu lingkungan, Anda dapat mempelajari buku <strong>Ekologi Lingkungan dan Pembangunan Berkelanjutan (ENV-350)</strong>:
        <br><br>
        • Ulasan komprehensif mengenai siklus biogeokimia, dampak pemanasan global terhadap keanekaragaman hayati, teknik pengelolaan limbah domestik, serta kebijakan energi terbarukan.`,
        `Kelestarian bumi adalah tanggung jawab kolektif. Buku <strong>ENV-350</strong> mengulas:
        <br><br>
        • Konsep **Ekonomi Sirkular**: Mendesain produk agar bahan bakunya dapat didaur ulang kembali secara terus menerus, meniadakan konsep sampah.
        <br>
        • Dampak deforestasi hutan terhadap pengurangan penyerapan karbon dioksida di atmosfer, yang mempercepat efek rumah kaca.`,
        `Energi terbarukan adalah masa depan peradaban. Menurut buku <strong>ENV-350</strong>:
        <br><br>
        • Pemanfaatan energi surya, angin, dan geotermal sebagai alternatif pengganti bahan bakar fosil guna meminimalkan emisi karbon.
        <br>
        • Langkah praktis individu dalam menghemat jejak karbon harian (mengurangi plastik sekali pakai, hemat listrik, naik transportasi umum).`
    ],
    generalStudies: [
        `Katalog perpustakaan kami kini telah diperluas ke berbagai bidang ilmu:
        <br><br>
        Kami menyediakan buku-buku bidang non-teknik seperti Psikologi, Ekonomi, Sastra, Hukum, Pendidikan, Kesehatan, dan Lingkungan. Silakan gunakan chip kategori di katalog untuk menyaring judul yang ingin Anda baca!`,
        `Halo! Di Meja Baca Anda sekarang dapat meletakkan buku-buku non-teknik:
        <br><br>
        Silakan telusuri katalog di bawah untuk menemukan topik humaniora, sosial, ilmu alam dasar, maupun sastra seni. Jika Anda butuh penjelasan materi dari bab tertentu, sebutkan saja topik atau kode bukunya di sini!`,
        `Perpustakaan digital kami mendukung pembelajaran lintas disiplin ilmu.
        <br><br>
        Pilih bidang minat Anda dari daftar filter kategori yang tersedia. Pinjam buku pilihan Anda agar kami dapat menyiapkan bab bacaan secara instan di browser Anda.`
    ],
    default: [
        `Maaf, saya belum memahami pertanyaan Anda. Sebagai BUBUB, Anda dapat bertanya tentang topik-topik berikut kepada saya:
        <br><br>
        • <strong>rekomendasi</strong> buku atau materi pemrograman
        <br>
        • materi ringkasan <strong>UI/UX Design</strong> atau <strong>HTML5</strong>
        <br>
        • penjelasan <strong>SQL Join</strong> database relasional
        <br>
        • konsep <strong>keamanan siber</strong> dan kriptografi
        <br>
        • bab pelajaran <strong>Matematika / Kalkulus</strong> SNBT.`,
        `Hai! Pertanyaan tersebut berada di luar cakupan pemahaman saya saat ini. Anda dapat menanyakan materi akademik berikut:
        <br><br>
        • Topik ilmu sosial: <strong>Psikologi</strong> belajar atau <strong>Ekonomi Mikro</strong>
        <br>
        • Topik sains: <strong>Biologi Sel</strong> genetika atau <strong>Kalkulus</strong> integral
        <br>
        • Topik humaniora: <strong>Sejarah Indonesia Modern</strong> atau teori <strong>Sastra</strong>
        <br>
        • Topik pembangunan: <strong>Pendidikan</strong> pengajaran atau ilmu <strong>Lingkungan</strong>.`,
        `Halo! Sebagai asisten pustakawan, saya dirancang untuk mendiskusikan isi buku di katalog perpustakaan. Coba tanyakan kata kunci berikut:
        <br><br>
        • **Keamanan Siber** (kunci enkripsi AES/RSA)
        • **Aksesibilitas UI/UX** (WCAG kontras teks)
        • **SQL INNER JOIN** (relasi antartabel)
        • **Kesehatan & Nutrisi** (keseimbangan gizi)
        • **Asas-Asas Hukum** (sumber hukum formal)`
    ]
};

// Remove the dynamic assignment at the end of the file since it's now integrated inside LIBRARIAN_RESPONSES

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
    let key = "default";
    
    if (qLower.includes("psikologi") || qLower.includes("kebiasaan") || qLower.includes("belajar efektif") || qLower.includes("fokus")) {
        key = "psychology";
    } else if (qLower.includes("ekonomi") || qLower.includes("bisnis") || qLower.includes("wirausaha") || qLower.includes("pasar")) {
        key = "economics";
    } else if (qLower.includes("sejarah") || qLower.includes("budaya") || qLower.includes("indonesia modern") || qLower.includes("reformasi")) {
        key = "history";
    } else if (qLower.includes("biologi") || qLower.includes("sel") || qLower.includes("gen") || qLower.includes("dna")) {
        key = "biology";
    } else if (qLower.includes("sastra") || qLower.includes("puisi") || qLower.includes("novel") || qLower.includes("buku sastra") || qLower.includes("naratif")) {
        key = "literature";
    } else if (qLower.includes("hukum") || qLower.includes("uu") || qLower.includes("undang") || qLower.includes("konstitusi")) {
        key = "law";
    } else if (qLower.includes("pendidikan") || qLower.includes("pedagogi") || qLower.includes("belajar") || qLower.includes("mengajar") || qLower.includes("guru")) {
        key = "education";
    } else if (qLower.includes("kesehatan") || qLower.includes("nutrisi") || qLower.includes("diet") || qLower.includes("olahraga") || qLower.includes("gizi")) {
        key = "health";
    } else if (qLower.includes("lingkungan") || qLower.includes("iklim") || qLower.includes("ekosistem") || qLower.includes("polusi") || qLower.includes("energi terbarukan")) {
        key = "environment";
    } else if (qLower.includes("non-tech") || qLower.includes("non tech") || qLower.includes("umum") || qLower.includes("studi umum")) {
        key = "generalStudies";
    } else if (qLower.includes("rekomendasi") || qLower.includes("buku pemrograman") || qLower.includes("coding") || qLower.includes("rekomendasi pemrograman")) {
        key = "rekomendasi";
    } else if (qLower.includes("sql") || qLower.includes("join") || qLower.includes("database")) {
        key = "sql";
    } else if (qLower.includes("ui") || qLower.includes("ux") || qLower.includes("desain") || qLower.includes("heuristic")) {
        key = "ui";
    } else if (qLower.includes("keamanan") || qLower.includes("siber") || qLower.includes("cyber") || qLower.includes("kriptografi") || qLower.includes("enkripsi")) {
        key = "cyber";
    } else if (qLower.includes("kalkulus") || qLower.includes("matematika") || qLower.includes("math") || qLower.includes("limit") || qLower.includes("integral")) {
        key = "math";
    } else if (qLower.includes("html") || qLower.includes("semantik") || qLower.includes("web")) {
        key = "html";
    }
    
    // Pick response variation randomly
    const responses = LIBRARIAN_RESPONSES[key];
    const responseText = Array.isArray(responses)
        ? responses[Math.floor(Math.random() * responses.length)]
        : responses;
    
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
