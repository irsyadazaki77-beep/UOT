/* ==========================================================================
   Universe Of Tech - LMS Quiz Engine (lms-quiz.js)
   ========================================================================== */

// --- Tracks & Course Material Database ---
const lmsTracks = [
    {
        id: "web-dev",
        title: "Frontend Web Engineer Path",
        badge: "Web Specialist",
        description: "Pelajari cara membangun antarmuka web modern yang responsif, interaktif, dan berkinerja tinggi mulai dari HTML5, CSS Grid/Flexbox, JavaScript modern, hingga optimasi Core Web Vitals.",
        color: "#32d66b",
        badgeIcon: "🧙‍♂️",
        badgeName: "Web Wizard",
        badgeDesc: "Menyelesaikan Jalur Frontend Web Engineer",
        modules: [
            {
                id: "html-semantic",
                title: "HTML5 & Semantic Web",
                lecture: {
                    title: "Mengapa Semantic HTML Sangat Penting di Era Modern",
                    category: "Web Development",
                    readTime: "5 menit baca",
                    content: `
                        <p>Dalam pengembangan web modern, HTML bukan sekadar kode untuk merender teks di layar. Lebih dari itu, HTML adalah cara kita memberikan <strong>makna (semantik)</strong> pada struktur informasi di halaman web.</p>
                        
                        <h3>Apa itu Semantic HTML?</h3>
                        <p>Semantic HTML adalah penggunaan tag HTML yang secara jelas menjelaskan arti elemen tersebut baik bagi browser, mesin pencari (SEO), maupun alat bantu pembaca layar (screen reader) bagi penyandang disabilitas. Contoh tag semantik meliputi <code>&lt;nav&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code>, dan <code>&lt;footer&gt;</code>.</p>
                        
                        <div class="lms-callout tip">
                            <strong>💡 Tips Aksesibilitas:</strong>
                            Menggunakan tag semantik seperti <code>&lt;button&gt;</code> untuk aksi klik jauh lebih baik daripada menggunakan tag <code>&lt;div&gt;</code> dengan event listener kustom, karena browser secara otomatis mengaktifkan fokus keyboard dan pembaca layar untuk tombol asli.
                        </div>

                        <h3>Keuntungan Menggunakan Semantic HTML:</h3>
                        <ul>
                            <li><strong>SEO (Search Engine Optimization) yang Lebih Baik</strong>: Mesin pencari seperti Google menggunakan tag semantik untuk merayapi konten dan memahami bagian mana yang merupakan menu navigasi, isi artikel utama, atau kaki halaman.</li>
                            <li><strong>Aksesibilitas (A11y)</strong>: Membantu penyandang tunanetra menggunakan screen reader untuk berpindah-pindah bagian halaman secara cepat.</li>
                            <li><strong>Keterbacaan Kode (Maintainability)</strong>: Kode program Anda menjadi lebih mudah dibaca dan dirawat oleh pengembang lain dibanding tumpukan <code>&lt;div&gt;</code> tanpa makna.</li>
                        </ul>

                        <h3>Contoh Struktur Halaman Semantik:</h3>
                        <pre><code class="language-html">&lt;header&gt;
  &lt;h1&gt;Universe Of Tech&lt;/h1&gt;
  &lt;nav&gt;
    &lt;a href="#home"&gt;Home&lt;/a&gt;
    &lt;a href="#materi"&gt;Materi&lt;/a&gt;
  &lt;/nav&gt;
&lt;/header&gt;

&lt;main&gt;
  &lt;article&gt;
    &lt;h2&gt;Pengenalan Semantic HTML&lt;/h2&gt;
    &lt;p&gt;HTML5 memperkenalkan banyak tag semantik baru...&lt;/p&gt;
  &lt;/article&gt;
&lt;/main&gt;

&lt;footer&gt;
  &lt;p&gt;&amp;copy; 2026 Universe Of Tech&lt;/p&gt;
&lt;/footer&gt;</code></pre>
                    `
                },
                quiz: {
                    category: "web",
                    difficulty: "easy",
                    limit: 5,
                    title: "Kuis HTML5 Semantik"
                }
            },
            {
                id: "css-layout",
                title: "Modern CSS Layouts",
                lecture: {
                    title: "Menguasai Grid System dan Flexbox untuk Layout Responsif",
                    category: "Web Development",
                    readTime: "7 menit baca",
                    content: `
                        <p>Tata letak CSS telah berevolusi dari era menggunakan tabel dan float ke sistem layout satu dimensi (Flexbox) dan dua dimensi (CSS Grid) yang sangat kuat dan fleksibel.</p>
                        
                        <h3>CSS Flexbox vs CSS Grid: Kapan Menggunakannya?</h3>
                        <p>Pertanyaan ini sering membingungkan pengembang pemula. Aturan praktisnya adalah:</p>
                        <ul>
                            <li><strong>Flexbox (Satu Dimensi)</strong>: Terbaik untuk menata elemen dalam satu baris horizontal atau satu kolom vertikal. Contoh: Bar navigasi (navbar), kumpulan tombol, atau daftar item sederhana.</li>
                            <li><strong>CSS Grid (Dua Dimensi)</strong>: Terbaik untuk menata elemen dalam grid baris dan kolom secara bersamaan. Contoh: Halaman dasbor yang kompleks, layout galeri gambar, atau struktur halaman utama.</li>
                        </ul>

                        <div class="lms-callout important">
                            <strong>⚠️ Aturan Spacing 8px Grid:</strong>
                            Dalam UI/UX profesional, usahakan jarak antar elemen (gap, margin, padding) kelipatan 8px (misal: 8px, 16px, 24px, 32px) untuk menjaga konsistensi visual di berbagai layar.
                        </div>

                        <h3>Contoh Penggunaan CSS Grid:</h3>
                        <pre><code class="language-css">.dashboard-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr; /* Responsif menjadi 1 kolom di mobile */
  }
}</code></pre>
                    `
                },
                quiz: {
                    category: "web",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis CSS Layout"
                }
            },
            {
                id: "js-async",
                title: "Asynchronous JavaScript",
                lecture: {
                    title: "Memahami Event Loop, Promises, dan Fetch API",
                    category: "Web Development",
                    readTime: "8 menit baca",
                    content: `
                        <p>JavaScript bersifat single-threaded, artinya hanya bisa menjalankan satu operasi pada satu waktu. Namun, aplikasi web modern membutuhkan operasi non-blocking seperti memuat data dari API luar tanpa membekukan antarmuka pengguna. Di sinilah Asynchronous JavaScript berperan.</p>
                        
                        <h3>Bagaimana JavaScript Asynchronous Bekerja?</h3>
                        <p>Browser menyediakan Web APIs (seperti setTimeout, DOM events, dan fetch) yang berjalan di latar belakang. Saat operasi asinkron selesai, callback dimasukkan ke dalam <strong>Callback Queue</strong>, lalu <strong>Event Loop</strong> akan memindahkannya ke Execution Stack setelah stack utama kosong.</p>

                        <h3>Menggunakan Promise dan Async/Await</h3>
                        <p>Daripada menggunakan callback yang memicu "callback hell", JavaScript modern menggunakan <code>Promise</code> yang dipercantik dengan sintaks <code>async/await</code> agar kode asinkron terlihat seperti kode sinkron.</p>

                        <div class="lms-callout warning">
                            <strong>🔒 Keamanan Penyimpanan Token:</strong>
                            Jangan pernah menyimpan token autentikasi (seperti JWT) sensitif di <code>localStorage</code> karena rentan terhadap serangan XSS (Cross-Site Scripting). Gunakan <code>httpOnly cookies</code> sebagai gantinya.
                        </div>

                        <h3>Contoh Request Data dengan Fetch API:</h3>
                        <pre><code class="language-javascript">async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.domain.com/users/\${userId}\`);
    if (!response.ok) throw new Error("Gagal mengambil data user");
    const data = await response.json();
    console.log("Data User:", data);
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
}</code></pre>
                    `
                },
                quiz: {
                    category: "web",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis JavaScript Async"
                }
            },
            {
                id: "web-perf",
                title: "Web Performance Optimization",
                lecture: {
                    title: "Meningkatkan Core Web Vitals & Implementasi Lazy Loading",
                    category: "Web Development",
                    readTime: "6 menit baca",
                    content: `
                        <p>Kecepatan situs web memiliki korelasi langsung dengan retensi pengguna dan SEO. Google menilai performa halaman web menggunakan metrik standar yang disebut <strong>Core Web Vitals</strong>.</p>
                        
                        <h3>Tiga Metrik Utama Core Web Vitals:</h3>
                        <ol>
                            <li><strong>LCP (Largest Contentful Paint)</strong>: Mengukur kecepatan rendering konten utama (seperti gambar banner besar). Nilai idealnya di bawah 2.5 detik.</li>
                            <li><strong>FID (First Input Delay) / INP (Interaction to Next Paint)</strong>: Mengukur responsivitas halaman saat pengguna pertama kali berinteraksi (mengklik tombol). Ideal di bawah 100 milidetik.</li>
                            <li><strong>CLS (Cumulative Layout Shift)</strong>: Mengukur stabilitas visual halaman. Layout bergeser setelah halaman dimuat (misal karena banner iklan) mengganggu pengalaman pengguna. Ideal di bawah 0.1.</li>
                        </ol>

                        <h3>Optimasi dengan Lazy Loading:</h3>
                        <p>Lazy loading menunda pemuatan gambar atau komponen JavaScript yang berada di bawah layar (below-the-fold) sampai pengguna melakukan scroll ke area tersebut.</p>
                        <pre><code class="language-html">&lt;!-- Menggunakan atribut loading bawaan browser --&gt;
&lt;img src="gambar-berat.jpg" alt="Ilustrasi" loading="lazy" width="800" height="600" /&gt;</code></pre>
                    `
                },
                quiz: {
                    category: "web",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Performa Web"
                }
            }
        ]
    },
    {
        id: "database-sql",
        title: "Database & SQL Specialist Path",
        badge: "DB Specialist",
        description: "Kuasai arsitektur penyimpanan data relasional dan NoSQL, sintaks kueri tingkat lanjut (JOIN & GROUP BY), normalisasi skema data, prinsip transaksi ACID, hingga penggunaan indeks.",
        color: "#4f8cff",
        badgeIcon: "👑",
        badgeName: "Query Overlord",
        badgeDesc: "Menyelesaikan Jalur Database & SQL",
        modules: [
            {
                id: "db-concepts",
                title: "Relational Concepts & Keys",
                lecture: {
                    title: "Memahami Aturan Relasi, Primary Key, dan Foreign Key",
                    category: "Database & SQL",
                    readTime: "5 menit baca",
                    content: `
                        <p>Database Relasional (RDBMS) mengorganisasi data ke dalam baris dan kolom di dalam tabel. Untuk menghubungkan antar tabel dan menjaga keunikan data, RDBMS menggunakan konsep <strong>Keys (Kunci)</strong>.</p>
                        
                        <h3>Primary Key vs Foreign Key:</h3>
                        <ul>
                            <li><strong>Primary Key (Kunci Utama)</strong>: Kolom atau kombinasi kolom yang secara unik mengidentifikasi setiap baris (record) dalam satu tabel. Nilainya tidak boleh kosong (NOT NULL) dan tidak boleh duplikat.</li>
                            <li><strong>Foreign Key (Kunci Tamu)</strong>: Kolom dalam suatu tabel yang merujuk ke Primary Key di tabel lain. Ini menciptakan hubungan (relasi) antar tabel dan menjaga integritas referensial.</li>
                        </ul>

                        <div class="lms-callout important">
                            <strong>🔑 Integritas Data:</strong>
                            Dengan Foreign Key, database secara otomatis menolak penghapusan data induk jika masih ada data anak yang merujuk ke sana (misalnya, menghapus user yang masih memiliki transaksi pembelian aktif).
                        </div>
                    `
                },
                quiz: {
                    category: "database",
                    difficulty: "easy",
                    limit: 5,
                    title: "Kuis Relational Database"
                }
            },
            {
                id: "sql-join",
                title: "SQL JOIN & Aggregates",
                lecture: {
                    title: "Teknik Menggabungkan Tabel (JOIN) dan GROUP BY",
                    category: "Database & SQL",
                    readTime: "7 menit baca",
                    content: `
                        <p>Salah satu kekuatan utama SQL adalah kemampuan menggabungkan data dari berbagai tabel relasional dengan satu instruksi query (kueri) menggunakan klausul <code>JOIN</code>.</p>
                        
                        <h3>Tipe-Tipe JOIN yang Sering Digunakan:</h3>
                        <ul>
                            <li><strong>INNER JOIN</strong>: Hanya menampilkan baris jika ada kecocokan di kedua tabel yang digabung.</li>
                            <li><strong>LEFT JOIN (LEFT OUTER JOIN)</strong>: Menampilkan semua data dari tabel kiri, ditambah data tabel kanan yang cocok. Jika tidak cocok, kolom kanan diisi nilai NULL.</li>
                            <li><strong>RIGHT JOIN</strong>: Kebalikan dari LEFT JOIN. Menampilkan semua data tabel kanan.</li>
                        </ul>

                        <h3>Fungsi Agregasi dan GROUP BY</h3>
                        <p>Digunakan untuk meringkas data. Contoh fungsi agregasi: <code>COUNT()</code> (hitung data), <code>SUM()</code> (jumlah), <code>AVG()</code> (rata-rata). Kueri harus menggunakan <code>GROUP BY</code> untuk kolom non-agregat.</p>
                        <pre><code class="language-sql">SELECT kategori, COUNT(id) AS jumlah_produk, AVG(harga) AS rata_harga
FROM produk
INNER JOIN kategori_produk ON produk.kategori_id = kategori_produk.id
GROUP BY kategori
HAVING AVG(harga) > 50000;</code></pre>
                    `
                },
                quiz: {
                    category: "database",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis SQL JOIN & GROUP BY"
                }
            },
            {
                id: "db-normalization",
                title: "Database Normalization & ACID",
                lecture: {
                    title: "Meminimalkan Redundansi dengan Normalisasi & Menjaga Transaksi ACID",
                    category: "Database & SQL",
                    readTime: "8 menit baca",
                    content: `
                        <p>Dalam merancang database, kita perlu menata kolom dan tabel agar tidak terjadi duplikasi data berlebih (redundansi) yang memicu anomali saat manipulasi data (insert, update, delete).</p>
                        
                        <h3>Tahapan Normalisasi:</h3>
                        <ol>
                            <li><strong>1NF (Normal Form Pertama)</strong>: Menghilangkan kolom dengan grup berulang dan memastikan setiap sel berisi nilai tunggal (atomic value).</li>
                            <li><strong>2NF (Normal Form Kedua)</strong>: Memenuhi 1NF dan memastikan semua kolom non-kunci bergantung penuh pada Primary Key (menghilangkan ketergantungan parsial).</li>
                            <li><strong>3NF (Normal Form Ketiga)</strong>: Memenuhi 2NF dan memastikan kolom non-kunci tidak bergantung pada kolom non-kunci lainnya (menghilangkan ketergantungan transitif).</li>
                        </ol>

                        <h3>Prinsip Transaksi ACID:</h3>
                        <p>Menjamin keandalan data dalam operasi database transaksional (seperti transfer uang bank):</p>
                        <ul>
                            <li><strong>Atomicity</strong>: Operasi dianggap satu kesatuan penuh. Berhasil semua, atau batal semua (All-or-Nothing).</li>
                            <li><strong>Consistency</strong>: Transaksi harus memindahkan database dari satu keadaan valid ke keadaan valid lainnya.</li>
                            <li><strong>Isolation</strong>: Operasi yang berjalan paralel tidak boleh saling mengganggu sebelum selesai (commit).</li>
                            <li><strong>Durability</strong>: Data permanen di storage setelah transaksi selesai berkomitmen, meski server mati listrik.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "database",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Normalisasi & ACID"
                }
            },
            {
                id: "db-indexing",
                title: "Indexing & Replication",
                lecture: {
                    title: "Mempercepat Kueri dengan Index B-Tree & Strategi High Availability",
                    category: "Database & SQL",
                    readTime: "6 menit baca",
                    content: `
                        <p>Ketika volume data bertumbuh menjadi jutaan baris, kueri pencarian akan melambat karena database harus melakukan scan baris demi baris (Full Table Scan). Solusinya adalah <strong>Indexing</strong>.</p>
                        
                        <h3>Bagaimana Index B-Tree Bekerja?</h3>
                        <p>Index B-Tree membuat struktur pohon pencarian seimbang di memori. Pencarian data bergeser dari kompleksitas waktu O(N) menjadi O(log N) yang sangat cepat.</p>
                        
                        <div class="lms-callout warning">
                            <strong>⚡ Efek Samping Indexing:</strong>
                            Index mempercepat kueri baca (SELECT), tetapi memperlambat kueri tulis (INSERT, UPDATE, DELETE) karena database harus menyusun ulang struktur pohon index setiap kali data dimodifikasi. Gunakan index hanya pada kolom yang sering dijadikan filter WHERE atau JOIN.
                        </div>

                        <h3>Replikasi Database:</h3>
                        <p>Menyalin data secara real-time ke server sekunder (Slave/Replica). Jika server utama (Master) mengalami kerusakan, Slave dapat langsung dipromosikan (Failover) sehingga layanan tetap online (High Availability).</p>
                    `
                },
                quiz: {
                    category: "database",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Indexing & Replikasi"
                }
            }
        ]
    },
    {
        id: "cyber-ui",
        title: "Cyber Security & UI/UX Specialist Path",
        badge: "Security & UI",
        description: "Pahami sistem pertahanan autentikasi web, enkripsi data, mitigasi phishing/malware, dipadukan dengan implementasi visual hierarchy, aksesibilitas WCAG, dan hukum interaksi pengguna (Hick's & Fitts's Laws).",
        color: "#8b5cf6",
        badgeIcon: "🛡️",
        badgeName: "Shield Guard",
        badgeDesc: "Menyelesaikan Jalur Cyber Security & UI/UX",
        modules: [
            {
                id: "cyber-auth",
                title: "Modern Authentication & Web Security",
                lecture: {
                    title: "Mengamankan Sistem Otentikasi dan Token Keamanan",
                    category: "Cyber Security",
                    readTime: "6 menit baca",
                    content: `
                        <p>Keamanan siber di web dimulai dari bagaimana kita mengidentifikasi pengguna secara aman dan menjaga agar kredensial mereka tidak dicuri oleh pihak luar.</p>
                        
                        <h3>Lapisan Pertahanan Otentikasi Modern:</h3>
                        <ul>
                            <li><strong>Two-Factor Authentication (2FA) / MFA</strong>: Mewajibkan pembuktian identitas tambahan di luar password, misalnya kode OTP sekali pakai dari Google Authenticator atau SMS.</li>
                            <li><strong>Enkripsi Password Kuat</strong>: Jangan pernah menyimpan password polos (plain text) di database! Gunakan algoritma hashing kriptografi adaptif lambat seperti <code>bcrypt</code> atau <code>argon2</code> dengan <code>salt</code> acak.</li>
                        </ul>

                        <div class="lms-callout important">
                            <strong>🔒 Mitigasi XSS & CSRF:</strong>
                            Gunakan header HTTP <code>Content-Security-Policy (CSP)</code> untuk membatasi eksekusi skrip ilegal di browser pengguna guna mencegah pencurian cookie sesi via Cross-Site Scripting (XSS).
                        </div>
                    `
                },
                quiz: {
                    category: "cyber",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis Otentikasi & Keamanan"
                }
            },
            {
                id: "cyber-threats",
                title: "Cyber Threats & Social Engineering",
                lecture: {
                    title: "Strategi Menghadapi Phishing, Ransomware, dan Serangan MitM",
                    category: "Cyber Security",
                    readTime: "6 menit baca",
                    content: `
                        <p>Ancaman siber tidak melulu menyerang kelemahan baris kode (software exploit). Penyerang sering kali memanfaatkan kerentanan psikologis manusia (meretas manusia) lewat teknik yang disebut <strong>Social Engineering</strong>.</p>
                        
                        <h3>Tiga Ancaman Siber Terpopuler:</h3>
                        <ol>
                            <li><strong>Phishing</strong>: Upaya memancing pengguna memasukkan username dan password di halaman web tiruan yang dibuat sangat mirip dengan halaman asli (misalnya, bank palsu).</li>
                            <li><strong>Ransomware</strong>: Perangkat perusak (malware) yang secara diam-diam menyusup ke komputer target, mengenkripsi seluruh data penting di harddisk, dan memeras korban untuk membayar sejumlah tebusan (biasanya Bitcoin) agar diberikan kunci dekripsinya.</li>
                            <li><strong>Man-in-the-Middle (MitM)</strong>: Penyerang berada di antara lalu lintas pengirim dan penerima (sering kali di jaringan WiFi publik tak berpassword) untuk menguping atau memanipulasi data sensitif yang ditransfer.</li>
                        </ol>

                        <div class="lms-callout tip">
                            <strong>💡 Perlindungan Utama:</strong>
                            Selalu gunakan protokol <strong>HTTPS</strong> yang mengenkripsi seluruh transfer data, dan hindari melakukan transaksi finansial saat terhubung ke WiFi publik tanpa menggunakan VPN (Virtual Private Network).
                        </div>
                    `
                },
                quiz: {
                    category: "cyber",
                    difficulty: "easy",
                    limit: 5,
                    title: "Kuis Ancaman Siber"
                }
            },
            {
                id: "ui-hierarchy",
                title: "Visual Hierarchy & Design Laws",
                lecture: {
                    title: "Menerapkan Visual Hierarchy dan Hukum Hick & Fitts",
                    category: "UI/UX Design",
                    readTime: "7 menit baca",
                    content: `
                        <p>Desain antarmuka (UI) yang baik bukan hanya soal estetika, melainkan bagaimana kita menuntun mata pengguna agar memahami struktur informasi dengan cepat dan nyaman.</p>
                        
                        <h3>Hukum Desain Penting (UX Laws):</h3>
                        <ul>
                            <li><strong>Hick's Law (Hukum Hick)</strong>: Waktu yang dibutuhkan seseorang untuk mengambil keputusan meningkat seiring bertambahnya jumlah pilihan dan kompleksitasnya. <em>Prinsip: Batasi menu pilihan, hindari membuat pengguna bingung.</em></li>
                            <li><strong>Fitts's Law (Hukum Fitts)</strong>: Waktu untuk menjangkau target tergantung pada ukuran target dan jarak ke target tersebut. <em>Prinsip: Tombol aksi penting harus dibuat besar dan mudah dijangkau oleh jari/kursor.</em></li>
                            <li><strong>Visual Hierarchy</strong>: Menggunakan kontras ukuran font, warna latar, tebal tulisan, dan spacing kosong (whitespace) agar pengguna tahu bagian mana yang paling penting terlebih dahulu.</li>
                        </ul>

                        <h3>Contoh Penerapan Hick's Law:</h3>
                        <p>Daripada menyajikan formulir pendaftaran 30 baris sekaligus yang membuat pengguna malas, pecahlah formulir tersebut menjadi beberapa tahapan (Multi-step form) yang memiliki 3-4 input per tahap.</p>
                    `
                },
                quiz: {
                    category: "design",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis UX Laws & Hierarchy"
                }
            },
            {
                id: "ui-accessibility",
                title: "Accessibility & Design Systems",
                lecture: {
                    title: "Membangun Design System yang Konsisten dan Aksesibilitas WCAG",
                    category: "UI/UX Design",
                    readTime: "6 menit baca",
                    content: `
                        <p>Desain yang baik adalah desain yang inklusif—dapat dinikmati oleh semua kalangan, termasuk mereka yang memiliki keterbatasan fisik atau sensorik.</p>
                        
                        <h3>Prinsip Aksesibilitas Web (WCAG):</h3>
                        <ul>
                            <li><strong>Rasio Kontras Warna</strong>: Pastikan teks kontras dengan latar belakangnya. Standar minimum rasio kontras teks biasa adalah 4.5:1 (tingkat AA) agar mudah dibaca oleh pengguna dengan rabun atau buta warna sebagian.</li>
                            <li><strong>Design Tokens</strong>: Penggunaan variabel desain (seperti warna primer, ukuran font, padding) yang konsisten dan disimpan dalam satu format pusat (seperti JSON) untuk mempermudah keselarasan antara tim desainer dan tim developer.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "design",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Aksesibilitas & Design System"
                }
            }
        ]
    }
];

