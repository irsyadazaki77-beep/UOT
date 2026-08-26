# Panduan Pengelolaan Konten (Content Authoring Guide) — Universe of Tech

Dokumen ini menjelaskan cara menambahkan, memperbarui, mempublikasikan, dan memvalidasi materi (*lessons*), bank soal (*quizzes*), dan proyek (*projects*) pada platform **Universe of Tech** (FASE 13).

---

## 🌟 Prinsip Utama: Content as DATA, Application as ENGINE

Pada arsitektur Universe of Tech FASE 13:
1. **Semua materi, quiz, dan proyek disajikan sebagai DATA JSON**, bukan string JavaScript hardcoded.
2. **Aplikasi bekerja sebagai ENGINE** (`content-engine.js`) yang memuat, memvalidasi, mengisolasi error, dan menyajikan konten secara efisien.
3. Menambahkan atau mengubah konten **TIDAK memerlukan modifikasi pada kode JavaScript UI utama**.

---

## 📁 Struktur Penyimpanan Konten

Seluruh data konten utama disimpan di direktori `/data/content/`:
- `/data/content/quizzes.json` — Bank soal quiz dan latihan
- `/data/content/lessons.json` — Materi pembelajaran dan bab
- `/data/content/projects.json` — Proyek portofolio & lab interaktif
- `/data/content/learning-paths.json` — Alur pembelajaran (tracks)
- `/data/content/culture.json` — Materi wawasan kebudayaan & bahasa daerah

---

## 📝 Format Skema Konten

### 1. Skema Quiz (`quizzes.json`)
```json
{
  "id": "programming-1",
  "question": "Apa fungsi variabel dalam program?",
  "options": [
    "Menyimpan nilai yang bisa digunakan ulang",
    "Menghapus error otomatis",
    "Mengubah desain database",
    "Menjalankan internet"
  ],
  "correctAnswer": 0,
  "explanation": "Variabel dipakai untuk menyimpan nilai, lalu nilai itu dapat dibaca atau diubah selama program berjalan.",
  "skills": ["programming", "variables"],
  "difficulty": "easy",
  "source": "quiz-question-bank",
  "tags": ["javascript", "basics"],
  "status": "published",
  "version": 1
}
```

*Aturan Validasi Quiz:*
- `id`: Harus unik di seluruh sistem.
- `options`: Minimal 2 opsi. Tidak boleh ada teks opsi duplikat.
- `correctAnswer`: Index opsi jawaban benar (dimulai dari `0`).
- `skills`: Minimal 1 tag skill/kategori.

---

### 2. Skema Lesson / Materi (`lessons.json`)
```json
{
  "id": "js-basic",
  "title": "Dasar Pemrograman JavaScript",
  "description": "Kuasai sintaks dasar, variabel, tipe data, dan kontrol alur dalam JavaScript modern.",
  "category": "programming",
  "skills": ["javascript", "programming-basics"],
  "prerequisites": [],
  "difficulty": 1,
  "contentBlocks": [
    {
      "type": "html",
      "title": "Bab 1: Pengenalan JavaScript",
      "data": "<h2>Bab 1: Pengenalan JavaScript</h2><p>JavaScript adalah bahasa pemrograman...</p>"
    }
  ],
  "quizIds": ["programming-1", "programming-2"],
  "estimatedMinutes": 15,
  "rewards": { "xp": 100, "coins": 15 },
  "status": "published",
  "version": 1
}
```

---

### 3. Skema Project (`projects.json`)
```json
{
  "id": "landing-page",
  "title": "Landing Page Personal",
  "objectives": [
    "Menyusun struktur HTML semantik untuk hero, tentang saya, dan kontak",
    "Menerapkan warna, tipografi, dan layout responsif dengan CSS"
  ],
  "skills": ["HTML", "CSS"],
  "prerequisites": [],
  "milestones": [
    {
      "title": "Milestone 1: Struktur HTML",
      "description": "Buat elemen header, section hero, dan footer."
    }
  ],
  "rubric": [
    { "criteria": "Kelengkapan HTML Semantik", "maxPoints": 40 },
    { "criteria": "Responsivitas Layout", "maxPoints": 40 }
  ],
  "rewards": { "xp": 100, "coins": 30 },
  "status": "published",
  "version": 1
}
```

