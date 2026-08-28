# Universe of Tech (UOT) — Design System & UI/UX Standards
**Dokumentasi Resmi Fase 7: Visual Tokens, Typography Scale, Spacing Math, and Accessibility Guidelines**

---

## 1. Palet Warna & Semantic Roles

| Token Warna | Nilai Hex | Peran & Kontras |
| :--- | :--- | :--- |
| `--uot-primary` | `#15803D` (Emerald Pine) | Aksi utama, tombol konfirmasi, badge aktif. Kontras 4.8:1 pada background terang. |
| `--uot-primary-hover` | `#166534` (Deep Forest) | State hover tombol primer. |
| `--uot-primary-soft` | `#F0FDF4` (Mint Surface) | Background chip materi aktif, kartu terselesaikan. |
| `--uot-accent` | `#D97706` (Amber Gold) | XP highlight, koin, achievement streak badge. |
| `--uot-bg` | `#F8FAF9` (Off-white Canvas) | Background kanvas utama aplikasi. |
| `--uot-surface` | `#FFFFFF` (Pure Card) | Latar belakang kartu materi dan kontainer dashboard. |
| `--uot-text-primary` | `#0F172A` (Slate Navy) | Tipografi judul dan teks utama (WCAG AAA compliant). |
| `--uot-text-secondary` | `#334155` (Slate Gray) | Teks pendukung, deskripsi modul. |
| `--uot-text-muted` | `#64748B` (Cool Slate) | Label meta, timestamp, nomor bab. |
| `--uot-border` | `rgba(15, 23, 42, 0.12)` | Garis pemisah komponen yang halus dan tegas. |

---

## 2. Skala Tipografi Matematis (Major Third Ratio: 1.25)

```
Level      Ukuran (px)   Line Height   Penggunaan
Display    36px          1.2           Hero Banner Judul Utama
H1         28px          1.3           Judul Modul / Header Halaman
H2         22px          1.35          Sub-judul Bab / Section Header
H3         18px          1.4           Judul Kartu Materi
Body       16px          1.6           Teks Utama (Min 16px, 65-75ch limit)
Small      14px          1.5           Label Badge, Tombol, Metadata
Micro      12px          1.4           Timestamp, Tag Versi
```

---

## 3. Sistem Spacing & Grid (4px Base Grid)

```
Token          Nilai (px)   Penggunaan
--space-1      4px          Padding mikro dalam chip/tag
--space-2      8px          Jarak antar ikon dan teks
--space-3      12px         Padding dalam tombol kecil / input
--space-4      16px         Padding standar kartu konten
--space-6      24px         Jarak antar kartu dalam grid
--space-8      32px         Padding kontainer section utama
--space-12     48px         Jarak vertikal antar section
```

---

## 4. Standar Aksesibilitas (WCAG 2.1 AA)

1. **Kontras Teks**: Seluruh teks body memiliki rasio kontras minimal 4.5:1 terhadap latar belakangnya.
2. **Touch Targets**: Area klik tombol, tautan navigasi, dan kontrol kuis memiliki ukuran minimal **44x44 piksel**.
3. **Focus Ring**: Indikator fokus keyboard tampak jelas menggunakan `outline: 2px solid var(--uot-focus-ring); outline-offset: 2px;`.
4. **Motion Safety**: Animasi transisi otomatis dinonaktifkan jika pengguna mengaktifkan preferensi `prefers-reduced-motion: reduce`.
5. **No Text Truncation inside Pills**: Label di dalam tombol dan pill badge tidak dipenggal di tengah kata.
