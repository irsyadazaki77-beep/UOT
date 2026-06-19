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

