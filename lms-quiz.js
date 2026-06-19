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
    },
    {
        id: "programming-algorithm",
        title: "Programming & Algorithm Explorer",
        badge: "Code Explorer",
        description: "Bangun fondasi coding yang kuat lewat logika pemrograman, struktur data, algoritma, debugging, dan clean code sebelum melangkah ke proyek yang lebih kompleks.",
        color: "#f59e0b",
        badgeIcon: "💻",
        badgeName: "Logic Crafter",
        badgeDesc: "Menyelesaikan Jalur Programming & Algorithm",
        modules: [
            {
                id: "programming-logic",
                title: "Logika, Variabel & Control Flow",
                lecture: {
                    title: "Menyusun Logika Program yang Mudah Dipahami",
                    category: "Programming",
                    readTime: "5 menit baca",
                    content: `
                        <p>Program adalah rangkaian instruksi yang mengubah input menjadi output. Fondasinya terdiri dari variabel untuk menyimpan nilai, operator untuk mengolahnya, dan control flow untuk menentukan instruksi mana yang dijalankan.</p>
                        <h3>Tiga Struktur Dasar Program</h3>
                        <ul>
                            <li><strong>Sequence</strong>: instruksi berjalan berurutan dari atas ke bawah.</li>
                            <li><strong>Selection</strong>: percabangan seperti <code>if</code> memilih aksi berdasarkan kondisi.</li>
                            <li><strong>Iteration</strong>: perulangan menjalankan pola yang sama secara efisien.</li>
                        </ul>
                        <div class="lms-callout tip"><strong>Tips:</strong> Tulis solusi dalam bentuk pseudocode terlebih dahulu agar fokus pada logika, bukan sintaks bahasa.</div>
                    `
                },
                quiz: {
                    category: "programming",
                    difficulty: "easy",
                    limit: 5,
                    title: "Kuis Logika Pemrograman"
                }
            },
            {
                id: "data-structures",
                title: "Data Structures Essentials",
                lecture: {
                    title: "Memilih Struktur Data yang Tepat",
                    category: "Programming",
                    readTime: "7 menit baca",
                    content: `
                        <p>Struktur data menentukan bagaimana informasi disimpan, diakses, dan diubah. Pemilihan struktur yang tepat membuat program lebih sederhana sekaligus lebih cepat.</p>
                        <h3>Struktur yang Sering Digunakan</h3>
                        <ul>
                            <li><strong>Array/List</strong> untuk kumpulan berurutan.</li>
                            <li><strong>Stack</strong> untuk pola Last In First Out seperti undo.</li>
                            <li><strong>Queue</strong> untuk antrean First In First Out.</li>
                            <li><strong>Map/Object</strong> untuk pencarian berdasarkan pasangan key dan value.</li>
                        </ul>
                        <div class="lms-callout important"><strong>Prinsip:</strong> Jangan memilih struktur data hanya karena familiar. Pertimbangkan pola baca, tulis, pencarian, dan penghapusan datanya.</div>
                    `
                },
                quiz: {
                    category: "programming",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis Struktur Data"
                }
            },
            {
                id: "algorithm-debugging",
                title: "Algorithms, Complexity & Debugging",
                lecture: {
                    title: "Membuat Solusi Efisien dan Menemukan Bug",
                    category: "Programming",
                    readTime: "8 menit baca",
                    content: `
                        <p>Algoritma yang benar belum tentu efisien. Big O membantu memperkirakan pertumbuhan waktu dan memori ketika ukuran input membesar, sedangkan debugging membantu menemukan penyebab ketika hasil program tidak sesuai harapan.</p>
                        <h3>Alur Debugging Praktis</h3>
                        <ol>
                            <li>Reproduksi masalah secara konsisten.</li>
                            <li>Persempit area penyebab dengan log atau breakpoint.</li>
                            <li>Uji asumsi menggunakan input kecil dan edge case.</li>
                            <li>Perbaiki akar masalah lalu tambahkan pengujian regresi.</li>
                        </ol>
                        <div class="lms-callout warning"><strong>Ingat:</strong> Optimasi dilakukan setelah solusi benar dan bottleneck sudah diukur, bukan hanya berdasarkan dugaan.</div>
                    `
                },
                quiz: {
                    category: "programming",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Algoritma & Debugging"
                }
            },
            {
                id: "clean-code",
                title: "Clean Code & Software Quality",
                lecture: {
                    title: "Menulis Kode yang Mudah Dirawat",
                    category: "Programming",
                    readTime: "6 menit baca",
                    content: `
                        <p>Kode lebih sering dibaca daripada ditulis. Nama yang jelas, fungsi kecil dengan satu tanggung jawab, dan pengujian yang tepat membuat perubahan fitur lebih aman.</p>
                        <h3>Kebiasaan Clean Code</h3>
                        <ul>
                            <li>Gunakan nama yang menjelaskan maksud.</li>
                            <li>Hindari duplikasi logika yang rawan tidak sinkron.</li>
                            <li>Pisahkan aturan bisnis dari detail tampilan.</li>
                            <li>Tulis komentar untuk alasan keputusan, bukan mengulang isi kode.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "programming",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis Clean Code"
                }
            }
        ]
    },
    {
        id: "data-analytics",
        title: "Data Analytics & Product Insight",
        badge: "Data Explorer",
        description: "Ubah data mentah menjadi keputusan melalui statistik dasar, visualisasi, KPI, funnel analysis, eksperimen, dan cara membaca insight tanpa terjebak kesimpulan palsu.",
        color: "#ec4899",
        badgeIcon: "📊",
        badgeName: "Insight Hunter",
        badgeDesc: "Menyelesaikan Jalur Data Analytics & Product Insight",
        modules: [
            {
                id: "analytics-foundation",
                title: "Data & Statistics Foundation",
                lecture: {
                    title: "Membaca Distribusi Data dengan Benar",
                    category: "Business Analytics",
                    readTime: "6 menit baca",
                    content: `
                        <p>Analisis dimulai dari memahami kualitas dan bentuk data. Mean, median, persentil, distribusi, dan outlier memberi sudut pandang berbeda terhadap perilaku pengguna atau performa bisnis.</p>
                        <h3>Pertanyaan Sebelum Menghitung</h3>
                        <ul>
                            <li>Dari mana data berasal dan siapa yang tidak terwakili?</li>
                            <li>Apakah ada nilai kosong, duplikat, atau format yang tidak konsisten?</li>
                            <li>Apakah rata-rata menyembunyikan segmen atau nilai ekstrem?</li>
                        </ul>
                        <div class="lms-callout important"><strong>Waspada:</strong> Data yang rapi belum tentu bebas bias. Selalu periksa proses pengumpulan dan definisi metrik.</div>
                    `
                },
                quiz: {
                    category: "analytics",
                    difficulty: "easy",
                    limit: 5,
                    title: "Kuis Fondasi Analitik"
                }
            },
            {
                id: "data-visualization",
                title: "Data Visualization & Storytelling",
                lecture: {
                    title: "Memilih Grafik yang Menjelaskan, Bukan Menghias",
                    category: "Business Analytics",
                    readTime: "6 menit baca",
                    content: `
                        <p>Visualisasi yang baik mempercepat pemahaman. Gunakan line chart untuk tren waktu, bar chart untuk perbandingan kategori, scatter plot untuk hubungan dua variabel, dan pie chart hanya untuk komposisi sederhana.</p>
                        <h3>Prinsip Cerita Data</h3>
                        <ul>
                            <li>Mulai dari pertanyaan dan audiens.</li>
                            <li>Tampilkan konteks, pembanding, serta periode waktu.</li>
                            <li>Gunakan warna untuk menyorot informasi penting.</li>
                            <li>Tutup dengan implikasi atau tindakan yang disarankan.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "analytics",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis Visualisasi Data"
                }
            },
            {
                id: "product-metrics",
                title: "KPI, Funnel & Product Metrics",
                lecture: {
                    title: "Mengukur Perjalanan Pengguna dan Nilai Bisnis",
                    category: "Business Analytics",
                    readTime: "7 menit baca",
                    content: `
                        <p>KPI yang berguna harus terkait tujuan. Funnel menunjukkan pengguna yang bergerak dari kunjungan hingga konversi, retention mengukur siapa yang kembali, sedangkan LTV dan CAC membantu menilai kesehatan model bisnis.</p>
                        <h3>Contoh Funnel Produk</h3>
                        <ol>
                            <li>Pengguna mengunjungi halaman.</li>
                            <li>Pengguna mendaftar.</li>
                            <li>Pengguna menyelesaikan aktivitas utama.</li>
                            <li>Pengguna kembali dan menjadi pelanggan.</li>
                        </ol>
                        <div class="lms-callout tip"><strong>Tips:</strong> Segmentasikan funnel berdasarkan sumber trafik, perangkat, atau kelompok pengguna untuk menemukan masalah yang tersembunyi.</div>
                    `
                },
                quiz: {
                    category: "analytics",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis KPI & Funnel"
                }
            },
            {
                id: "experiments-insight",
                title: "Experiments & Predictive Insight",
                lecture: {
                    title: "Membedakan Korelasi, Kausalitas, dan Prediksi",
                    category: "Business Analytics",
                    readTime: "8 menit baca",
                    content: `
                        <p>Korelasi menunjukkan dua variabel bergerak bersama, tetapi tidak membuktikan bahwa satu variabel menyebabkan yang lain. Eksperimen terkontrol membantu menguji kausalitas, sedangkan predictive analytics memakai pola historis untuk memperkirakan hasil masa depan.</p>
                        <h3>Eksperimen yang Sehat</h3>
                        <ul>
                            <li>Tentukan hipotesis dan metrik utama sebelum eksperimen.</li>
                            <li>Bagi kelompok secara acak dan hindari perubahan lain selama tes.</li>
                            <li>Gunakan ukuran sampel serta durasi yang memadai.</li>
                            <li>Periksa dampak samping, bukan hanya kenaikan satu metrik.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "analytics",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Eksperimen & Prediksi"
                }
            }
        ]
    },
    {
        id: "fullstack-builder",
        title: "Full-Stack App Builder Path",
        badge: "Project Builder",
        description: "Satukan frontend, logika aplikasi, API, database, keamanan, dan performa menjadi satu jalur proyek untuk memahami alur aplikasi modern dari browser hingga data.",
        color: "#06b6d4",
        badgeIcon: "🚀",
        badgeName: "App Architect",
        badgeDesc: "Menyelesaikan Jalur Full-Stack App Builder",
        modules: [
            {
                id: "app-architecture",
                title: "App Architecture & HTTP",
                lecture: {
                    title: "Memahami Alur Browser, Server, API, dan Database",
                    category: "Web Development",
                    readTime: "6 menit baca",
                    content: `
                        <p>Aplikasi full-stack menghubungkan antarmuka di browser dengan server yang menjalankan aturan bisnis dan database yang menyimpan informasi. Keduanya berkomunikasi melalui request dan response HTTP.</p>
                        <h3>Alur Sebuah Fitur</h3>
                        <ol>
                            <li>Pengguna melakukan aksi pada antarmuka.</li>
                            <li>Frontend mengirim request ke endpoint API.</li>
                            <li>Server memvalidasi input dan menjalankan aturan bisnis.</li>
                            <li>Database membaca atau menyimpan data.</li>
                            <li>Respons dikirim kembali dan UI diperbarui.</li>
                        </ol>
                    `
                },
                quiz: {
                    category: "web",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis Arsitektur Aplikasi"
                }
            },
            {
                id: "api-state",
                title: "API, Async Flow & State",
                lecture: {
                    title: "Mengelola Data Asinkron Tanpa Membingungkan Pengguna",
                    category: "Programming",
                    readTime: "7 menit baca",
                    content: `
                        <p>Request jaringan membutuhkan waktu dan dapat gagal. Karena itu aplikasi perlu mengelola state loading, success, empty, dan error secara eksplisit agar antarmuka tetap responsif.</p>
                        <h3>Checklist Integrasi API</h3>
                        <ul>
                            <li>Validasi status respons sebelum membaca data.</li>
                            <li>Tampilkan indikator loading dan pesan error yang berguna.</li>
                            <li>Batalkan request yang sudah tidak relevan bila diperlukan.</li>
                            <li>Jangan menaruh secret key di kode frontend.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "programming",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis API & Async Flow"
                }
            },
            {
                id: "data-layer",
                title: "Data Modeling & Transactions",
                lecture: {
                    title: "Merancang Lapisan Data yang Konsisten",
                    category: "Database & SQL",
                    readTime: "7 menit baca",
                    content: `
                        <p>Model data yang baik mewakili hubungan nyata antarinformasi. Primary key menjaga identitas, foreign key menjaga relasi, dan transaksi memastikan serangkaian perubahan berhasil seluruhnya atau dibatalkan.</p>
                        <h3>Contoh pada Aplikasi Kuis</h3>
                        <ul>
                            <li>Tabel pengguna menyimpan profil.</li>
                            <li>Tabel sesi menyimpan waktu dan skor.</li>
                            <li>Tabel jawaban menghubungkan sesi dengan soal.</li>
                            <li>Index mempercepat pencarian riwayat pengguna.</li>
                        </ul>
                    `
                },
                quiz: {
                    category: "database",
                    difficulty: "medium",
                    limit: 5,
                    title: "Kuis Lapisan Data"
                }
            },
            {
                id: "ship-secure-app",
                title: "Security, Testing & Performance",
                lecture: {
                    title: "Menyiapkan Aplikasi yang Layak Dirilis",
                    category: "Cyber Security",
                    readTime: "8 menit baca",
                    content: `
                        <p>Sebelum dirilis, aplikasi harus memvalidasi input di server, membatasi hak akses, melindungi sesi, menguji alur kritis, dan mengukur performa nyata.</p>
                        <h3>Release Checklist</h3>
                        <ul>
                            <li>Gunakan HTTPS dan penyimpanan password berbasis hashing kuat.</li>
                            <li>Uji autentikasi, otorisasi, dan penanganan input berbahaya.</li>
                            <li>Tambahkan logging tanpa membocorkan data sensitif.</li>
                            <li>Optimalkan aset dan ukur Core Web Vitals.</li>
                        </ul>
                        <div class="lms-callout warning"><strong>Penting:</strong> Keamanan bukan fitur tambahan di akhir proyek. Ia perlu dipikirkan pada setiap lapisan aplikasi.</div>
                    `
                },
                quiz: {
                    category: "cyber",
                    difficulty: "hard",
                    limit: 5,
                    title: "Kuis Security & Release"
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
        mode: "practice", // "practice" or "challenge"
        lastRenderedIndex: -1
    }
};

const LMS_STORAGE_KEY = "eduquestLmsProgress";

// --- Initialization ---
function initLms() {
    loadLmsProgress();
    renderTabs();
    renderTrackCards();
    updateBadgesCabinet();
    restoreLmsReturnContext();
    openRequestedTrack();
}

function loadLmsProgress() {
    const parsed = window.QuizNation?.storage.read(localStorage, LMS_STORAGE_KEY, {});
    lmsState.progress = window.QuizNation?.sanitize.lmsProgress(parsed) || lmsState.progress;
    
    // Sync with active session username if it is available
    const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
    if (session && session.username && (!lmsState.progress.userName || lmsState.progress.userName === "Developer Indonesia")) {
        lmsState.progress.userName = session.username;
    }
}

function saveLmsProgress() {
    lmsState.progress = window.QuizNation?.sanitize.lmsProgress(lmsState.progress) || lmsState.progress;
    window.QuizNation?.storage.write(localStorage, LMS_STORAGE_KEY, lmsState.progress);
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
            <div class="lms-global-stats">
                <div class="lms-stat-line">
                    <span class="lms-stat-label">Materi Selesai</span>
                    <strong class="lms-stat-value green">${totalLecturesRead} 📄</strong>
                </div>
                <div class="lms-stat-line">
                    <span class="lms-stat-label">Kuis Lulus</span>
                    <strong class="lms-stat-value blue">${totalQuizzesPassed} ✍️</strong>
                </div>
                <div class="lms-stat-line">
                    <span class="lms-stat-label">Sertifikat Diraih</span>
                    <strong class="lms-stat-value purple">${totalBadges} 🏆</strong>
                </div>
            </div>

            <div class="lms-tracks-grid" id="tracksGrid"></div>
        </div>
        <div class="lms-classroom" id="classroomView" style="display: none;">
            <!-- Outline Sidebar -->
            <aside class="lms-sidebar-outline">
                <div class="lms-sidebar-header">
                    <button class="lms-back-tracks-btn" id="lmsBackTracks"><i class="fa-solid fa-arrow-left"></i> Kembali ke Jalur</button>
                    <span class="lms-roadmap-kicker"><i class="fa-solid fa-route"></i> Learning roadmap</span>
                    <h2 class="lms-syllabus-title" id="lmsSidebarTrackTitle">Syllabus</h2>
                    <div class="lms-sidebar-progress">
                        <div class="lms-sidebar-progress-text">
                            <span>Progres jalur</span>
                            <span id="lmsSidebarProgressPct">0%</span>
                        </div>
                        <div class="lms-sidebar-progress-bar">
                            <div class="lms-sidebar-progress-fill" id="lmsSidebarProgressFill"></div>
                        </div>
                        <div class="lms-progress-caption"><i class="fa-solid fa-circle-check"></i> Progres tersimpan otomatis</div>
                    </div>
                </div>
                <div class="lms-syllabus-tree" id="lmsSyllabusTree"></div>
                <button class="btn btn-danger" id="lmsResetOutlineBtn" style="margin-top: 14px; min-height:36px; font-size:11px; padding: 8px 12px; border-radius:12px; width: 100%;">✕ Reset Progres Jalur</button>
            </aside>
            
            <!-- Main Panel -->
            <div class="lms-classroom-main" id="lmsClassroomMain"></div>

            <!-- Right Sidebar Info (Combined Tool Card) -->
            <aside class="lms-right-sidebar">
                <div class="lms-tools-widget">
                    <div class="lms-tools-nav">
                        <button class="lms-tool-tab active" onclick="switchSidebarTool('badges')" id="toolTabBadges" type="button"><i class="fa-solid fa-trophy"></i> Lencana</button>
                        <button class="lms-tool-tab" onclick="switchSidebarTool('notes')" id="toolTabNotes" type="button"><i class="fa-solid fa-note-sticky"></i> Catatan</button>
                    </div>
                    <div class="lms-tool-pane" id="toolPaneBadges">
                        <div class="lms-badge-grid" id="lmsBadgeCabinetGrid"></div>
                    </div>
                    <div class="lms-tool-pane" id="toolPaneNotes" style="display: none;">
                        <div class="lms-notes-header">
                            <span class="lms-notes-save-indicator" id="notesSaveIndicator">Tersimpan</span>
                        </div>
                        <textarea class="lms-notes-textarea" id="lmsNotesTextarea" maxlength="5000" placeholder="Tulis catatan penting, rumus, atau konsep penting di sini..."></textarea>
                    </div>
                </div>
            </aside>
        </div>
    `;

    // Render Track cards dynamically
    const grid = document.getElementById("tracksGrid");
    if (!grid) return;

    grid.innerHTML = lmsTracks.map(track => {
        const progressInfo = calculateTrackProgress(track.id);
        const isCompleted = isTrackCertificateEligible(track.id);
        const hasFinishedJourney = progressInfo.percent === 100;
        const certificateLabel = isCompleted
            ? "Unduh Sertifikat"
            : hasFinishedJourney
                ? "Remedial Kuis"
                : `Terkunci ${progressInfo.percent}%`;
        const certificateAria = isCompleted
            ? `Unduh sertifikat ${track.title}`
            : hasFinishedJourney
                ? `Sertifikat ${track.title} terkunci sampai rata-rata kuis setiap milestone minimal 80`
                : `Sertifikat ${track.title} terkunci, progres ${progressInfo.percent}%`;
        
        return `
            <div class="lms-track-card ${getTrackClass(track.id)}" data-track-id="${track.id}" role="button" tabindex="0">
                <div class="lms-track-badge">${track.badge}</div>
                <h3 class="lms-track-title-text">${track.title}</h3>
                <p class="lms-track-description">${track.description}</p>
                <div class="lms-track-meta">
                    <span class="lms-track-modules-count">
                        📚 ${track.modules.length} Modul 
                        • ${isCompleted ? "Completed" : progressInfo.percent + "% Progress"}
                    </span>
                    <div class="lms-track-actions">
                        <span class="lms-track-btn" style="background: ${track.color};">${progressInfo.percent > 0 ? "Lanjut Belajar" : "Mulai Belajar"}</span>
                        <button class="lms-track-certificate-btn ${isCompleted ? "is-ready" : ""}" type="button"
                            data-download-certificate="${track.id}" ${isCompleted ? "" : "disabled"}
                            aria-label="${certificateAria}">
                            <i class="fa-solid ${isCompleted ? "fa-download" : "fa-lock"}"></i>
                            ${certificateLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
    grid.addEventListener("click", (event) => {
        const certificateButton = event.target.closest("[data-download-certificate]");
        if (certificateButton) {
            event.stopPropagation();
            if (!certificateButton.disabled) showCertificate(certificateButton.dataset.downloadCertificate);
            return;
        }
        const card = event.target.closest("[data-track-id]");
        if (card) openTrackPage(card.dataset.trackId);
    });
    grid.addEventListener("keydown", (event) => {
        if (event.target.closest("button, a, input, textarea, select")) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest("[data-track-id]");
        if (!card) return;
        event.preventDefault();
        openTrackPage(card.dataset.trackId);
    });
    setupLmsEventListeners();
    initNotesWidget();
}

function openTrackPage(trackId) {
    const isStandalone = document.body.dataset.page === "learning-path";
    if (isStandalone) {
        enterTrack(trackId);
        window.history.replaceState({}, "", `learning-path.html?track=${encodeURIComponent(trackId)}`);
        return;
    }
    window.location.href = `learning-path.html?track=${encodeURIComponent(trackId)}`;
}

function openRequestedTrack() {
    if (document.body.dataset.page !== "learning-path") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("lmsReturn") === "1") return;
    const requestedTrackId = params.get("track");
    const storedTrackId = localStorage.getItem("eduquestLastLmsTrack");
    const trackId = lmsTracks.some(track => track.id === requestedTrackId)
        ? requestedTrackId
        : lmsTracks.some(track => track.id === storedTrackId)
            ? storedTrackId
            : lmsTracks[0]?.id;
    if (!trackId) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Data jalur belajar tidak tersedia.", "warning");
        }
        return;
    }
    if (trackId !== requestedTrackId) {
        window.history.replaceState({}, "", `learning-path.html?track=${encodeURIComponent(trackId)}`);
        if (requestedTrackId && typeof window.showQuizToast === "function") {
            window.showQuizToast("Jalur tidak ditemukan. Membuka jalur belajar terakhir yang tersedia.", "warning");
        }
    }
    enterTrack(trackId);
}

