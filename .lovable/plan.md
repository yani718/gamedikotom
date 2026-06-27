## Rencana Fitur Multiplayer + Panel Admin + Timer

Saya akan menambahkan 3 fitur besar ke DichoLife Explorer:

### 1. Mode Bermain Berkelompok (Room / Lobby)
- Halaman baru **`/rooms`** — pemain bisa membuat room atau gabung pakai **kode 6 digit**.
- Setiap room: host (pembuat), daftar peserta (min 2 orang untuk mulai), organisme yang dipilih, status (`waiting` / `playing` / `finished`).
- Realtime via Supabase: ketika ada yang join/leave, semua pemain langsung lihat update.
- Saat host klik **"Mulai Permainan"**, semua peserta otomatis masuk ke halaman play dengan organisme yang sama.

### 2. Timer Saat Game Dimulai
- Di halaman play, ada countdown **berjalan dari 0** (atau batas waktu yang host pilih: 60/120/300 detik).
- Tampil di atas kartu subjek, bergaya pill berwarna hijau→kuning→merah saat waktu menipis.
- Skor mendapat **bonus kecepatan**: makin cepat selesai, makin tinggi bonus.
- Untuk mode room, hasil semua peserta dikumpulkan dan ditampilkan ranking room di akhir.

### 3. Panel Admin Pemilik Game
- Email pemilik (Anda) jadi **admin** otomatis lewat tabel `user_roles` + fungsi `has_role` (aman, tidak bisa dipalsukan dari klien).
- Halaman baru **`/admin`** hanya bisa diakses admin:
  - Statistik total: jumlah pemain, room aktif, total game dimainkan.
  - Daftar **semua pemain** (nama, foto, level, skor, terakhir aktif).
  - Daftar **room aktif** secara realtime (siapa host, siapa peserta, status, organisme).
  - Tombol untuk **menutup room** atau **kick pemain** jika perlu.

### Detail Teknis (untuk referensi)

**Migrasi DB baru:**
- `app_role` enum (`admin`, `player`)
- `user_roles` (id, user_id, role) + RLS + fungsi `has_role()` SECURITY DEFINER
- `rooms` (id, code unik 6-digit, host_id, organism_id, status, time_limit_sec, started_at, finished_at)
- `room_players` (room_id, user_id, joined_at, finished_at, score, result_leaf)
- Realtime di-enable untuk `rooms` dan `room_players`
- Trigger: saat user baru dengan email pemilik daftar → otomatis dapat role admin (atau seed manual sekali).

**File baru/diubah:**
- `src/routes/rooms.tsx` — daftar room + buat/gabung
- `src/routes/rooms.$code.tsx` — lobby room
- `src/routes/play.$id.tsx` — ditambah parameter `?room=CODE`, timer, bonus kecepatan
- `src/routes/admin.tsx` — panel admin (cek `has_role` lewat server function)
- `src/components/game/Timer.tsx` — komponen timer reusable
- `src/lib/rooms.functions.ts` — server functions: createRoom, joinRoom, startRoom, leaveRoom, submitResult
- `src/lib/admin.functions.ts` — listPlayers, listRooms, kickPlayer, closeRoom
- `src/routes/menu.tsx` — tombol "🎮 Main Berkelompok" + (jika admin) tombol "🛡 Admin"

### Pertanyaan sebelum mulai
Saya butuh **email akun Anda** (yang dipakai login Google) supaya bisa jadi admin otomatis. Atau saya bisa buat tombol "klaim sebagai admin" yang hanya berfungsi pertama kali (jika belum ada admin di sistem). Mana yang Anda pilih?

1. **Beri tahu email saya** sekarang (lebih aman).
2. **Pakai tombol "Klaim Admin"** sekali pakai (lebih fleksibel kalau belum tahu email).
