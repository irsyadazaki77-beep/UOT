# DATABASE & PERSISTENCE ARCHITECTURE — UNIVERSE OF TECH (FASE 18)

Dokumen ini mendefinisikan arsitektur persistent storage, skema relasional, sistem migrasi, penanganan transaksi ACID, strategi idempotensi, dan prosedur backup & recovery untuk platform **Universe of Tech**.

---

## 1. Arsitektur Multi-Database (SQLite Dev & PostgreSQL Prod)

Platform Universe of Tech menggunakan **Database Access Layer (DAL)** berbasis Repository Pattern yang diabstraksikan oleh `db/db-adapter.js`.

```
                  +-----------------------------------+
                  |           Express Server          |
                  |     (Routes, Auth, Middleware)    |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |          Repository Layer         |
                  | - UserRepository                  |
                  | - SessionRepository               |
                  | - ProgressRepository              |
                  | - SubscriptionRepository          |
                  | - ContentRepository               |
                  | - AnalyticsRepository             |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |        DBAdapter Singleton        |
                  | (ACID Transactions, Params, WAL)  |
                  +--------+-----------------+--------+
                           |                 |
          (Local / Dev)    v                 v   (Production)
                 +-------------+         +---------------+
                 | node:sqlite |         |  PostgreSQL   |
                 | (WAL Mode)  |         | (DATABASE_URL)|
                 +-------------+         +---------------+
```

### Konfigurasi Environment
- **Development / Sandbox**: `node:sqlite` (native WAL mode di `data/uot.sqlite`). Tidak memerlukan instalasi service eksternal, siap jalan langsung di container.
- **Production**: PostgreSQL pool via environment variable `DATABASE_URL` (misal: `postgres://user:pass@host:5432/uot_prod`).

---

## 2. Skema Relasional & Tabel Lengkap

