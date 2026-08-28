# Universe of Tech (UOT) — Persistence & Database Architecture
**Dokumentasi Resmi Fase 2: Database Consolidation & Single Source of Truth**

---

## 1. Arsitektur Single Source of Truth

Universe of Tech (UOT) menerapkan arsitektur persistensi data berlapis yang menjamin determinisme data, konkurensi aman, serta pemisahan tegas antara basis data operasional dan data konten kurikulum.

```
+-------------------------------------------------------------+
|                      Controller Layer                       |
| (AuthController, ProgressController, SubscriptionController)|
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                        Service Layer                        |
| (AuthService, ProgressService, SubscriptionService, Content)|
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      Repository Layer                       |
|   - UserRepository          - SessionRepository             |
|   - ProgressRepository      - SubscriptionRepository        |
|   - ContentRepository       - AnalyticsRepository           |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 Database Adapter (DBAdapter)                |
+------------------------------+------------------------------+
               |                               |
       (Production)                     (Local / CI)
               v                               v
+------------------------------+ +----------------------------+
|      PostgreSQL 15+          | |       SQLite 3 (WAL)       |
|    (Autoritatif Prod)        | |    (File / Memori Lokal)   |
+------------------------------+ +----------------------------+
```

---

## 2. Klasifikasi dan Peran Komponen Penyimpanan

| Komponen Penyimpanan | Lingkungan | Sifat Data | Tanggung Jawab & Kebijakan |
| :--- | :--- | :--- | :--- |
| **PostgreSQL (`DATABASE_URL`)** | Produksi (Cloud) | Authoritative, Stateful | Menyimpan data akun pengguna, status langganan PRO, ledger transaksi XP/Coins, progres kurikulum, audit keamanan. |
| **SQLite (`uot.sqlite` - WAL)** | Development & CI | Authoritative Lokal | Eksekusi query terisolasi secara lokal dengan mode Write-Ahead Logging (WAL) untuk performa tinggi tanpa dependensi container berat. |
| **Content Seed (`data/content/*.json`)** | Semua Lingkungan | Immutable Canonical Seed | Sumber data awal modul (lessons, quizzes, learning-paths, projects, culture, books). Dimuat otomatis ke database saat migrasi. |
| **Memory / Cache** | Runtime | Transient | Menyimpan feature flag cache dan metrik observabilitas sementara. |

---

## 3. Skema Database Relasional Terpadu

Database UOT dirancang dengan tabel-tabel ternormalisasi yang dilengkapi integritas referensial dan indeks pencarian cepat:

1. **`users`**: Identitas akun, username, email unik, hash kata sandi PBKDF2-SHA512, salt unik 16-byte, role (`user`/`admin`), timestamp pendaftaran.
2. **`sessions`**: Token sesi `uot_sess_*`, referensi `user_id`, token CSRF, waktu kedaluwarsa 24 jam.
3. **`user_progress`**: Level, lifetime XP, saldo koin, streak aktif, proteksi streak freeze, avatar & tema yang digunakan, metadata JSON konfigurasi.
4. **`progress_events` (Ledger)**: Catatan append-only untuk setiap perubahan XP/Coins guna mencegah kecurangan (anti-replay & duplicate reward prevention).
5. **`user_completed_lessons`**: Riwayat materi dan bab yang telah diselesaikan pengguna.
6. **`achievements` & `user_inventory`**: Pencapaian dan inventaris item yang telah dibuka pengguna.
7. **`subscriptions` & `invoices`**: Status langganan PRO, periode aktif, dan histori transaksi pembayaran.
8. **`content`**: Metadata dan payload JSON setiap item kurikulum terindeks berdasarkan domain dan status (published/draft).
9. **`analytics_events`, `error_telemetry`, `web_vitals`, `feature_flags`**: Tabel observabilitas dan konfigurasi dinamis.

---

## 4. Migrasi Skema Deterministik (`db/migrator.js`)

Semua perubahan skema database dikelola melalui tabel `schema_migrations`:
- Eksekusi migrasi berurutan berdasarkan nomor versi SQL (`001_initial_schema.sql`, dst).
- Pengecekan idempotensi sebelum eksekusi untuk mencegah *duplicate table execution*.
- Sinkronisasi otomatis data seed dari direktori canonical `/data/content/` ke tabel `content`.
- Isolasi transaksi (`BEGIN TRANSACTION ... COMMIT`) untuk menjaga integritas data jika terjadi kegagalan sistem di tengah proses migrasi.
