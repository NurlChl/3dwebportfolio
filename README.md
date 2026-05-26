# 3D Artist Portfolio + CMS

Website portfolio untuk 3D artist dengan realtime Three.js viewer, halaman SEO-friendly, dan CMS sederhana untuk mengelola profil serta upload model `.glb` / `.gltf`.

## Stack

- Next.js App Router
- Three.js via React Three Fiber dan Drei
- MongoDB native driver
- MongoDB Atlas free tier untuk metadata portfolio dan CMS
- Upload lokal ke `public/uploads/models` untuk development

Untuk produksi, simpan file 3D besar di object storage seperti Cloudflare R2, S3, atau Supabase Storage, lalu simpan URL file di MongoDB. MongoDB cocok untuk data portfolio dan profil, tetapi bukan tempat terbaik untuk menyimpan file Blender/GLB berukuran besar.

## Setup

1. Copy `.env.example` menjadi `.env`.
2. Isi `DATABASE_URL` dari MongoDB Atlas.
3. Buat hash password admin:

```bash
node -e "require('bcryptjs').hash('password-anda', 12).then(console.log)"
```

4. Jalankan:

```bash
npm install
npm run db:seed
npm run dev
```

CMS tersedia di `/admin`.

Credential development default:

- Email: `admin@example.com`
- Password: `admin12345`

Untuk production, ganti `ADMIN_PASSWORD`, `ADMIN_PASSWORD_HASH`, dan `SESSION_SECRET`.

## SEO 

Project sudah menyediakan metadata per halaman, `sitemap.xml`, `robots.txt`, URL detail portfolio berbasis slug, dan konten ringkasan yang bisa diedit dari CMS. Untuk ranking, tetap perlu optimasi konten nyata: judul portfolio spesifik, deskripsi proses kerja, alt/poster media, backlink, performa asset 3D, dan domain authority.
