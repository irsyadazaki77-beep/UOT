# ANALYTICS, OBSERVABILITY & CONTINUOUS IMPROVEMENT GUIDE (FASE 15)

Dokumentasi resmi arsitektur product analytics, observability, error telemetry, Web Vitals, feature flags, dan sistem health monitoring pada Universe of Tech.

---

## 1. PRINSIP UTAMA & BATAS PRIVASI (PRIVACY BOUNDARY)

Universe of Tech menerapkan prinsip **Privacy-Conscious Telemetry**:
1. **Penyaringan Data Sensitif Otomatis (Automatic Scrubbing)**:
   - Sistem **TIDAK PERNAH** mencatat password, token autentikasi, API key, CVV, atau input teks sensitif.
   - Semua objek properti dan pesan error secara otomatis melewati sanitizer `scrubSensitiveData` sebelum disimpan.
2. **Kontrol Konsen Pengguna (Consent Handling)**:
   - Pengguna dapat mematikan pengumpulan telemetry pribadi melalui pengaturan profil (`settings.analytics = false`).
   - Jika konsen dimatikan, identitas user dianonimkan menggunakan SHA-256 hash acak (`anon_usr`).
3. **Tanpa Metrics Palsu (No Fake Metrics)**:
   - Jika data event belum tersedia, dashboard secara eksplisit menampilkan `No data yet` atau `0`.

---

## 2. EVENT TAXONOMY & STRUKTUR SKEMA

Semua event dikirim melalui skema terstruktur standar:

```json
{
  "event": "lesson_completed",
  "timestamp": "2026-08-22T10:00:00.000Z",
  "sessionId": "sess_xyz123",
  "userId": "usr_99812",
  "properties": {
    "lessonId": "web_dev_101",
    "timeSpentSeconds": 180,
    "xpEarned": 50
  }
}
```

### Daftar Event Resmi:
- `session_started`: Awal sesi pengguna baru atau kembali.
- `landing_viewed`: Akses ke halaman utama.
- `login_completed`: Berhasil masuk akun.
- `learning_path_viewed`: Membuka halaman alur belajar.
- `lesson_started` / `lesson_completed`: Mulai atau selesai mempelajari materi.
- `quiz_started` / `quiz_completed`: Mulai atau selesai pengerjaan kuis.
- `question_answered`: Menjawab pertanyaan kuis (mencatat `isCorrect` dan `questionId`).
- `project_started` / `project_completed`: Pengerjaan proyek praktis.
- `achievement_unlocked`: Membuka pencapaian baru.
- `mission_completed`: Selesai misi harian/mingguan.
- `recommendation_clicked`: Mengklik rekomendasi materi adaptif.
- `sync_failed`: Kegagalan sinkronisasi progres.
- `error_occurred`: Laporan error client/server.
- `vitals_recorded`: Laporan Web Vitals (LCP, CLS, INP).

---

## 3. CONVERSION FUNNEL & METRICS ENGINE

### Funnel Utama (7 Langkah Conversion)
1. **Landing Page** (`landing_viewed` / `session_started`)
2. **Login / Auth** (`login_completed`)
3. **Learning Path View** (`learning_path_viewed`)
4. **First Lesson Started** (`lesson_started`)
5. **First Quiz Started** (`quiz_started`)
6. **First Completion** (`lesson_completed` / `project_completed`)
7. **Return Visit** (Kunjungan pada &ge; 2 hari berbeda)

---

## 4. DETEKSI MATERI & SOAL BERMASALAH (CONTENT REVIEW)

- Engine menganalisis semua event `question_answered`.
- Soal atau topik dengan **tingkat kegagalan &ge; 70%** (dari minimal 3 percobaan) otomatis ditandai di bawah `difficultContent` untuk ditinjau oleh tim penyusun konten.

---

## 5. ERROR & PERFORMANCE TELEMETRY

### Error Telemetry:
- Menangkap uncaught JS error, unhandled promise rejection, dan kegagalan API.
- Menghapus stack trace sensitif dan header Authorization sebelum penyimpanan.

### Web Vitals Telemetry:
- Menangkap metric LCP, CLS, dan INP secara real-time via `PerformanceObserver`.
- Mengelompokkan kualitas ke dalam *Good*, *Needs Improvement*, dan *Poor*.

---

## 6. FEATURE FLAGS & A/B EXPERIMENTATION

### Katalog Feature Flags:
- `adaptive_quiz_mode` (Default: `true`)
- `social_leaderboard_v2` (Default: `true`)
- `dark_theme_default` (Default: `false`)
- `interactive_sandbox_v2` (Default: `true`)

Semua evaluasi feature flag dilengkapi dengan **fallback aman (safe fallback)** apabila server tidak terjangkau.

---

## 7. RETENSI DATA & BATAS PENYIMPANAN

- **Events Retention**: Maksimal 10.000 event terakhir dalam ring buffer.
- **Errors Retention**: Maksimal 1.000 error terakhir.
- **Vitals Retention**: Maksimal 2.000 record vitals.
- Penyimpanan persisten otomatis dilakukan ke file `/data/uot_analytics_store.json`.