// --- LMS Engine State ---
const lmsState = {
    currentTrackId: null,
    currentModuleIndex: 0,
    currentStepType: null, // "lecture", "quiz-intro", "quiz-active", "quiz-result"
    
    // Progres disimpan di LocalStorage
    progress: {
        completedLectures: [], // array of "trackId_moduleId"
        quizScores: {},       // object mapping "trackId_moduleId_quizType" to score
        unlockedBadges: [],   // list of trackIds completed
        userName: "Developer Indonesia"
    },

    // State kuis aktif saat ini di dalam LMS
    quiz: {
        title: "",
        questions: [],
        current: 0,
        selected: [], // array of answers chosen
        flagged: [],  // array of boolean flags
        bookmarks: [],
        timeLeft: 0,
        timerId: null,
        streak: 0,
        cheatWarnings: 0,
        mode: "practice" // "practice" or "challenge"
    }
};

const LMS_STORAGE_KEY = "eduquestLmsProgress";

// --- Initialization ---
function initLms() {
    loadLmsProgress();
    renderTabs();
    renderTrackCards();
    setupLmsEventListeners();
    updateBadgesCabinet();
    initNotesWidget();
    initTabSwitching();
    restoreLmsReturnContext();
}

// --- Load/Save Progress ---
function loadLmsProgress() {
    try {
        const raw = localStorage.getItem(LMS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            lmsState.progress = {
                completedLectures: parsed.completedLectures || [],
                quizScores: parsed.quizScores || {},
                unlockedBadges: parsed.unlockedBadges || [],
                userName: parsed.userName || "Developer Indonesia"
            };
        }
    } catch (e) {
        console.error("Gagal memuat progres LMS:", e);
    }
}

