# Universe of Tech (UOT) — Security Architecture & Hardening
**Dokumentasi Resmi Fase 4: Defense-in-Depth, OWASP Compliance, and Cryptographic Security**

---

## 1. Kebijakan Keamanan & Kriptografi

Universe of Tech menerapkan prinsip *Defense-in-Depth* pada seluruh lapisan komputasi:

### A. Pengamanan Kredensial & Kata Sandi
- **Algoritma Hashing**: PBKDF2 dengan digest `SHA-512`, 100.000 iterasi putaran, serta salt kriptografis acak 16-byte (`crypto.randomBytes(16)`).
- **Verifikasi Timing-Safe**: Pengecekan hash menggunakan `crypto.timingSafeEqual` untuk mencegah serangan *timing attack*.
- **Kompleksitas Kata Sandi**: Minimal 8 karakter, wajib memuat huruf besar, huruf kecil, dan angka (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`).

### B. Pengelolaan Sesi & Token
- **Session Identifier**: Token 256-bit berentropi tinggi (`uot_sess_*`) disimpan dalam cookie bertanda `HttpOnly`, `SameSite=Lax`, dan `Secure` (pada mode produksi).
- **Session Rotation**: Token sesi lama otomatis dihancurkan dan diterbitkan ulang saat login/registrasi untuk mencegah serangan *Session Fixation*.
- **Masa Berlaku Sesi**: Kedaluwarsa otomatis dalam 24 jam dengan rutinitas pembersihan (*garbage collection*) sesi berkala.

### C. Proteksi CSRF (Cross-Site Request Forgery)
- **Verifikasi Header**: Seluruh mutasi data (`POST`, `PUT`, `DELETE`, `PATCH`) mewajibkan penyertaan header `X-CSRF-Token` yang cocok dengan token sesi pengguna atau cookie `uot_csrf`.
- **Origin Validation**: Validasi kecocokan header `Origin` terhadap `Host` untuk memblokir permintaan lintas domain berbahaya.

### D. Pembatasan Laju (Rate Limiting & Anti-Brute-Force)
- **Sliding-Window Rate Limiting**: Membatasi percobaan login, registrasi, dan perubahan progres per IP.
- **Audit Logging**: Pencatatan kegagalan autentikasi dengan penyamaran email (`u***r@domain.com`) untuk melindungi privasi pengguna dari *data harvesting*.

---

## 2. Matriks Pengendalian Kerentanan OWASP Top 10

| Kategori OWASP | Mekanisme Pertahanan UOT | Status Verifikasi |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Otorisasi berbasis peran (`admin`/`user`), validasi kepemilikan data server-authoritative, pemeriksaan session token pada setiap request mutasi. | Terverifikasi |
| **A02: Cryptographic Failures** | HSTS (`max-age=31536000`), HTTPS-only cookies pada produksi, hash PBKDF2-SHA512 dengan salt individual. | Terverifikasi |
| **A03: Injection (SQL/NoSQL/Command)** | Seluruh query database menggunakan *Parameterized Queries* (`?` atau `$1`) via DBAdapter. Tidak ada string concatenation pada query SQL. | Terverifikasi |
| **A04: Insecure Design** | Anti-abuse validation pada penambahan XP/Coins (maksimum delta XP per aktivitas, ledger idempotency). | Terverifikasi |
| **A05: Security Misconfiguration** | Headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, CSP dinamis dengan Nonce. Endpoint `/api/health` disanitasi tanpa membeberkan path internal filesystem. | Terverifikasi |
| **A06: Vulnerable & Outdated Components** | Audit dependensi berkala, pemisahan dependensi runtime minimalis. | Terverifikasi |
| **A07: Identification & Authentication Failures** | Proteksi brute force, lockout tracking, penolakan kata sandi lemah. | Terverifikasi |
| **A08: Software & Data Integrity Failures** | Webhook Stripe divalidasi dengan signature kriptografis (`stripe-signature`). Sandbox mode terisolasi dan dilabeli secara eksplisit. | Terverifikasi |
| **A09: Security Logging & Monitoring** | Audit log terpusat untuk aktivitas administratif dan kegagalan auth. Correlation ID (`X-Request-Id`) pada setiap request. | Terverifikasi |
| **A10: Server-Side Request Forgery (SSRF)** | Sandbox runner berjalan pada isolasi CSP terketat (`connect-src 'none'`, `default-src 'none'`). | Terverifikasi |

---

## 3. Laporan Risiko Residu (Honest Residual Risk Disclosure)

Sebagai standar integritas teknik senior, tidak ada sistem perangkat lunak yang dapat diklaim "100% kebal" terhadap seluruh ancaman siber. Berikut adalah area perhatian operasional untuk tim DevOps & SecOps:

1. **Rotasi Kunci Rahasia**: `ADMIN_KEY` dan `STRIPE_SECRET_KEY` wajib dirotasi secara berkala (maksimal 90 hari) melalui platform secret manager Cloud Run.
2. **Koneksi Database Produksi**: Saat bermigrasi ke PostgreSQL produksi, pastikan konfigurasi `DATABASE_URL` menggunakan koneksi terenkripsi SSL (`sslmode=require`).
3. **Penyimpanan Rate Limiter Skala Multi-Instance**: Pada deployment horizontal multi-kontainer, ganti `MemoryStore` dengan Redis/KeyDB cluster agar batas laju tersinkronisasi secara global di seluruh pod.
