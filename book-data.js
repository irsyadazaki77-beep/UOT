// Database Buku Digital Universitas
const BOOKS = [
    {
        id: "js-basic",
        code: "CS-101",
        title: "Dasar Pemrograman JavaScript",
        author: "Dr. Rian Adams, M.T.",
        category: "CS",
        categoryLabel: "Computer Science",
        time: "15 menit",
        pages: 180,
        rating: 4.8,
        coverGradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        chapters: [
            {
                title: "Bab 1: Pengenalan JavaScript & Ekosistem Web",
                content: `
                    <h2>Bab 1: Pengenalan JavaScript</h2>
                    <p>JavaScript adalah bahasa pemrograman tingkat tinggi, dinamis, dan berbasis prototipe yang menjadi pilar utama pengembangan aplikasi web interaktif. Awalnya diciptakan oleh Brendan Eich pada tahun 1995 hanya dalam waktu 10 hari, JavaScript kini telah berevolusi menjadi bahasa multi-paradigma yang berjalan di sisi klien (browser) maupun sisi server menggunakan Node.js.</p>
                    <p>Dalam ekosistem pengembangan web, HTML mendefinisikan struktur halaman, CSS mengatur gaya visual, dan JavaScript memberikan kehidupan melalui perilaku interaktif. Dengan JavaScript, Anda dapat membuat formulir dinamis, memuat konten baru tanpa memuat ulang halaman, memanipulasi struktur DOM (Document Object Model), dan membangun aplikasi web satu halaman (SPA) yang kompleks.</p>
                    <p>Untuk menulis variabel di JavaScript modern, kita menggunakan kata kunci <code>let</code> untuk variabel yang nilainya dapat berubah, dan <code>const</code> untuk nilai konstan yang tidak dapat diubah setelah dideklarasikan. Penggunaan kata kunci lama seperti <code>var</code> sangat tidak disarankan karena memiliki kelemahan scope (hoisting) yang sering memicu bug.</p>
                `
            },
            {
                title: "Bab 2: Struktur Kontrol Alur dan Logika",
                content: `
                    <h2>Bab 2: Struktur Kontrol Alur</h2>
                    <p>Struktur kontrol alur pemrograman adalah mekanisme yang menentukan baris kode mana yang akan dieksekusi berdasarkan kondisi logika tertentu atau melakukan perulangan untuk efisiensi penulisan kode.</p>
                    <p><strong>1. Percabangan (Conditional):</strong> Pengambilan keputusan dilakukan menggunakan blok <code>if</code>, <code>else if</code>, dan <code>else</code>. Untuk kondisi percabangan yang banyak dan bersifat statis, alternatif yang lebih rapi adalah struktur <code>switch-case</code>.</p>
                    <p><strong>2. Perulangan (Looping):</strong> Digunakan untuk mengeksekusi blok kode berulang kali. JavaScript menyediakan beberapa jenis perulangan:
                    <ul>
                        <li><code>for</code> loop: Digunakan ketika jumlah perulangan sudah diketahui dengan pasti.</li>
                        <li><code>while</code> loop: Mengeksekusi kode selama kondisi bernilai true.</li>
                        <li><code>do-while</code>: Menjamin kode dieksekusi minimal satu kali sebelum memeriksa kondisi.</li>
                        <li><code>for-of</code> dan <code>for-in</code>: Untuk iterasi array dan properti objek secara efisien.</li>
                    </ul>
                    </p>
                `
            },
            {
                title: "Bab 3: Fungsi, Objek, dan Array",
                content: `
                    <h2>Bab 3: Fungsi dan Struktur Data</h2>
                    <p>Fungsi (Function) adalah blok kode terorganisasi yang digunakan untuk melakukan tindakan tertentu dan dapat dipanggil berulang kali secara modular. Deklarasi fungsi di JavaScript dapat dilakukan dengan cara tradisional maupun menggunakan sintaks modern <code>arrow function</code>.</p>
                    <p>Contoh penulisan Arrow Function:
                    <pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; font-family: monospace;">const hitungLuas = (panjang, lebar) => panjang * lebar;</pre>
                    </p>
                    <p>Objek (Object) adalah tipe data non-primitif yang menyimpan pasangan kunci-nilai (key-value pair), mewakili entitas nyata dalam pemrograman. Array adalah daftar elemen terurut yang dapat menampung berbagai tipe data, dikelola menggunakan fungsi bawaan seperti <code>map()</code>, <code>filter()</code>, dan <code>reduce()</code> untuk manipulasi data modern.</p>
                `
            }
        ]
    },
    {
        id: "sql-join",
        code: "DB-202",
        title: "Prinsip Sistem Basis Data SQL",
        author: "Prof. Sarah Wijaya",
        category: "Database",
        categoryLabel: "Database Systems",
        time: "12 menit",
        pages: 220,
        rating: 4.9,
        coverGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        chapters: [
            {
                title: "Bab 1: Pengantar Relational Database Management System (RDBMS)",
                content: `
                    <h2>Bab 1: Pengantar RDBMS</h2>
                    <p>RDBMS (Relational Database Management System) adalah sistem manajemen basis data yang mengorganisasi data ke dalam baris dan kolom yang terstruktur membentuk tabel. Hubungan antar tabel didefinisikan menggunakan Kunci Utama (Primary Key) dan Kunci Tamu (Foreign Key).</p>
                    <p>Prinsip utama RDBMS adalah kepatuhan terhadap standar ACID untuk memastikan transaksi database berjalan aman:
                    <ul>
                        <li><strong>Atomicity:</strong> Transaksi harus selesai sepenuhnya atau dibatalkan sama sekali.</li>
                        <li><strong>Consistency:</strong> Data harus valid sesuai aturan relasi database sebelum dan sesudah transaksi.</li>
                        <li><strong>Isolation:</strong> Transaksi yang berjalan bersamaan tidak boleh saling mengganggu.</li>
                        <li><strong>Durability:</strong> Hasil transaksi yang sukses tersimpan permanen bahkan jika sistem mati.</li>
                    </ul>
                    </p>
                `
            },
            {
                title: "Bab 2: Dasar DDL, DML, dan Query SELECT",
                content: `
                    <h2>Bab 2: DDL, DML, dan SELECT Query</h2>
                    <p>Structured Query Language (SQL) dibagi menjadi beberapa sub-bahasa utama:</p>
                    <p><strong>1. DDL (Data Definition Language):</strong> Perintah untuk mendefinisikan struktur database. Contohnya adalah <code>CREATE TABLE</code> untuk membuat tabel baru dan <code>ALTER TABLE</code> untuk memodifikasi struktur kolom.</p>
                    <p><strong>2. DML (Data Manipulation Language):</strong> Perintah untuk memanipulasi data di dalam database. Contohnya:
                    <ul>
                        <li><code>INSERT INTO</code>: Menambahkan data baru.</li>
                        <li><code>UPDATE</code>: Memperbarui data yang ada.</li>
                        <li><code>DELETE</code>: Menghapus data dari tabel.</li>
                    </ul>
                    </p>
                    <p>Query pencarian data utama dilakukan menggunakan perintah <code>SELECT</code> yang dipadukan dengan klausa <code>WHERE</code> untuk menyaring kondisi spesifik, <code>ORDER BY</code> untuk pengurutan, dan <code>GROUP BY</code> untuk pengelompokan agregat data.</p>
                `
            },
            {
                title: "Bab 3: Sintaks Visual SQL JOIN dan Agregasi",
                content: `
                    <h2>Bab 3: SQL JOIN & Agregasi</h2>
                    <p>Dalam database relasional, informasi seringkali tersebar di beberapa tabel. JOIN digunakan untuk menyatukan baris-baris dari dua tabel atau lebih berdasarkan kolom relasi yang bersesuaian.</p>
                    <p><strong>Jenis-Jenis SQL JOIN:</strong>
                    <ul>
                        <li><code>INNER JOIN</code>: Mengembalikan baris ketika ada kecocokan di kedua tabel.</li>
                        <li><code>LEFT JOIN</code>: Mengembalikan semua baris dari tabel kiri, dan baris yang cocok dari tabel kanan.</li>
                        <li><code>RIGHT JOIN</code>: Mengembalikan semua baris dari tabel kanan, dan baris yang cocok dari tabel kiri.</li>
                        <li><code>FULL OUTER JOIN</code>: Mengembalikan baris saat ada kecocokan di salah satu tabel.</li>
                    </ul>
                    </p>
                    <p>Agregasi SQL menggunakan fungsi seperti <code>COUNT()</code>, <code>SUM()</code>, <code>AVG()</code>, <code>MAX()</code>, dan <code>MIN()</code> dipadukan dengan <code>GROUP BY</code> untuk menganalisis data dalam skala besar secara cepat di server database.</p>
                `
            }
        ]
    },
    {
        id: "ui-heuristic",
        code: "DS-303",
        title: "Panduan Desain Antarmuka UI/UX",
        author: "Kenji Sato, M.Ds.",
        category: "Design",
        categoryLabel: "UI/UX Design",
        time: "10 menit",
        pages: 150,
        rating: 4.7,
        coverGradient: "linear-gradient(135deg, #ec4899, #be185d)",
        chapters: [
            {
                title: "Bab 1: Filosofi Desain Berpusat Pengguna (User-Centered Design)",
                content: `
                    <h2>Bab 1: User-Centered Design (UCD)</h2>
                    <p>Desain Antarmuka (UI) dan Pengalaman Pengguna (UX) adalah dua disiplin ilmu yang berbeda namun saling melengkapi dalam pembuatan produk digital. UI berfokus pada estetika visual produk (tipografi, tata letak, warna, tombol), sedangkan UX berfokus pada kemudahan, efisiensi, dan kepuasan psikologis pengguna saat menggunakan produk tersebut.</p>
                    <p>Filosofi utama UCD adalah menempatkan pengguna akhir sebagai fokus utama dalam setiap tahap perancangan produk. Proses ini dimulai dari penelitian pengguna (user research), penyusunan persona, pemetaan arsitektur informasi, wireframing, pembuatan prototype interaktif, hingga pengujian kegunaan (usability testing).</p>
                `
            },
            {
                title: "Bab 2: Hirarki Visual, Tipografi, dan Psikologi Warna",
                content: `
                    <h2>Bab 2: Estetika & Hirarki Visual</h2>
                    <p>Hirarki visual memandu mata pengguna di sepanjang antarmuka produk digital, mempertegas elemen apa yang paling penting untuk dibaca pertama kali.</p>
                    <p><strong>1. Tipografi Kontras:</strong> Perbedaan ukuran font (H1, H2, body) dan ketebalan (bold, regular) membantu membangun aliran bacaan yang alami bagi pengguna.</p>
                    <p><strong>2. Psikologi Warna & Kontras:</strong> Warna mengomunikasikan emosi dan tindakan. Misalnya, warna primer biru melambangkan kepercayaan, hijau untuk sukses atau penyelesaian, sedangkan merah atau jingga untuk peringatan penting. Kontras rasio teks dengan latar belakang minimal harus memenuhi standar WCAG 2.0 (minimal rasio kontras 4.5:1 untuk teks biasa) agar ramah aksesibilitas.</p>
                `
            },
            {
                title: "Bab 3: 10 Heuristik Usabilitas Jakob Nielsen",
                content: `
                    <h2>Bab 3: 10 Heuristik Usabilitas Jakob Nielsen</h2>
                    <p>10 Heuristik Nielsen adalah aturan praktis (rules of thumb) yang diakui dunia untuk menilai kualitas usabilitas interaksi manusia dan komputer:</p>
                    <p>
                    <ol>
                        <li><strong>Visibility of system status:</strong> Sistem harus selalu memberi tahu pengguna apa yang sedang terjadi melalui umpan balik yang tepat waktu.</li>
                        <li><strong>Match between system and the real world:</strong> Informasi harus menggunakan istilah dan bahasa yang akrab di telinga pengguna asli.</li>
                        <li><strong>User control and freedom:</strong> Sediakan tombol undo, redo, dan jalan keluar yang jelas saat pengguna membuat kesalahan tak sengaja.</li>
                        <li><strong>Consistency and standards:</strong> Elemen visual dan istilah tidak boleh berbeda antar halaman dalam satu platform.</li>
                        <li><strong>Error prevention:</strong> Desain yang baik harus mencegah terjadinya kesalahan sejak awal sebelum memunculkan pesan error.</li>
                    </ol>
                    </p>
                `
            }
        ]
    },
    {
        id: "analytics-kpi",
        code: "SEC-404",
        title: "Keamanan Siber & Defisit Sistem",
        author: "Ir. Teguh Hartono, CISA",
        category: "Security",
        categoryLabel: "Cyber Security",
        time: "15 menit",
        pages: 310,
        rating: 4.6,
        coverGradient: "linear-gradient(135deg, #ef4444, #b91c1c)",
        chapters: [
            {
                title: "Bab 1: Dasar Keamanan Jaringan dan Informasi",
                content: `
                    <h2>Bab 1: Dasar Keamanan Siber</h2>
                    <p>Keamanan siber (Cybersecurity) bertujuan untuk melindungi kerahasiaan, integritas, dan ketersediaan data (dikenal sebagai CIA Triad) dari serangan, kerusakan, atau akses tidak sah.</p>
                    <p>Komponen CIA Triad meliputi:
                    <ul>
                        <li><strong>Confidentiality (Kerahasiaan):</strong> Memastikan hanya pihak berwenang yang dapat mengakses data sensitif (misalnya lewat enkripsi).</li>
                        <li><strong>Integrity (Integritas):</strong> Menjamin data tidak diubah secara ilegal selama penyimpanan atau transmisi (menggunakan hashing/checksum).</li>
                        <li><strong>Availability (Ketersediaan):</strong> Menjamin sistem dan data dapat diakses oleh pengguna sah saat dibutuhkan (mencegah serangan DDoS).</li>
                    </ul>
                    </p>
                `
            },
            {
                title: "Bab 2: Kriptografi: Enkripsi Simetris, Asimetris, & Hashing",
                content: `
                    <h2>Bab 2: Kriptografi</h2>
                    <p>Kriptografi adalah pilar utama keamanan untuk mengamankan data rahasia.</p>
                    <p><strong>1. Enkripsi Simetris:</strong> Menggunakan kunci yang sama untuk melakukan enkripsi (mengunci data) dan dekripsi (membuka data). Contoh algoritma populer adalah AES (Advanced Encryption Standard). Sangat cepat tetapi sulit dalam pertukaran kunci yang aman.</p>
                    <p><strong>2. Enkripsi Asimetris:</strong> Menggunakan sepasang kunci: Kunci Publik (disebarkan ke semua orang untuk mengunci data) dan Kunci Privat (disimpan rahasia untuk mendekripsi data). Contoh: RSA dan ECC.</p>
                    <p><strong>3. Hashing:</strong> Fungsi satu arah yang mengubah data menjadi string acak dengan panjang tetap. Hashing tidak dapat didekripsi kembali, berguna untuk memverifikasi kecocokan password tanpa menyimpan password asli dalam database. Contoh: SHA-256 dan bcrypt.</p>
                `
            },
            {
                title: "Bab 3: Kerentanan Sistem, Pentesting, dan Pencegahan",
                content: `
                    <h2>Bab 3: Ancaman & Pencegahan</h2>
                    <p>Sistem teknologi seringkali memiliki celah keamanan (vulnerability) yang dapat dimanfaatkan oleh peretas. Metode pengujian celah keamanan ini dikenal sebagai Penetration Testing (Pentesting).</p>
                    <p>Serangan siber yang paling umum antara lain:
                    <ul>
                        <li><strong>Phishing:</strong> Penipuan sosial berupa pengiriman email atau link palsu untuk mencuri data kredensial korban.</li>
                        <li><strong>SQL Injection:</strong> Memasukkan perintah database SQL berbahaya melalui input form web untuk membaca atau merusak data server.</li>
                        <li><strong>Cross-Site Scripting (XSS):</strong> Menyisipkan skrip klien berbahaya (seperti JavaScript) ke dalam halaman web tepercaya yang diakses pengguna lain.</li>
                    </ul>
                    </p>
                    <p>Pencegahan dilakukan dengan membersihkan input form (input sanitization), pembatasan hak akses (principle of least privilege), dan pembaruan berkala celah keamanan sistem.</p>
                `
            }
        ]
    },
    {
        id: "web-semantic",
        code: "WEB-102",
        title: "Esensi HTML5 & Struktur Web Modern",
        author: "Jessica Loren, B.Sc.",
        category: "Web",
        categoryLabel: "Web Engineering",
        time: "14 menit",
        pages: 140,
        rating: 4.8,
        coverGradient: "linear-gradient(135deg, #10b981, #047857)",
        chapters: [
            {
                title: "Bab 1: Evolusi HTML5 & Elemen Semantik",
                content: `
                    <h2>Bab 1: HTML5 Semantik</h2>
                    <p>HTML (HyperText Markup Language) adalah bahasa standar global untuk menstrukturkan halaman web. Rilis HTML5 membawa revolusi besar dengan memperkenalkan elemen semantik.</p>
                    <p>Elemen semantik secara jelas menerangkan arti dari konten tersebut kepada browser, pengembang, dan mesin pencari. Sebelum HTML5, halaman web didominasi oleh tag generik seperti <code>&lt;div class="header"&gt;</code>. HTML5 menggantinya dengan tag semantik asli yang memperjelas struktur dokumen:
                    <ul>
                        <li><code>&lt;header&gt;</code>: Menampung elemen navigasi utama atau judul pengenal halaman.</li>
                        <li><code>&lt;nav&gt;</code>: Blok navigasi khusus link internal atau eksternal.</li>
                        <li><code>&lt;article&gt;</code>: Konten mandiri yang dapat didistribusikan secara terpisah (seperti artikel berita atau post blog).</li>
                        <li><code>&lt;section&gt;</code>: Mengelompokkan konten yang bertema sama dalam satu dokumen.</li>
                        <li><code>&lt;footer&gt;</code>: Informasi penutup halaman, lisensi hak cipta, dan link sekunder.</li>
                    </ul>
                    </p>
                `
            },
            {
                title: "Bab 2: Struktur Web yang SEO-Friendly & Aksesibilitas (ARIA)",
                content: `
                    <h2>Bab 2: SEO & Aksesibilitas Web</h2>
                    <p>HTML semantik sangat membantu perayap (crawler) mesin pencari seperti Googlebot untuk memetakan konten terpenting dalam website Anda, yang secara langsung meningkatkan visibilitas SEO (Search Engine Optimization) halaman Anda.</p>
                    <p>Aksesibilitas web (A11y) memastikan website dapat diakses dengan baik oleh semua orang, termasuk penyandang disabilitas yang menggunakan alat bantu pembaca layar (screen reader). Penggunaan atribut ARIA (Accessible Rich Internet Applications) seperti <code>aria-label</code>, <code>aria-expanded</code>, dan penataan hirarki heading yang tepat (satu <code>&lt;h1&gt;</code> per halaman) adalah bentuk kepatuhan standar web modern.</p>
                `
            },
            {
                title: "Bab 3: Form Lanjut & Elemen Media Asli HTML5",
                content: `
                    <h2>Bab 3: Form Lanjut & Elemen Media</h2>
                    <p>Sebelum HTML5, pemutaran audio dan video di web membutuhkan plugin eksternal seperti Adobe Flash Player yang lambat dan rentan celah keamanan. HTML5 mengintegrasikan pemutaran media secara asli menggunakan tag <code>&lt;audio&gt;</code> dan <code>&lt;video&gt;</code> lengkap dengan API kontrol JavaScript bawaan.</p>
                    <p>HTML5 juga memperkaya elemen formulir dengan tipe input baru seperti <code>email</code>, <code>date</code>, <code>number</code>, <code>range</code> (slider), dan atribut validasi otomatis seperti <code>required</code> dan <code>pattern</code>. Hal ini mengurangi ketergantungan pada JavaScript hanya untuk melakukan validasi form sederhana.</p>
                `
            }
        ]
    },
    {
        id: "flash-snbt",
        code: "MATH-505",
        title: "Kalkulus Adaptif untuk SNBT/TKA",
        author: "Dr. Ahmad Dahlan",
        category: "Math",
        categoryLabel: "Matematika",
        time: "18 menit",
        pages: 260,
        rating: 4.9,
        coverGradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        chapters: [
            {
                title: "Bab 1: Konsep Dasar Limit Fungsi & Kekontinuan",
                content: `
                    <h2>Bab 1: Konsep Limit Fungsi</h2>
                    <p>Limit fungsi adalah salah satu konsep fondasi utama kalkulus. Limit menjelaskan kecenderungan nilai suatu fungsi aljabar atau trigonometri ketika variabel inputnya mendekati suatu angka tertentu secara sangat dekat, baik dari arah kiri maupun kanan, namun tidak harus sama dengan angka tersebut.</p>
                    <p>Secara matematis, limit dinotasikan sebagai:
                    <pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; font-family: monospace;">lim (x -> c) f(x) = L</pre>
                    </p>
                    <p>Suatu fungsi dikatakan kontinu di titik c jika nilai limit x mendekati c dari f(x) ada, nilai fungsi f(c) ada, dan nilai limit tersebut sama dengan nilai fungsi di titik tersebut. Konsep limit sangat berguna untuk menyelesaikan soal limit tak tentu (seperti 0/0) dengan metode pemfaktoran atau aturan L'Hopital.</p>
                `
            },
            {
                title: "Bab 2: Turunan Fungsi Aljabar (Diferensial) & Aplikasi",
                content: `
                    <h2>Bab 2: Turunan Fungsi Aljabar</h2>
                    <p>Turunan (Diferensial) adalah konsep matematika yang mengukur laju perubahan seketika suatu fungsi terhadap perubahan variabel independennya. Secara grafis, turunan di suatu titik mewakili kemiringan (gradien) garis singgung kurva fungsi tersebut di titik yang dimaksud.</p>
                    <p><strong>Aturan Turunan Dasar:</strong>
                    <ul>
                        <li>Fungsi konstan: Turunan dari c adalah 0.</li>
                        <li>Fungsi pangkat: Turunan dari x^n adalah n * x^(n-1).</li>
                        <li>Aturan rantai (chain rule) untuk turunan fungsi komposisi: d/dx [f(g(x))] = f'(g(x)) * g'(x).</li>
                    </ul>
                    </p>
                    <p>Aplikasi turunan meliputi pencarian titik stasioner (nilai maksimum dan minimum fungsi), menentukan interval fungsi naik/turun, dan menyelesaikan masalah optimalisasi kehidupan sehari-hari.</p>
                `
            },
            {
                title: "Bab 3: Konsep Integral dan Perhitungan Luas Daerah",
                content: `
                    <h2>Bab 3: Konsep Integral</h2>
                    <p>Integral adalah operasi kebalikan dari turunan (anti-turnan). Terdapat dua jenis integral utama dalam kalkulus:</p>
                    <p><strong>1. Integral Tak Tentu:</strong> Mengembalikan fungsi umum beserta konstanta pengintegralan C.
                    <pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; font-family: monospace;">∫ x^n dx = (1 / (n+1)) * x^(n+1) + C</pre>
                    </p>
                    <p><strong>2. Integral Tentu:</strong> Memiliki batas pengintegralan atas dan bawah, menghasilkan suatu nilai numerik mutlak yang presisi. Berdasarkan Teorema Dasar Kalkulus, integral tentu digunakan secara luas untuk menghitung luas daerah di bawah kurva yang dibatasi koordinat tertentu, serta volume benda putar 3 dimensi.</p>
                `
            }
        ]
    },
    {
        id: "learning-psychology",
        code: "PSY-110",
        title: "Psikologi Belajar dan Kebiasaan Efektif",
        author: "Dr. Maya Kartika, M.Psi.",
        category: "Psychology",
        categoryLabel: "Psikologi",
        time: "16 menit",
        pages: 210,
        rating: 4.8,
        coverGradient: "linear-gradient(135deg, #14b8a6, #0f766e)",
        chapters: [
            {
                title: "Bab 1: Cara Otak Membentuk Ingatan",
                content: `
                    <h2>Bab 1: Cara Otak Membentuk Ingatan</h2>
                    <p>Belajar bukan sekadar membaca ulang materi, tetapi proses membangun jalur memori melalui perhatian, pengulangan bermakna, dan penggunaan aktif. Informasi yang hanya dilihat sekilas biasanya berhenti di memori jangka pendek, sementara informasi yang dipakai untuk menjawab pertanyaan, menjelaskan ulang, atau menyelesaikan masalah lebih mudah masuk ke memori jangka panjang.</p>
                    <p>Strategi yang kuat adalah retrieval practice, yaitu mencoba mengingat kembali materi tanpa melihat catatan. Cara ini melatih otak mengambil informasi, bukan hanya mengenalinya. Digabungkan dengan jeda belajar atau spaced repetition, hasil belajar cenderung lebih tahan lama.</p>
                `
            },
            {
                title: "Bab 2: Fokus, Distraksi, dan Energi Mental",
                content: `
                    <h2>Bab 2: Fokus, Distraksi, dan Energi Mental</h2>
                    <p>Fokus adalah sumber daya terbatas. Terlalu sering berpindah aplikasi, membuka notifikasi, atau belajar sambil multitasking membuat otak membayar biaya perpindahan perhatian. Karena itu, sesi belajar singkat namun dalam sering lebih efektif daripada durasi panjang yang penuh gangguan.</p>
                    <p>Gunakan blok waktu 25 sampai 45 menit untuk satu tujuan belajar. Tutup distraksi utama, tentukan target kecil, lalu akhiri sesi dengan ringkasan satu paragraf atau tiga poin inti. Kebiasaan kecil ini membuat proses belajar lebih mudah diulang.</p>
                `
            },
            {
                title: "Bab 3: Membangun Kebiasaan Belajar",
                content: `
                    <h2>Bab 3: Membangun Kebiasaan Belajar</h2>
                    <p>Kebiasaan terbentuk melalui pemicu, rutinitas, dan hadiah. Pemicu dapat berupa jam tertentu, tempat belajar, atau daftar tugas singkat. Rutinitasnya adalah tindakan belajar yang spesifik, misalnya membaca satu bab dan membuat lima pertanyaan. Hadiahnya dapat berupa rasa selesai, checklist, atau jeda singkat.</p>
                    <p>Mulailah dari target kecil yang tidak terasa berat. Konsistensi lebih penting daripada intensitas awal. Setelah kebiasaan stabil, tingkatkan durasi atau tingkat kesulitannya secara bertahap.</p>
                `
            }
        ]
    },
    {
        id: "micro-economics",
        code: "ECO-210",
        title: "Ekonomi Mikro untuk Pengambilan Keputusan",
        author: "Prof. Nandita Prameswari",
        category: "Economics",
        categoryLabel: "Ekonomi",
        time: "17 menit",
        pages: 240,
        rating: 4.7,
        coverGradient: "linear-gradient(135deg, #22c55e, #15803d)",
        chapters: [
            {
                title: "Bab 1: Kelangkaan, Pilihan, dan Biaya Peluang",
                content: `
                    <h2>Bab 1: Kelangkaan, Pilihan, dan Biaya Peluang</h2>
                    <p>Ekonomi dimulai dari kenyataan bahwa sumber daya terbatas, sedangkan kebutuhan manusia terus berkembang. Setiap keputusan memiliki biaya peluang, yaitu manfaat terbaik yang dikorbankan ketika memilih satu alternatif dibanding alternatif lain.</p>
                    <p>Konsep ini membantu mahasiswa memahami keputusan rumah tangga, perusahaan, maupun pemerintah. Memilih waktu untuk belajar, bekerja, atau beristirahat juga memiliki biaya peluang yang dapat dianalisis secara ekonomi.</p>
                `
            },
            {
                title: "Bab 2: Permintaan, Penawaran, dan Harga",
                content: `
                    <h2>Bab 2: Permintaan, Penawaran, dan Harga</h2>
                    <p>Permintaan menggambarkan jumlah barang yang ingin dibeli konsumen pada berbagai tingkat harga. Penawaran menggambarkan jumlah barang yang siap dijual produsen. Titik temu keduanya membentuk harga keseimbangan.</p>
                    <p>Ketika permintaan naik sementara penawaran tetap, harga cenderung meningkat. Ketika penawaran melimpah sementara permintaan tetap, harga cenderung turun. Pola sederhana ini menjadi dasar analisis pasar.</p>
                `
            },
            {
                title: "Bab 3: Elastisitas dan Strategi Pasar",
                content: `
                    <h2>Bab 3: Elastisitas dan Strategi Pasar</h2>
                    <p>Elastisitas mengukur seberapa peka konsumen terhadap perubahan harga. Barang kebutuhan pokok biasanya kurang elastis, sedangkan barang substitusi atau barang mewah lebih elastis.</p>
                    <p>Perusahaan menggunakan konsep elastisitas untuk menentukan harga, diskon, dan segmentasi pasar. Pemerintah juga memakainya untuk memperkirakan dampak pajak atau subsidi terhadap perilaku masyarakat.</p>
                `
            }
        ]
    },
    {
        id: "indonesia-history",
        code: "HIS-120",
        title: "Sejarah Indonesia Modern",
        author: "Dr. Bima Mahendra",
        category: "History",
        categoryLabel: "Sejarah",
        time: "18 menit",
        pages: 280,
        rating: 4.9,
        coverGradient: "linear-gradient(135deg, #f97316, #c2410c)",
        chapters: [
            {
                title: "Bab 1: Pergerakan Nasional",
                content: `
                    <h2>Bab 1: Pergerakan Nasional</h2>
                    <p>Pergerakan nasional Indonesia tumbuh dari perubahan pendidikan, organisasi modern, pers, dan kesadaran identitas bersama. Organisasi seperti Budi Utomo, Sarekat Islam, dan berbagai kelompok pemuda memperluas gagasan tentang kemerdekaan dan persatuan.</p>
                    <p>Periode ini penting karena menunjukkan perubahan cara perjuangan, dari perlawanan lokal menuju gerakan politik dan sosial yang lebih terorganisasi.</p>
                `
            },
            {
                title: "Bab 2: Proklamasi dan Awal Republik",
                content: `
                    <h2>Bab 2: Proklamasi dan Awal Republik</h2>
                    <p>Proklamasi 17 Agustus 1945 menjadi penanda lahirnya Republik Indonesia. Namun kemerdekaan tidak otomatis membuat negara baru stabil. Pemerintah harus membangun konstitusi, lembaga negara, diplomasi, dan pertahanan dalam situasi konflik.</p>
                    <p>Masa awal republik memperlihatkan pentingnya kepemimpinan, konsolidasi politik, dan dukungan rakyat dalam mempertahankan kemerdekaan.</p>
                `
            },
            {
                title: "Bab 3: Reformasi dan Demokrasi Kontemporer",
                content: `
                    <h2>Bab 3: Reformasi dan Demokrasi Kontemporer</h2>
                    <p>Reformasi 1998 membuka perubahan besar pada sistem politik Indonesia. Pemilu lebih terbuka, desentralisasi diperkuat, kebebasan pers meningkat, dan lembaga demokrasi mengalami pembaruan.</p>
                    <p>Tantangannya adalah menjaga kualitas demokrasi, menekan korupsi, melindungi hak warga, dan memastikan pembangunan terasa adil bagi berbagai daerah.</p>
                `
            }
        ]
    },
    {
        id: "biology-cell",
        code: "BIO-130",
        title: "Biologi Sel dan Genetika Dasar",
        author: "Dr. Laras Puspita",
        category: "Biology",
        categoryLabel: "Biologi",
        time: "15 menit",
        pages: 230,
        rating: 4.6,
        coverGradient: "linear-gradient(135deg, #84cc16, #4d7c0f)",
        chapters: [
            {
                title: "Bab 1: Struktur dan Fungsi Sel",
                content: `
                    <h2>Bab 1: Struktur dan Fungsi Sel</h2>
                    <p>Sel adalah unit dasar kehidupan. Di dalamnya terdapat organel yang bekerja seperti sistem kecil: nukleus menyimpan informasi genetik, mitokondria menghasilkan energi, ribosom membuat protein, dan membran sel mengatur keluar masuk zat.</p>
                    <p>Memahami sel membantu kita memahami jaringan, organ, penyakit, dan mekanisme tubuh secara menyeluruh.</p>
                `
            },
            {
                title: "Bab 2: DNA, Gen, dan Pewarisan Sifat",
                content: `
                    <h2>Bab 2: DNA, Gen, dan Pewarisan Sifat</h2>
                    <p>DNA menyimpan instruksi biologis dalam bentuk urutan basa nitrogen. Segmen DNA yang membawa informasi untuk sifat tertentu disebut gen. Gen diwariskan dari orang tua kepada anak melalui proses reproduksi.</p>
                    <p>Variasi genetik membuat makhluk hidup berbeda satu sama lain. Variasi ini dapat muncul melalui kombinasi gen, mutasi, dan seleksi alam.</p>
                `
            },
            {
                title: "Bab 3: Ekspresi Gen dan Protein",
                content: `
                    <h2>Bab 3: Ekspresi Gen dan Protein</h2>
                    <p>Ekspresi gen adalah proses ketika informasi dalam DNA digunakan untuk membuat protein. Tahap utamanya adalah transkripsi dari DNA ke RNA, lalu translasi RNA menjadi rantai asam amino.</p>
                    <p>Protein berperan sebagai enzim, struktur sel, pengangkut molekul, dan sinyal biologis. Karena itu, perubahan pada gen dapat memengaruhi fungsi tubuh.</p>
                `
            }
        ]
    },
    {
        id: "world-literature",
        code: "LIT-160",
        title: "Pengantar Sastra Dunia",
        author: "Ratih Anindya, M.Hum.",
        category: "Literature",
        categoryLabel: "Sastra",
        time: "14 menit",
        pages: 190,
        rating: 4.8,
        coverGradient: "linear-gradient(135deg, #a855f7, #7e22ce)",
        chapters: [
            {
                title: "Bab 1: Membaca Tema dan Konflik",
                content: `
                    <h2>Bab 1: Membaca Tema dan Konflik</h2>
                    <p>Sastra membantu pembaca memahami pengalaman manusia melalui tokoh, konflik, latar, dan bahasa. Tema adalah gagasan utama yang mengikat cerita, sedangkan konflik memberi dorongan emosional pada alur.</p>
                    <p>Membaca sastra bukan hanya mencari pesan moral, tetapi juga mengamati bagaimana bentuk, gaya, dan sudut pandang membangun makna.</p>
                `
            },
            {
                title: "Bab 2: Puisi, Prosa, dan Drama",
                content: `
                    <h2>Bab 2: Puisi, Prosa, dan Drama</h2>
                    <p>Puisi menekankan kepadatan bahasa, citraan, ritme, dan metafora. Prosa memberikan ruang naratif lebih luas melalui cerita pendek dan novel. Drama menghidupkan konflik melalui dialog dan aksi panggung.</p>
                    <p>Ketiga bentuk ini memiliki cara berbeda untuk membangun imajinasi dan menyampaikan pengalaman batin manusia.</p>
                `
            },
            {
                title: "Bab 3: Konteks Budaya dalam Sastra",
                content: `
                    <h2>Bab 3: Konteks Budaya dalam Sastra</h2>
                    <p>Karya sastra lahir dari konteks sosial, politik, sejarah, dan budaya tertentu. Memahami konteks membantu pembaca menangkap lapisan makna yang mungkin tidak terlihat dari alur cerita saja.</p>
                    <p>Namun pembacaan sastra tetap terbuka. Pembaca dapat membandingkan pengalaman tokoh dengan realitas masa kini dan pengalaman pribadi.</p>
                `
            }
        ]
    },
    {
        id: "constitutional-law",
        code: "LAW-201",
        title: "Dasar Hukum Tata Negara",
        author: "Dr. Fajar Nugroho, S.H.",
        category: "Law",
        categoryLabel: "Hukum",
        time: "16 menit",
        pages: 250,
        rating: 4.7,
        coverGradient: "linear-gradient(135deg, #64748b, #334155)",
        chapters: [
            {
                title: "Bab 1: Konstitusi dan Negara Hukum",
                content: `
                    <h2>Bab 1: Konstitusi dan Negara Hukum</h2>
                    <p>Konstitusi adalah aturan dasar yang mengatur struktur negara, pembagian kekuasaan, hak warga, dan prinsip penyelenggaraan pemerintahan. Dalam negara hukum, kekuasaan harus dibatasi oleh hukum dan dapat dipertanggungjawabkan.</p>
                    <p>Prinsip ini mencegah kekuasaan berjalan sewenang-wenang dan memastikan warga memiliki perlindungan hukum.</p>
                `
            },
            {
                title: "Bab 2: Pembagian Kekuasaan",
                content: `
                    <h2>Bab 2: Pembagian Kekuasaan</h2>
                    <p>Pembagian kekuasaan memisahkan fungsi legislatif, eksekutif, dan yudikatif agar saling mengawasi. Mekanisme checks and balances menjaga agar satu lembaga tidak mendominasi lembaga lain.</p>
                    <p>Dalam praktiknya, koordinasi antarlembaga tetap diperlukan, tetapi harus berjalan sesuai batas kewenangan.</p>
                `
            },
            {
                title: "Bab 3: Hak Warga Negara",
                content: `
                    <h2>Bab 3: Hak Warga Negara</h2>
                    <p>Hak warga negara meliputi hak sipil, politik, ekonomi, sosial, dan budaya. Negara berkewajiban menghormati, melindungi, dan memenuhi hak tersebut melalui kebijakan dan lembaga publik.</p>
                    <p>Pemahaman hak warga membantu masyarakat berpartisipasi secara aktif dan kritis dalam kehidupan demokrasi.</p>
                `
            }
        ]
    },
    {
        id: "education-assessment",
        code: "EDU-140",
        title: "Strategi Pembelajaran dan Asesmen",
        author: "Dian Pratiwi, M.Pd.",
        category: "Education",
        categoryLabel: "Pendidikan",
        time: "13 menit",
        pages: 175,
        rating: 4.6,
        coverGradient: "linear-gradient(135deg, #06b6d4, #0369a1)",
        chapters: [
            {
                title: "Bab 1: Tujuan Belajar yang Terukur",
                content: `
                    <h2>Bab 1: Tujuan Belajar yang Terukur</h2>
                    <p>Pembelajaran efektif dimulai dari tujuan yang jelas. Tujuan belajar yang baik menyebutkan kemampuan apa yang harus dicapai siswa, dalam konteks apa, dan bagaimana keberhasilannya diamati.</p>
                    <p>Tujuan yang terukur membantu guru memilih aktivitas belajar, bahan ajar, dan bentuk penilaian yang selaras.</p>
                `
            },
            {
                title: "Bab 2: Pembelajaran Aktif",
                content: `
                    <h2>Bab 2: Pembelajaran Aktif</h2>
                    <p>Pembelajaran aktif menempatkan siswa sebagai peserta yang berpikir, berdiskusi, mencoba, dan merefleksikan. Guru berperan sebagai perancang pengalaman belajar, bukan hanya penyampai informasi.</p>
                    <p>Contohnya adalah diskusi kasus, proyek kecil, eksperimen, kuis formatif, dan presentasi singkat.</p>
                `
            },
            {
                title: "Bab 3: Asesmen Formatif",
                content: `
                    <h2>Bab 3: Asesmen Formatif</h2>
                    <p>Asesmen formatif dilakukan selama proses belajar untuk memberi umpan balik cepat. Tujuannya bukan memberi nilai akhir, tetapi membantu siswa dan guru mengetahui bagian mana yang perlu diperbaiki.</p>
                    <p>Contoh asesmen formatif antara lain exit ticket, pertanyaan refleksi, latihan singkat, dan pemeriksaan pemahaman lisan.</p>
                `
            }
        ]
    },
    {
        id: "public-health",
        code: "HLT-170",
        title: "Kesehatan Publik dan Gaya Hidup",
        author: "dr. Nadia Permata",
        category: "Health",
        categoryLabel: "Kesehatan",
        time: "12 menit",
        pages: 160,
        rating: 4.7,
        coverGradient: "linear-gradient(135deg, #fb7185, #be123c)",
        chapters: [
            {
                title: "Bab 1: Determinan Kesehatan",
                content: `
                    <h2>Bab 1: Determinan Kesehatan</h2>
                    <p>Kesehatan dipengaruhi oleh banyak faktor: genetik, perilaku, lingkungan, akses layanan kesehatan, pendidikan, pendapatan, dan dukungan sosial. Karena itu, kesehatan publik memandang masalah kesehatan sebagai persoalan individu sekaligus masyarakat.</p>
                    <p>Pencegahan sering lebih efektif daripada pengobatan setelah penyakit berkembang.</p>
                `
            },
            {
                title: "Bab 2: Nutrisi, Aktivitas, dan Tidur",
                content: `
                    <h2>Bab 2: Nutrisi, Aktivitas, dan Tidur</h2>
                    <p>Gaya hidup sehat bertumpu pada pola makan seimbang, aktivitas fisik rutin, tidur cukup, dan pengelolaan stres. Perubahan kecil yang konsisten dapat memberi dampak besar pada energi dan daya tahan tubuh.</p>
                    <p>Prinsip dasarnya adalah memilih makanan beragam, mengurangi konsumsi berlebihan, bergerak setiap hari, dan menjaga ritme tidur.</p>
                `
            },
            {
                title: "Bab 3: Literasi Kesehatan",
                content: `
                    <h2>Bab 3: Literasi Kesehatan</h2>
                    <p>Literasi kesehatan adalah kemampuan mencari, memahami, dan menggunakan informasi kesehatan dengan benar. Di era digital, kemampuan mengecek sumber informasi menjadi sangat penting.</p>
                    <p>Informasi kesehatan sebaiknya dibandingkan dengan sumber resmi, tenaga medis, dan bukti ilmiah yang dapat dipertanggungjawabkan.</p>
                `
            }
        ]
    },
    {
        id: "climate-environment",
        code: "ENV-180",
        title: "Lingkungan dan Perubahan Iklim",
        author: "Dr. Sena Wiratama",
        category: "Environment",
        categoryLabel: "Lingkungan",
        time: "15 menit",
        pages: 205,
        rating: 4.8,
        coverGradient: "linear-gradient(135deg, #16a34a, #166534)",
        chapters: [
            {
                title: "Bab 1: Ekosistem dan Keseimbangan",
                content: `
                    <h2>Bab 1: Ekosistem dan Keseimbangan</h2>
                    <p>Ekosistem adalah jaringan interaksi antara makhluk hidup dan lingkungan fisiknya. Keseimbangan ekosistem dapat terganggu oleh pencemaran, perubahan penggunaan lahan, eksploitasi berlebih, dan perubahan iklim.</p>
                    <p>Ketika satu komponen terganggu, dampaknya dapat menyebar ke rantai makanan, kualitas air, udara, dan kehidupan manusia.</p>
                `
            },
            {
                title: "Bab 2: Perubahan Iklim",
                content: `
                    <h2>Bab 2: Perubahan Iklim</h2>
                    <p>Perubahan iklim dipicu oleh peningkatan gas rumah kaca yang menahan panas di atmosfer. Dampaknya meliputi kenaikan suhu rata-rata, cuaca ekstrem, kenaikan permukaan laut, dan perubahan pola musim.</p>
                    <p>Upaya mitigasi menekan penyebabnya, sedangkan adaptasi membantu masyarakat menyesuaikan diri dengan dampaknya.</p>
                `
            },
            {
                title: "Bab 3: Aksi Berkelanjutan",
                content: `
                    <h2>Bab 3: Aksi Berkelanjutan</h2>
                    <p>Aksi berkelanjutan dapat dimulai dari penghematan energi, pengurangan sampah, transportasi rendah emisi, konsumsi bijak, dan perlindungan ruang hijau. Pada skala lebih besar, kebijakan publik dan inovasi industri sangat menentukan.</p>
                    <p>Keberlanjutan bukan sekadar isu lingkungan, tetapi juga menyangkut keadilan sosial dan ekonomi antar generasi.</p>
                `
            }
        ]
    },
    {
        id: "business-strategy",
        code: "BUS-220",
        title: "Strategi Bisnis dan Kewirausahaan",
        author: "Raka Indrajaya, MBA",
        category: "Business",
        categoryLabel: "Bisnis",
        time: "14 menit",
        pages: 215,
        rating: 4.7,
        coverGradient: "linear-gradient(135deg, #0ea5e9, #1d4ed8)",
        chapters: [
            {
                title: "Bab 1: Model Bisnis",
                content: `
                    <h2>Bab 1: Model Bisnis</h2>
                    <p>Model bisnis menjelaskan bagaimana sebuah organisasi menciptakan, menyampaikan, dan menangkap nilai. Elemen pentingnya meliputi pelanggan, proposisi nilai, saluran distribusi, sumber pendapatan, struktur biaya, dan mitra utama.</p>
                    <p>Model yang baik tidak hanya terlihat menarik di atas kertas, tetapi mampu diuji dengan pelanggan nyata.</p>
                `
            },
            {
                title: "Bab 2: Validasi Pasar",
                content: `
                    <h2>Bab 2: Validasi Pasar</h2>
                    <p>Validasi pasar dilakukan untuk memastikan masalah pelanggan benar-benar ada dan solusi yang ditawarkan cukup bernilai. Wawancara pelanggan, prototipe sederhana, dan uji harga adalah beberapa metode yang sering digunakan.</p>
                    <p>Tujuan validasi adalah belajar cepat sebelum menghabiskan terlalu banyak sumber daya.</p>
                `
            },
            {
                title: "Bab 3: Pertumbuhan dan Operasi",
                content: `
                    <h2>Bab 3: Pertumbuhan dan Operasi</h2>
                    <p>Pertumbuhan bisnis memerlukan strategi pemasaran, proses operasional yang rapi, pengelolaan keuangan, dan kualitas layanan yang konsisten. Pertumbuhan yang terlalu cepat tanpa fondasi operasi dapat menimbulkan masalah baru.</p>
                    <p>Bisnis yang sehat menjaga keseimbangan antara akuisisi pelanggan, retensi, margin, dan kemampuan tim menjalankan proses harian.</p>
                `
            }
        ]
    }
];