function getTrackClass(trackId) {
    if (trackId === "web-dev") return "track-web";
    if (trackId === "database-sql") return "track-db";
    if (trackId === "cyber-ui") return "track-cyber";
    if (trackId === "programming-algorithm") return "track-code";
    if (trackId === "data-analytics") return "track-data";
    return "track-fullstack";
}

function getReadTimeLabel(baseText, extraMinutes = 0) {
    const baseMinutes = Number(String(baseText).match(/\d+/)?.[0] || 5);
    return `${baseMinutes + extraMinutes} menit baca`;
}

function getModuleLessons(mod) {
    if (mod._lessonSteps) return mod._lessonSteps;
    mod._lessonSteps = [
        {
            id: "lesson-core",
            kind: "lesson",
            title: "Materi Inti",
            shortLabel: "Materi 1",
            xp: 15,
            lesson: mod.lecture
        },
        {
            id: "lesson-lab",
            kind: "lesson",
            title: "Materi Praktik",
            shortLabel: "Materi 2",
            xp: 15,
            lesson: {
                title: `Blueprint Praktik ${mod.title}`,
                category: mod.lecture.category,
                readTime: getReadTimeLabel(mod.lecture.readTime, 2),
                content: `
                    <p>Materi lanjutan ini membantu Anda mengubah teori <strong>${mod.title}</strong> menjadi pola kerja yang lebih praktis. Fokusnya adalah bagaimana konsep inti dari pembahasan sebelumnya dipakai saat menyusun solusi nyata.</p>

                    <h3>Tujuan Materi Praktik</h3>
                    <ul>
                        <li>Memecah topik menjadi langkah implementasi yang bisa diulang.</li>
                        <li>Mengidentifikasi keputusan teknis yang paling sering diambil saat mengerjakan tugas nyata.</li>
                        <li>Membuat checklist kecil agar hasil kerja tetap konsisten dari awal sampai akhir.</li>
                    </ul>

                    <div class="lms-callout tip">
                        <strong>Tips Praktik:</strong>
                        Saat mempelajari <code>${mod.title}</code>, biasakan membuat mini proyek, mencatat asumsi, dan menulis alasan di balik keputusan yang Anda ambil.
                    </div>

                    <h3>Rangka Kerja 3 Langkah</h3>
                    <ol>
                        <li><strong>Pahami tujuan</strong>: tentukan hasil apa yang ingin dicapai dari topik ini.</li>
                        <li><strong>Bangun versi sederhana</strong>: mulai dari implementasi minimal yang benar dulu.</li>
                        <li><strong>Refine</strong>: optimasi, rapikan struktur, lalu evaluasi kualitas akhir.</li>
                    </ol>

                    <pre><code class="language-javascript">const learningBlueprint = {
  topic: "${mod.title}",
  objective: "Memahami konsep lalu mengubahnya menjadi implementasi",
  workflow: ["Plan", "Build", "Review"]
};

console.log("Blueprint belajar aktif:", learningBlueprint);</code></pre>
                `
            }
        },
        {
            id: "lesson-case",
            kind: "lesson",
            title: "Materi Studi Kasus",
            shortLabel: "Materi 3",
            xp: 15,
            lesson: {
                title: `Studi Kasus & Quality Review ${mod.title}`,
                category: mod.lecture.category,
                readTime: getReadTimeLabel(mod.lecture.readTime, 3),
                content: `
                    <p>Pada materi ketiga, kita menilai bagaimana <strong>${mod.title}</strong> diterapkan dalam konteks yang lebih dekat dengan workflow profesional: ada tujuan, ada batasan, dan ada standar kualitas yang harus dipenuhi.</p>

                    <h3>Studi Kasus Ringkas</h3>
                    <p>Bayangkan Anda diminta menyelesaikan tugas yang berkaitan dengan <strong>${mod.title}</strong>. Bukan hanya solusi yang dicari, tetapi juga konsistensi, keterbacaan, keamanan, dan pengalaman pengguna.</p>

                    <h3>Checklist Review</h3>
                    <ul>
                        <li>Apakah implementasi sudah benar secara konsep?</li>
                        <li>Apakah strukturnya mudah dibaca dan dijelaskan ke orang lain?</li>
                        <li>Apakah ada sisi performa, aksesibilitas, atau maintainability yang bisa diperbaiki?</li>
                    </ul>

                    <div class="lms-callout important">
                        <strong>Checkpoint Kualitas:</strong>
                        Sebelum lanjut ke kuis akhir, pastikan Anda mampu menjelaskan <code>${mod.lecture.title}</code> dengan kata-kata sendiri, bukan hanya menghafal istilahnya.
                    </div>

                    <pre><code class="language-text">Case Review:
- Topik: ${mod.title}
- Fokus utama: kualitas implementasi
- Outcome: solusi yang benar, rapi, dan mudah dikembangkan</code></pre>
                `
            }
        }
    ];
    return mod._lessonSteps;
}