function saveLmsProgress() {
    try {
        localStorage.setItem(LMS_STORAGE_KEY, JSON.stringify(lmsState.progress));
    } catch (e) {
        console.error("Gagal menyimpan progres LMS:", e);
    }
}

// --- Tab Switching Navigation ---
function initTabSwitching() {
    const tabBtns = document.querySelectorAll(".lms-tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            playSound('click');
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tabId = btn.dataset.tab;
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            const targetTab = document.getElementById(`${tabId}-tab`);
            if (targetTab) {
                targetTab.classList.add("active");
                if (tabId === "quick-arena") {
                    // Update Quick Arena visual to sync
                    if (typeof updateSidebarVisibility === 'function') {
                        updateSidebarVisibility();
                    }
                }
            }
        });
    });
}

function renderTabs() {
    // Generate tab selectors right at the top page
    const existingMain = document.querySelector(".page");
    if (!existingMain) return;

    // Check if selector exists
    if (document.querySelector(".lms-tab-container")) return;

    const tabContainer = document.createElement("div");
    tabContainer.className = "lms-tab-container";
    tabContainer.innerHTML = `
        <div class="lms-tab-nav" role="tablist">
            <button class="lms-tab-btn active" data-tab="lms-classroom" role="tab" aria-selected="true">🎓 Jalur Belajar (LMS)</button>
            <button class="lms-tab-btn" data-tab="quick-arena" role="tab" aria-selected="false">🎮 Quick Quiz Arena</button>
        </div>
    `;

    // Insert tabs before the hero section
    const hero = document.querySelector(".hero");
    if (hero) {
        existingMain.insertBefore(tabContainer, hero);
    }
}

