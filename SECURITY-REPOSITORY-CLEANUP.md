# Universe of Tech (UOT) — Security & Repository Cleanup
**Dokumentasi Resmi Fase 1: Repository Hygiene, Database Sanitization, and Sensitive Data Protection**

---

## 1. Ringkasan Eksekutif

Audit komprehensif terhadap repositori Universe of Tech (UOT) telah dilakukan untuk mengidentifikasi dan memusnahkan artefak runtime, snapshot pengujian, file database biner, serta potensi paparan kredensial sensitif.

Repositori telah dibersihkan dan distandardisasi dengan pemisahan tegas antara:
1. **Data Source / Seed Canonical**: Data kurikulum dan materi belajar immutable (`/data/content/*.json`).
2. **Runtime Data Store**: Database SQLite lokal (`/data/uot.sqlite`, WAL, SHM) yang kini diabaikan oleh Git.
3. **Test Fixtures & Backups**: Snapshot pengujian (`/data/backups/`) dengan proteksi direktori `.gitkeep`.
4. **Production Data**: Konfigurasi koneksi PostgreSQL authoritative (`DATABASE_URL`).

---

## 2. File & Pola yang Dilarang Masuk ke Git

| Pola File / Direktori | Klasifikasi | Alasan Keamanan & Operasional |
| :--- | :--- | :--- |
| `*.sqlite`, `*.sqlite-wal`, `*.sqlite-shm` | Runtime Database Biner | Rawan korupsi file saat multi-commit, mengandung data lokal pengguna/sesi, menimbulkan konflik merge non-deterministik. |
| `data/uot_db_store.json` | Runtime JSON Store | Berisi plaintext hash password sesi lokal pengembang/pengguna runtime. |
| `data/uot_analytics_store.json` | Telemetri Runtime | Mengandung log error runtime dan ID sesi internal. |
| `data/backups/*.json` | Backup Snapshot | Akumulasi snapshot berulang memenuhi ukuran repositori dan membeberkan histori data lokal. |
| `.env`, `.env.local`, `.env.*` | Credentials / Secrets | Berisi kunci API (Stripe Secret, Admin Key, Database URL) yang tidak boleh bocor ke publik. |
| `npm-debug.log*`, `*.log` | Runtime Logs | Membocorkan trace error dan struktur path internal server. |

---

## 3. Aturan `.gitignore` Terpadu

Aturan berikut telah diperbarui pada file `/.gitignore` untuk memastikan artefak runtime tidak pernah kembali ter-commit:

```gitignore
# Local environment and secrets
.env
.env.*
!.env.example

# Dependencies and generated output
node_modules/
dist/
coverage/

# Runtime Database & Persistence Files
*.sqlite
*.sqlite-wal
*.sqlite-shm
data/*.sqlite
data/*.sqlite-wal
data/*.sqlite-shm
data/runtime/
data/uot_db_store.json
data/uot_analytics_store.json
src/data/*.json
!data/content/*.json

# Backups and snapshots
data/backups/*
!data/backups/.gitkeep

# Temporary and test artifacts
tmp/
temp/
*.tmp

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

## 4. Pemisahan Struktur Data Canonical

```
/data
├── backups/
│   └── .gitkeep              # Folder snapshot lokal (file backup otomatis di-ignore)
└── content/                  # Immutable Canonical Content Seed
    ├── books.json            # 41 Buku materi & referensi teknologi
    ├── culture.json          # Modul kebudayaan & bahasa nusantara
    ├── learning-paths.json   # 21 Jalur kompetensi teknologi (Canonical Single Source)
    ├── lessons.json          # Silabus materi terstruktur
    ├── projects.json         # Proyek portofolio praktis
    └── quizzes.json          # Bank soal interaktif & asesmen
```

---

## 5. Prosedur Pembersihan Histori Git (Jika Diperlukan pada Remote)

Bila file biner atau kredensial sempat ter-push ke histori remote sebelumnya, lakukan pembersihan mendalam menggunakan `git-filter-repo` atau `BFG Repo-Cleaner`:

```bash
# 1. Pastikan working tree bersih
git status

# 2. Hapus tracking file runtime yang terlanjur terindeks
git rm -r --cached data/*.sqlite data/*.sqlite-wal data/*.sqlite-shm data/backups/*.json data/uot_db_store.json 2>/dev/null || true

# 3. Membersihkan seluruh commit history menggunakan git filter-branch atau git-filter-repo
git filter-repo --path data/backups/ --invert-paths --force
git filter-repo --path data/uot.sqlite --invert-paths --force

# 4. Verifikasi repositori
git status
npm test
```

---

## 6. Audit Paparan Informasi Sensitif

1. **`ADMIN_KEY`**: Wajib disuplai melalui environment variable (`ADMIN_KEY`) pada mode produksi. Nilai default fallback diblokir di tingkat startup produksi.
2. **`STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`**: Disuplai via `.env`, diverifikasi secara lazy pada provider initialization.
3. **Hash Password**: Disimpan dalam bentuk PBKDF2 (SHA-512, 100.000 iterasi) dengan salt kriptografis unik 16-byte per akun.
4. **Masking Log**: Audit log auth gagal secara otomatis menyamarkan alamat email (`d***r@domain.com`) untuk mencegah information harvesting.