function getModuleQuizzes(mod) {
    if (mod._quizSteps) return mod._quizSteps;
    const baseDifficulty = mod.quiz.difficulty || "medium";
    const reviewDifficulty = baseDifficulty === "easy" ? "medium" : baseDifficulty;
    const challengeDifficulty = baseDifficulty === "easy" ? "medium" : "hard";
    mod._quizSteps = [
        {
            id: "practice",
            kind: "quiz",
            title: "Kuis Latihan",
            sessionTitle: `${mod.title} - Kuis Latihan`,
            mode: "practice",
            xp: 20,
            passThreshold: 80,
            category: mod.quiz.category,
            difficulty: baseDifficulty
        },
        {
            id: "review",
            kind: "quiz",
            title: "Kuis Review",
            sessionTitle: `${mod.title} - Kuis Review`,
            mode: "practice",
            xp: 25,
            passThreshold: 80,
            category: mod.quiz.category,
            difficulty: reviewDifficulty
        },
        {
            id: "challenge",
            kind: "quiz",
            title: "Ujian Tantangan",
            sessionTitle: `${mod.title} - Ujian Tantangan`,
            mode: "challenge",
            xp: 30,
            passThreshold: 80,
            category: mod.quiz.category,
            difficulty: challengeDifficulty
        },
        {
            id: "mastery",
            kind: "quiz",
            title: "Ujian Mastery",
            sessionTitle: `${mod.title} - Ujian Mastery`,
            mode: "challenge",
            xp: 35,
            passThreshold: 80,
            category: mod.quiz.category,
            difficulty: "hard"
        }
    ];
    return mod._quizSteps;
}