### `users`
Tabel identitas dan autentikasi pengguna:
- `id` (VARCHAR(64) PRIMARY KEY)
- `username` (VARCHAR(100) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `salt` (VARCHAR(64) NOT NULL)
- `role` (VARCHAR(32) DEFAULT 'user')
- `is_pro` (INTEGER DEFAULT 0)
- `created_at` (DATETIME NOT NULL)
- `updated_at` (DATETIME NOT NULL)

### `sessions`
Tabel session persistence (HttpOnly cookie store):
- `token` (VARCHAR(128) PRIMARY KEY)
- `user_id` (VARCHAR(64) NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE)
- `role` (VARCHAR(32) DEFAULT 'user')
- `is_pro` (INTEGER DEFAULT 0)
- `expires_at` (DATETIME NOT NULL)
- `created_at` (DATETIME NOT NULL)
- `last_seen_at` (DATETIME NOT NULL)

### `user_progress`
Agregat snapshot progres pembelajaran pengguna:
- `user_id` (VARCHAR(64) PRIMARY KEY, FOREIGN KEY -> users(id) ON DELETE CASCADE)
- `lifetime_xp` (INTEGER DEFAULT 0)
- `level` (INTEGER DEFAULT 1)
- `coins` (INTEGER DEFAULT 50)
- `streak` (INTEGER DEFAULT 0)
- `last_active_date` (VARCHAR(32))
- `streak_freeze_count` (INTEGER DEFAULT 0)
- `equipped_avatar` (VARCHAR(64) DEFAULT '👨‍💻')
- `equipped_theme` (VARCHAR(64) DEFAULT 'ocean')
- `equipped_accent` (VARCHAR(64) DEFAULT 'ocean')
- `flagged` (INTEGER DEFAULT 0)
- `settings_json` (TEXT)
- `personal_bests_json` (TEXT)
- `daily_missions_json` (TEXT)
- `weekly_missions_json` (TEXT)
- `challenge_progress_json` (TEXT)
- `recommendation_history_json` (TEXT)
- `created_at` (DATETIME NOT NULL)
- `updated_at` (DATETIME NOT NULL)

### `progress_events` (Event Ledger & Idempotency)
Buku besar event progres pembelajaran untuk audit, sinkronisasi, dan anti-cheat:
- `event_id` (VARCHAR(128) NOT NULL)
- `user_id` (VARCHAR(64) NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE)
- `event_type` (VARCHAR(64) NOT NULL)
- `client_timestamp` (DATETIME)
- `server_timestamp` (DATETIME NOT NULL)
- `xp_awarded` (INTEGER DEFAULT 0)
- `coins_awarded` (INTEGER DEFAULT 0)
- `reason` (VARCHAR(255))
- `payload_json` (TEXT)
- `result_json` (TEXT)
- **Constraint**: `PRIMARY KEY (user_id, event_id)` & `UNIQUE(user_id, event_id)`

### `user_completed_lessons`
Tabel normalisasi bagian/bab materi yang diselesaikan:
- `user_id` (VARCHAR(64) NOT NULL)
- `lesson_id` (VARCHAR(128) NOT NULL)
- `completed_at` (DATETIME NOT NULL)
- **Constraint**: `PRIMARY KEY (user_id, lesson_id)`

### `quiz_attempts`
Riwayat pengerjaan kuis dan latihan:
- `id` (VARCHAR(64) PRIMARY KEY)
- `user_id` (VARCHAR(64) NOT NULL)
- `quiz_id` (VARCHAR(128) NOT NULL)
- `score` (INTEGER NOT NULL)
- `is_passed` (INTEGER DEFAULT 0)
- `is_perfect` (INTEGER DEFAULT 0)
- `time_spent_seconds` (INTEGER DEFAULT 0)
- `attempt_number` (INTEGER DEFAULT 1)
- `created_at` (DATETIME NOT NULL)

### `projects_progress`
Progres langkah proyek portofolio:
- `user_id` (VARCHAR(64) NOT NULL)
- `project_id` (VARCHAR(128) NOT NULL)
- `current_step` (INTEGER DEFAULT 1)
- `completed_steps_json` (TEXT)
- `is_completed` (INTEGER DEFAULT 0)
- `created_at` (DATETIME NOT NULL)
- `updated_at` (DATETIME NOT NULL)
- **Constraint**: `PRIMARY KEY (user_id, project_id)`

### `achievements` & `user_inventory`
- `achievements`: `(user_id, achievement_id, unlocked_at)` PK: `(user_id, achievement_id)`
- `user_inventory`: `(user_id, item_id, unlocked_at)` PK: `(user_id, item_id)`

### `subscriptions`
- `user_id` (VARCHAR(64) PRIMARY KEY)
- `plan_id` (VARCHAR(64) NOT NULL)
- `status` (VARCHAR(32) DEFAULT 'active')
- `source` (VARCHAR(64) DEFAULT 'manual')
- `starts_at` (DATETIME NOT NULL)
- `expires_at` (DATETIME)
- `is_trial` (INTEGER DEFAULT 0)
- `created_at` (DATETIME NOT NULL)
- `updated_at` (DATETIME NOT NULL)

### `content`
- `domain` (VARCHAR(64) NOT NULL)
- `id` (VARCHAR(128) NOT NULL)
- `title` (VARCHAR(255))
- `status` (VARCHAR(32) DEFAULT 'published')
- `content_json` (TEXT NOT NULL)
- `created_at` (DATETIME NOT NULL)
- `updated_at` (DATETIME NOT NULL)
- **Constraint**: `PRIMARY KEY (domain, id)`

### `analytics_events`, `error_telemetry`, `web_vitals`, `feature_flags`
- Menyimpan telemetri, metrik performa, dan dynamic feature flag toggle secara persisten.

---

## 3. Strategi Transaksi & Idempotensi

1. **ACID Transaction Block**:
   Setiap event mutasi (`processActivityEvent`) dieksekusi di dalam satu blok transaksi database (`BEGIN ... COMMIT / ROLLBACK`).
2. **Idempotency via UNIQUE Constraint**:
   Event ID yang sama ditolak dari pencatatan ulang ganda menggunakan pemeriksaan dan constraint `UNIQUE(user_id, event_id)`. Request ulang dengan event ID yang sama mengembalikan status `alreadyProcessed: true` beserta snapshot state terkini tanpa menambah XP atau koin ganda.
3. **Deterministic Timestamps**:
   Semua kronologi waktu (`server_timestamp`, `created_at`, `updated_at`) menggunakan server clock ISO 8601 (`new Date().toISOString()`), menolak manipulasi clock dari sisi client.
4. **Anti-Abuse Velocity Anomaly**:
   Transaksi secara otomatis mengecek ambang batas kecepatan XP (maks 500 XP/10 detik atau 3000 XP/1 jam) dan waktu pengerjaan kuis instan (<3 detik). Anomali dicatat ke tabel `suspicious_flags` dan user progress ditandai `flagged = 1`.

---

## 4. Indeks Database (Performance & Concurrency)

Indeks dibuat secara otomatis saat migrasi:
- `idx_users_email` pada `users(email)`
- `idx_sessions_user_id` pada `sessions(user_id)`
- `idx_sessions_expires_at` pada `sessions(expires_at)`
- `idx_progress_events_user` pada `progress_events(user_id, server_timestamp)`
- `idx_progress_events_type` pada `progress_events(event_type)`
- `idx_completed_lessons_user` pada `user_completed_lessons(user_id)`
- `idx_quiz_attempts_user_quiz` pada `quiz_attempts(user_id, quiz_id)`
- `idx_achievements_user` pada `achievements(user_id)`
- `idx_inventory_user` pada `user_inventory(user_id)`
- `idx_content_domain_status` pada `content(domain, status)`
- `idx_analytics_events_name` pada `analytics_events(event_name, timestamp)`
- `idx_error_telemetry_time` pada `error_telemetry(timestamp)`
- `idx_followers_follower` pada `followers(follower_id)`
- `idx_followers_following` pada `followers(following_id)`
- `idx_notifications_user` pada `notifications(user_id, is_read)`

---

## 5. Sistem Migrasi & Backup Recovery

1. **Migrator (`db/migrator.js`)**:
   - Memastikan tabel `schema_migrations` tersedia.
   - Menjalankan file migrasi SQL berurutan (`001_initial_schema.sql`, dst).
   - Memindahkan data legacy dari `uot_db_store.json` dan `content/*.json` ke database SQL secara aman (`INSERT OR IGNORE`).
2. **Backup Service (`db/backup.js`)**:
   - **Snapshot**: Menghasilkan file snapshot JSON berisi seluruh tabel users, konten, dan konfigurasi ke folder `data/backups/`.
   - **Admin API**:
     - `GET /api/admin/db/status` (Health & Metrics)
     - `POST /api/admin/db/backup` (Trigger Snapshot)
     - `GET /api/admin/db/backups` (Daftar Snapshot)
   - **Restore**: Mengembalikan state konten dan data dari snapshot cadangan.

---

## 6. Offline Client Queue & Sync Protocol

- **Offline Queue**: Event yang terjadi saat offline disimpan di `localStorage['uot_pending_events']`.
- **Acknowledged Event Dequeue**: Saat online kembali, client mengirim antrean ke `/api/progress/sync`. Server mengembalikan `acknowledgedEventIds: [...]`. Client **hanya** menghapus event yang telah di-acknowledge sukses oleh server, menjaga data tidak pernah hilang jika terjadi network glitch di tengah transmisi.
