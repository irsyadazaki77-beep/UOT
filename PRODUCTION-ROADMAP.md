# Rilis produksi UNIVERSE OF TECH

Fondasi front-end pada repositori ini berjalan sebagai aplikasi statis. Beberapa fitur penting tidak boleh diperlakukan sebagai aman sebelum memiliki layanan server.

## Status implementasi front-end (18 Juli 2026)

- Checkout lokal sekarang diberi label **demo**, tidak mengaku memproses pembayaran nyata, dan memakai nomor referensi `DEMO-*`.
- `api-client.js` dan `api-contract.yaml` menyediakan jalur hosted checkout produksi. Isi meta `quiznation-api-base` dengan origin API HTTPS setelah server tersedia.
- Service worker tidak lagi merujuk aset yang hilang dan kegagalan satu aset tidak menggagalkan seluruh instalasi offline.
- Runner JavaScript materi sudah dipisahkan ke iframe sandbox tanpa akses same-origin. Header khusus runner membatasi `unsafe-eval` hanya pada halaman tersebut.
- `_headers` menyediakan CSP, anti-clickjacking, MIME sniffing protection, referrer policy, dan permissions policy untuk host statis yang mendukung format tersebut.
- Logo, ikon PWA, dan maskot yang tampil telah dioptimalkan. Pemeriksaan regresi dapat dijalankan dengan `npm test`.
- Canonical, `og:url`, robots, dan sitemap absolut dapat dihasilkan setelah domain tersedia dengan `npm run prepare:production -- https://domain-anda.example`.

Poin di bawah tetap membutuhkan backend, domain, dan kredensial penyedia pembayaran; semuanya belum boleh ditandai selesai hanya dari perubahan front-end.

## Wajib sebelum menerima pengguna atau pembayaran nyata

1. Sediakan API HTTPS untuk autentikasi, profil, progres, bookmark, serta status langganan.
2. Simpan sesi dalam cookie `HttpOnly`, `Secure`, `SameSite=Lax`; jangan percaya `localStorage` untuk identitas atau akses Pro.
3. Verifikasi pembayaran melalui webhook provider pada server dan jadikan hasil webhook sebagai satu-satunya sumber status Pro.
4. Validasi input di API, gunakan rate limit pada login/kuis/AI, audit log, serta monitoring error.
5. Terapkan `_headers` sebagai HTTP header pada platform hosting. Sandbox sudah dipisahkan dan `unsafe-eval` dibatasi pada runner; migrasikan skrip/style inline yang tersisa agar `unsafe-inline` dapat dihapus.
6. Tentukan domain produksi lalu ubah entri `<loc>` pada `sitemap.xml` menjadi URL absolut domain tersebut.

## Kontrak data minimum

`users(id, email, display_name, created_at)`

`learning_progress(user_id, track_id, lesson_id, status, score, updated_at)`

`subscriptions(user_id, provider, provider_subscription_id, status, current_period_end)`

`quiz_attempts(user_id, session_id, category, score, answers, completed_at)`

Semua endpoint yang memodifikasi data harus membutuhkan autentikasi dan memvalidasi kepemilikan data berdasarkan `user_id` dari sesi server, bukan dari payload browser.