function getModuleSteps(mod) {
    return [...getModuleLessons(mod), ...getModuleQuizzes(mod)];
}

function getLessonProgressKeys(trackId, moduleId, lessonId) {
    const primaryKey = `${trackId}_${moduleId}_${lessonId}`;
    return lessonId === "lesson-core" ? [primaryKey, `${trackId}_${moduleId}`] : [primaryKey];
}

function isLessonCompleted(trackId, moduleId, lessonId) {
    return getLessonProgressKeys(trackId, moduleId, lessonId)
        .some(key => lmsState.progress.completedLectures.includes(key));
}

function markLessonCompleted(trackId, moduleId, lessonId) {
    const primaryKey = `${trackId}_${moduleId}_${lessonId}`;
    if (!lmsState.progress.completedLectures.includes(primaryKey)) {
        lmsState.progress.completedLectures.push(primaryKey);
    }
}

function getQuizScore(trackId, moduleId, quizId) {
    return lmsState.progress.quizScores[`${trackId}_${moduleId}_${quizId}`] || 0;
}

function hasQuizAttempt(trackId, moduleId, quizId) {
    return Object.prototype.hasOwnProperty.call(lmsState.progress.quizScores, `${trackId}_${moduleId}_${quizId}`);
}

function getModuleQuizSteps(mod) {
    return getModuleSteps(mod).filter(step => step.kind === "quiz");
}

function getModuleQuizAverage(trackId, mod) {
    const quizSteps = getModuleQuizSteps(mod);
    const totalScore = quizSteps.reduce((sum, step) => sum + getQuizScore(trackId, mod.id, step.id), 0);
    const attemptedCount = quizSteps.filter(step => hasQuizAttempt(trackId, mod.id, step.id)).length;
    return {
        average: quizSteps.length ? Math.round(totalScore / quizSteps.length) : 0,
        attemptedCount,
        totalCount: quizSteps.length,
        allAttempted: quizSteps.length > 0 && attemptedCount === quizSteps.length
    };
}

function areModuleLessonsCompleted(trackId, mod) {
    return getModuleSteps(mod)
        .filter(step => step.kind === "lesson")
        .every(step => isLessonCompleted(trackId, mod.id, step.id));
}

function getModuleCertificateStatus(trackId, mod) {
    const quizInfo = getModuleQuizAverage(trackId, mod);
    const lessonsCompleted = areModuleLessonsCompleted(trackId, mod);
    return {
        eligible: lessonsCompleted && quizInfo.allAttempted && quizInfo.average >= 80,
        lessonsCompleted,
        quizInfo
    };
}

function isTrackCertificateEligible(trackId) {
    const track = lmsTracks.find(item => item.id === trackId);
    if (!track) return false;
    return track.modules.every(mod => getModuleCertificateStatus(trackId, mod).eligible);
}

function getTrackRetryModules(trackId) {
    const track = lmsTracks.find(item => item.id === trackId);
    if (!track) return [];
    return track.modules.filter(mod => !getModuleCertificateStatus(trackId, mod).eligible);
}

function isQuizCompleted(trackId, moduleId, quizStep) {
    return hasQuizAttempt(trackId, moduleId, quizStep.id);
}

function isStepCompleted(trackId, moduleId, step) {
    return step.kind === "lesson"
        ? isLessonCompleted(trackId, moduleId, step.id)
        : isQuizCompleted(trackId, moduleId, step);
}

function findModuleStep(track, moduleIndex, stepId) {
    const mod = track?.modules?.[moduleIndex];
    if (!mod) return null;
    return getModuleSteps(mod).find(step => step.id === stepId) || null;
}

// --- Classroom Navigation & Render Outline Sidebar ---
function calculateTrackProgress(trackId) {
    const track = lmsTracks.find(t => t.id === trackId);
    if (!track) return { done: 0, total: 0, percent: 0 };

    const totalSteps = track.modules.reduce((sum, mod) => sum + getModuleSteps(mod).length, 0);
    let doneSteps = 0;

    track.modules.forEach(mod => {
        getModuleSteps(mod).forEach(step => {
            if (isStepCompleted(trackId, mod.id, step)) doneSteps++;
        });
    });

    const percent = Math.round((doneSteps / totalSteps) * 100);
    return { done: doneSteps, total: totalSteps, percent };
}

function enterTrack(trackId) {
    const activeTrack = lmsTracks.find(track => track.id === trackId);
    if (!activeTrack) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Jalur belajar tidak ditemukan.", "warning");
        }
        return;
    }
    playSound('click');
    lmsState.currentTrackId = trackId;
    lmsState.currentModuleIndex = 0;
    lmsState.currentStepType = getModuleSteps(activeTrack.modules[0])[0]?.id || "lesson-core";
    localStorage.setItem("eduquestLastLmsTrack", trackId);

    const tracksView = document.getElementById("tracksView");
    const classroomView = document.getElementById("classroomView");
    if (!tracksView || !classroomView) return;
    tracksView.style.display = "none";
    classroomView.style.display = "grid";

    if (document.body.dataset.page === "learning-path" && activeTrack) {
        document.title = `${activeTrack.title} - Universe Of Tech`;
    }

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

async function resetLmsTrackProgress(trackId) {
    const accepted = typeof window.requestQuizConfirmation === "function"
        ? await window.requestQuizConfirmation({
            title: "Reset progres jalur?",
            message: "Seluruh materi selesai, nilai kuis, dan lencana pada jalur ini akan dihapus.",
            acceptLabel: "Reset Jalur"
        })
        : false;
    if (accepted) {
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
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Progres jalur berhasil direset.", "success");
        }
    }
}