// --- Render Course Tracks Grid ---
function renderTrackCards() {
    const lmsTab = document.getElementById("lms-classroom-tab");
    if (!lmsTab) return;

    // Calculate global stats
    const totalLecturesRead = lmsState.progress.completedLectures.length;
    const totalQuizzesPassed = Object.values(lmsState.progress.quizScores).filter(s => s >= 80).length;
    const totalBadges = lmsState.progress.unlockedBadges.length;

    lmsTab.innerHTML = `
        <div class="lms-tracks-container" id="tracksView">
            <h2 class="lms-tracks-title">Tech Academy Learning Tracks</h2>
            <p class="lms-tracks-desc">Pilih jalur belajar Anda, baca materi kuliah interaktif, selesaikan kuis, dan dapatkan sertifikat digital profesional.</p>
            
            <!-- Global Stats Bar -->
            <div class="setup-card" style="margin-bottom: 32px; grid-template-columns: repeat(3, 1fr); text-align: center;">
                <div class="stat-line" style="display: flex; flex-direction: column; gap: 4px; padding: 14px;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Materi Selesai</span>
                    <strong style="font-size: 24px; color: var(--green-dark);">${totalLecturesRead} 📄</strong>
                </div>
                <div class="stat-line" style="display: flex; flex-direction: column; gap: 4px; padding: 14px;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Kuis Lulus</span>
                    <strong style="font-size: 24px; color: var(--blue);">${totalQuizzesPassed} ✍️</strong>
                </div>
                <div class="stat-line" style="display: flex; flex-direction: column; gap: 4px; padding: 14px;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Sertifikat Diraih</span>
                    <strong style="font-size: 24px; color: var(--purple);">${totalBadges} 🏆</strong>
                </div>
            </div>

            <div class="lms-tracks-grid" id="tracksGrid"></div>
        </div>
        <div class="lms-classroom" id="classroomView" style="display: none;">
            <!-- Outline Sidebar -->
            <aside class="lms-sidebar-outline">
                <div class="lms-sidebar-header">
                    <button class="lms-back-tracks-btn" id="lmsBackTracks"><i class="fa-solid fa-arrow-left"></i> Kembali ke Jalur</button>
                    <h2 class="lms-syllabus-title" id="lmsSidebarTrackTitle">Syllabus</h2>
                    <div class="lms-sidebar-progress">
                        <div class="lms-sidebar-progress-text">
                            <span>Selesai</span>
                            <span id="lmsSidebarProgressPct">0%</span>
                        </div>
                        <div class="lms-sidebar-progress-bar">
                            <div class="lms-sidebar-progress-fill" id="lmsSidebarProgressFill"></div>
                        </div>
                    </div>
                </div>
                <div class="lms-syllabus-tree" id="lmsSyllabusTree"></div>
                <button class="btn btn-danger" id="lmsResetOutlineBtn" style="margin-top: 14px; min-height:36px; font-size:11px; padding: 8px 12px; border-radius:12px; width: 100%;">✕ Reset Progres Jalur</button>
            </aside>
            
            <!-- Main Panel -->
            <div class="lms-classroom-main" id="lmsClassroomMain"></div>

            <!-- Right Sidebar Info -->
            <aside class="lms-right-sidebar">
                <div class="lms-badge-cabinet">
                    <h3 class="lms-badge-title">🏆 Sertifikat & Lencana</h3>
                    <div class="lms-badge-grid" id="lmsBadgeCabinetGrid"></div>
                </div>
                
                <div class="lms-notes-widget">
                    <div class="lms-notes-header">
                        <h3 class="lms-notes-title">📝 Catatan Belajar</h3>
                        <span class="lms-notes-save-indicator" id="notesSaveIndicator">Tersimpan</span>
                    </div>
                    <textarea class="lms-notes-textarea" id="lmsNotesTextarea" placeholder="Tulis catatan penting, rumus, atau konsep penting di sini. Tersimpan otomatis untuk modul ini..."></textarea>
                </div>
            </aside>
        </div>
    `;

    // Render Track cards dynamically
    const grid = document.getElementById("tracksGrid");
    if (!grid) return;

    grid.innerHTML = lmsTracks.map(track => {
        const progressInfo = calculateTrackProgress(track.id);
        const isCompleted = progressInfo.percent === 100;
        
        return `
            <div class="lms-track-card ${getTrackClass(track.id)}" onclick="enterTrack('${track.id}')">
                <div class="lms-track-badge">${track.badge}</div>
                <h3 class="lms-track-title-text">${track.title}</h3>
                <p class="lms-track-description">${track.description}</p>
                <div class="lms-track-meta">
                    <span class="lms-track-modules-count">
                        📚 ${track.modules.length} Modul 
                        • ${isCompleted ? "Completed" : progressInfo.percent + "% Progress"}
                    </span>
                    <button class="lms-track-btn" style="background: ${track.color};">Mulai Belajar</button>
                </div>
            </div>
        `;
    }).join("");
}

function getTrackClass(trackId) {
    if (trackId === "web-dev") return "track-web";
    if (trackId === "database-sql") return "track-db";
    return "track-cyber";
}

// --- Classroom Navigation & Render Outline Sidebar ---
function calculateTrackProgress(trackId) {
    const track = lmsTracks.find(t => t.id === trackId);
    if (!track) return { done: 0, total: 0, percent: 0 };

    const totalSteps = track.modules.length * 3; // each module has: Lecture, Practice Quiz, Challenge Quiz
    let doneSteps = 0;

    track.modules.forEach(mod => {
        // Lecture step
        const isLectureDone = lmsState.progress.completedLectures.includes(`${trackId}_${mod.id}`);
        if (isLectureDone) doneSteps++;

        // Practice Quiz step (Passing score >= 80)
        const practiceScore = lmsState.progress.quizScores[`${trackId}_${mod.id}_practice`] || 0;
        if (practiceScore >= 80) doneSteps++;

        // Challenge Quiz step (Passing score >= 80)
        const challengeScore = lmsState.progress.quizScores[`${trackId}_${mod.id}_challenge`] || 0;
        if (challengeScore >= 80) doneSteps++;
    });

    const percent = Math.round((doneSteps / totalSteps) * 100);
    return { done: doneSteps, total: totalSteps, percent };
}

function enterTrack(trackId) {
    playSound('click');
    lmsState.currentTrackId = trackId;
    lmsState.currentModuleIndex = 0;
    lmsState.currentStepType = "lecture";

    document.getElementById("tracksView").style.display = "none";
    document.getElementById("classroomView").style.display = "grid";

    renderOutlineSidebar();
    renderClassroomContent();
    updateBadgesCabinet();
    loadModuleNotes();

    // Bind path reset button
    const resetBtn = document.getElementById("lmsResetOutlineBtn");
    if (resetBtn) {
        resetBtn.onclick = () => resetLmsTrackProgress(trackId);
    }
}

function resetLmsTrackProgress(trackId) {
    if (confirm("Apakah Anda yakin ingin mereset seluruh progres di Jalur Belajar ini? Semua materi bacaan dan nilai kuis di jalur ini akan dihapus.")) {
        playSound('laser');
        
        // Remove completed lectures for this track
        lmsState.progress.completedLectures = lmsState.progress.completedLectures.filter(
            item => !item.startsWith(`${trackId}_`)
        );
        
        // Remove kuis scores for this track
        Object.keys(lmsState.progress.quizScores).forEach(key => {
            if (key.startsWith(`${trackId}_`)) {
                delete lmsState.progress.quizScores[key];
            }
        });
        
        // Remove unlocked badge for this track
        lmsState.progress.unlockedBadges = lmsState.progress.unlockedBadges.filter(
            badge => badge !== trackId
        );
        
        saveLmsProgress();
        renderOutlineSidebar();
        renderClassroomContent();
        updateBadgesCabinet();
        loadModuleNotes();
        alert("Progres jalur berhasil direset!");
    }
}

function renderOutlineSidebar() {
    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    if (!track) return;

    // Set header
    document.getElementById("lmsSidebarTrackTitle").textContent = track.title;
    
    // Update progress
    const progress = calculateTrackProgress(track.id);
    document.getElementById("lmsSidebarProgressPct").textContent = `${progress.percent}%`;
    document.getElementById("lmsSidebarProgressFill").style.width = `${progress.percent}%`;

    const tree = document.getElementById("lmsSyllabusTree");
    if (!tree) return;

    tree.innerHTML = track.modules.map((mod, index) => {
        const isLectureActive = index === lmsState.currentModuleIndex && lmsState.currentStepType === "lecture";
        const isPracticeActive = index === lmsState.currentModuleIndex && lmsState.currentStepType === "practice";
        const isChallengeActive = index === lmsState.currentModuleIndex && lmsState.currentStepType === "challenge";

        const isLectureDone = lmsState.progress.completedLectures.includes(`${track.id}_${mod.id}`);
        const practiceScore = lmsState.progress.quizScores[`${track.id}_${mod.id}_practice`] || 0;
        const challengeScore = lmsState.progress.quizScores[`${track.id}_${mod.id}_challenge`] || 0;

        const isPracticeDone = practiceScore >= 80;
        const isChallengeDone = challengeScore >= 80;

        return `
            <div class="lms-chapter-group">
                <div class="lms-chapter-header">Modul ${index + 1}: ${mod.title}</div>
                
                <!-- Lecture Step -->
                <div class="lms-syllabus-item ${isLectureActive ? 'active' : ''} ${isLectureDone ? 'completed' : ''}" 
                     onclick="selectStep(${index}, 'lecture')">
                    <span class="lms-item-check">${isLectureDone ? '🟢' : '⚪'}</span>
                    <span class="lms-item-title">Materi: ${mod.lecture.title}</span>
                    <span class="lms-item-type-icon">📄</span>
                </div>

                <!-- Practice Quiz Step -->
                <div class="lms-syllabus-item ${isPracticeActive ? 'active' : ''} ${isPracticeDone ? 'completed' : ''}" 
                     onclick="selectStep(${index}, 'practice')">
                    <span class="lms-item-check">${isPracticeDone ? '🟢' : '⚪'}</span>
                    <span class="lms-item-title">Kuis Latihan (${practiceScore}%)</span>
                    <span class="lms-item-type-icon">✍️</span>
                </div>

                <!-- Challenge Quiz Step -->
                <div class="lms-syllabus-item ${isChallengeActive ? 'active' : ''} ${isChallengeDone ? 'completed' : ''}" 
                     onclick="selectStep(${index}, 'challenge')">
                    <span class="lms-item-check">${isChallengeDone ? '🟢' : '⚪'}</span>
                    <span class="lms-item-title">Ujian Tantangan (${challengeScore}%)</span>
                    <span class="lms-item-type-icon">🏆</span>
                </div>
            </div>
        `;
    }).join("");

    // Check if fully completed to trigger badge unlock
    if (progress.percent === 100 && !lmsState.progress.unlockedBadges.includes(track.id)) {
        unlockTrackBadge(track.id);
    }
}

