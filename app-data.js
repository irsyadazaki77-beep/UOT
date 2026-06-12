// Universe Of Tech - Shared Application Data

const virtualDatabase = [
    { id: 1, nama: "Budi Santoso", kelas: "12-RPL", nilai: 85, status: "Lulus" },
    { id: 2, nama: "Siti Rahma", kelas: "12-TKJ", nilai: 92, status: "Lulus" },
    { id: 3, nama: "Dewi Lestari", kelas: "11-RPL", nilai: 74, status: "Remedial" },
    { id: 4, nama: "Zaki Firdaus", kelas: "12-RPL", nilai: 98, status: "Lulus" },
    { id: 5, nama: "Andi Wijaya", kelas: "11-MM", nilai: 65, status: "Remedial" }
];

const achievementsList = [
    { id: 'first_step', title: 'First Step Coder', desc: 'Centang checklist belajar pertamamu.', icon: '🚶‍♂️', unlocked: false },
    { id: 'drill_champion', title: 'Drill Champion', desc: 'Selesaikan Daily Drill pertama.', icon: '⚡', unlocked: false },
    { id: 'sandbox_hacker', title: 'Sandbox Hacker', desc: 'Jalankan/Visualisasikan kode di Sandbox.', icon: '💻', unlocked: false },
    { id: 'sql_master', title: 'SQL Warlord', desc: 'Jalankan kueri SQL di Sandbox.', icon: '🗄️', unlocked: false },
    { id: 'security_expert', title: 'Security Warden', desc: 'Simulasikan serangan XSS.', icon: '🛡️', unlocked: false },
    { id: 'sqli_hacker', title: 'SQL Injection Breaker', desc: 'Simulasikan SQL Injection bypass.', icon: '☠️', unlocked: false },
    { id: 'level_legend', title: 'Tech Legend', desc: 'Capai Level 5 dalam RPG.', icon: '👑', unlocked: false }
];

const sandboxPresets = {
    js: [
        {
            title: "Looping Pengguna",
            code: `// Loop visualizer: menghitung jumlah user lulus
let totalLulus = 0;
let skorSiswa = [85, 92, 74, 98, 65];

for (let i = 0; i < skorSiswa.length; i++) {
    let skor = skorSiswa[i];
    if (skor >= 75) {
        totalLulus++;
    }
}
console.log("Total siswa lulus: " + totalLulus);`
        },
        {
            title: "Kondisi Percabangan",
            code: `// Cek status nilai siswa
let nilai = 82;
let grade = "C";

if (nilai >= 90) {
    grade = "A";
} else if (nilai >= 80) {
    grade = "B";
} else {
    grade = "D";
}
console.log("Grade Anda: " + grade);`
        }
    ],
    sql: [
        {
            title: "SELECT Semua Data",
            code: "SELECT * FROM siswa;"
        },
        {
            title: "Filter Nilai Lulus (>= 75)",
            code: "SELECT nama, nilai FROM siswa WHERE nilai >= 75;"
        },
        {
            title: "Cari Siswa Remedial",
            code: "SELECT nama, kelas, status FROM siswa WHERE status = 'Remedial';"
        }
    ],
    sqli: [
        {
            title: "Bypass Login ' OR '1'='1",
            code: "' OR '1'='1"
        },
        {
            title: "Bypass Login Admin Comment",
            code: "admin' --"
        },
        {
            title: "Input Teks Biasa (Aman)",
            code: "budi_santoso"
        }
    ],
    xss: [
        {
            title: "Input Aman (Teks Biasa)",
            code: "Halo mentor Zaki! Belajar tech seru banget di sini."
        },
        {
            title: "Serangan Script Jahat (XSS)",
            code: "<script>alert('Aplikasi Anda telah diretas oleh Hacker Cilik!')<\/script>"
        },
        {
            title: "Injeksi Gambar Rusak",
            code: "<img src='x' onerror='alert(\"XSS Payload terpicu!\")'>"
        }
    ]
};

const drillBank = [
    { q: "Konsep apa yang dipakai untuk mengulang instruksi berkali-kali dalam kode?", a: ["Loop", "Index", "Wireframe", "Funnel"], c: 0, note: "Loop menjalankan blok kode berulang sesuai kondisi atau jumlah tertentu." },
    { q: "Elemen HTML yang punya makna struktur membantu hal apa?", a: ["Semantik dan aksesibilitas", "Menghapus database", "Menambah virus", "Mematikan CSS"], c: 0, note: "HTML semantik membantu browser, mesin pencari, dan pembaca layar memahami struktur." },
    { q: "JOIN di SQL digunakan untuk...", a: ["Menggabungkan data antar tabel", "Menghapus semua kolom", "Mengubah warna UI", "Mengenkripsi password"], c: 0, note: "JOIN membaca relasi antar tabel berdasarkan kolom yang terkait." },
    { q: "MFA membuat akun lebih aman karena...", a: ["Verifikasi tidak hanya memakai password", "Password jadi tidak perlu", "Semua data publik", "Login selalu gagal"], c: 0, note: "MFA menambah lapisan verifikasi seperti OTP, authenticator, atau biometrik." },
    { q: "A/B testing paling tepat dipakai untuk...", a: ["Membandingkan dua varian", "Menulis semua kode ulang", "Menghapus user", "Membuat tabel primary key"], c: 0, note: "A/B testing membandingkan performa dua versi terhadap metrik tertentu." }
];