---

## 🛠️ Cara Menambahkan Konten Baru

### Cara 1: Menggunakan Web Admin UI (`/admin-content.html`)
1. Buka browser dan akses halaman `/admin-content.html`.
2. Masukkan **Server Admin Key** di sudut kanan atas.
3. Klik tombol **"+ Tambah Item Baru"**.
4. Isi data pada formulir interaktif (ID, Judul/Pertanyaan, Skill, Opsi Quiz).
5. Centang **"Publish sekarang"** untuk langsung menayangkannya, atau biarkan tidak tercentang untuk menyimpan sebagai **Draft**.
6. Klik **"Simpan Konten"**. System secara otomatis akan menjalankan validasi skema sebelum menyimpan.

---

### Cara 2: Menggunakan Import / Export JSON
1. Di halaman `/admin-content.html`, klik **"Export JSON"** untuk mengunduh seluruh data konten saat ini.
2. Buka file JSON tersebut dengan editor teks (VSCode / Notepad).
3. Tambahkan item baru mengikuti contoh skema di atas.
4. Di halaman `/admin-content.html`, klik **"Import JSON"** dan pilih file yang sudah diperbarui.

---

### Cara 3: Melalui Admin API Server (cURL / Postman / Script)

**Menyimpan / Memperbarui Item Konten:**
```bash
POST /api/admin/content/save
Headers:
  Content-Type: application/json
  x-admin-key: uot-admin-secret-key-2026
  X-Requested-With: XMLHttpRequest

Body:
{
  "domain": "quizzes",
  "item": {
    "id": "js-advanced-01",
    "question": "Apakah perbedaan antara Closure dan Scope?",
    "options": [
      "Closure mengingat variabel dari lexical scope luar saat fungsi dieksekusi",
      "Scope adalah tipe data angka",
      "Closure hanya bisa digunakan di server",
      "Tidak ada perbedaan"
    ],
    "correctAnswer": 0,
    "skills": ["javascript", "closure"],
    "difficulty": "hard",
    "status": "published"
  }
}
```

**Mengubah Status Draft / Published:**
```bash
POST /api/admin/content/publish
Body:
{
  "domain": "quizzes",
  "id": "js-advanced-01",
  "status": "draft"
}
```

---

## 🩺 Diagnostik & Quality Audit Otomatis

Aplikasi ini dilengkapi dengan **Automated Diagnostic Quality Check**:
- **Pemeriksaan ID Unik**: Mendeteksi jika terdapat ID duplikat di seluruh domain.
- **Pemeriksaan Jawaban Hilang**: Mendeteksi jika `correctAnswer` tidak diset atau berada di luar jangkauan index opsi.
- **Pemeriksaan Opsi Duplikat**: Mendeteksi jika ada opsi pilihan yang sama dalam satu soal.
- **Pemeriksaan Prerequisite Invalid**: Mendeteksi jika suatu materi/proyek merujuk ke ID prerequisite yang tidak ada di database.

Anda dapat menjalankan diagnostik kapan saja melalui API:
```bash
GET /api/admin/content/validate
Header: x-admin-key: uot-admin-secret-key-2026
```
Atau dengan menekan tombol **"Uji Ulang"** di Dashboard Admin `/admin-content.html`.

---

## 🛡️ Keamanan & Isolasi Error (Fallback Protection)

Jika terjadi kesalahan pada salah satu file data atau ID konten tidak ditemukan:
1. `ContentEngine` **TIDAK AKAN membuat aplikasi crash atau menampilkan blank screen**.
2. `ContentEngine` akan mengembalikan **Fallback State Object** yang aman berisi pesan informatif bagi pengguna.
3. Pengguna biasa hanya dapat mengakses konten bersatatus `published`, sedangkan tim author dapat meninjau item berstatus `draft`.