function selectStep(moduleIndex, stepType) {
    if (lmsState.quiz.timerId) {
        if (!confirm("Kuis sedang aktif berjalan. Pindah materi sekarang akan membatalkan kuis ini. Apakah Anda yakin?")) {
            return;
        }
        clearInterval(lmsState.quiz.timerId);
        lmsState.quiz.timerId = null;
    }

    playSound('click');
    lmsState.currentModuleIndex = moduleIndex;
    lmsState.currentStepType = stepType;

    renderOutlineSidebar();
    renderClassroomContent();
    loadModuleNotes();
}

// --- Render Classroom Contents ---
function renderClassroomContent() {
    const main = document.getElementById("lmsClassroomMain");
    if (!main) return;

    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    const mod = track.modules[lmsState.currentModuleIndex];

    if (lmsState.currentStepType === "lecture") {
        renderLecture(mod.lecture, track.id, mod.id);
    } else if (lmsState.currentStepType === "practice" || lmsState.currentStepType === "challenge") {
        renderQuizIntro(mod, lmsState.currentStepType);
    }
}

// 1. Lecture Note renderer
function renderLecture(lecture, trackId, moduleId) {
    const main = document.getElementById("lmsClassroomMain");
    const isCompleted = lmsState.progress.completedLectures.includes(`${trackId}_${moduleId}`);

    main.innerHTML = `
        <div class="lms-lecture">
            <div class="lms-lecture-header">
                <div class="lms-lecture-meta">
                    <span class="lms-lecture-tag">${lecture.category}</span>
                    <span class="lms-lecture-tag">⏱️ ${lecture.readTime}</span>
                </div>
                <h1 class="lms-lecture-title">${lecture.title}</h1>
            </div>
            <div class="lms-lecture-body">
                ${lecture.content}
            </div>
            <div class="lms-lecture-footer">
                <button class="btn ${isCompleted ? 'btn-ghost' : 'btn-primary'}" id="lmsCompleteLectureBtn" ${isCompleted ? 'disabled' : ''}>
                    ${isCompleted ? '✓ Selesai Dibaca' : '🚀 Selesai & Dapatkan +15 XP'}
                </button>
            </div>
        </div>
    `;

    // Bind complete button
    const btn = document.getElementById("lmsCompleteLectureBtn");
    if (btn && !isCompleted) {
        btn.addEventListener("click", () => {
            playSound('success');
            lmsState.progress.completedLectures.push(`${trackId}_${moduleId}`);
            saveLmsProgress();
            
            // Add XP via RPG Engine
            if (typeof addXp === 'function') {
                addXp(15);
            }

            renderOutlineSidebar();
            renderLecture(lecture, trackId, moduleId);
        });
    }

    // Add copy code buttons programmatically
    document.querySelectorAll(".lms-lecture-body pre").forEach(pre => {
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-code-btn";
        copyBtn.textContent = "Salin";
        copyBtn.addEventListener("click", async () => {
            const code = pre.querySelector("code").textContent;
            try {
                if (!navigator.clipboard || !window.isSecureContext) {
                    throw new Error("Clipboard API unavailable");
                }
                await navigator.clipboard.writeText(code);
                copyBtn.textContent = "Disalin!";
                playSound('click');
                setTimeout(() => copyBtn.textContent = "Salin", 2000);
            } catch (error) {
                console.warn("Copy code unavailable:", error);
                copyBtn.textContent = "Pilih & salin";
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(pre.querySelector("code"));
                selection.removeAllRanges();
                selection.addRange(range);
                setTimeout(() => copyBtn.textContent = "Salin", 2500);
            }
        });
        pre.appendChild(copyBtn);
    });
}

// 2. Quiz Intro Screen renderer
function renderQuizIntro(mod, quizType) {
    const main = document.getElementById("lmsClassroomMain");
    const isChallenge = quizType === "challenge";
    const highScore = lmsState.progress.quizScores[`${lmsState.currentTrackId}_${mod.id}_${quizType}`] || 0;

    main.innerHTML = `
        <div class="lms-quiz-intro">
            <span class="lms-quiz-icon">${isChallenge ? '🏆' : '✍️'}</span>
            <h1 class="lms-quiz-intro-title">${mod.title} - Kuis ${isChallenge ? 'Tantangan (Ujian)' : 'Latihan'}</h1>
            <p class="lms-quiz-intro-desc">
                Uji pemahaman Anda tentang ${mod.title}. Anda memerlukan skor minimal <strong>80% (4/5 benar)</strong> untuk melengkapi langkah silabus ini.
            </p>
            
            <div class="lms-quiz-rules-card">
                <h3 class="lms-quiz-rules-title">📋 Aturan & Info Kuis:</h3>
                <ul class="lms-quiz-rules-list">
                    <li><strong>Jumlah Soal</strong>: 5 Pertanyaan</li>
                    <li><strong>Bantuan AI Tutor</strong>: ${isChallenge ? '🔴 Tidak tersedia (Mode Ujian)' : '🟢 Tersedia setiap saat'}</li>
                    <li><strong>Bantuan 50:50 / Hint</strong>: ${isChallenge ? '🔴 Tidak' : '🟢 Ya, 2 Kali bantuan'}</li>
                    <li><strong>Skor Tertinggi Anda</strong>: ${highScore}%</li>
                    ${isChallenge ? '<li><strong>Anti-Cheating</strong>: Peringatan akan dipicu jika Anda membuka tab browser lain.</li>' : ''}
                </ul>
            </div>

            <button class="btn btn-blue" id="lmsStartQuizBtn">Mulai Kuis Sesi Ini</button>
            <p class="lms-focus-room-note">Kuis akan dibuka di LMS Focus Room satu layar agar pengerjaan lebih fokus tanpa scroll halaman.</p>
        </div>
    `;

    document.getElementById("lmsStartQuizBtn").addEventListener("click", () => {
        startLmsQuizSession(mod, quizType);
    });
}

// --- LMS Quiz Session Logic ---
function startLmsQuizSession(mod, quizType) {
    try {
        playSound('click');
        
        // Pick questions from the global questionBank based on category & difficulty
        const qSource = (typeof window.questionBank !== 'undefined') ? window.questionBank : ((typeof questionBank !== 'undefined') ? questionBank : []);
        const categoryQuery = mod.quiz.category;
        const difficultyQuery = mod.quiz.difficulty;

        let matchedQuestions = qSource.filter(q => q.category === categoryQuery);
        
        // Shuffle and pick 5 questions
        if (!matchedQuestions.length) {
            // Final fallback in case empty
            matchedQuestions = [
                { 
                    id: "fb-1", 
                    category: categoryQuery || "web", 
                    difficulty: difficultyQuery || "easy", 
                    question: "Kuis sedang mempersiapkan soal. Apakah Anda siap?", 
                    answers: ["Ya, siap", "Tentu", "Pasti", "Mulai"], 
                    correct: 0, 
                    hint: "Pilih jawaban A.", 
                    explanation: "Ini adalah pertanyaan inisiasi." 
                }
            ];
        } else {
            matchedQuestions = matchedQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
        }

        // Process and shuffle answers inside matchedQuestions
        const sessionQuestions = matchedQuestions.map(q => {
            const mappedAnswers = q.answers.map((text, idx) => ({ text, originalIndex: idx }));
            const shuffled = [...mappedAnswers];
            for (let index = shuffled.length - 1; index > 0; index -= 1) {
                const swapIndex = Math.floor(Math.random() * (index + 1));
                [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
            }
            return {
                ...q,
                shuffledAnswers: shuffled,
                shuffledCorrect: shuffled.findIndex(ans => ans.originalIndex === q.correct)
            };
        });

        const track = lmsTracks.find(item => item.id === lmsState.currentTrackId);
        const payload = {
            version: 1,
            source: "lms",
            createdAt: new Date().toISOString(),
            config: {
                category: mod.quiz.category,
                difficulty: mod.quiz.difficulty,
                amount: sessionQuestions.length,
                mode: quizType,
                categoryLabel: mod.lecture.category,
                difficultyLabel: mod.quiz.difficulty === "hard" ? "Challenge" : mod.quiz.difficulty === "medium" ? "Normal" : "Pemanasan",
                modeLabel: quizType === "challenge" ? "Ujian Tantangan" : "Kuis Latihan"
            },
            lms: {
                trackId: track.id,
                trackTitle: track.title,
                moduleId: mod.id,
                moduleIndex: lmsState.currentModuleIndex,
                moduleTitle: mod.title,
                quizType,
                passThreshold: 80
            },
            timeLimit: 5 * 60,
            questions: sessionQuestions
        };

        sessionStorage.setItem("eduquestQuizSession", JSON.stringify(payload));
        sessionStorage.removeItem("eduquestQuizActiveState");
        window.location.href = "quiz-session.html";
    } catch (err) {
        alert("CRITICAL ERROR in startLmsQuizSession: " + err.message);
        console.error(err);
    }
}

function restoreLmsReturnContext() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lmsReturn") !== "1") return;

    const trackId = params.get("track");
    const moduleIndex = Number(params.get("module"));
    const stepType = params.get("step");
    const track = lmsTracks.find(item => item.id === trackId);
    const validStep = stepType === "practice" || stepType === "challenge";
    if (!track || !Number.isInteger(moduleIndex) || !track.modules[moduleIndex] || !validStep) return;

    sessionStorage.setItem("quizActiveTab", "lms-classroom");
    document.getElementById("lmsClassroomTab")?.click();
    enterTrack(trackId);
    selectStep(moduleIndex, stepType);
    window.history.replaceState({}, "", window.location.pathname);
}