const zakiBrain = {
    loop: `Perulangan atau looping itu cara koding ngejalanin baris kode berulang-ulang tanpa kita capek ngetik satu-satu, coy! Bisa pake for, while, atau do-while.
Contoh Loop di Javascript:
\`\`\`js
let total = 0;
for (let i = 1; i <= 5; i++) {
    total += i;
    console.log("i = " + i + ", total = " + total);
}
console.log("Selesai! Hasil akhir: " + total);
\`\`\``,
    perulangan: `Looping itu perulangan, cuy. Contohnya kamu nge-print nama pacar kamu 100 kali biar gak ngambek. Bikin loop, jalankan, beres! Di luar nalar praktisnya!
Contoh Loop:
\`\`\`js
let i = 1;
while(i <= 3) {
    console.log("Loop ke-" + i + ": Gacor!");
    i++;
}
\`\`\``,
    variabel: `Variabel itu semacam wadah atau laci memori di komputer kita, coy. Buat nyimpen status data. Bisa nyimpen angka, string teks, status boolean, dll.
Contoh Variabel di Javascript:
\`\`\`js
let nama = "Mentor Zaki";
let level = 5;
let isGacor = true;
console.log("Profil: " + nama + ", Level: " + level + ", Status: " + isGacor);
\`\`\``,
    database: `Database itu gudang penyimpanan data digital kita biar aman dan terstruktur, cuy. Paling sering pake SQL relasional di mana data disimpan di baris dan kolom tabel.
Contoh Query database:
\`\`\`sql
SELECT * FROM siswa WHERE nilai >= 80;
\`\`\``,
    sql: `SQL itu kueri bahasa gaul buat ngomong sama database relasional, cuy. Mantranya kayak SELECT * FROM siswa WHERE status = 'Lulus'; biar langsung ketemu!
Contoh Query SQL:
\`\`\`sql
SELECT nama, kelas, nilai FROM siswa WHERE status = 'Remedial';
\`\`\``,
    belajar: "Kunci sukses belajar tech itu konsisten dikit-dikit tapi tiap hari, jangan ditumpuk semalam suntuk (SKS) kayak ujian sekolah. Mulai dari roadmap timeline di page ini, terus praktek hands-on di page basic!",
    materi: "Di Universe Of Tech ini materi kita lengkap banget, dari Programming dasar, Web, SQL Database, UI/UX Design, Cyber Security, Analytics, Cloud, Mobile, sampe AI Machine Learning. Kece parah!",
    a11y: "Aksesibilitas (A11y) itu seni bikin web yang ramah buat semua orang, termasuk temen-temen kita yang berkebutuhan khusus. Pake tag HTML semantik yang bener, kasih alt text di gambar, dan kontras warna yang cukup, coy!",
    desain: "Desain UI/UX bukan sekadar pewarnaan tombol biar cantik, tapi gimana cara memandu mata pengguna ngeliat focal point terpenting pake visual hierarchy dan whitespace yang lega. Jangan ditumpuk-tumpuk pusing!",
    cyber: `Keamanan Cyber itu benteng utama data kita, coy. Jangan pake password tanggal lahir! Aktifkan MFA/2FA, hindari klik link mencurigakan, dan sanitize input database biar gak kena serangan XSS/SQL Injection!
Contoh payload XSS untuk simulasi keamanan:
\`\`\`html
<script>alert("Serangan XSS terdeteksi!")<\/script>
\`\`\``,
    ai: "AI atau kecerdasan buatan itu model statistik raksasa yang dilatih pake data latih untuk nebak pola baru. Prompt engineering itu cara kita nulis perintah yang presisi biar AI gak halusinasi ngaco!",
    cloud: "Cloud computing itu sewa komputer server orang lain (kayak AWS, Google Cloud, Azure) biar aplikasi kamu bisa online 24 jam non-stop tanpa takut mati listrik rumah. DevOps ngurusin otomatisasi deploy pake CI/CD, coy!",
    git: "Git itu mesin waktu kodingan kamu, cuy! Tiap perubahan penting dikunci pake commit. Kalo kodingan rusak atau error berantakan, tinggal rollback balik ke versi sebelumnya. Kolaborasi tim jadi super mulus!"
};
