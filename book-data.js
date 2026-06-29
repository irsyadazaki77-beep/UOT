// Database Buku Digital Universitas - Terkembang & Lengkap
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
                    
                    <div style="background: rgba(79, 140, 255, 0.08); border-left: 4px solid var(--blue); padding: 12px 16px; border-radius: 0 12px 12px 0; margin: 16px 0;">
                        <strong>Catatan Penting:</strong> Di browser, JavaScript berinteraksi langsung dengan DOM (Document Object Model) untuk memperbarui halaman secara langsung tanpa reload.
                    </div>

                    <h3>Perbandingan Kata Kunci Variabel</h3>
                    <p>Dalam JavaScript modern, manajemen memori dan variabel menggunakan kata kunci yang lebih aman untuk menghindari hoisting bugs:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                <th style="padding: 8px;">Fitur</th>
                                <th style="padding: 8px;"><code>let</code></th>
                                <th style="padding: 8px;"><code>const</code></th>
                                <th style="padding: 8px;"><code>var</code> (Lama)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;">Scope</td>
                                <td style="padding: 8px;">Block Scope</td>
                                <td style="padding: 8px;">Block Scope</td>
                                <td style="padding: 8px;">Function Scope</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;">Reassign</td>
                                <td style="padding: 8px;">Bisa</td>
                                <td style="padding: 8px;">Tidak Bisa</td>
                                <td style="padding: 8px;">Bisa</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;">Redeclare</td>
                                <td style="padding: 8px;">Tidak Bisa</td>
                                <td style="padding: 8px;">Tidak Bisa</td>
                                <td style="padding: 8px;">Bisa</td>
                            </tr>
                        </tbody>
                    </table>

                    <p>Contoh penulisan deklarasi variabel:</p>
                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
let counter = 1;
counter = 2; // Berhasil

const apiKey = "XYZ123";
// apiKey = "ABC"; // Error: Assignment to constant variable.
                    </pre>
                `,
                quiz: {
                    question: "Manakah kata kunci variabel di JavaScript modern yang nilainya dapat diubah-ubah namun tidak dapat dideklarasikan ulang dalam scope yang sama?",
                    options: ["const", "let", "var", "static"],
                    correct: 1,
                    explanation: "Kata kunci 'let' digunakan untuk mendeklarasikan variabel yang nilainya bisa di-reassign (diubah) tetapi tidak bisa dideklarasikan ulang (re-declared) dalam blok scope yang sama."
                }
            },
            {
                title: "Bab 2: Struktur Kontrol Alur dan Logika",
                content: `
                    <h2>Bab 2: Struktur Kontrol Alur</h2>
                    <p>Struktur kontrol alur pemrograman adalah mekanisme yang menentukan baris kode mana yang akan dieksekusi berdasarkan kondisi logika tertentu atau melakukan perulangan untuk efisiensi penulisan kode.</p>
                    
                    <h3>1. Percabangan (Conditional)</h3>
                    <p>Pengambilan keputusan dilakukan menggunakan blok <code>if</code>, <code>else if</code>, dan <code>else</code>. Untuk kondisi percabangan yang banyak dan bersifat statis, alternatif yang lebih rapi adalah struktur <code>switch-case</code>.</p>
                    
                    <h3>2. Perulangan (Looping)</h3>
                    <p>Perulangan digunakan untuk mengeksekusi blok kode secara berulang selama kondisi terpenuhi. JavaScript menyediakan beberapa jenis perulangan:</p>
                    <ul>
                        <li><code>for</code> loop: Digunakan ketika batas atau jumlah perulangan sudah diketahui dengan pasti.</li>
                        <li><code>while</code> loop: Mengeksekusi blok kode selama kondisi bernilai <code>true</code>.</li>
                        <li><code>do-while</code>: Menjamin kode dieksekusi minimal satu kali sebelum memeriksa kondisi logika.</li>
                        <li><code>for-of</code>: Iterasi langsung di atas nilai elemen dari objek iterabel seperti Array.</li>
                    </ul>

                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
// Contoh Perulangan for-of
const fruits = ["Apel", "Mangga", "Pisang"];
for (const fruit of fruits) {
    console.log(fruit); // Output: Apel, Mangga, Pisang
}
                    </pre>
                `,
                quiz: {
                    question: "Jenis perulangan manakah di JavaScript yang menjamin blok kodenya dieksekusi minimal satu kali terlebih dahulu sebelum mengecek kondisi logikanya?",
                    options: ["for loop", "while loop", "do-while loop", "for-in loop"],
                    correct: 2,
                    explanation: "Perulangan do-while mengeksekusi blok kode di dalam 'do' terlebih dahulu, baru kemudian mengevaluasi kondisi di dalam 'while' di bagian akhir."
                }
            },
            {
                title: "Bab 3: Fungsi, Objek, dan Array",
                content: `
                    <h2>Bab 3: Fungsi dan Struktur Data</h2>
                    <p>Fungsi (Function) adalah blok kode terorganisasi yang digunakan untuk melakukan tindakan tertentu dan dapat dipanggil berulang kali secara modular. Deklarasi fungsi di JavaScript dapat dilakukan dengan cara tradisional maupun menggunakan sintaks modern <code>arrow function</code>.</p>
                    
                    <h3>Arrow Function</h3>
                    <p>Sintaks ringkas ini sangat sering digunakan dalam pemrograman modern karena tidak mengikat konteks <code>this</code> sendiri:</p>
                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
// Sintaks Tradisional
function tambah(a, b) {
    return a + b;
}

