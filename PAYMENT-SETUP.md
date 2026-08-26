# Panduan Integrasi Pembayaran Stripe & Arsitektur Langganan PRO
## Universe of Tech — Sistem Pendidikan Terintegrasi

Dokumen ini berisi panduan teknis lengkap untuk mengonfigurasi, menguji, dan memelihara modul pembayaran berbasis **Stripe** serta arsitektur verifikasi **PRO Entitlement** yang aman, jujur, dan berpusat pada server.

---

## 1. Arsitektur Pembayaran (Server-Side Source of Truth)

Sistem pembayaran ini menggunakan pola desain **Server-to-Server** di mana seluruh otorisasi dan penentuan hak akses (*entitlement*) dilakukan oleh server backend secara independen.

```
[ Frontend Client ]
       |
  1. Klik "Lanjut ke Stripe"
       v
[ Server Backend ] ---> 2. Buat Checkout Session ---> [ Stripe Hosted UI ]
       ^                                                     |
       |                                            3. Bayar dengan sukses
       |                                                     |
       +------------ 4. Kirim Webhook (invoice.paid) <-------+
```

### Karakteristik Keamanan Utama:
1. **No Client Control**: Client tidak dapat mengubah status Pro secara sepihak di `localStorage` (claims lokal selalu divalidasi ke database).
2. **Signature Verification**: Webhook `/api/payment/webhook` memverifikasi tanda tangan kriptografi (`stripe-signature`) dari Stripe menggunakan webhook secret.
3. **Webhook Idempotency**: Setiap event ID dicatat dalam tabel `processed_webhooks`. Jika event ID yang sama dikirim ulang, server akan segera merespons sukses tanpa memproses ulang data (mencegah eksploitasi pengiriman ganda).
4. **Subscription Period Management**: Periode aktif dihitung dari timestamp nyata yang bersumber langsung dari Stripe API.

---

## 2. Struktur Database Pendukung (`SQLite3`)

Skema database lengkap dikelola melalui migrasi SQL (`/db/migrations/004_payment_architecture_fields.sql`):

*   **`subscriptions`**: Menyimpan status langganan pengguna saat ini.
    *   `provider_customer_id`: ID Pelanggan di Stripe (`cus_...`).
    *   `provider_subscription_id`: ID Langganan di Stripe (`sub_...`).
    *   `status`: Status aktif dari Stripe (`active`, `past_due`, `canceled`, `expired`).
    *   `cancel_at_period_end`: Boolean penanda pembatalan otomatis di akhir masa penagihan.
*   **`payment_invoices`**: Riwayat tagihan dan kuitansi pembayaran resmi.
*   **`processed_webhooks`**: Tabel pelacak event ID webhook Stripe untuk menjamin idempotensi.

---

## 3. Cara Konfigurasi Environment & Stripe Dashboard

Untuk mengaktifkan pembayaran nyata pada lingkungan produksi, tambahkan variabel berikut pada file `.env` atau panel konfigurasi Cloud Run:

```env
# Kunci rahasia Stripe (Stripe Secret Key dari Dashboard)
STRIPE_SECRET_KEY=sk_live_... (Atau sk_test_... untuk pengujian)

# Tanda tangan Webhook Stripe (Stripe Webhook Secret)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Langkah Pengaturan Webhook di Dashboard Stripe:
1. Buka halaman **Stripe Dashboard** -> **Developers** -> **Webhooks**.
2. Klik **Add Endpoint**.
3. Setel URL Endpoint ke: `https://<domain-kamu>/api/payment/webhook`.
4. Pilih event berikut untuk didengarkan:
    *   `checkout.session.completed`
    *   `invoice.paid`
    *   `customer.subscription.updated`
    *   `customer.subscription.deleted`
5. Dapatkan kunci rahasia webhook (`whsec_...`) lalu masukkan ke variabel `STRIPE_WEBHOOK_SECRET`.

---

## 4. Pengujian Simulasi & Skenario Sandbox

Jika `STRIPE_SECRET_KEY` tidak diatur, aplikasi secara cerdas beralih ke **Sandbox Demo Mode**. Pada mode ini, Anda dapat menguji berbagai skenario langsung dari antarmuka web.

### Skenario Pengujian Mandiri:

1.  **Aktivasi Pro Lewat Sandbox (Demo)**
    *   **Tindakan**: Buka `/payment.html`, pilih paket bulanan/tahunan, isi data kartu demo secara acak, klik **Jalankan Simulasi**.
    *   **Hasil**: Server mencatat invoice pending, memicu simulasi sukses, mencatat entri langganan aktif di tabel `subscriptions`, dan memperbarui UI pengguna menjadi PRO.
2.  **Uji Webhook Signature Palsu**
    *   **Tindakan**: Mengirimkan request POST manual ke `/api/payment/webhook` tanpa header `stripe-signature` yang valid.
    *   **Hasil**: Server menolak request dengan status **HTTP 400 Bad Request** dan pesan kesalahan `INVALID_SIGNATURE`.
3.  **Uji Webhook Idempotensi (Duplicate Event)**
    *   **Tindakan**: Mengirimkan event webhook yang sama (dengan ID event yang sama) sebanyak 2 kali.
    *   **Hasil**: Request pertama sukses diproses. Request kedua akan segera menghasilkan respons HTTP 200 dengan flag `{ received: true, duplicate: true }` tanpa memproses ulang database.
4.  **Pembatalan & Berakhirnya Masa Aktif (Cancellation / Expiry)**
    *   **Tindakan**: Klik tombol batal langganan di halaman Profil.
    *   **Hasil**: Server memperbarui flag `cancel_at_period_end` menjadi `true`. Pada akhir periode, status berubah menjadi `expired` dan akses premium pengguna langsung dicabut.
5.  **Uji Sandbox di Environment Produksi**
    *   **Tindakan**: Mengubah variabel lingkungan `NODE_ENV` menjadi `production` lalu mencoba menembak endpoint `/api/subscription/sandbox-activate`.
    *   **Hasil**: Server menolak keras dengan status **HTTP 403 Forbidden** demi menjaga keamanan produksi nyata.

---

## 5. Pemecahan Masalah (Troubleshooting)

*   **Masalah: Server terus menampilkan "Please wait while your application starts..."**
    *   *Sebab*: Stripe SDK diinisialisasi secara langsung pada tingkat modul load-time dengan kunci kosong yang menyebabkan crash.
    *   *Solusi*: Kode ini telah menerapkan **Lazy Initialization** pada `payment-provider.js` sehingga server tetap berjalan stabil meskipun kunci belum dikonfigurasi.
*   **Masalah: Transaksi berhasil di Stripe, tetapi status pengguna di web belum berubah.**
    *   *Sebab*: Port webhook terblokir atau server tidak dapat memproses raw body payload untuk divalidasi.
    *   *Solusi*: Webhook server kami menggunakan parser `express.json` kustom yang mempertahankan body asli sebagai `req.rawBody` untuk verifikasi tanda tangan Stripe yang andal. Pastikan Stripe Dashboard Anda mengirim event webhook ke rute `/api/payment/webhook` yang benar.
