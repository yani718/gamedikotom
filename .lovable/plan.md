# Rencana Perubahan DichoLife Explorer

Saya akan menambahkan 3 hal yang Anda minta. Karena **Login Google** dan **Leaderboard nyata (lintas pemain)** memerlukan backend, saya akan mengaktifkan **Lovable Cloud** (database + autentikasi terkelola, tanpa setup tambahan).

---

## 1. Halaman Profil — Edit Nama & Upload Foto

- Field nama sudah bisa diedit; akan saya tambahkan tombol **Simpan** yang jelas + validasi (min 2, maks 24 karakter).
- Tambah opsi **Upload Foto** di samping pilihan avatar emoji:
  - Tombol "📷 Unggah Foto" → memilih file gambar dari perangkat.
  - Disimpan sebagai data URL di profil (lokal) **dan** ke Lovable Cloud Storage bila user login, agar tampil di leaderboard.
  - Foto kustom dipakai sebagai avatar bulat (menggantikan emoji jika ada).

## 2. Halaman Permainan — Tombol Kembali di Kunci Dikotom

Di fase **Kunci Dikotom** (`src/routes/play.$id.tsx`):
- Tambah tombol **← Kembali** di setiap langkah pertanyaan (kecuali langkah pertama).
- Menekan tombol mengembalikan ke node sebelumnya dan menghapus jawaban terakhir, sehingga pemain bisa memilih jawaban berbeda.
- Tambah indikator "Langkah X dari sekian" + animasi transisi mundur.

## 3. Login Google + Leaderboard Nyata

### Aktifkan Lovable Cloud
Untuk menyimpan akun pemain dan skor yang bisa dibandingkan antar pemain.

### Autentikasi
- Tambah route `/auth` dengan tombol **Masuk dengan Google**.
- Di Dashboard & Profil: tampilkan status login; tombol "Masuk" jika belum, "Keluar" jika sudah.
- Profil pengguna yang login (nama, avatar/foto) otomatis tersinkron ke database.

### Database (Lovable Cloud)
Dua tabel + RLS:
- `profiles` — id, display_name, avatar_emoji, avatar_url, created_at
  - Auto-buat via trigger saat user signup.
  - RLS: pengguna bisa baca semua (untuk leaderboard), hanya bisa update miliknya sendiri.
- `scores` — id, user_id, total_score, level, organisms_played, updated_at
  - RLS: baca semua, upsert hanya milik sendiri.
- Trigger otomatis membuat profile + scores row saat user baru daftar.

### Storage
- Bucket `avatars` (public) untuk upload foto profil.

### Leaderboard
Komponen leaderboard di halaman Profil:
- Jika user **login** → query top 20 dari tabel `scores` join `profiles`, urut skor desc, tampilkan peringkat asli + highlight baris milik user.
- Jika **belum login** → tampilkan pesan "Masuk untuk melihat leaderboard global" + tombol login.
- Hapus data dummy Aria/Bima/dst.

### Sinkronisasi skor
Setiap selesai bermain (`addResult` di `src/game/profile.ts`):
- Tetap simpan ke localStorage (mode tamu).
- Jika user login → upsert skor ke tabel `scores` di Cloud.

---

## File yang akan dibuat/diubah

**Baru**
- `src/routes/auth.tsx` — halaman login Google
- `src/integrations/supabase/*` — otomatis dibuat saat Cloud aktif
- `src/hooks/useAuthUser.ts` — hook session + profile
- `src/lib/leaderboard.functions.ts` — server fn ambil top scores
- `src/lib/sync-score.functions.ts` — upsert skor user
- Migrasi SQL: tabel `profiles`, `scores`, trigger, RLS, bucket `avatars`

**Diubah**
- `src/routes/profile.tsx` — upload foto, leaderboard real, status login
- `src/routes/play.$id.tsx` — tombol kembali kunci dikotom
- `src/routes/menu.tsx` — tombol login/logout di header
- `src/game/profile.ts` — dukung `avatarUrl` + sync ke Cloud
- `src/components/game/Logo.tsx` (mungkin) — tidak perlu

## Catatan Teknis (boleh diabaikan)

- Google OAuth via broker Lovable (`lovable.auth.signInWithOAuth("google")`).
- `requireSupabaseAuth` untuk semua server fn yang menulis skor.
- Leaderboard fn pakai `supabaseAdmin` (read-only, kolom aman saja) agar tamu juga bisa lihat.
- Foto upload divalidasi ≤2MB, tipe image/*.

Setuju saya lanjutkan dengan rencana ini?