function handleLmsCheatDetection() {
    if (document.visibilityState === "hidden" && lmsState.currentStepType === "challenge" && lmsState.quiz.timerId) {
        lmsState.quiz.cheatWarnings++;
        playSound('alarm');
        
        alert(`🔴 PERINGATAN UJIAN (Peringatan ${lmsState.quiz.cheatWarnings}/3):\nPerpindahan tab atau window terdeteksi! Mohon fokus pada layar pengerjaan ujian. Jika melanggar 3 kali, ujian Anda akan otomatis digagalkan.`);

        if (lmsState.quiz.cheatWarnings >= 3) {
            alert("🔴 Batas kecurangan terlampaui. Ujian dibatalkan otomatis dengan skor 0%.");
            finishLmsQuiz(true); // Forced failure
        }
    }
}

function renderLmsQuizActiveLayout() {
    const main = document.getElementById("lmsClassroomMain");
    if (!main) return;

    main.innerHTML = `
        <div class="quiz-shell" id="lmsQuizShell" style="border-radius: 24px; box-shadow: none;">
            <div class="quiz-top" style="border-radius: 20px 20px 0 0;">
                <div class="quiz-meta">
                    <div class="pill-row">
                        <span class="pill" id="lmsQuizCounter">Soal 1/5</span>
                        <span class="pill" style="text-transform: uppercase;">Mode: ${lmsState.quiz.mode}</span>
                    </div>
                    <div class="timer" id="lmsQuizTimer">05:00</div>
                </div>
                <div class="progress-track" style="margin-top: 8px;">
                    <div class="progress-fill" id="lmsQuizProgressFill" style="width: 20%;"></div>
                </div>
            </div>

            <div class="question-area" style="min-height: 320px;">
                <div class="question-card" id="lmsQuestionCard">
                    <div class="question-label" id="lmsQuestionLabel">Kategori</div>
                    <h2 class="question-title" id="lmsQuestionText" style="font-size: 22px; margin-bottom: 18px;">Memuat pertanyaan...</h2>
                    <div class="answer-grid" id="lmsQuestionAnswers"></div>
                </div>

                <div class="feedback" id="lmsQuestionFeedback"></div>

                <div class="quiz-actions" style="margin-top: 24px;">
                    <div class="utility-actions">
                        <button class="btn btn-ghost" id="lmsQuizHintBtn">Hint</button>
                        <button class="btn btn-ghost" id="lmsQuizFiftyBtn">50:50</button>
                        <button class="btn btn-ghost" id="lmsQuizFlagBtn">Ragu-ragu</button>
                        ${lmsState.quiz.mode === "practice" ? '<button class="btn btn-dark" id="lmsQuizAiBtn" style="background:#0f172a;"><i class="fa-solid fa-robot"></i> Tanya AI Tutor</button>' : ''}
                    </div>
                    <div class="utility-actions">
                        <button class="btn btn-ghost" id="lmsQuizPrevBtn" disabled>Sebelumnya</button>
                        <button class="btn btn-primary" id="lmsQuizSubmitBtn">Submit</button>
                        <button class="btn btn-blue" id="lmsQuizNextBtn" style="display:none;">Lanjut</button>
                    </div>
                </div>
            </div>
            
            <!-- Dynamic AI Tutor obrolan -->
            <div class="lms-ai-tutor-container" id="lmsAiTutorContainer">
                <div class="lms-ai-header">
                    <div class="lms-ai-title">🤖 AI Tutor Coach</div>
                    <button class="lms-ai-close-btn" id="lmsAiCloseBtn">×</button>
                </div>
                <div class="lms-ai-chat-history" id="lmsAiChatHistory">
                    <!-- Obrolan -->
                </div>
                <div class="lms-ai-footer" id="lmsAiFooter">
                    <!-- Chip -->
                </div>
            </div>
        </div>
    `;

    // Setup active question rendering
    showLmsQuestion();

    // Bind action buttons
    document.getElementById("lmsQuizFlagBtn").addEventListener("click", toggleLmsQuizFlag);
    
    document.getElementById("lmsQuizPrevBtn").addEventListener("click", () => {
        if (lmsState.quiz.current > 0) {
            lmsState.quiz.current--;
            showLmsQuestion();
        }
    });

    document.getElementById("lmsQuizSubmitBtn").addEventListener("click", submitLmsAnswer);
    
    document.getElementById("lmsQuizNextBtn").addEventListener("click", () => {
        if (lmsState.quiz.current < 4) {
            lmsState.quiz.current++;
            showLmsQuestion();
        } else {
            finishLmsQuiz();
        }
    });

    // Disable helper actions in Challenge/Exam Mode
    if (lmsState.quiz.mode === "challenge") {
        document.getElementById("lmsQuizHintBtn").disabled = true;
        document.getElementById("lmsQuizFiftyBtn").disabled = true;
    } else {
        document.getElementById("lmsQuizHintBtn").addEventListener("click", triggerLmsHint);
        document.getElementById("lmsQuizFiftyBtn").addEventListener("click", triggerLmsFifty);
        
        // Open AI Tutor Panel
        const aiBtn = document.getElementById("lmsQuizAiBtn");
        if (aiBtn) {
            aiBtn.addEventListener("click", toggleAiTutorPanel);
        }
        
        const aiCloseBtn = document.getElementById("lmsAiCloseBtn");
        if (aiCloseBtn) {
            aiCloseBtn.addEventListener("click", toggleAiTutorPanel);
        }
    }

    // Keyboard navigation
    document.addEventListener("keydown", handleLmsQuizKeyboardInput);
}

function handleLmsQuizKeyboardInput(e) {
    if (!lmsState.quiz.timerId) return; // quiz not active
    
    const code = e.code;
    
    // Map A, B, C, D keys to answers (Digit 1-4 or keys A-D)
    let selectedIdx = -1;
    if (code === "KeyA" || code === "Digit1") selectedIdx = 0;
    if (code === "KeyB" || code === "Digit2") selectedIdx = 1;
    if (code === "KeyC" || code === "Digit3") selectedIdx = 2;
    if (code === "KeyD" || code === "Digit4") selectedIdx = 3;

    if (selectedIdx !== -1 && selectedIdx < lmsState.quiz.questions[lmsState.quiz.current].shuffledAnswers.length) {
        const currentAnswered = lmsState.quiz.selected[lmsState.quiz.current];
        if (!currentAnswered) {
            selectLmsChoiceOption(selectedIdx);
        }
    }

    if (code === "Space") {
        e.preventDefault();
        toggleLmsQuizFlag();
    }

    if (code === "Enter") {
        e.preventDefault();
        const submitBtn = document.getElementById("lmsQuizSubmitBtn");
        const nextBtn = document.getElementById("lmsQuizNextBtn");
        
        if (submitBtn && submitBtn.style.display !== "none" && !submitBtn.disabled) {
            submitLmsAnswer();
        } else if (nextBtn && nextBtn.style.display !== "none") {
            nextBtn.click();
        }
    }
}