function renderOutlineSidebar() {
    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    if (!track) return;

    document.getElementById("lmsSidebarTrackTitle").textContent = track.title;

    const progress = calculateTrackProgress(track.id);
    document.getElementById("lmsSidebarProgressPct").textContent = `${progress.percent}%`;
    document.getElementById("lmsSidebarProgressFill").style.width = `${progress.percent}%`;

    const tree = document.getElementById("lmsSyllabusTree");
    if (!tree) return;

    tree.innerHTML = track.modules.map((mod, index) => {
        const steps = getModuleSteps(mod);
        const completedSteps = steps.filter(step => isStepCompleted(track.id, mod.id, step)).length;
        const moduleCertificateStatus = getModuleCertificateStatus(track.id, mod);
        const moduleAverage = moduleCertificateStatus.quizInfo.average;
        const quizzesAttempted = moduleCertificateStatus.quizInfo.allAttempted;
        const isModuleComplete = moduleCertificateStatus.eligible;
        const isModuleActive = index === lmsState.currentModuleIndex;
        const needsRetry = moduleCertificateStatus.lessonsCompleted && quizzesAttempted && !isModuleComplete;
        const moduleStatus = isModuleComplete ? "completed" : isModuleActive ? "current" : completedSteps > 0 || needsRetry ? "in-progress" : "upcoming";
        const statusLabel = isModuleComplete
            ? "Sertifikat terbuka"
            : needsRetry
                ? `Remedial ${moduleAverage}%`
                : isModuleActive
                    ? "Sedang dipelajari"
                    : completedSteps > 0
                        ? "Dilanjutkan"
                        : "Akan datang";
        const estimatedMinutes = 25 + (index * 5);
        const difficulty = index === 0 ? "Pemula" : index === track.modules.length - 1 ? "Lanjutan" : "Menengah";
        const totalXp = steps.reduce((sum, step) => sum + (step.xp || 0), 0);
        const renderedSteps = steps.map((step, stepIndex) => {
            const isActive = index === lmsState.currentModuleIndex && lmsState.currentStepType === step.id;
            const done = isStepCompleted(track.id, mod.id, step);
            const score = step.kind === "quiz" ? getQuizScore(track.id, mod.id, step.id) : 0;
            const passed = step.kind === "quiz" ? score >= (step.passThreshold || 80) : done;
            const needsRetryStep = step.kind === "quiz" && done && !passed;
            const icon = step.kind === "lesson"
                ? (done ? "fa-check" : "fa-book-open")
                : (passed ? "fa-check" : needsRetryStep ? "fa-rotate-right" : step.mode === "challenge" ? "fa-trophy" : "fa-pen");
            const label = step.kind === "lesson"
                ? `${step.shortLabel}: ${step.lesson.title}`
                : `${step.title} (${score}%)`;
            const meta = step.kind === "lesson"
                ? (done ? "Selesai" : `+${step.xp} XP`)
                : (passed ? "Lulus" : needsRetryStep ? `Ulangi (${step.passThreshold || 80}%)` : `${step.passThreshold || 80}% target`);
            return `
                <button class="lms-syllabus-item ${isActive ? 'active' : ''} ${done ? 'completed' : ''} ${needsRetryStep ? 'needs-retry' : ''}"
                     type="button" data-module-index="${index}" data-step-type="${step.id}">
                    <span class="lms-item-check"><i class="fa-solid ${icon}"></i></span>
                    <span class="lms-item-title">${label}</span>
                    <span class="lms-item-type-icon">${meta}</span>
                </button>
            `;
        }).join("");

        return `
            <div class="lms-chapter-group ${moduleStatus}" data-module-status="${moduleStatus}" style="--module-order: ${index}">
                <div class="lms-module-node" aria-hidden="true">
                    ${isModuleComplete ? '<i class="fa-solid fa-check"></i>' : index + 1}
                </div>
                <div class="lms-chapter-heading">
                    <div class="lms-chapter-header">Milestone ${index + 1}</div>
                    <span class="lms-module-status">${statusLabel}</span>
                </div>
                <h3 class="lms-module-title">${mod.title}</h3>
                <div class="lms-module-meta">
                    <span><i class="fa-regular fa-clock"></i> ${estimatedMinutes} menit</span>
                    <span><i class="fa-solid fa-signal"></i> ${difficulty}</span>
                    <span><i class="fa-solid fa-bolt"></i> +${totalXp} XP</span>
                </div>
                <div class="lms-module-certificate-hint ${isModuleComplete ? 'ready' : needsRetry ? 'warning' : ''}">
                    <i class="fa-solid ${isModuleComplete ? 'fa-file-circle-check' : needsRetry ? 'fa-rotate-right' : 'fa-chart-line'}"></i>
                    <span>Rata-rata kuis milestone: <strong>${moduleAverage}%</strong> / target <strong>80%</strong></span>
                </div>
                ${isModuleComplete ? `
                    <button class="lms-module-certificate-btn" type="button"
                        data-module-certificate="${index}" aria-label="Download sertifikat PDF modul ${mod.title}">
                        <i class="fa-solid fa-file-pdf"></i> Download PDF Modul
                    </button>
                ` : ""}
                ${renderedSteps}
            </div>
        `;
    }).join("");

    tree.onclick = (event) => {
        const certificateButton = event.target.closest("[data-module-certificate]");
        if (certificateButton) {
            downloadModuleCertificate(track.id, Number(certificateButton.dataset.moduleCertificate));
            return;
        }
        const step = event.target.closest("[data-module-index][data-step-type]");
        if (!step) return;
        selectStep(Number(step.dataset.moduleIndex), step.dataset.stepType);
    };

    if (isTrackCertificateEligible(track.id) && !lmsState.progress.unlockedBadges.includes(track.id)) {
        unlockTrackBadge(track.id);
    }
}

async function selectStep(moduleIndex, stepType) {
    const track = lmsTracks.find(item => item.id === lmsState.currentTrackId);
    const step = findModuleStep(track, moduleIndex, stepType);
    if (!track || !Number.isInteger(moduleIndex) || !track.modules[moduleIndex] || !step) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Langkah belajar tidak valid. Silakan pilih ulang dari roadmap.", "warning");
        }
        return;
    }
    if (lmsState.quiz.timerId) {
        const accepted = typeof window.requestQuizConfirmation === "function"
            ? await window.requestQuizConfirmation({
                title: "Pindah materi?",
                message: "Sesi quiz lama akan dihentikan sebelum membuka langkah lain.",
                acceptLabel: "Pindah Materi"
            })
            : false;
        if (!accepted) return;
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
    const mod = track?.modules[lmsState.currentModuleIndex];
    const step = findModuleStep(track, lmsState.currentModuleIndex, lmsState.currentStepType);
    if (!track || !mod) {
        main.innerHTML = `<div class="lms-focus-room-note">Modul tidak dapat dimuat. Pilih kembali langkah dari roadmap.</div>`;
        return;
    }
    if (!step) {
        main.innerHTML = `<div class="lms-focus-room-note">Langkah modul tidak ditemukan. Silakan pilih ulang dari roadmap.</div>`;
        return;
    }

    if (step.kind === "lesson") {
        renderLesson(step, track.id, mod.id);
    } else if (step.kind === "quiz") {
        renderQuizIntro(mod, step);
    }
}

