# UNIVERSE OF TECH — CONTENT MIGRATION MAP (FASE 20)
*Single Source of Truth, CMS Engine & Runtime Migration*

---

## 1. Executive Summary & Audit

Sistem konten Universe of Tech sebelumnya tersebar pada berbagai file JavaScript hardcoded di sisi klien dan sebagian kecil file JSON CMS:

| Domain Konten | Sumber Data Hardcoded Asal | Jumlah Konten Asal | Target Domain Canonical | Target File Sinkronisasi Disk | Skema Validasi Utama |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quizzes (Bank Soal & Asesmen)** | `quiz-question-bank.js`, `curriculum-data.js` (assessments), `feature-pages.js` | 426 soal bank + 84 chapter assessments (840 soal) | `quizzes` | `data/content/quizzes.json` | Opsi unik (min 2), correctAnswer valid, explanation terisi, skill/kategori terisi |
| **Lessons (Materi Belajar)** | `curriculum-data.js` (tracks.chapters.lessons), `lms-quiz.js` | 252 materi interaktif + silabus | `lessons` | `data/content/lessons.json` | ID unik, title tidak kosong, skill/kategori valid, contentBlocks valid |
| **Learning Paths (Jalur Belajar)** | `curriculum-data.js` (tracks), `learning-journey.js` | 21 jalur keahlian teknologi | `learningPaths` | `data/content/learning-paths.json` (alias `learningPaths.json`) | ID unik, title valid, daftar chapters valid |
| **Projects (Proyek Praktik)** | `projects.js`, `db/content-catalog.js` | 6 proyek interaktif terstruktur | `projects` | `data/content/projects.json` | ID unik, title tidak kosong, skills & rubrik terdefinisi |
| **Culture (Kekayaan Budaya Nusantara)** | `wonderful-data.js` | 23 destinasi & 8 wilayah budaya | `culture` | `data/content/culture.json` | ID unik, name/title valid, region & highlight terisi |
| **Books (Perpustakaan Digital)** | `book-data.js`, `book-data-expansion.js`, `book-content-depth.js` | 41 buku akademik & teknologi lengkap | `books` | `data/content/books.json` | ID unik, title, author, chapters valid |

---

## 2. Canonical Naming & Domain Convention

Untuk mengatasi inkonsistensi antara `learningPaths` (kode JavaScript) dan `learning-paths.json` (nama file), ditetapkan aturan konvensi kanonikal berikut:

1. **In-Memory & API Representation**: Domain `learningPaths` (dengan dukungan otomatis untuk alias `learning-paths` dan `learning_paths`).
2. **On-Disk Persistence**: `data/content/learning-paths.json` (disinkronkan dengan `learningPaths.json` jika diperlukan).
3. **Database Table**: `content` table dengan kolom `domain`, `id`, `title`, `status`, `content_json`, `created_at`, `updated_at`.
4. **All Canonical Domains**:
   - `quizzes`
   - `lessons`
   - `learningPaths`
   - `projects`
   - `culture`
   - `books`

---

## 3. ID Stability & Progress Preservation

Seluruh ID konten dipertahankan persis tanpa modifikasi untuk menjaga integritas riwayat progres pengguna (`user_progress`, `user_completed_lessons`, `user_completed_projects`, `user_quiz_attempts`, `reward_ledger`):
- Soal kuis: `programming-1` s/d `futuretech-9`, `programming-logika-program-assessment`, dsb.
- Materi: `html-dasar-pengenalan-html`, `logika-program-input-proses-dan-output`, dsb.
- Jalur belajar: `programming`, `web`, `frontend`, `backend`, `python`, `data-science`, `ai-engineer`, `devops`, `cyber-security`, `mobile`, `cloud`, dsb.
- Proyek: `landing-page`, `todo-interaktif`, `dashboard-data`, `ui-redesign`, `form-aman`, `git-readme`.
- Buku: `js-basic`, `sql-join`, `ui-heuristic`, `analytics-kpi`, `web-semantic`, `flash-snbt`, dsb.

---

## 4. Arsitektur Single Source of Truth & Runtime Flow

```
[ Admin CMS / Migration Tool ]
           │
           ▼
[ Content Repository (SQLite) & File Storage (JSON) ]
           │
     (Version Increment & Cache Invalidation)
           │
           ▼
[ Express Content API (Lazy Chunks, Filtering, Version Meta) ]
           │
  ┌────────┴────────────────────────┐
  ▼                                 ▼
[ Online Mode (Network Fetch) ]   [ Offline Mode (IndexedDB / LocalStorage Cache) ]
  │                                 │
  └────────┬────────────────────────┘
           ▼
[ User-Facing Client Service (ContentService / ContentEngine) ]
           │
           ├─► LMS Quiz Engine (lms-quiz.js)
           ├─► Materi Studio (materi-clean.js)
           ├─► Projects Engine (projects.js)
           ├─► Culture & Nusantara Hub (wonderful-pages.js)
           └─► Academic Library (library-academic.js / reader-studio.js)
```

---

## 5. Kriteria Validasi Mutu Konten (Content Quality Rules)

1. **Duplicate ID Check**: Memastikan tidak ada tabrakan ID lintas maupun dalam domain.
2. **Correct Answer Boundary**: Indeks jawaban benar tidak boleh di luar batas opsi.
3. **Explanation Presence**: Setiap soal kuis wajib menyertakan penjelasan rasional.
4. **Skills & Metadata Check**: Setiap materi dan kuis terhubung dengan minimal 1 keahlian/kategori.
5. **Prerequisites Integrity**: Memastikan seluruh prasyarat materi/proyek merujuk ke konten nyata yang terdaftar.
6. **Draft Isolation**: Konten berstatus `draft` dilarang dikirim ke endpoint publik pengguna non-admin.
7. **Version & Timestamp**: Setiap mutasi konten menaikkan versi konten secara atomik.