function showLmsQuestion() {
    try {
        const qIndex = lmsState.quiz.current;
        const q = lmsState.quiz.questions[qIndex];
        if (!q) {
            console.warn("showLmsQuestion: No question found at index", qIndex);
            return;
        }

        // HUD and metadata
        document.getElementById("lmsQuizCounter").textContent = `Soal ${qIndex + 1}/5`;
        document.getElementById("lmsQuizProgressFill").style.width = `${((qIndex + 1) / 5) * 100}%`;
        document.getElementById("lmsQuestionLabel").textContent = `${q.category.toUpperCase()} - LEVEL: ${q.difficulty.toUpperCase()}`;
        document.getElementById("lmsQuestionText").textContent = q.question;

        // Render options
        const ansGrid = document.getElementById("lmsQuestionAnswers");
        ansGrid.innerHTML = "";

        const savedSelection = lmsState.quiz.selected[qIndex];

        q.shuffledAnswers.forEach((ans, idx) => {
            const opt = document.createElement("button");
            opt.className = "answer-option";
            opt.dataset.index = idx;
            opt.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + idx)}</span><span>${ans.text}</span>`;
            
            // Handle click selection
            opt.addEventListener("click", () => {
                if (!savedSelection) {
                    selectLmsChoiceOption(idx);
                }
            });

            // Apply styles if already submitted
            if (savedSelection) {
                opt.disabled = true;
                if (idx === q.shuffledCorrect) {
                    opt.classList.add("is-correct");
                }
                if (ans.text === savedSelection.chosenText && !savedSelection.isCorrect) {
                    opt.classList.add("is-wrong");
                }
            } else {
                // Apply temp selection visual before submission
                const tempSelected = lmsState.quiz.tempSelection;
                if (tempSelected === idx) {
                    opt.style.borderColor = "var(--blue)";
                    opt.style.background = "var(--white)";
                }
            }

            ansGrid.appendChild(opt);
        });

        // Handle submit/next visibility
        const submitBtn = document.getElementById("lmsQuizSubmitBtn");
        const nextBtn = document.getElementById("lmsQuizNextBtn");
        const prevBtn = document.getElementById("lmsQuizPrevBtn");
        const feedback = document.getElementById("lmsQuestionFeedback");

        prevBtn.disabled = qIndex === 0;

        if (savedSelection) {
            submitBtn.style.display = "none";
            nextBtn.style.display = "inline-flex";
            nextBtn.textContent = qIndex === 4 ? "Selesai" : "Lanjut";
            
            feedback.innerHTML = `<strong>${savedSelection.isCorrect ? "Benar!" : "Kurang Tepat."}</strong> ${q.explanation}`;
            feedback.classList.add("show");
        } else {
            submitBtn.style.display = "inline-flex";
            nextBtn.style.display = "none";
            
            // Disable submit until options are highlighted
            submitBtn.disabled = lmsState.quiz.tempSelection === undefined;
            
            feedback.classList.remove("show");
            feedback.innerHTML = "";
        }

        // Flag styling
        const flagBtn = document.getElementById("lmsQuizFlagBtn");
        flagBtn.textContent = lmsState.quiz.flagged[qIndex] ? "Batal Ragu" : "Ragu-ragu";
        flagBtn.style.background = lmsState.quiz.flagged[qIndex] ? "rgba(255, 209, 102, 0.2)" : "";

        // Reset helper buttons based on limits and states
        const hintBtn = document.getElementById("lmsQuizHintBtn");
        const fiftyBtn = document.getElementById("lmsQuizFiftyBtn");
        if (lmsState.quiz.mode === "practice") {
            hintBtn.disabled = savedSelection || lmsState.quiz.questions[qIndex].usedHint;
            fiftyBtn.disabled = savedSelection || lmsState.quiz.questions[qIndex].usedFifty;
        }

        // Sync AI Tutor Chat input suggestions
        if (lmsState.quiz.mode === "practice" && document.getElementById("lmsAiTutorContainer").classList.contains("open")) {
            renderAiTutorPromptChips();
        }
    } catch (err) {
        alert("CRITICAL ERROR in showLmsQuestion: " + err.message);
        console.error(err);
    }
}

function selectLmsChoiceOption(idx) {
    playSound('click');
    lmsState.quiz.tempSelection = idx;
    
    // Re-render
    showLmsQuestion();
}

function submitLmsAnswer() {
    const qIndex = lmsState.quiz.current;
    const q = lmsState.quiz.questions[qIndex];
    const choiceIdx = lmsState.quiz.tempSelection;

    if (choiceIdx === undefined) return;

    const chosenAns = q.shuffledAnswers[choiceIdx];
    const correctAns = q.shuffledAnswers[q.shuffledCorrect];
    const isCorrect = choiceIdx === q.shuffledCorrect;

    // Record answer
    lmsState.quiz.selected[qIndex] = {
        questionId: q.id,
        chosenText: chosenAns.text,
        correctText: correctAns.text,
        isCorrect: isCorrect
    };

    lmsState.quiz.tempSelection = undefined;

    if (isCorrect) {
        lmsState.quiz.streak++;
        playSound('success');
        // Confetti effect from homepage (reusing local confetti if present)
        if (typeof launchConfetti === 'function') {
            launchConfetti(8);
        }
    } else {
        lmsState.quiz.streak = 0;
        playSound('laser');
    }

    showLmsQuestion();
}

function toggleLmsQuizFlag() {
    playSound('click');
    const qIndex = lmsState.quiz.current;
    lmsState.quiz.flagged[qIndex] = !lmsState.quiz.flagged[qIndex];
    
    showLmsQuestion();
}

function triggerLmsHint() {
    const qIndex = lmsState.quiz.current;
    const q = lmsState.quiz.questions[qIndex];
    if (q.usedHint || lmsState.quiz.mode !== "practice") return;

    q.usedHint = true;
    playSound('click');
    
    const feedback = document.getElementById("lmsQuestionFeedback");
    feedback.innerHTML = `<strong>Hint Soal:</strong> ${q.hint}`;
    feedback.classList.add("show");

    document.getElementById("lmsQuizHintBtn").disabled = true;
}

function triggerLmsFifty() {
    const qIndex = lmsState.quiz.current;
    const q = lmsState.quiz.questions[qIndex];
    if (q.usedFifty || lmsState.quiz.mode !== "practice") return;

    q.usedFifty = true;
    playSound('click');

    const wrongIndexes = q.shuffledAnswers
        .map((ans, idx) => idx)
        .filter(idx => idx !== q.shuffledCorrect);

    // Pick 2 wrong answers to hide
    const randomHides = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
    
    randomHides.forEach(idx => {
        const optionEl = document.querySelector(`.answer-option[data-index="${idx}"]`);
        if (optionEl) {
            optionEl.style.opacity = "0.2";
            optionEl.disabled = true;
        }
    });

    document.getElementById("lmsQuizFiftyBtn").disabled = true;
}

// --- AI Tutor Panel Logic ---
function toggleAiTutorPanel() {
    playSound('click');
    const panel = document.getElementById("lmsAiTutorContainer");
    panel.classList.toggle("open");

    if (panel.classList.contains("open")) {
        // Clear old chats
        const chatHist = document.getElementById("lmsAiChatHistory");
        chatHist.innerHTML = `
            <div class="lms-ai-bubble tutor">
                Halo Coder! Saya asisten AI Tutor Anda. Ada kesulitan dengan soal nomor ${lmsState.quiz.current + 1}? Silakan pilih salah satu pertanyaan atau diskusikan konsepnya!
            </div>
        `;
        renderAiTutorPromptChips();
    }
}

function renderAiTutorPromptChips() {
    const footer = document.getElementById("lmsAiFooter");
    if (!footer) return;

    footer.innerHTML = `
        <button class="lms-ai-chip" onclick="askAiTutor('concept')">💡 Jelaskan konsep materi</button>
        <button class="lms-ai-chip" onclick="askAiTutor('hint')">🔍 Berikan petunjuk ekstra</button>
        <button class="lms-ai-chip" onclick="askAiTutor('distractor')">❌ Mengapa pilihan lain keliru?</button>
    `;
}

function askAiTutor(queryType) {
    playSound('click');
    const chatHist = document.getElementById("lmsAiChatHistory");
    const q = lmsState.quiz.questions[lmsState.quiz.current];

    // Append user question bubble
    let userMsg = "";
    if (queryType === 'concept') userMsg = "Jelaskan konsep dasar materi soal ini, Tutor!";
    if (queryType === 'hint') userMsg = "Tolong berikan petunjuk tambahan agar saya bisa memecahkan soal ini.";
    if (queryType === 'distractor') userMsg = "Mengapa pilihan jawaban pengecoh lainnya salah?";

    const studentBubble = document.createElement("div");
    studentBubble.className = "lms-ai-bubble student";
    studentBubble.textContent = userMsg;
    chatHist.appendChild(studentBubble);
    chatHist.scrollTop = chatHist.scrollHeight;

    // Show typing loader
    const loader = document.createElement("div");
    loader.className = "lms-ai-bubble tutor lms-ai-typing-loader";
    loader.innerHTML = "<span></span><span></span><span></span>";
    chatHist.appendChild(loader);
    chatHist.scrollTop = chatHist.scrollHeight;

    // Simulate thinking delay
    setTimeout(() => {
        loader.remove();

        let tutorMsg = "";
        if (queryType === 'concept') {
            tutorMsg = `Untuk memahami soal ini, kuncinya adalah memahami teori tentang ${q.category.toUpperCase()}.\n\nKonsep penting: ${q.explanation.split('.')[0]}.\n\nCobalah memahami logika tersebut dan temukan mana dari pilihan jawaban yang paling selaras dengan penjelasan ini!`;
        } else if (queryType === 'hint') {
            tutorMsg = `Tentu, perhatikan baik-baik petunjuk ini: "${q.hint}".\n\nPikirkan kembali skenario di dunia nyata yang sesuai dengan petunjuk tersebut. Mengeliminasi 2 jawaban yang paling tidak mungkin akan sangat membantu Anda menentukan pilihan!`;
        } else if (queryType === 'distractor') {
            tutorMsg = `Opsi pengecoh lainnya salah karena mereka biasanya menggambarkan fungsi yang berkebalikan, menggunakan terminologi yang salah, atau tidak relevan dengan kriteria dalam soal. Selalu pastikan jawaban yang Anda pilih menjawab langsung kata kunci dalam pertanyaan: "${q.question}"`;
        }

        const tutorBubble = document.createElement("div");
        tutorBubble.className = "lms-ai-bubble tutor";
        tutorBubble.innerHTML = tutorMsg.replace(/\n/g, "<br>");
        chatHist.appendChild(tutorBubble);
        chatHist.scrollTop = chatHist.scrollHeight;
    }, 1200);
}

// --- Finish Quiz Sesi & Result Renderer ---
function finishLmsQuiz(cheatFailed = false) {
    clearInterval(lmsState.quiz.timerId);
    lmsState.quiz.timerId = null;

    // Remove visibility listener
    document.removeEventListener("visibilitychange", handleLmsCheatDetection);
    document.removeEventListener("keydown", handleLmsQuizKeyboardInput);

    const main = document.getElementById("lmsClassroomMain");
    if (!main) return;

    let correctCount = 0;
    if (!cheatFailed) {
        lmsState.quiz.selected.forEach(ans => {
            if (ans && ans.isCorrect) correctCount++;
        });
    }

    const total = 5;
    const score = cheatFailed ? 0 : Math.round((correctCount / total) * 100);
    const passThreshold = 80;
    const isPassed = score >= passThreshold;

    // Update LMS Score DB if it's higher than previous score
    const scoreKey = `${lmsState.currentTrackId}_${lmsTracks.find(t => t.id === lmsState.currentTrackId).modules[lmsState.currentModuleIndex].id}_${lmsState.quiz.mode}`;
    const previousScore = lmsState.progress.quizScores[scoreKey] || 0;
    if (score > previousScore) {
        lmsState.progress.quizScores[scoreKey] = score;
        saveLmsProgress();
    }

    // Award XP via Coder RPG
    if (score > 0 && typeof addXp === 'function') {
        const xpReward = isPassed ? (score * 2) + 50 : (score * 2); // Bonus 50 XP if passed!
        addXp(xpReward);
    }

    // Sound effect
    if (isPassed) {
        playSound('success');
        if (typeof launchConfetti === 'function') launchConfetti(30);
    } else {
        playSound('alarm');
    }

    main.innerHTML = `
        <div class="lms-quiz-intro" style="animation: scoreBurst 0.5s ease both;">
            <span class="lms-quiz-icon">${isPassed ? '🎉' : '❌'}</span>
            <h1 class="lms-quiz-intro-title">${isPassed ? 'Selamat, Anda Lulus!' : 'Belum Lulus Kriteria'}</h1>
            <div class="result-score" style="font-size: 72px; margin: 10px 0; color: ${isPassed ? 'var(--green)' : 'var(--danger)'};">${score}%</div>
            
            <p class="lms-quiz-intro-desc" style="max-width: 580px;">
                ${cheatFailed 
                    ? "Sesi ujian Anda telah dibatalkan secara otomatis karena melanggar aturan tab switching sebanyak 3 kali." 
                    : isPassed 
                        ? `Luar biasa! Anda berhasil melampaui kriteria kelulusan 80% dengan menjawab ${correctCount} dari 5 soal secara tepat. Langkah ini telah dicentang dalam kurikulum.`
                        : `Anda berhasil menjawab ${correctCount} dari 5 soal secara tepat. Anda membutuhkan minimal skor 80% (4 benar) untuk menyelesaikan langkah ini. Pelajari kembali materi bacaan dan coba lagi!`
                }
            </p>

            <div class="panel-actions" style="justify-content: center; gap: 12px; margin-top: 24px;">
                <button class="btn btn-primary" onclick="restartLmsQuiz()">Ulangi Kuis</button>
                <button class="btn btn-ghost" onclick="selectStep(${lmsState.currentModuleIndex}, 'lecture')">Kembali ke Materi</button>
            </div>

            <!-- Review Kuis Ringkasan -->
            <div style="text-align: left; margin-top: 36px;">
                <h3 style="font-size: 18px; font-weight:900; margin-bottom: 16px;">Tinjauan Jawaban:</h3>
                <div class="review-list">
                    ${lmsState.quiz.questions.map((q, idx) => {
                        const ans = lmsState.quiz.selected[idx];
                        const isAnsCorrect = ans && ans.isCorrect;
                        
                        return `
                            <div class="review-item ${isAnsCorrect ? 'is-correct' : 'is-wrong'}" style="margin-bottom: 12px; padding: 16px; border-radius:18px;">
                                <strong>Soal ${idx + 1}: ${q.question}</strong>
                                <small style="display: block; margin-top: 8px; line-height: 1.5; color: var(--muted); font-size:12px;">
                                    Jawaban Anda: ${ans ? ans.chosenText : 'Tidak dijawab'}<br>
                                    Jawaban Benar: ${q.shuffledAnswers[q.shuffledCorrect].text}<br>
                                    <span style="color: var(--dark); font-weight:800; display:block; margin-top:4px;">Penjelasan: ${q.explanation}</span>
                                </small>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        </div>
    `;

    renderOutlineSidebar();
}

function restartLmsQuiz() {
    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    const mod = track.modules[lmsState.currentModuleIndex];
    startLmsQuizSession(mod, lmsState.currentStepType);
}

// --- Digital Certificate and Badge System ---
function unlockTrackBadge(trackId) {
    if (lmsState.progress.unlockedBadges.includes(trackId)) return;

    lmsState.progress.unlockedBadges.push(trackId);
    saveLmsProgress();
    updateBadgesCabinet();

    // Trigger floating notification using RPG engine achievement helper
    const track = lmsTracks.find(t => t.id === trackId);
    if (typeof unlockAchievement === 'function') {
        // Unlock custom local achievement
        unlockAchievement('level_legend'); // reuse existing or customize
    }

    // Award big XP
    if (typeof addXp === 'function') {
        addXp(150); // Big bonus for completing track!
    }
}

function updateBadgesCabinet() {
    const grid = document.getElementById("lmsBadgeCabinetGrid");
    if (!grid) return;

    grid.innerHTML = lmsTracks.map(track => {
        const isUnlocked = lmsState.progress.unlockedBadges.includes(track.id);
        const progress = calculateTrackProgress(track.id);
        
        return `
            <div class="lms-badge-slot ${isUnlocked ? 'unlocked' : ''}" onclick="${isUnlocked ? `showCertificate('${track.id}')` : ''}">
                <span class="lms-badge-icon">${track.badgeIcon}</span>
                <span class="lms-badge-tooltip">
                    ${isUnlocked 
                        ? `KLIK: Klaim Sertifikat ${track.badgeName}` 
                        : `${track.badgeName}: Selesaikan Jalur (${progress.percent}%)`
                    }
                </span>
            </div>
        `;
    }).join("");
}

function showCertificate(trackId) {
    const track = lmsTracks.find(t => t.id === trackId);
    if (!track) return;

    // Check if modal exists in DOM, if not create it
    let modal = document.getElementById("lmsCertificateModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.className = "lms-modal";
        modal.id = "lmsCertificateModal";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="lms-modal-content">
            <div class="lms-modal-header">
                <h3 class="lms-modal-title">Graduation Credentials</h3>
                <button class="lms-modal-close" onclick="closeCertificateModal()">×</button>
            </div>
            <div class="lms-modal-body">
                <div class="lms-cert-input-row">
                    <label for="lmsCertStudentName">Nama Lengkap Penerima:</label>
                    <input type="text" id="lmsCertStudentName" value="${lmsState.progress.userName}" placeholder="Ketik nama Anda di sini..." oninput="updateCertificateName(this.value)">
                </div>

                <div class="lms-cert-frame" id="printableCertArea">
                    <div class="lms-cert-kicker">Universe Of Tech Academy</div>
                    <h1 class="lms-cert-header">CERTIFICATE OF COMPLETION</h1>
                    <p class="lms-cert-text">Dengan bangga mempersembahkan sertifikat kelulusan kepada:</p>
                    
                    <div class="lms-cert-name" id="lmsCertDisplayName">${lmsState.progress.userName}</div>
                    
                    <p class="lms-cert-text">yang telah berhasil menuntaskan dan lulus seluruh kurikulum akademis pada:</p>
                    <div class="lms-cert-course">${track.title}</div>
                    
                    <div class="lms-cert-seal-row">
                        <div class="lms-cert-sig">
                            <div class="lms-cert-sig-line">Zaki AI</div>
                            CEO & AI Instructor
                        </div>
                        <div class="lms-cert-seal"></div>
                        <div class="lms-cert-sig">
                            <div class="lms-cert-sig-line">${new Date().toLocaleDateString('id-ID')}</div>
                            Tanggal Kelulusan
                        </div>
                    </div>
                    
                    <div class="lms-cert-meta">
                        Verification ID: UOT-${trackId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)} • Verified Academic Honor
                    </div>
                </div>

                <div class="panel-actions" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="btn btn-ghost" onclick="closeCertificateModal()">Tutup</button>
                    <button class="btn btn-primary" onclick="printCertificate()"><i class="fa-solid fa-print"></i> Cetak / Simpan ke PDF</button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("show");
}

function updateCertificateName(name) {
    const cleanName = name.trim() || "Developer Indonesia";
    lmsState.progress.userName = cleanName;
    saveLmsProgress();

    const display = document.getElementById("lmsCertDisplayName");
    if (display) display.textContent = cleanName;
}

function printCertificate() {
    playSound('click');
    window.print();
}

function closeCertificateModal() {
    playSound('click');
    const modal = document.getElementById("lmsCertificateModal");
    if (modal) modal.classList.remove("show");
}

// --- Study Notes Widget Logic ---
function initNotesWidget() {
    const textarea = document.getElementById("lmsNotesTextarea");
    if (!textarea) return;

    let debounceTimer;
    textarea.addEventListener("input", () => {
        const indicator = document.getElementById("notesSaveIndicator");
        if (indicator) {
            indicator.textContent = "Menyimpan...";
            indicator.style.opacity = "1";
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            saveModuleNotes();
            if (indicator) {
                indicator.textContent = "Tersimpan";
                setTimeout(() => {
                    indicator.style.opacity = "0";
                }, 1500);
            }
        }, 1000);
    });
}

function loadModuleNotes() {
    const textarea = document.getElementById("lmsNotesTextarea");
    if (!textarea || !lmsState.currentTrackId) return;

    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    const mod = track.modules[lmsState.currentModuleIndex];
    const key = `lms_notes_${lmsState.currentTrackId}_${mod.id}`;
    
    textarea.value = localStorage.getItem(key) || "";
}

function saveModuleNotes() {
    const textarea = document.getElementById("lmsNotesTextarea");
    if (!textarea || !lmsState.currentTrackId) return;

    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    const mod = track.modules[lmsState.currentModuleIndex];
    const key = `lms_notes_${lmsState.currentTrackId}_${mod.id}`;
    
    localStorage.setItem(key, textarea.value);
}

// --- Button Listeners (Classroom Mode) ---
function setupLmsEventListeners() {
    // Back to tracks button
    const backBtn = document.getElementById("lmsBackTracks");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (lmsState.quiz.timerId) {
                if (!confirm("Kuis sedang aktif berjalan. Kembali sekarang akan membatalkan kuis ini. Apakah Anda yakin?")) {
                    return;
                }
                clearInterval(lmsState.quiz.timerId);
                lmsState.quiz.timerId = null;
            }
            
            playSound('click');
            lmsState.currentTrackId = null;
            
            // Re-render tracks to reflect fresh progress pct
            renderTrackCards();
            
            document.getElementById("classroomView").style.display = "none";
            document.getElementById("tracksView").style.display = "block";
        });
    }
}

// --- Attach functions globally for inline HTML events ---
window.askAiTutor = askAiTutor;
window.restartLmsQuiz = restartLmsQuiz;
window.selectStep = selectStep;
window.closeCertificateModal = closeCertificateModal;
window.printCertificate = printCertificate;
window.updateCertificateName = updateCertificateName;
window.showCertificate = showCertificate;

// Initialize on Script load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLms);
} else {
    initLms();
}
