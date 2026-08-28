# Universe of Tech (UOT) — Backend Architecture
**Dokumentasi Resmi Fase 3: Layered Architecture, Modular Services, and Clean Contract Standards**

---

## 1. Ikhtisar Struktur Modular Backend

Arsitektur backend UOT telah didecoupling sepenuhnya dari struktur monolitik menjadi pola arsitektur berlapis (*Layered Clean Architecture*):

```
src/
├── server.js                     # Thin HTTP entrypoint & process lifecycle manager
├── server-db.js                  # Persistent bridge layer
└── server/
    ├── app.js                    # Express application factory (`createApp`)
    ├── config/                   # Environtment variables & runtime settings
    ├── bootstrap/                # Database & provider initializers
    │   ├── database.js
    │   └── providers.js
    ├── middleware/               # Cross-cutting concerns
    │   ├── security-headers.js   # CSP with nonce, HSTS, frame-ancestors
    │   ├── error-handler.js      # Centralized error response handler
    │   └── index.js              # Auth, CSRF, Rate limiter, Role gates
    ├── services/                 # Pure domain business logic
    │   ├── auth-service.js
    │   ├── subscription-service.js
    │   ├── progress-service.js
    │   ├── content-service.js
    │   ├── social-service.js
    │   └── analytics-service.js
    ├── controllers/              # HTTP request parsing & response serialization
    │   ├── auth-controller.js
    │   ├── subscription-controller.js
    │   ├── progress-controller.js
    │   ├── social-controller.js
    │   ├── telemetry-controller.js
    │   └── admin-controller.js
    ├── routes/                   # Route definitions & parameter validation
    │   ├── auth-routes.js
    │   ├── subscription-routes.js
    │   ├── progress-routes.js
    │   ├── social-routes.js
    │   ├── telemetry-routes.js
    │   └── admin-routes.js
    ├── security/                 # Password hashing & crypto helpers
    │   └── crypto.js
    └── utils/                    # Helper utilities
        ├── request-id.js         # Correlation ID generator (`X-Request-Id`)
        ├── api-response.js       # Standardized response formatters
        └── sanitize.js           # Input sanitizers
```

---

## 2. Standar Respons API Terpadu

Semua endpoint API publik dan internal mengikuti format JSON terstandardisasi:

### Respons Berhasil (2xx)
```json
{
  "ok": true,
  "data": { ... },
  "message": "Deskripsi opsional"
}
```

### Respons Gagal (4xx / 5xx)
```json
{
  "ok": false,
  "error": "ERROR_CODE_STRING",
  "message": "Pesan ramah pengguna yang menjelaskan kesalahan.",
  "requestId": "req_a1b2c3d4e5"
}
```

---

## 3. Alur Permintaan (Request Lifecycle)

1. **Inflow**: Permintaan HTTP masuk melalui `src/server.js`.
2. **Correlation Tracking**: Middleware `request-id.js` menyematkan `req.id` dan header `X-Request-Id`.
3. **Security Headers & CSP**: Middleware `security-headers.js` menyuntikkan CSP nonce unik untuk mencegah serangan script injection.
4. **Body & Cookies**: Parser `express.json` (limit 256kb) dan parser cookie memproses payload.
5. **Autentikasi & Otorisasi**: `middlewares.authenticate` mengekstrak sesi dari cookie `HttpOnly` `uot_session` atau header `Authorization: Bearer <token>`.
6. **Proteksi Mutasi**: `middlewares.requireCsrf` memvalidasi header `X-CSRF-Token` pada seluruh mutasi data (`POST`, `PUT`, `DELETE`, `PATCH`).
7. **Rate Limiting**: Membatasi laju request per IP dan per aksi.
8. **Routing**: Meneruskan ke Controller yang bersangkutan.
9. **Domain Execution**: Controller mendelegasikan pemrosesan data murni ke Service Layer (`src/server/services/`).
10. **Data Persistence**: Service memanggil Repository Layer untuk query database relasional.
11. **Error Handling**: Jika terjadi pengecualian (*exception*), middleware `error-handler.js` menangkap dan mengembalikan respon error JSON terstruktur tanpa membocorkan stack trace internal ke klien produksi.