// Sintaks Arrow Function
const tambahArrow = (a, b) => a + b;
                    </pre>

                    <h3>Manipulasi Array Modern</h3>
                    <p>Gunakan fungsi deklaratif untuk mengolah array secara efisien:</p>
                    <ul>
                        <li><code>map()</code>: Mengubah setiap elemen array menjadi elemen baru.</li>
                        <li><code>filter()</code>: Menyaring elemen berdasarkan kondisi logika tertentu.</li>
                        <li><code>reduce()</code>: Mengakumulasikan seluruh elemen array menjadi satu nilai tunggal.</li>
                    </ul>
                `,
                quiz: {
                    question: "Fungsi bawaan array manakah yang digunakan jika kita ingin menyaring elemen array dan menghasilkan array baru yang hanya berisi elemen yang memenuhi kriteria tertentu?",
                    options: ["map()", "reduce()", "filter()", "forEach()"],
                    correct: 2,
                    explanation: "Fungsi filter() mengevaluasi setiap elemen array dengan fungsi callback dan mengembalikan array baru berisi elemen-elemen yang menghasilkan nilai true."
                }
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
                    
                    <div style="background: rgba(50, 214, 107, 0.08); border-left: 4px solid var(--green); padding: 12px 16px; border-radius: 0 12px 12px 0; margin: 16px 0;">
                        <strong>Prinsip Utama:</strong> Kepatuhan terhadap standar ACID menjamin integritas transaksi data.
                    </div>

                    <h3>Karakteristik ACID</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                <th style="padding: 8px;">Karakteristik</th>
                                <th style="padding: 8px;">Penjelasan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;"><strong>Atomicity</strong></td>
                                <td style="padding: 8px;">Seluruh perintah dalam transaksi harus sukses semua atau gagal seluruhnya (rollback).</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;"><strong>Consistency</strong></td>
                                <td style="padding: 8px;">Data berpindah dari satu kondisi valid ke kondisi valid berikutnya sesuai constraint.</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;"><strong>Isolation</strong></td>
                                <td style="padding: 8px;">Transaksi yang berjalan bersamaan tidak boleh saling mengganggu (interferensi).</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 8px;"><strong>Durability</strong></td>
                                <td style="padding: 8px;">Data yang berhasil di-commit akan tersimpan secara permanen di media penyimpanan.</td>
                            </tr>
                        </tbody>
                    </table>
                `,
                quiz: {
                    question: "Karakteristik transaksi database manakah yang memastikan bahwa ketika sistem mati secara tiba-tiba setelah transaksi berhasil, data tetap tersimpan aman di disk?",
                    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
                    correct: 3,
                    explanation: "Durability menjamin hasil dari transaksi database yang telah sukses di-commit akan bertahan secara permanen di media penyimpanan keras."
                }
            },
            {
                title: "Bab 2: Dasar DDL, DML, dan Query SELECT",
                content: `
                    <h2>Bab 2: DDL, DML, dan SELECT Query</h2>
                    <p>Structured Query Language (SQL) dibagi menjadi beberapa sub-bahasa utama berdasarkan fungsinya:</p>
                    
                    <h3>1. DDL (Data Definition Language)</h3>
                    <p>Perintah untuk membuat, memodifikasi, dan menghapus struktur tabel atau skema database. Contoh perintah:</p>
                    <ul>
                        <li><code>CREATE TABLE</code>: Membuat tabel baru.</li>
                        <li><code>ALTER TABLE</code>: Mengubah struktur kolom.</li>
                        <li><code>DROP TABLE</code>: Menghapus tabel secara permanen.</li>
                    </ul>

                    <h3>2. DML (Data Manipulation Language)</h3>
                    <p>Perintah untuk mengolah isi data di dalam tabel. Contoh perintah:</p>
                    <ul>
                        <li><code>INSERT INTO</code>: Menambahkan baris data baru.</li>
                        <li><code>UPDATE</code>: Memperbarui data yang ada.</li>
                        <li><code>DELETE</code>: Menghapus data spesifik.</li>
                    </ul>

                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
-- Contoh Query DML dan SELECT
INSERT INTO mahasiswa (nama, nim) VALUES ('Zaki', '12345');
SELECT * FROM mahasiswa WHERE nim = '12345';
                    </pre>
                `,
                quiz: {
                    question: "Manakah di bawah ini yang merupakan contoh perintah Data Definition Language (DDL)?",
                    options: ["INSERT INTO", "ALTER TABLE", "UPDATE", "SELECT"],
                    correct: 1,
                    explanation: "ALTER TABLE mengubah struktur skema database (kolom, tipe data), sehingga termasuk Data Definition Language (DDL)."
                }
            },
            {
                title: "Bab 3: Sintaks Visual SQL JOIN dan Agregasi",
                content: `
                    <h2>Bab 3: SQL JOIN & Agregasi</h2>
                    <p>JOIN digunakan untuk menyatukan baris-baris dari dua tabel atau lebih berdasarkan kolom relasi kunci yang bersesuaian di antara mereka.</p>
                    
                    <h3>Tipe-Tipe SQL JOIN</h3>
                    <ul>
                        <li><strong>INNER JOIN:</strong> Hanya menampilkan baris jika ada kecocokan di kedua belah tabel.</li>
                        <li><strong>LEFT JOIN:</strong> Mengembalikan seluruh baris dari tabel sebelah kiri, dan kolom yang cocok dari tabel kanan (atau NULL jika tidak ada cocok).</li>
                        <li><strong>RIGHT JOIN:</strong> Mengembalikan seluruh baris dari tabel sebelah kanan, dan kolom yang cocok dari tabel kiri.</li>
                    </ul>

                    <h3>Fungsi Agregasi</h3>
                    <p>Digunakan untuk melakukan kalkulasi data kuantitatif:</p>
                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
SELECT department, AVG(salary) 
FROM karyawan 
GROUP BY department;
                    </pre>
                `,
                quiz: {
                    question: "Jika kita ingin mengambil semua data dari tabel 'karyawan' (sebelah kiri) meskipun departemen mereka (sebelah kanan) belum terdaftar di tabel 'departemen', JOIN mana yang harus digunakan?",
                    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
                    correct: 1,
                    explanation: "LEFT JOIN mengembalikan semua baris dari tabel sebelah kiri, bahkan jika tidak ada baris yang cocok di tabel sebelah kanan."
                }
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
                    <p>UI berfokus pada keindahan estetika antarmuka produk digital (warna, tombol, tipografi), sedangkan UX berfokus pada kemudahan kegunaan serta kenyamanan interaksi pengguna dengan produk digital tersebut.</p>
                    
                    <p>User-Centered Design (UCD) menempatkan pengguna sebagai subjek utama pada setiap siklus desain. Langkah-langkah utama UCD meliputi:</p>
                    <ol>
                        <li><strong>User Research:</strong> Memahami kebutuhan nyata target pengguna.</li>
                        <li><strong>Wireframing:</strong> Merancang tata letak dasar hitam-putih.</li>
                        <li><strong>Prototyping:</strong> Membuat simulasi interaksi antarmuka yang dapat diklik.</li>
                        <li><strong>Usability Testing:</strong> Menguji produk langsung ke pengguna untuk dievaluasi.</li>
                    </ol>
                `,
                quiz: {
                    question: "Apakah tujuan utama dari dilakukannya tahapan Usability Testing dalam siklus User-Centered Design?",
                    options: ["Mencari warna dominan yang paling disukai desainer", "Menguji langsung produk ke pengguna asli untuk mengevaluasi kemudahan penggunaannya", "Menulis baris kode program utama", "Membuat logo resmi produk"],
                    correct: 1,
                    explanation: "Usability testing bertujuan memvalidasi kegunaan desain dengan mengamati pengguna nyata berinteraksi dengan produk."
                }
            },
            {
                title: "Bab 2: Hirarki Visual, Tipografi, dan Psikologi Warna",
                content: `
                    <h2>Bab 2: Estetika & Hirarki Visual</h2>
                    <p>Hirarki visual memandu mata pengguna di sepanjang antarmuka produk digital, mempertegas elemen apa yang paling penting untuk dibaca pertama kali.</p>
                    
                    <h3>Tipografi dan Kontras</h3>
                    <p>Perbedaan ukuran font (misal: H1, H2, body) dan ketebalan membantu membangun aliran bacaan yang alami bagi pengguna.</p>

                    <h3>Psikologi Warna</h3>
                    <ul>
                        <li><strong>Biru:</strong> Kepercayaan, kestabilan, profesional (sering untuk teknologi & finansial).</li>
                        <li><strong>Hijau:</strong> Keberhasilan, kesehatan, penyelesaian tugas.</li>
                        <li><strong>Merah:</strong> Peringatan, kesalahan, urgensi tindakan.</li>
                    </ul>
                `,
                quiz: {
                    question: "Rasio kontras warna teks dan latar belakang minimal berapakah yang disarankan oleh standar WCAG 2.0 untuk teks biasa agar ramah aksesibilitas?",
                    options: ["2.0:1", "3.0:1", "4.5:1", "7.0:1"],
                    correct: 2,
                    explanation: "WCAG 2.0 menyarankan rasio kontras minimal 4.5:1 untuk teks ukuran normal agar mudah dibaca oleh penyandang gangguan penglihatan."
                }
            },
            {
                title: "Bab 3: 10 Heuristik Usabilitas Jakob Nielsen",
                content: `
                    <h2>Bab 3: 10 Heuristik Usabilitas Jakob Nielsen</h2>
                    <p>10 Heuristik Nielsen adalah aturan praktis (rules of thumb) yang diakui dunia untuk menilai kualitas usabilitas interaksi manusia dan komputer. Mari kita ulas 5 aturan penting di antaranya:</p>
                    
                    <div style="background: rgba(139, 92, 246, 0.08); border-left: 4px solid var(--purple); padding: 12px 16px; border-radius: 0 12px 12px 0; margin: 16px 0;">
                        <strong>1. Visibility of system status:</strong> Sistem harus selalu memberi tahu pengguna tentang apa yang sedang terjadi melalui feedback yang cepat.
                    </div>
                    
                    <p><strong>2. Match between system and the real world:</strong> Informasi harus menggunakan istilah dan bahasa yang akrab bagi pengguna.</p>
                    <p><strong>3. User control and freedom:</strong> Sediakan tombol undo, redo, dan jalan keluar yang jelas saat pengguna salah klik.</p>
                    <p><strong>4. Consistency and standards:</strong> Istilah dan elemen tidak boleh berbeda-beda antar halaman.</p>
                    <p><strong>5. Error prevention:</strong> Desain yang baik mencegah terjadinya kesalahan sejak awal daripada sekadar menampilkan pesan error.</p>
                `,
                quiz: {
                    question: "Heuristik usabilitas manakah yang terpenuhi jika sebuah aplikasi web menyediakan tombol 'Batal' (Undo) setelah pengguna menghapus suatu file?",
                    options: ["Visibility of system status", "Match between system and real world", "User control and freedom", "Consistency and standards"],
                    correct: 2,
                    explanation: "User control and freedom memprioritaskan penyediaan tombol keluar darurat seperti 'Undo' ketika pengguna melakukan kesalahan tanpa sengaja."
                }
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
                    <p>Keamanan siber bertujuan melindungi kerahasiaan, integritas, dan ketersediaan data (dikenal sebagai CIA Triad) dari serangan, kerusakan, atau akses tidak sah.</p>
                    
                    <h3>CIA Triad</h3>
                    <ul>
                        <li><strong>Confidentiality (Kerahasiaan):</strong> Memastikan hanya pihak berwenang yang dapat mengakses data sensitif (misalnya lewat enkripsi).</li>
                        <li><strong>Integrity (Integritas):</strong> Menjamin data tidak diubah secara ilegal selama penyimpanan atau transmisi (menggunakan hashing/checksum).</li>
                        <li><strong>Availability (Ketersediaan):</strong> Menjamin sistem dan data dapat diakses oleh pengguna sah saat dibutuhkan (mencegah serangan DDoS).</li>
                    </ul>
                `,
                quiz: {
                    question: "Komponen CIA Triad manakah yang diserang secara langsung oleh hacker yang meluncurkan serangan DDoS (Distributed Denial of Service) untuk melumpuhkan server?",
                    options: ["Confidentiality", "Integrity", "Availability", "Authenticity"],
                    correct: 2,
                    explanation: "Serangan DDoS bertujuan melumpuhkan server sehingga layanan tidak dapat diakses oleh pengguna sah. Ini merupakan serangan terhadap Availability (Ketersediaan)."
                }
            },
            {
                title: "Bab 2: Kriptografi: Enkripsi Simetris, Asimetris, & Hashing",
                content: `
                    <h2>Bab 2: Kriptografi</h2>
                    <p>Kriptografi adalah pilar utama keamanan untuk mengamankan data rahasia.</p>
                    
                    <h3>1. Enkripsi Simetris</h3>
                    <p>Menggunakan satu kunci yang sama untuk mengenkripsi (mengunci) dan mendekripsi (membuka) data. Contoh: AES. Sangat cepat tetapi sulit dalam pertukaran kunci yang aman.</p>
                    
                    <h3>2. Enkripsi Asimetris</h3>
                    <p>Menggunakan sepasang kunci: <strong>Kunci Publik</strong> (untuk mengunci data, disebarkan bebas) dan <strong>Kunci Privat</strong> (untuk membuka data, dirahasiakan). Contoh: RSA.</p>
                    
                    <h3>3. Hashing</h3>
                    <p>Fungsi satu arah yang mengubah data menjadi string acak dengan panjang tetap. Bersifat irreversible (tidak dapat dikembalikan ke teks asli). Contoh: SHA-256.</p>
                `,
                quiz: {
                    question: "Manakah karakteristik utama dari fungsi Hashing dibandingkan dengan metode enkripsi biasa?",
                    options: ["Menggunakan kunci asimetris", "Dapat didekripsi kembali menjadi teks asli", "Bersifat satu arah (tidak dapat didekripsi kembali)", "Lebih lambat dari enkripsi asimetris"],
                    correct: 2,
                    explanation: "Hashing adalah fungsi satu arah (one-way function) yang bersifat irreversible, digunakan untuk verifikasi integritas data atau sandi."
                }
            },
            {
                title: "Bab 3: Kerentanan Sistem, Pentesting, dan Pencegahan",
                content: `
                    <h2>Bab 3: Ancaman & Pencegahan</h2>
                    <p>Sistem teknologi seringkali memiliki celah keamanan (vulnerability) yang dapat dimanfaatkan oleh peretas. Metode pengujian celah keamanan ini dikenal sebagai Penetration Testing (Pentesting).</p>
                    
                    <h3>Tipe Serangan Populer</h3>
                    <ul>
                        <li><strong>SQL Injection:</strong> Memasukkan perintah database SQL berbahaya melalui input form web untuk membaca data server secara ilegal.</li>
                        <li><strong>Cross-Site Scripting (XSS):</strong> Menyisipkan skrip berbahaya (JavaScript) ke dalam halaman web tepercaya yang akan dieksekusi di browser korban.</li>
                    </ul>
                `,
                quiz: {
                    question: "Celah keamanan manakah yang terjadi akibat penyerang berhasil menyisipkan perintah query database ilegal melalui kolom input teks pada website?",
                    options: ["Cross-Site Scripting (XSS)", "SQL Injection", "Phishing", "DDoS"],
                    correct: 1,
                    explanation: "SQL Injection terjadi saat input form dari pengguna tidak disanitasi dengan benar, sehingga penyerang dapat menyisipkan dan mengeksekusi query SQL ilegal pada database server."
                }
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
                    <p>HTML5 memperkenalkan elemen semantik asli yang memperjelas struktur dokumen baik bagi browser, developer, maupun crawler mesin pencari:</p>
                    
                    <ul>
                        <li><code>&lt;header&gt;</code>: Judul pengenal halaman atau navigasi utama.</li>
                        <li><code>&lt;nav&gt;</code>: Blok navigasi khusus link.</li>
                        <li><code>&lt;article&gt;</code>: Konten mandiri yang dapat didistribusikan secara terpisah (seperti artikel berita atau post blog).</li>
                        <li><code>&lt;section&gt;</code>: Mengelompokkan konten yang bertema sama.</li>
                        <li><code>&lt;footer&gt;</code>: Informasi penutup halaman dan hak cipta.</li>
                    </ul>
                `,
                quiz: {
                    question: "Manakah elemen semantik HTML5 yang paling tepat digunakan untuk membungkus sebuah konten mandiri yang dapat berdiri sendiri, seperti artikel berita?",
                    options: ["<section>", "<div>", "<article>", "<aside>"],
                    correct: 2,
                    explanation: "Elemen <article> didesain khusus untuk konten mandiri yang secara logis dapat didistribusikan secara independen dari sisa halaman."
                }
            },
            {
                title: "Bab 2: Struktur Web yang SEO-Friendly & Aksesibilitas (ARIA)",
                content: `
                    <h2>Bab 2: SEO & Aksesibilitas Web</h2>
                    <p>HTML semantik sangat membantu perayap (crawler) mesin pencari seperti Googlebot untuk memetakan konten terpenting dalam website Anda, yang secara langsung meningkatkan visibilitas SEO (Search Engine Optimization) halaman Anda.</p>
                    
                    <h3>Aksesibilitas Web (ARIA)</h3>
                    <p>Aksesibilitas memastikan website dapat diakses dengan baik oleh semua orang, termasuk penyandang disabilitas yang menggunakan screen reader. Penggunaan atribut ARIA seperti <code>aria-label</code> dan penataan hirarki heading yang tepat (satu <code>&lt;h1&gt;</code> per halaman) adalah standar web modern.</p>
                `,
                quiz: {
                    question: "Berapa banyakkah heading <h1> yang disarankan untuk ada dalam satu halaman web demi optimalisasi SEO dan struktur aksesibilitas?",
                    options: ["Tidak boleh ada sama sekali", "Hanya satu <h1>", "Maksimal tiga <h1>", "Bebas sebanyak-banyaknya"],
                    correct: 1,
                    explanation: "Satu halaman web idealnya hanya memiliki satu elemen <h1> sebagai judul utama dokumen untuk mempermudah identifikasi konten oleh search engine crawler dan screen reader."
                }
            },
            {
                title: "Bab 3: Form Lanjut & Elemen Media Asli HTML5",
                content: `
                    <h2>Bab 3: Form Lanjut & Elemen Media</h2>
                    <p>HTML5 mengintegrasikan pemutaran media secara asli menggunakan tag <code>&lt;audio&gt;</code> dan <code>&lt;video&gt;</code> lengkap dengan API kontrol JavaScript bawaan, menggantikan plugin eksternal lama seperti Flash Player.</p>
                    
                    <p>HTML5 juga memperkaya elemen formulir dengan tipe input baru seperti <code>email</code>, <code>date</code>, <code>number</code>, dan <code>range</code> beserta atribut validasi bawaan seperti <code>required</code>.</p>
                `,
                quiz: {
                    question: "Elemen media HTML5 manakah yang digunakan untuk memutar video secara langsung di web tanpa bantuan plugin eksternal?",
                    options: ["<embed>", "<video>", "<media>", "<source>"],
                    correct: 1,
                    explanation: "Tag <video> adalah elemen bawaan HTML5 untuk menampilkan dan memutar konten video langsung di browser."
                }
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
                    <p>Limit fungsi menggambarkan nilai yang didekati oleh suatu fungsi ketika variabel independennya mendekati suatu titik tertentu secara sangat dekat, baik dari kiri maupun kanan.</p>
                    
                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
lim (x -> c) f(x) = L
                    </pre>

                    <h3>Aturan L'Hopital</h3>
                    <p>Ketika menemukan limit tak tentu $\\frac{0}{0}$ atau $\\frac{\\infty}{\\infty}$, kita dapat menurunkan pembilang dan penyebut secara terpisah:</p>
                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
lim (x -> c) f(x)/g(x) = lim (x -> c) f'(x)/g'(x)
                    </pre>
                `,
                quiz: {
                    question: "Metode diferensial manakah yang digunakan untuk memecahkan limit bentuk tak tentu (0/0) dengan cara menurunkan pembilang dan penyebut secara terpisah?",
                    options: ["Aturan Rantai", "Metode Substitusi", "Aturan L'Hopital", "Teorema Nilai Rata-rata"],
                    correct: 2,
                    explanation: "Aturan L'Hopital memperbolehkan pencarian nilai limit bentuk tak tentu dengan menurunkan fungsi pembilang dan penyebut secara independen."
                }
            },
            {
                title: "Bab 2: Turunan Fungsi Aljabar (Diferensial) & Aplikasi",
                content: `
                    <h2>Bab 2: Turunan Fungsi Aljabar</h2>
                    <p>Turunan mengukur laju perubahan seketika suatu fungsi terhadap perubahan variabel independennya. Secara geometris, turunan di suatu titik mewakili kemiringan (gradien) garis singgung kurva fungsi tersebut di titik tersebut.</p>
                    
                    <h3>Aturan Turunan Dasar</h3>
                    <ul>
                        <li>Turunan dari konstanta $c$ adalah $0$.</li>
                        <li>Turunan dari $x^n$ adalah $n \\cdot x^{n-1}$.</li>
                        <li>Aturan rantai untuk turunan fungsi komposisi: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$.</li>
                    </ul>
                `,
                quiz: {
                    question: "Berapakah turunan pertama dari fungsi f(x) = 3x^3 - 5x + 7?",
                    options: ["9x^2 - 5", "9x^2 - 5x", "3x^2 - 5", "9x^3 - 5"],
                    correct: 0,
                    explanation: "Menggunakan aturan pangkat: d/dx(3x^3) = 9x^2, d/dx(-5x) = -5, dan d/dx(7) = 0. Jadi turunan pertamanya adalah 9x^2 - 5."
                }
            },
            {
                title: "Bab 3: Konsep Integral dan Perhitungan Luas Daerah",
                content: `
                    <h2>Bab 3: Konsep Integral</h2>
                    <p>Integral adalah operasi kebalikan dari turunan (anti-turunan). Terdapat dua jenis integral utama dalam kalkulus:</p>
                    
                    <h3>1. Integral Tak Tentu</h3>
                    <p>Mengembalikan fungsi umum beserta konstanta pengintegralan C.</p>
                    <pre style="background: rgba(102, 112, 133, 0.05); border: 1px solid var(--border); padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto;">
∫ x^n dx = (1 / (n+1)) * x^(n+1) + C
                    </pre>
                    
                    <h3>2. Integral Tentu</h3>
                    <p>Memiliki batas atas dan bawah, digunakan secara luas untuk menghitung luas daerah di bawah kurva yang dibatasi koordinat tertentu.</p>
                `,
                quiz: {
                    question: "Berapakah nilai hasil dari integral tak tentu ∫ 2x dx ?",
                    options: ["x^2 + C", "2x^2 + C", "x + C", "x^2/2 + C"],
                    correct: 0,
                    explanation: "∫ 2x dx = 2 * (1/2) * x^2 + C = x^2 + C."
                }
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
                    <p>Strategi yang kuat adalah retrieval practice, yaitu mencoba mengingat kembali materi tanpa melihat catatan. Cara ini melatih otak mengambil informasi, bukan hanya mengenali.</p>
                `,
                quiz: {
                    question: "Metode belajar manakah yang melatih otak mengambil informasi secara aktif tanpa melihat catatan?",
                    options: ["Passive Reading", "Retrieval Practice", "Highlighting", "Cramming"],
                    correct: 1,
                    explanation: "Retrieval practice melatih jalur memori otak dengan memanggil kembali informasi secara aktif."
                }
            },
            {
                title: "Bab 2: Fokus, Distraksi, dan Energi Mental",
                content: `
                    <h2>Bab 2: Fokus, Distraksi, dan Energi Mental</h2>
                    <p>Fokus adalah sumber daya terbatas. Terlalu sering berpindah aplikasi, membuka notifikasi, atau belajar sambil multitasking membuat otak membayar biaya perpindahan perhatian. Karena itu, sesi belajar singkat namun mendalam sering lebih efektif daripada durasi panjang yang penuh gangguan.</p>
                `,
                quiz: {
                    question: "Manakah akibat negatif dari sering berpindah fokus atau multitasking saat belajar?",
                    options: ["Meningkatkan konsentrasi", "Membayar biaya perpindahan perhatian (switch cost)", "Meningkatkan daya ingat jangka panjang", "Mempercepat pemahaman materi"],
                    correct: 1,
                    explanation: "Multitasking memicu biaya perpindahan perhatian (switch cost) yang memecah fokus kognitif otak."
                }
            },
            {
                title: "Bab 3: Membangun Kebiasaan Belajar",
                content: `
                    <h2>Bab 3: Membangun Kebiasaan Belajar</h2>
                    <p>Kebiasaan terbentuk melalui pemicu, rutinitas, dan hadiah. Pemicu dapat berupa jam tertentu, tempat belajar, atau daftar tugas singkat. Rutinitasnya adalah tindakan belajar yang spesifik, misalnya membaca satu bab dan membuat lima pertanyaan. Hadiahnya dapat berupa rasa selesai, checklist, atau jeda singkat.</p>
                `,
                quiz: {
                    question: "Tiga komponen utama pembentuk lingkaran kebiasaan (habit loop) adalah...",
                    options: ["Niat, Usaha, Hasil", "Pemicu, Rutinitas, Hadiah", "Jadwal, Buku, Nilai", "Fokus, Catatan, Ujian"],
                    correct: 1,
                    explanation: "Habit loop terdiri dari cue (pemicu), routine (rutinitas), dan reward (hadiah)."
                }
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
                `,
                quiz: {
                    question: "Apakah yang dimaksud dengan Biaya Peluang (Opportunity Cost)?",
                    options: ["Biaya total produksi barang", "Alternatif terbaik yang dikorbankan saat memilih suatu opsi", "Harga diskon barang di pasar", "Pajak tambahan dari pemerintah"],
                    correct: 1,
                    explanation: "Biaya peluang adalah nilai dari alternatif terbaik yang harus dikorbankan untuk mengambil suatu keputusan."
                }
            },
            {
                title: "Bab 2: Permintaan, Penawaran, dan Harga",
                content: `
                    <h2>Bab 2: Permintaan, Penawaran, dan Harga</h2>
                    <p>Permintaan menggambarkan jumlah barang yang ingin dibeli konsumen pada berbagai tingkat harga. Penawaran menggambarkan jumlah barang yang siap dijual produsen. Titik temu keduanya membentuk harga keseimbangan.</p>
                `,
                quiz: {
                    question: "Bila terjadi peningkatan permintaan barang namun penawarannya tetap, bagaimanakah tren harga barang tersebut?",
                    options: ["Harga akan turun", "Harga akan naik", "Harga tetap stabil", "Harga menjadi nol"],
                    correct: 1,
                    explanation: "Ketika permintaan meningkat di atas penawaran yang tetap, kelangkaan relatif mendorong harga naik."
                }
            },
            {
                title: "Bab 3: Elastisitas dan Strategi Pasar",
                content: `
                    <h2>Bab 3: Elastisitas dan Strategi Pasar</h2>
                    <p>Elastisitas mengukur seberapa peka konsumen terhadap perubahan harga. Barang kebutuhan pokok biasanya kurang elastis, sedangkan barang substitusi atau barang mewah lebih elastis.</p>
                `,
                quiz: {
                    question: "Jenis barang apakah yang elastisitas permintaannya cenderung inelastis (tidak peka terhadap perubahan harga)?",
                    options: ["Barang mewah", "Barang kebutuhan pokok", "Barang elektronik sekunder", "Perhiasan emas"],
                    correct: 1,
                    explanation: "Barang kebutuhan pokok seperti beras tetap dibeli meskipun harganya naik, sehingga bersifat inelastis."
                }
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
                `,
                quiz: {
                    question: "Organisasi pergerakan nasional manakah yang berdirinya pada 20 Mei 1908 diperingati sebagai Hari Kebangkitan Nasional?",
                    options: ["Sarekat Islam", "Budi Utomo", "Indische Partij", "Muhammadiyah"],
                    correct: 1,
                    explanation: "Berdirinya Budi Utomo pada 20 Mei 1908 diakui sebagai awal kebangkitan kesadaran nasional."
                }
            },
            {
                title: "Bab 2: Proklamasi dan Awal Republik",
                content: `
                    <h2>Bab 2: Proklamasi dan Awal Republik</h2>
                    <p>Proklamasi 17 Agustus 1945 menjadi penanda lahirnya Republik Indonesia. Namun kemerdekaan tidak otomatis membuat negara baru stabil. Pemerintah harus membangun konstitusi, lembaga negara, diplomasi, dan pertahanan dalam situasi konflik.</p>
                `,
                quiz: {
                    question: "Kapan naskah Proklamasi Kemerdekaan Republik Indonesia secara resmi dibacakan?",
                    options: ["1 Juni 1945", "17 Agustus 1945", "18 Agustus 1945", "10 November 1945"],
                    correct: 1,
                    explanation: "Naskah proklamasi dibacakan oleh Soekarno didampingi Hatta pada 17 Agustus 1945."
                }
            },
            {
                title: "Bab 3: Reformasi dan Demokrasi Kontemporer",
                content: `
                    <h2>Bab 3: Reformasi dan Demokrasi Kontemporer</h2>
                    <p>Reformasi 1998 membuka perubahan besar pada sistem politik Indonesia. Pemilu lebih terbuka, desentralisasi diperkuat, kebebasan pers meningkat, dan lembaga demokrasi mengalami pembaruan.</p>
                `,
                quiz: {
                    question: "Tahun berapakah era Reformasi Indonesia dimulai, yang ditandai dengan turunnya Presiden Soeharto?",
                    options: ["1945", "1966", "1998", "2004"],
                    correct: 2,
                    explanation: "Era Reformasi lahir pada tahun 1998 setelah mundurnya Presiden Soeharto dari jabatannya."
                }
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
                `,
                quiz: {
                    question: "Organel sel manakah yang sering disebut 'powerhouse of the cell' karena berfungsi menghasilkan energi dalam bentuk ATP?",
                    options: ["Nukleus", "Ribosom", "Mitokondria", "Lisosom"],
                    correct: 2,
                    explanation: "Mitokondria adalah tempat berlangsungnya respirasi seluler yang menghasilkan energi seluler ATP."
                }
            },
            {
                title: "Bab 2: DNA, Gen, dan Pewarisan Sifat",
                content: `
                    <h2>Bab 2: DNA, Gen, dan Pewarisan Sifat</h2>
                    <p>DNA menyimpan instruksi biologis dalam bentuk urutan basa nitrogen. Segmen DNA yang membawa informasi untuk sifat tertentu disebut gen. Gen diwariskan dari orang tua kepada anak melalui proses reproduksi.</p>
                `,
                quiz: {
                    question: "Segmen spesifik pada rantai DNA yang mengkode informasi untuk sifat genetik tertentu disebut...",
                    options: ["Kromosom", "Gen", "RNA", "Enzim"],
                    correct: 1,
                    explanation: "Gen adalah unit dasar pewarisan sifat yang menempati lokus tertentu pada kromosom berupa segmen DNA."
                }
            },
            {
                title: "Bab 3: Ekspresi Gen dan Protein",
                content: `
                    <h2>Bab 3: Ekspresi Gen dan Protein</h2>
                    <p>Ekspresi gen adalah proses ketika informasi dalam DNA digunakan untuk membuat protein. Tahap utamanya adalah transkripsi dari DNA ke RNA, lalu translasi RNA menjadi rantai asam amino.</p>
                `,
                quiz: {
                    question: "Tahapan translasi dalam ekspresi gen adalah proses...",
                    options: ["Menyalin DNA menjadi RNA", "Menerjemahkan kode kodon RNA menjadi rantai asam amino", "Menggandakan rantai DNA", "Memotong protein rusak"],
                    correct: 1,
                    explanation: "Translasi adalah proses penerjemahan kode genetik mRNA oleh ribosom menjadi susunan polipeptida/protein."
                }
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
                `,
                quiz: {
                    question: "Apakah yang dimaksud dengan 'Tema' dalam analisis karya sastra?",
                    options: ["Nama tokoh utama", "Gagasan pokok atau ide dasar cerita", "Latar tempat kejadian", "Akhir penyelesaian cerita"],
                    correct: 1,
                    explanation: "Tema merupakan ide sentral atau gagasan pokok yang ingin disampaikan pengarang melalui karyanya."
                }
            },
            {
                title: "Bab 2: Puisi, Prosa, dan Drama",
                content: `
                    <h2>Bab 2: Puisi, Prosa, dan Drama</h2>
                    <p>Puisi menekankan kepadatan bahasa, citraan, ritme, dan metafora. Prosa memberikan ruang naratif lebih luas melalui cerita pendek dan novel. Drama menghidupkan konflik melalui dialog dan aksi panggung.</p>
                `,
                quiz: {
                    question: "Karya sastra yang mengutamakan dialog antartokoh dan ditujukan untuk dipentaskan disebut...",
                    options: ["Puisi", "Novel", "Drama", "Esai"],
                    correct: 2,
                    explanation: "Drama ditulis dalam bentuk dialog dengan petunjuk pementasan untuk diperagakan aktor."
                }
            },
            {
                title: "Bab 3: Konteks Budaya dalam Sastra",
                content: `
                    <h2>Bab 3: Konteks Budaya dalam Sastra</h2>
                    <p>Karya sastra lahir dari konteks sosial, politik, sejarah, dan budaya tertentu. Memahami konteks membantu pembaca menangkap lapisan makna yang mungkin tidak terlihat dari alur cerita saja.</p>
                `,
                quiz: {
                    question: "Mengapa pemahaman konteks sosial-sejarah penting dalam mengkaji karya sastra?",
                    options: ["Agar bisa menghafal biografi penulis", "Membantu menyingkap latar belakang makna dan motivasi di balik cerita", "Mempercepat proses membaca cepat", "Mengurangi nilai estetika tulisan"],
                    correct: 1,
                    explanation: "Konteks memberikan latar belakang penting mengapa isu atau konflik tertentu diangkat oleh pengarang."
                }
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
                `,
                quiz: {
                    question: "Apakah fungsi utama dari adanya Konstitusi dalam suatu negara?",
                    options: ["Sebagai dokumen formal biasa", "Membatasi kekuasaan penguasa dan menjamin hak warga negara", "Menentukan tarif pajak pasar", "Mengatur kurikulum pendidikan"],
                    correct: 1,
                    explanation: "Konstitusi membatasi kewenangan pemerintah agar tidak sewenang-wenang serta menjamin hak-hak asasi warga."
                }
            },
            {
                title: "Bab 2: Pembagian Kekuasaan",
                content: `
                    <h2>Bab 2: Pembagian Kekuasaan</h2>
                    <p>Pembagian kekuasaan memisahkan fungsi legislatif (membuat undang-undang), eksekutif (menjalankan undang-undang), dan yudikatif (mengadili pelanggaran hukum) agar saling mengawasi (checks and balances).</p>
                `,
                quiz: {
                    question: "Lembaga negara manakah yang memegang kekuasaan yudikatif (mengadili pelanggaran hukum)?",
                    options: ["Presiden dan Menteri", "DPR dan DPD", "Mahkamah Agung dan Mahkamah Konstitusi", "Gubernur dan Walikota"],
                    correct: 2,
                    explanation: "Yudikatif di Indonesia dipegang oleh badan peradilan tertinggi yaitu Mahkamah Agung dan Mahkamah Konstitusi."
                }
            },
            {
                title: "Bab 3: Hak Warga Negara",
                content: `
                    <h2>Bab 3: Hak Warga Negara</h2>
                    <p>Hak warga negara meliputi hak sipil, politik, ekonomi, sosial, dan budaya. Negara berkewajiban menghormati, melindungi, dan memenuhi hak tersebut melalui kebijakan dan lembaga publik.</p>
                `,
                quiz: {
                    question: "Negara berkewajiban untuk... hak-hak asasi warga negaranya.",
                    options: ["Mengurangi dan membatasi", "Menghormati, melindungi, dan memenuhi", "Mengabaikan demi pembangunan", "Menjual ke pihak asing"],
                    correct: 1,
                    explanation: "Tiga kewajiban dasar negara terhadap HAM adalah respect (menghormati), protect (melindungi), dan fulfill (memenuhi)."
                }
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
                `,
                quiz: {
                    question: "Penyusunan tujuan belajar yang terukur bertujuan untuk...",
                    options: ["Membebani guru dengan dokumen", "Menyelaraskan materi, metode belajar, dan asesmen secara tepat", "Meningkatkan biaya operasional sekolah", "Menghapus kuis dari kelas"],
                    correct: 1,
                    explanation: "Tujuan yang terukur menjadi kompas dalam merancang asesmen dan metode mengajar yang relevan."
                }
            },
            {
                title: "Bab 2: Pembelajaran Aktif",
                content: `
                    <h2>Bab 2: Pembelajaran Aktif</h2>
                    <p>Pembelajaran aktif menempatkan siswa sebagai peserta yang berpikir, berdiskusi, mencoba, dan merefleksikan. Guru berperan sebagai perancang pengalaman belajar, bukan hanya penyampai informasi tunggal.</p>
                `,
                quiz: {
                    question: "Manakah peran utama guru dalam pembelajaran yang berpusat pada siswa (student-centered)?",
                    options: ["Penceramah tunggal sepanjang sesi", "Fasilitator dan perancang pengalaman belajar", "Pengawas ujian yang pasif", "Pemberi hukuman fisik"],
                    correct: 1,
                    explanation: "Guru bergeser peran menjadi fasilitator yang mengarahkan kolaborasi dan keaktifan berpikir siswa."
                }
            },
            {
                title: "Bab 3: Asesmen Formatif",
                content: `
                    <h2>Bab 3: Asesmen Formatif</h2>
                    <p>Asesmen formatif dilakukan selama proses belajar untuk memberi umpan balik cepat. Tujuannya bukan memberi nilai akhir, tetapi membantu siswa dan guru mengetahui bagian mana yang perlu diperbaiki.</p>
                `,
                quiz: {
                    question: "Apakah tujuan utama dilakukannya Asesmen Formatif?",
                    options: ["Memberikan nilai rapor akhir kelulusan", "Memberikan umpan balik cepat untuk perbaikan proses belajar yang sedang berjalan", "Menghukum siswa malas", "Menyusun statistik tahunan dinas"],
                    correct: 1,
                    explanation: "Asesmen formatif fokus pada diagnosis pemahaman selama proses, bukan evaluasi hasil akhir (sumatif)."
                }
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
                `,
                quiz: {
                    question: "Determinan kesehatan yang memandang aspek sosial seperti pendapatan dan pendidikan termasuk ke dalam...",
                    options: ["Faktor biologis murni", "Determinan sosial ekonomi", "Faktor genetik", "Layanan klinik rumah sakit"],
                    correct: 1,
                    explanation: "Pendidikan dan ekonomi adalah determinan sosial yang memengaruhi gaya hidup dan akses layanan kesehatan."
                }
            },
            {
                title: "Bab 2: Nutrisi, Aktivitas, dan Tidur",
                content: `
                    <h2>Bab 2: Nutrisi, Aktivitas, dan Tidur</h2>
                    <p>Gaya hidup sehat bertumpu pada pola makan seimbang, aktivitas fisik rutin, tidur cukup, dan pengelolaan stres. Perubahan kecil yang konsisten dapat memberi dampak besar pada energi dan daya tahan tubuh.</p>
                `,
                quiz: {
                    question: "Berapakah durasi tidur malam ideal yang disarankan untuk orang dewasa demi kesehatan mental dan fisik?",
                    options: ["4-5 jam", "7-9 jam", "10-12 jam", "Bebas kapan saja"],
                    correct: 1,
                    explanation: "Rata-rata orang dewasa membutuhkan 7-9 jam tidur berkualitas per malam untuk pemulihan optimal."
                }
            },
            {
                title: "Bab 3: Literasi Kesehatan",
                content: `
                    <h2>Bab 3: Literasi Kesehatan</h2>
                    <p>Literasi kesehatan adalah kemampuan mencari, memahami, dan menggunakan informasi kesehatan dengan benar. Di era digital, kemampuan mengecek sumber informasi menjadi sangat penting.</p>
                `,
                quiz: {
                    question: "Kemampuan memilah mitos dan fakta medis dari media sosial termasuk ke dalam...",
                    options: ["Alergi kesehatan", "Literasi kesehatan", "Diagnosa klinis", "Imunisasi mandiri"],
                    correct: 1,
                    explanation: "Literasi kesehatan mencakup kemampuan kritis menyaring informasi medis dari berita palsu/hoaks."
                }
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
                `,
                quiz: {
                    question: "Gangguan pada satu spesies dalam rantai makanan dapat memengaruhi keseimbangan ekosistem karena...",
                    options: ["Spesies tidak saling bergantung", "Setiap komponen dalam ekosistem saling berinteraksi dan bergantung", "Hewan akan pindah ke kandang", "Hutan akan tumbuh lebih cepat"],
                    correct: 1,
                    explanation: "Ekosistem bersifat interdependen, di mana perubahan pada satu elemen memicu efek berantai ke elemen lainnya."
                }
            },
            {
                title: "Bab 2: Perubahan Iklim",
                content: `
                    <h2>Bab 2: Perubahan Iklim</h2>
                    <p>Perubahan iklim dipicu oleh peningkatan gas rumah kaca yang menahan panas di atmosfer. Dampaknya meliputi kenaikan suhu rata-rata, cuaca ekstrem, kenaikan permukaan laut, dan perubahan pola musim.</p>
                `,
                quiz: {
                    question: "Gas manakah yang kontribusinya paling besar terhadap pemanasan global akibat pembakaran bahan bakar fosil?",
                    options: ["Oksigen (O2)", "Karbon Dioksida (CO2)", "Nitrogen (N2)", "Argon"],
                    correct: 1,
                    explanation: "CO2 adalah gas rumah kaca utama yang dilepaskan dalam skala besar oleh aktivitas industri dan kendaraan bermotor."
                }
            },
            {
                title: "Bab 3: Aksi Berkelanjutan",
                content: `
                    <h2>Bab 3: Aksi Berkelanjutan</h2>
                    <p>Aksi berkelanjutan dapat dimulai dari penghematan energi, pengurangan sampah, transportasi rendah emisi, konsumsi bijak, dan perlindungan ruang hijau. Pada skala lebih besar, kebijakan publik dan inovasi industri sangat menentukan.</p>
                `,
                quiz: {
                    question: "Salah satu aksi berkelanjutan sederhana di tingkat rumah tangga untuk menekan volume sampah plastik adalah...",
                    options: ["Membakar semua sampah di halaman", "Menggunakan tas belanja kain yang dapat dipakai ulang", "Membuang sampah ke saluran air", "Membeli produk sekali pakai"],
                    correct: 1,
                    explanation: "Menggunakan tas belanja reusable secara signifikan mengurangi ketergantungan pada kantong plastik sekali pakai."
                }
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
                `,
                quiz: {
                    question: "Manakah komponen model bisnis yang menjelaskan manfaat unik yang ditawarkan bisnis kepada target pelanggannya?",
                    options: ["Customer Segments", "Value Proposition", "Key Resources", "Revenue Streams"],
                    correct: 1,
                    explanation: "Value Proposition (Proposisi Nilai) mendefinisikan nilai, solusi, atau keunikan produk yang ditawarkan kepada pasar."
                }
            },
            {
                title: "Bab 2: Validasi Pasar",
                content: `
                    <h2>Bab 2: Validasi Pasar</h2>
                    <p>Validasi pasar dilakukan untuk memastikan masalah pelanggan benar-benar ada dan solusi yang ditawarkan cukup bernilai. Wawancara pelanggan, prototipe sederhana, dan uji harga adalah beberapa metode yang sering digunakan.</p>
                `,
                quiz: {
                    question: "Apakah tujuan utama melakukan validasi pasar di awal merintis bisnis?",
                    options: ["Meminjam modal bank", "Memastikan ada kebutuhan nyata di pasar sebelum menghabiskan banyak sumber daya", "Menyewa ruko besar", "Merekrut puluhan karyawan"],
                    correct: 1,
                    explanation: "Validasi pasar mengurangi risiko kegagalan dengan membuktikan adanya permintaan nyata dari calon pembeli."
                }
            },
            {
                title: "Bab 3: Pertumbuhan dan Operasi",
                content: `
                    <h2>Bab 3: Pertumbuhan dan Operasi</h2>
                    <p>Pertumbuhan bisnis memerlukan strategi pemasaran, proses operasional yang rapi, pengelolaan keuangan, dan kualitas layanan yang konsisten. Pertumbuhan yang terlalu cepat tanpa fondasi operasi dapat menimbulkan masalah baru.</p>
                `,
                quiz: {
                    question: "Apakah risiko utama jika suatu bisnis tumbuh terlalu cepat (scale up) tanpa didukung sistem operasional yang solid?",
                    options: ["Keuntungan terlalu besar", "Kegagalan layanan atau penurunan kualitas produk karena kelebihan beban", "Kompetitor akan otomatis menyerah", "Pajak usaha dihapus"],
                    correct: 1,
                    explanation: "Tumbuh terlalu cepat tanpa fondasi (over-expansion) dapat menyebabkan bottleneck operasional dan rusaknya reputasi merek."
                }
            }
        ]
    }
];
