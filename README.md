# Found-It UMM

Website lost and found untuk lingkungan Universitas Muhammadiyah Malang. Aplikasi ini dibuat dengan React + Vite dan menggunakan Supabase untuk autentikasi, penyimpanan data barang, serta profil pengguna.

## Fitur Utama

- Login dan register dengan Supabase Auth
- Profil pengguna dengan `username`, `email`, `nomor HP`, `alamat`, dan avatar
- Lapor barang hilang dan barang ditemukan
- Kontak pelapor langsung ke WhatsApp
- Status barang dapat diperbarui
- UI responsif untuk desktop dan mobile

## Tech Stack

- React
- Vite
- Tailwind CSS
- Supabase

## Menjalankan Secara Lokal

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` berdasarkan `.env.example`, lalu isi:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

3. Jalankan development server:

```bash
npm run dev
```

4. Build production:

```bash
npm run build
```

5. Jalankan test:

```bash
npm test
```

## Setup Supabase

Project ini mengandalkan beberapa komponen backend di Supabase:

- `Authentication > Users` untuk login dan register
- tabel `items` untuk data barang
- tabel `profiles` untuk data profil pengguna
- edge function `delete-account` untuk hapus akun

Migration tabel `profiles` tersedia di:

[20260509121500_create_profiles_table.sql](</C:/file/Find it/KBT/supabase/migrations/20260509121500_create_profiles_table.sql:1>)

Jika belum dijalankan, buka Supabase SQL Editor lalu jalankan isi migration tersebut.

## Deploy ke Vercel

Tambahkan environment variable berikut di project Vercel:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Jika fitur hapus akun ingin tetap aktif, deploy juga edge function Supabase:

```bash
supabase functions deploy delete-account --verify-jwt
```

Pastikan `SUPABASE_SERVICE_ROLE_KEY` tersedia di environment function Supabase.

## Turnstile CAPTCHA

Login dan register memakai Cloudflare Turnstile. Site key dipakai di frontend lewat `VITE_TURNSTILE_SITE_KEY`.

Secret key tidak boleh disimpan di browser. Simpan `TURNSTILE_SECRET_KEY` di environment edge function Supabase, lalu deploy function:

```bash
supabase functions deploy turnstile-verify
```

Setelah itu, login dan register akan memverifikasi token CAPTCHA ke Cloudflare sebelum lanjut ke Supabase Auth.

## Catatan Sebelum Testing Publik

- Pastikan tabel `profiles` sudah dibuat
- Pastikan user yang dites ada di `Authentication > Users`
- Jika email confirmation aktif, user harus verifikasi email sebelum login
- Pastikan env di Vercel dan lokal mengarah ke project Supabase yang sama