// 1. Lesson Note renderer
function renderLesson(step, trackId, moduleId) {
    const main = document.getElementById("lmsClassroomMain");
    const lesson = step.lesson;
    const isCompleted = isLessonCompleted(trackId, moduleId, step.id);

    main.innerHTML = `
        <div class="lms-lecture">
            <div class="lms-lecture-header">
                <div class="lms-lecture-meta">
                    <span class="lms-lecture-tag">${lesson.category}</span>
                    <span class="lms-lecture-tag">⏱️ ${lesson.readTime}</span>
                    <span class="lms-lecture-tag">📚 ${step.title}</span>
                </div>
                <h1 class="lms-lecture-title">${lesson.title}</h1>
            </div>
            <div class="lms-lecture-body">
                ${lesson.content}
            </div>
            <div class="lms-lecture-footer">
                <button class="btn ${isCompleted ? 'btn-ghost' : 'btn-primary'}" id="lmsCompleteLectureBtn" ${isCompleted ? 'disabled' : ''}>
                    ${isCompleted ? '✓ Selesai Dibaca' : `🚀 Selesai & Dapatkan +${step.xp} XP`}
                </button>
            </div>
        </div>
    `;

    // Bind complete button
    const btn = document.getElementById("lmsCompleteLectureBtn");
    if (btn && !isCompleted) {
        btn.addEventListener("click", () => {
            playSound('success');
            markLessonCompleted(trackId, moduleId, step.id);
            saveLmsProgress();
            
            // Add XP via RPG Engine
            if (typeof addXp === 'function') {
                addXp(step.xp || 15);
            }

            renderOutlineSidebar();
            renderLesson(step, trackId, moduleId);
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
function renderQuizIntro(mod, quizStep) {
    const main = document.getElementById("lmsClassroomMain");
    const isChallenge = quizStep.mode === "challenge";
    const highScore = getQuizScore(lmsState.currentTrackId, mod.id, quizStep.id);

    main.innerHTML = `
        <div class="lms-quiz-intro">
            <span class="lms-quiz-icon">${isChallenge ? '🏆' : '✍️'}</span>
            <h1 class="lms-quiz-intro-title">${quizStep.sessionTitle}</h1>
            <p class="lms-quiz-intro-desc">
                Uji pemahaman Anda tentang ${mod.title}. Anda memerlukan skor minimal <strong>${quizStep.passThreshold}%</strong> untuk melengkapi langkah silabus ini.
            </p>
            
            <div class="lms-quiz-rules-card">
                <h3 class="lms-quiz-rules-title">📋 Aturan & Info Kuis:</h3>
                <ul class="lms-quiz-rules-list">
                    <li><strong>Jumlah Soal</strong>: 5 Pertanyaan</li>
                    <li><strong>Bantuan AI Tutor</strong>: ${isChallenge ? '🔴 Tidak tersedia (Mode Ujian)' : '🟢 Tersedia setiap saat'}</li>
                    <li><strong>Bantuan 50:50 / Hint</strong>: ${isChallenge ? '🔴 Tidak' : '🟢 Ya, 2 Kali bantuan'}</li>
                    <li><strong>Skor Tertinggi Anda</strong>: ${highScore}%</li>
                    <li><strong>Reward</strong>: +${quizStep.xp} XP</li>
                    ${isChallenge ? '<li><strong>Integritas Fokus</strong>: Perpindahan tab dicatat dan memunculkan pengingat tanpa menggagalkan sesi otomatis.</li>' : ''}
                </ul>
            </div>

            <button class="btn btn-blue" id="lmsStartQuizBtn">Mulai Kuis Sesi Ini</button>
            <p class="lms-focus-room-note">Kuis akan dibuka di LMS Focus Room satu layar agar pengerjaan lebih fokus tanpa scroll halaman.</p>
        </div>
    `;

    const startButton = document.getElementById("lmsStartQuizBtn");
    if (startButton) {
        startButton.addEventListener("click", () => {
            startLmsQuizSession(mod, quizStep);
        });
    }
}

// --- LMS Quiz Session Logic ---
function startLmsQuizSession(mod, quizStep) {
    try {
        playSound('click');
        
        // Pick questions from the global questionBank based on category & difficulty
        const qSource = (typeof window.questionBank !== 'undefined') ? window.questionBank : ((typeof questionBank !== 'undefined') ? questionBank : []);
        const categoryQuery = quizStep.category || mod.quiz.category;
        const difficultyQuery = quizStep.difficulty || mod.quiz.difficulty;

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
        const payload = window.QuizNation.sessions.create({
            source: "lms",
            config: {
                category: categoryQuery,
                difficulty: difficultyQuery,
                amount: sessionQuestions.length,
                mode: quizStep.mode,
                categoryLabel: mod.lecture.category,
                difficultyLabel: difficultyQuery === "hard" ? "Challenge" : difficultyQuery === "medium" ? "Normal" : "Pemanasan",
                modeLabel: quizStep.title
            },
            lms: {
                trackId: track.id,
                trackTitle: track.title,
                moduleId: mod.id,
                moduleIndex: lmsState.currentModuleIndex,
                moduleTitle: mod.title,
                quizType: quizStep.id,
                passThreshold: quizStep.passThreshold || 80
            },
            timeLimit: 5 * 60,
            questions: sessionQuestions
        });

        window.QuizNation.storage.write(sessionStorage, "eduquestQuizSession", payload);
        window.QuizNation.storage.remove(sessionStorage, "eduquestQuizActiveState");
        window.location.href = "quiz-session.html";
    } catch (err) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Sesi LMS tidak dapat dibuka. Periksa data modul lalu coba lagi.", "warning");
        }
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
    const validStep = findModuleStep(track, moduleIndex, stepType);
    if (!track || !Number.isInteger(moduleIndex) || !track.modules[moduleIndex] || !validStep) return;

    sessionStorage.setItem("quizActiveTab", "lms-classroom");
    document.getElementById("lmsClassroomTab")?.click();
    enterTrack(trackId);
    void selectStep(moduleIndex, stepType).catch(error => {
        console.error("Gagal memulihkan langkah LMS:", error);
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Hasil kuis tersimpan, tetapi langkah modul perlu dipilih ulang.", "warning");
        }
    });
    const cleanUrl = document.body.dataset.page === "learning-path"
        ? `learning-path.html?track=${encodeURIComponent(trackId)}`
        : window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
}

function handleLmsCheatDetection() {
    if (document.visibilityState === "hidden" && lmsState.quiz.mode === "challenge" && lmsState.quiz.timerId) {
        lmsState.quiz.cheatWarnings++;
        playSound('alarm');
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast(`Pengingat fokus ${lmsState.quiz.cheatWarnings}: perpindahan tab dicatat, sesi tetap berjalan.`, "warning");
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
                        
                    </div>
                    <div class="utility-actions">
                        <button class="btn btn-ghost" id="lmsQuizPrevBtn" disabled>Sebelumnya</button>
                        <button class="btn btn-primary" id="lmsQuizSubmitBtn">Submit</button>
                        <button class="btn btn-blue" id="lmsQuizNextBtn" style="display:none;">Lanjut</button>
                    </div>
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
        // BUBUB global assistant handles quiz help from the floating shortcut.
    } catch (err) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Soal tidak dapat ditampilkan. Muat ulang sesi untuk mencoba lagi.", "warning");
        }
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
                <button class="btn btn-primary" id="lmsLegacyRetryButton" type="button">Ulangi Kuis</button>
                <button class="btn btn-ghost" id="lmsLegacyBackButton" type="button">Kembali ke Materi</button>
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
    document.getElementById("lmsLegacyRetryButton")?.addEventListener("click", restartLmsQuiz);
    document.getElementById("lmsLegacyBackButton")?.addEventListener("click", () => {
        const track = lmsTracks.find(item => item.id === lmsState.currentTrackId);
        const mod = track?.modules?.[lmsState.currentModuleIndex];
        const fallbackStep = mod ? getModuleLessons(mod)[0]?.id : "lesson-core";
        selectStep(lmsState.currentModuleIndex, fallbackStep);
    });

    renderOutlineSidebar();
}

function restartLmsQuiz() {
    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    const mod = track?.modules[lmsState.currentModuleIndex];
    const quizStep = findModuleStep(track, lmsState.currentModuleIndex, lmsState.currentStepType);
    if (!track || !mod) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Modul kuis tidak ditemukan. Pilih kembali kuis dari roadmap.", "warning");
        }
        return;
    }
    if (!quizStep || quizStep.kind !== "quiz") {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Langkah kuis tidak valid untuk diulang.", "warning");
        }
        return;
    }
    startLmsQuizSession(mod, quizStep);
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
        const certificateReady = isTrackCertificateEligible(track.id);
        
        return `
            <button class="lms-badge-slot ${isUnlocked ? 'unlocked' : ''}" type="button" data-certificate-track="${isUnlocked ? track.id : ''}" ${isUnlocked ? '' : 'disabled'}>
                <span class="lms-badge-icon">${track.badgeIcon}</span>
                <span class="lms-badge-tooltip">
                    ${isUnlocked 
                        ? `KLIK: Klaim Sertifikat ${track.badgeName}` 
                        : certificateReady
                            ? `Klik untuk klaim ${track.badgeName}`
                            : `${track.badgeName}: Selesaikan jalur dan capai rata-rata kuis 80 per milestone (${progress.percent}%)`
                    }
                </span>
            </button>
        `;
    }).join("");
    if (!grid.dataset.certificateListenerBound) {
        grid.dataset.certificateListenerBound = "true";
        grid.addEventListener("click", (event) => {
            const badge = event.target.closest("[data-certificate-track]");
            if (badge?.dataset.certificateTrack) showCertificate(badge.dataset.certificateTrack);
        });
    }
}

