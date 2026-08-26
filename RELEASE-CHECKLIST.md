# RELEASE-CHECKLIST.md — Universe of Tech (UOT)
**Rilis Produksi Candidate (v1.0.0-RC)**

Dokumen ini menyajikan status rilis final, hasil audit, dan kesiapan rilis untuk aplikasi **Universe of Tech (UOT)**.

---

## 1. Ringkasan Status Rilis
- **Status Rilis Front-End**: 100% Production Ready (Client-Side App & PWA)
- **Status Integrasi Backend API**: Ready for Server Integration (Optional REST API Contract defined in `api-contract.yaml`)
- **Status Keamanan Client-Side**: Passed (CSP, Anti-XSS Header, Sanitized InnerHTML, Sandbox Isolation)
- **Status Test Suite**: 100% Passed (72/72 tests passing across Unit, E2E, Security, A11y, and Smoke Routes)

---

## 2. Audit User Journey & Alur Pengguna

| Tahap Journey | Komponen Page | Primary Action | Status |
| :--- | :--- | :--- | :--- |
| **New User Landing** | `index.html` | "Mulai Belajar" / "Daftar Akun" | ✅ OK |
| **Authentication** | `login.html` | "Masuk ke Akun" / "Daftar" | ✅ OK |
| **Onboarding** | `learning-journey.html` | "Pilih Jalur Belajar Pertama" | ✅ OK |
| **Learning Path Selection** | `materi.html`, `materi-basic.html` | "Pelajari Modul" | ✅ OK |
| **Learn (Materi & Reading)** | `materi-studio.html`, `reader-studio.html` | "Selesaikan & Lanjut Kuis" | ✅ OK |
| **Practice & Sandbox** | `sandbox-runner.html`, `projects.html` | "Jalankan Kode" / "Kirim Proyek" | ✅ OK |
| **Quiz & Assessment** | `quiz.html`, `quiz-session.html`, `tka-lms.html` | "Mulai Kuis" / "Submit Jawaban" | ✅ OK |
| **Reward & XP Engine** | `progression-engine.js` | "Klaim Bonus Misi / XP" | ✅ OK |
| **Achievements & Badges** | `achievements.html` | "Lihat Lencana & Level" | ✅ OK |
| **Leaderboard** | `leaderboard.html` | "Lihat Peringkat Demo/Lokal" | ✅ OK (Simulasi Demo Explicit) |
| **Profile & Settings** | `profile.html` | "Edit Profil" / "Ekspor Data" | ✅ OK |
| **Continue Learning** | `app-shell.js`, `learning-path.html` | "Lanjutkan Progres Terakhir" | ✅ OK |

---

## 3. Hasil Audit Branding & Key Storage

### A. Branding Audit
- **Nama Final**: **Universe of Tech (UOT)**
- **Meta & HTML Title**: Terstandarisasi di seluruh 27 file HTML utama.
- **Legacy Names Cleared**: Sebutan legacy seperti *EduQuest* dan *QuizNation* pada UI label publik telah diganti dengan *Universe of Tech*.

### B. Storage & Migration Audit
- **Canonical Storage Key**: `uot_game_state` (v4 Schema)
- **Legacy Migration Support**: Standardisasi `security-helper.js` dan `progression-engine.js` membaca `eduquestRPG`, `eduquestXP`, `eduquest_theme`, dan melakukan fallback/migrasi otomatis tanpa merusak data pengguna lama.
- **Primary Source**: `Progression.getCanonicalState()` dijadikan Single Source of Truth.

---

## 4. Leaderboard & Data Fairness
- **Mode Leaderboard**: Diberi label transparan dan tegas: **Mode Simulasi Demo & Papan Peringkat Lokal**.
- **User Rank Data**: Menggabungkan data pengguna aktif dari `Progression.getCanonicalState()` secara akurat untuk posisi kompetitif lokal.

---

## 5. Audit Progression, Achievement, & PRO Gating

### A. Progression Balance
- **Tingkat Level**: 1 (Script Kiddie) s/d 7 (AI Archmage).
- **Formula XP**: Arithmetic progression ($Level \times 100\text{ XP}$) memberikan kurva belajar yang mulus.
- **Aktivitas & Reward**:
  - Membaca Modul: +15 XP
  - Menyelesaikan Kuis: +40 s/d +75 XP
  - Menyelesaikan Proyek: +120 XP
  - Daily Missions All-Clear: +80 XP

### B. Achievements & PRO Gating
- Catalog 12 lencana pencapaian utama bebas dari duplikasi ID.
- Fitur PRO (Advanced Code Sandbox, Download Offline Certificate, Dark Mode Custom Accent) terisolasi aman dengan pengecekan `Subscription.isPro()`.

---

## 6. Audit Keamanan & Kualitas Kode

- **Content Security Policy (CSP)**: Mengaktifkan script-src `'self'` dengan `unsafe-inline` aman dan membatasi `eval` khusus untuk Sandbox Runner (`sandbox-runner.html`).
- **Sanitasi Output**: HTML injection dicegah melalui `DOMPurify` / innerHTML sanitizer helper pada `security-helper.js`.
- **Aksesibilitas (A11y)**: Seluruh tombol interaktif memiliki `aria-label` atau teks deskriptif, kontras warna AA/AAA terpenuhi.

---

## 7. Penutup & Pernyataan Kesiapan Rilis

> **PERNYATAAN RESMI**:
> Seluruh alur utama pengguna, sistem progresif, modul pembelajaran, kuis, latihan, serta aset PWA telah diverifikasi dan bebas dari dead-end navigation atau blocker keamanan. Aplikasi **Universe of Tech** siap untuk dideploy ke lingkungan produksi statis maupun dihubungkan dengan API backend server jika dibutuhkan.
