# Universe of Tech (UOT) — Frontend Architecture
**Dokumentasi Resmi Fase 5: Design Tokens, Unified Stylesheets, and Modular Client Scripts**

---

## 1. Hirarki Stylesheet Terpadu

Untuk mengeliminasi konflik CSS dan *patchwork culture*, seluruh tampilan UOT distandardisasi ke dalam struktur stylesheet terpadu berbasis Design Tokens:

```
public/
├── tokens.css                    # 1. Fondasi Design Tokens global (warna, radius, spacing, shadow)
├── app-shell.css                 # 2. Layout dasar aplikasi, flex/grid container, baseline reset
├── responsive-system.css         # 3. Breakpoint sistem (Mobile, Tablet, Desktop, Ultra-Wide)
├── navbar-shared.css             # 4. Navigasi global terpadu dan state drawer mobile
├── compact-global.css            # 5. Utilitas micro-component dan card container
│
└── Domain Stylesheets:
    ├── index-clean.css           # Beranda & Discovery Hub
    ├── learning-journey.css      # Peta Jalur Belajar (Curriculum Roadmap)
    ├── materi-clean.css          # Modul Bacaan & Studio Materi
    ├── quiz-clean.css            # Antarmuka Kuis & Evaluasi Belajar
    ├── snbt-clean.css            # Bank Soal Ujian SNBT / TKA
    ├── bahasa-daerah.css         # Eksplorasi Bahasa Daerah & Budaya
    ├── pro-hub.css               # Pusat Fitur PRO & Manajemen Langganan
    ├── profile-modern.css        # Profil Pengguna, Statistik & Badges
    └── games/games.css           # Game Edukasi & Interaktif
```

---

## 2. Standar Struktur JavaScript Klien

Semua script klien diorganisasikan berdasarkan domain tanggung jawab fungsional dengan antarmuka yang bersih:

| Modul JS | Peran & Tanggung Jawab |
| :--- | :--- |
| `api-client.js` | Wrapper HTTP terpusat dengan penanganan header CSRF otomatis, retry, dan token auth. |
| `account-core.js` | Manajemen state sesi klien, autentikasi UI, dan profil pengguna. |
| `activity-service.js` | Pengiriman aktivitas belajar terverifikasi ke server ledger. |
| `navbar-explore.js` | Interaksi navbar global, pencarian cepat (Command Palette), dan navigasi responsif. |
| `adaptive-learning-engine.js` | Penentuan rekomendasi materi cerdas berdasarkan riwayat belajar. |
| `content-engine.js` | Runtime parser konten lokal/offline dengan fallback database. |
| `security-helper.js` | Sanitasi input dan proteksi XSS DOM sisi klien. |
| `markdown-code-helper.js` | Parser markdown dan syntax highlighter materi pemrograman. |

---

## 3. Aturan Tata Kelola CSS & Anti-Slop Principles

1. **Konsistensi Token**: Seluruh ukuran margin, padding, warna, dan radius wajib merujuk ke variabel `--uot-*` atau `--space-*` dari `tokens.css`.
2. **Eliminasi `!important`**: Tidak diperkenankan menggunakan `!important` untuk menimpa gaya dasar kecuali untuk helper utilitas utiliter tertentu.
3. **Pemberian ID Unik**: Seluruh container kartu utama, form submit, dan tombol tindakan memiliki atribut `id` unik.
4. **Touch Target**: Seluruh tombol dan kontrol navigasi memiliki ukuran interaksi minimal 44px pada layar sentuh ponsel.