function showCertificate(trackId) {
    const track = lmsTracks.find(t => t.id === trackId);
    if (!track) return;
    const progress = calculateTrackProgress(trackId);
    if (progress.percent !== 100) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast(`Selesaikan seluruh materi dan kuis terlebih dahulu. Progres saat ini ${progress.percent}%.`, "warning");
        }
        return;
    }
    if (!isTrackCertificateEligible(trackId)) {
        const retryModules = getTrackRetryModules(trackId).map(mod => mod.title).join(", ");
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast(`Rata-rata kuis tiap milestone wajib minimal 80. Ulangi kuis pada: ${retryModules}.`, "warning");
        }
        return;
    }
    if (!lmsState.progress.unlockedBadges.includes(trackId)) {
        unlockTrackBadge(trackId);
    }

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
                <button class="lms-modal-close" id="lmsCertificateClose" type="button" aria-label="Tutup sertifikat">×</button>
            </div>
            <div class="lms-modal-body">
                <div class="lms-cert-input-row">
                    <label for="lmsCertStudentName">Nama Lengkap Penerima:</label>
                    <input type="text" id="lmsCertStudentName" maxlength="80" placeholder="Ketik nama Anda di sini...">
                </div>

                <div class="lms-cert-frame" id="printableCertArea">
                    <img src="logo.png" alt="" class="lms-cert-watermark" aria-hidden="true">
                    <div class="lms-cert-corner top-left"></div>
                    <div class="lms-cert-corner top-right"></div>
                    <div class="lms-cert-corner bottom-left"></div>
                    <div class="lms-cert-corner bottom-right"></div>

                    <div class="lms-cert-brand">
                        <img src="logo.png" alt="Universe Of Tech" class="lms-cert-logo">
                        <div>
                            <div class="lms-cert-kicker">Universe Of Tech Academy</div>
                            <div class="lms-cert-credential">Verified Digital Credential</div>
                        </div>
                    </div>

                    <div class="lms-cert-title-block">
                        <span class="lms-cert-overline">Certificate</span>
                        <h1 class="lms-cert-header">Certificate of Completion</h1>
                        <p class="lms-cert-subheader">Diberikan sebagai pengakuan resmi atas penyelesaian program pembelajaran.</p>
                    </div>

                    <p class="lms-cert-text">Dengan bangga diberikan kepada</p>
                    
                    <div class="lms-cert-name" id="lmsCertDisplayName"></div>
                    
                    <p class="lms-cert-text">telah berhasil menyelesaikan dan memenuhi standar kelulusan pada</p>
                    <div class="lms-cert-course" id="lmsCertCourse"></div>
                    
                    <div class="lms-cert-details">
                        <div class="lms-cert-detail-card">
                            <span>Issued by</span>
                            <strong>Universe Of Tech Academy</strong>
                        </div>
                        <div class="lms-cert-detail-card">
                            <span>Credential Type</span>
                            <strong>Completion Award</strong>
                        </div>
                    </div>

                    <div class="lms-cert-seal-row">
                        <div class="lms-cert-sig">
                            <span>Authorized by</span>
                            <div class="lms-cert-sig-line">BUBUB</div>
                            <small>CEO & AI Instructor</small>
                        </div>
                        <div class="lms-cert-seal">
                            <span>UOT</span>
                            <small>Verified</small>
                        </div>
                        <div class="lms-cert-sig">
                            <span>Completion Date</span>
                            <div class="lms-cert-sig-line" id="lmsCertDate"></div>
                            <small>Tanggal Kelulusan</small>
                        </div>
                    </div>
                    
                    <div class="lms-cert-meta">
                        <span id="lmsCertVerification"></span>
                    </div>
                </div>

                <div class="panel-actions" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="btn btn-ghost" id="lmsCertificateCancel" type="button">Tutup</button>
                    <button class="btn btn-blue" id="lmsCertificateDownload" type="button"><i class="fa-solid fa-download"></i> Download Sertifikat</button>
                    <button class="btn btn-primary" id="lmsCertificatePrint" type="button"><i class="fa-solid fa-print"></i> Cetak / Simpan ke PDF</button>
                </div>
            </div>
        </div>
    `;

    const nameInput = document.getElementById("lmsCertStudentName");
    nameInput.value = lmsState.progress.userName;
    document.getElementById("lmsCertDisplayName").textContent = lmsState.progress.userName;
    document.getElementById("lmsCertCourse").textContent = track.title;
    document.getElementById("lmsCertDate").textContent = new Date().toLocaleDateString("id-ID");
    document.getElementById("lmsCertVerification").textContent =
        `Verification ID: UOT-${trackId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)} - Verified Academic Honor`;
    nameInput.addEventListener("input", () => updateCertificateName(nameInput.value));
    document.getElementById("lmsCertificateClose").addEventListener("click", closeCertificateModal);
    document.getElementById("lmsCertificateCancel").addEventListener("click", closeCertificateModal);
    document.getElementById("lmsCertificateDownload").addEventListener("click", () => downloadCertificate(trackId));
    document.getElementById("lmsCertificatePrint").addEventListener("click", printCertificate);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeCertificateModal();
    }, { once: true });
    modal.classList.add("show");
    nameInput.focus();
}

function updateCertificateName(name) {
    const cleanName = window.QuizNation?.sanitize.text(name, 80, "Developer Indonesia") || "Developer Indonesia";
    lmsState.progress.userName = cleanName;
    saveLmsProgress();

    const display = document.getElementById("lmsCertDisplayName");
    if (display) display.textContent = cleanName;
}

function printCertificate() {
    playSound('click');
    window.print();
}

function getCertificateStudentName() {
    const name = document.getElementById("lmsCertStudentName")?.value || lmsState.progress.userName;
    return window.QuizNation?.sanitize.text(name, 80, "Developer Indonesia") || "Developer Indonesia";
}

function normalizePdfText(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function certificateFileSlug(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function dataUrlToBytes(dataUrl) {
    const base64 = String(dataUrl).split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}

function asciiBytes(value) {
    const bytes = new Uint8Array(String(value).length);
    for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = String(value).charCodeAt(index) & 0xff;
    }
    return bytes;
}

function concatBytes(chunks) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(chunk => {
        result.set(chunk, offset);
        offset += chunk.length;
    });
    return result;
}

function loadCertificateLogoJpeg() {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const size = 520;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, size, size);
                const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight) * 0.9;
                const width = image.naturalWidth * scale;
                const height = image.naturalHeight * scale;
                ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
                resolve({
                    width: size,
                    height: size,
                    bytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92))
                });
            } catch (error) {
                console.warn("Logo sertifikat tidak dapat dimasukkan ke PDF.", error);
                resolve(null);
            }
        };
        image.onerror = () => resolve(null);
        image.src = "logo.png";
    });
}

async function buildCertificatePdf({ studentName, title, subtitle, verificationId, dateText }) {
    const pageWidth = 842;
    const centerX = pageWidth / 2;
    const text = (value, y, size, font = "F1", color = "0.08 0.13 0.22", textCenter = centerX) => {
        const safe = normalizePdfText(value);
        const estimatedWidth = safe.length * size * (font === "F2" ? 0.53 : 0.5);
        const x = Math.max(55, textCenter - (estimatedWidth / 2));
        return `BT /${font} ${size} Tf ${color} rg ${x.toFixed(1)} ${y} Td (${safe}) Tj ET`;
    };
    const leftText = (value, x, y, size, font = "F1", color = "0.08 0.13 0.22") => {
        const safe = normalizePdfText(value);
        return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${safe}) Tj ET`;
    };
    const logo = await loadCertificateLogoJpeg();
    const logoPaint = logo ? [
        "q",
        "72 0 0 72 74 478 cm /Logo Do",
        "Q",
        "q",
        "/GS1 gs",
        "220 0 0 220 311 196 cm /Logo Do",
        "Q"
    ] : [];
    const content = [
        "q",
        "0.987 0.976 0.944 rg 0 0 842 595 re f",
        "0.054 0.102 0.188 rg 0 565 842 30 re f",
        "0.045 0.098 0.175 RG 2.2 w 30 30 782 535 re S",
        "0.694 0.537 0.247 RG 1.2 w 43 43 756 509 re S",
        "0.031 0.698 0.769 RG 3 w 58 525 m 58 502 l S",
        "0.486 0.839 0.251 RG 3 w 784 525 m 784 502 l S",
        "0.031 0.698 0.769 RG 3 w 58 70 m 58 93 l S",
        "0.486 0.839 0.251 RG 3 w 784 70 m 784 93 l S",
        ...logoPaint,
        leftText("UNIVERSE OF TECH ACADEMY", 156, 526, 13, "F3", "0.054 0.102 0.188"),
        leftText("VERIFIED DIGITAL CREDENTIAL", 156, 506, 8, "F3", "0.45 0.36 0.20"),
        "0.031 0.698 0.769 RG 1.5 w 562 520 m 745 520 l S",
        text("CERTIFICATE", 446, 13, "F3", "0.45 0.36 0.20"),
        text("Certificate of Completion", 407, 34, "F3", "0.054 0.102 0.188"),
        text("Diberikan sebagai pengakuan resmi atas penyelesaian program pembelajaran.", 380, 11, "F1", "0.35 0.40 0.49"),
        text("Dengan bangga diberikan kepada", 337, 12, "F1", "0.35 0.40 0.49"),
        text(studentName, 292, Math.min(31, Math.max(20, 38 - studentName.length * 0.34)), "F2", "0.054 0.102 0.188"),
        "0.694 0.537 0.247 RG 1.4 w 258 276 m 584 276 l S",
        text(subtitle, 238, 11, "F1", "0.35 0.40 0.49"),
        text(title, 203, Math.min(22, Math.max(16, 27 - title.length * 0.16)), "F3", "0.02 0.32 0.46"),
        "0.96 0.98 0.97 rg 214 154 180 48 re f",
        "0.88 0.81 0.64 RG 0.8 w 214 154 180 48 re S",
        "0.96 0.98 0.97 rg 448 154 180 48 re f",
        "0.88 0.81 0.64 RG 0.8 w 448 154 180 48 re S",
        text("Issued by", 184, 8, "F3", "0.45 0.36 0.20", 304),
        text("Universe Of Tech Academy", 167, 10, "F3", "0.054 0.102 0.188", 304),
        text("Credential Type", 184, 8, "F3", "0.45 0.36 0.20", 538),
        text("Completion Award", 167, 10, "F3", "0.054 0.102 0.188", 538),
        "0.58 0.63 0.70 RG 1 w 92 118 m 274 118 l S",
        text("BUBUB", 96, 13, "F2", "0.054 0.102 0.188", 183),
        text("CEO & AI Instructor", 77, 8, "F1", "0.35 0.40 0.49", 183),
        "0.04 0.67 0.78 rg 391 84 60 60 re f",
        text("UOT", 110, 16, "F3", "1 1 1", 421),
        text("VERIFIED", 97, 6, "F3", "1 1 1", 421),
        "0.58 0.63 0.70 RG 1 w 568 118 m 750 118 l S",
        text(dateText, 96, 11, "F2", "0.054 0.102 0.188", 659),
        text("Tanggal Kelulusan", 77, 8, "F1", "0.35 0.40 0.49", 659),
        "0.054 0.102 0.188 rg 0 0 842 20 re f",
        text(verificationId, 38, 7.5, "F1", "0.48 0.52 0.60"),
        "Q"
    ].join("\n");

    const contentBytes = asciiBytes(content);
    const fontResource = "/Font << /F1 6 0 R /F2 7 0 R /F3 8 0 R >>";
    const imageResource = logo ? " /XObject << /Logo 9 0 R >> /ExtGState << /GS1 10 0 R >>" : "";
    const objects = [
        asciiBytes("<< /Type /Catalog /Pages 2 0 R >>"),
        asciiBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
        asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << ${fontResource}${imageResource} >> /Contents 4 0 R >>`),
        concatBytes([asciiBytes(`<< /Length ${contentBytes.length} >>\nstream\n`), contentBytes, asciiBytes("\nendstream")]),
        asciiBytes("<< /Producer (Universe Of Tech Academy) /Title (Certificate of Completion) >>"),
        asciiBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
        asciiBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Times-BoldItalic >>"),
        asciiBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    ];
    if (logo) {
        objects.push(concatBytes([
            asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`),
            logo.bytes,
            asciiBytes("\nendstream")
        ]));
        objects.push(asciiBytes("<< /Type /ExtGState /ca 0.08 /CA 0.08 >>"));
    }

    const chunks = [asciiBytes("%PDF-1.4\n")];
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
        chunks.push(asciiBytes(`${index + 1} 0 obj\n`), object, asciiBytes("\nendobj\n"));
    });
    const xrefOffset = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    let trailer = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
        trailer += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    trailer += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(asciiBytes(trailer));
    return concatBytes(chunks);
}

async function triggerCertificatePdf(data, fileName) {
    const pdfBytes = await buildCertificatePdf(data);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadCertificate(trackId) {
    const track = lmsTracks.find(item => item.id === trackId);
    const progress = calculateTrackProgress(trackId);
    if (!track || progress.percent !== 100) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Sertifikat belum tersedia. Selesaikan seluruh jalur terlebih dahulu.", "warning");
        }
        return;
    }
    if (!isTrackCertificateEligible(trackId)) {
        const retryModules = getTrackRetryModules(trackId).map(mod => mod.title).join(", ");
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast(`Sertifikat jalur masih terkunci. Rata-rata kuis tiap milestone harus minimal 80. Ulangi kuis pada: ${retryModules}.`, "warning");
        }
        return;
    }

    const studentName = getCertificateStudentName();
    updateCertificateName(studentName);
    const dateText = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    const verificationId = `UOT-TRACK-${trackId.toUpperCase()}-${Date.now().toString().slice(-8)}`;
    await triggerCertificatePdf({
        studentName,
        title: track.title,
        subtitle: "telah membaca seluruh materi dan lulus seluruh kuis pada jalur",
        verificationId,
        dateText
    }, `sertifikat-jalur-${certificateFileSlug(track.title)}-${certificateFileSlug(studentName)}.pdf`);

    playSound('success');
    if (typeof window.showQuizToast === "function") {
        window.showQuizToast("Sertifikat PDF jalur berhasil diunduh.", "success");
    }
}

async function downloadModuleCertificate(trackId, moduleIndex) {
    const track = lmsTracks.find(item => item.id === trackId);
    const mod = track?.modules[moduleIndex];
    if (!track || !mod) return;

    const moduleStatus = getModuleCertificateStatus(trackId, mod);
    const allStepsCompleted = getModuleSteps(mod).every(step => isStepCompleted(trackId, mod.id, step));
    if (!allStepsCompleted || !moduleStatus.lessonsCompleted || !moduleStatus.quizInfo.allAttempted) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Selesaikan seluruh materi dan seluruh kuis pada milestone ini sebelum mengunduh sertifikat.", "warning");
        }
        return;
    }
    if (!moduleStatus.eligible) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast(`Rata-rata kuis milestone ini baru ${moduleStatus.quizInfo.average}%. Ulangi kuis sampai minimal 80 untuk membuka sertifikat.`, "warning");
        }
        return;
    }

    const studentName = getCertificateStudentName();
    updateCertificateName(studentName);
    const dateText = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    const verificationId = `UOT-MODULE-${trackId.toUpperCase()}-${mod.id.toUpperCase()}-${Date.now().toString().slice(-8)}`;
    await triggerCertificatePdf({
        studentName,
        title: mod.title,
        subtitle: `telah menyelesaikan modul pada jalur ${track.title}`,
        verificationId,
        dateText
    }, `sertifikat-modul-${certificateFileSlug(mod.title)}-${certificateFileSlug(studentName)}.pdf`);

    playSound('success');
    if (typeof window.showQuizToast === "function") {
        window.showQuizToast(`Sertifikat PDF modul ${mod.title} berhasil diunduh.`, "success");
    }
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
    const mod = track?.modules[lmsState.currentModuleIndex];
    if (!mod) {
        textarea.value = "";
        return;
    }
    const key = `lms_notes_${lmsState.currentTrackId}_${mod.id}`;

    try {
        textarea.value = (localStorage.getItem(key) || "").slice(0, 5000);
    } catch (error) {
        textarea.value = "";
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Catatan belum dapat dimuat dari penyimpanan browser.", "warning");
        }
    }
}

function saveModuleNotes() {
    const textarea = document.getElementById("lmsNotesTextarea");
    if (!textarea || !lmsState.currentTrackId) return;

    const track = lmsTracks.find(t => t.id === lmsState.currentTrackId);
    const mod = track?.modules[lmsState.currentModuleIndex];
    if (!mod) return;
    const key = `lms_notes_${lmsState.currentTrackId}_${mod.id}`;
    
    try {
        localStorage.setItem(key, textarea.value.slice(0, 5000));
    } catch (error) {
        if (typeof window.showQuizToast === "function") {
            window.showQuizToast("Catatan belum tersimpan karena penyimpanan browser penuh.", "warning");
        }
    }
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
            if (document.body.dataset.page === "learning-path") {
                window.location.href = "quiz.html#lms-classroom-tab";
                return;
            }
            lmsState.currentTrackId = null;
            
            // Re-render tracks to reflect fresh progress pct
            renderTrackCards();
            
            document.getElementById("classroomView").style.display = "none";
            document.getElementById("tracksView").style.display = "block";
        });
    }
}

// --- Attach functions globally for inline HTML events ---
window.restartLmsQuiz = restartLmsQuiz;
window.selectStep = selectStep;
window.closeCertificateModal = closeCertificateModal;
window.printCertificate = printCertificate;
window.downloadCertificate = downloadCertificate;
window.downloadModuleCertificate = downloadModuleCertificate;
window.updateCertificateName = updateCertificateName;
window.showCertificate = showCertificate;

// Initialize on Script load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLms);
} else {
    initLms();
}
