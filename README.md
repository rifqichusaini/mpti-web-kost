# Aplikasi Manajemen Kost

Aplikasi web untuk mengelola sistem kost-kostan, termasuk manajemen kamar, penyewa, dan booking requests.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Cara Menggunakan](#cara-menggunakan)
- [Struktur Database](#struktur-database)

## ✨ Fitur Utama

### Untuk Admin
- **Dashboard Admin**: Overview lengkap sistem kost
- **Manajemen Kamar**: 
  - Tambah, edit, dan hapus kamar
  - Atur harga sewa dan fasilitas
  - Update status ketersediaan kamar
  - Upload dan kelola foto kamar
- **Manajemen Penyewa**:
  - Lihat daftar penyewa aktif
  - Kelola data penyewa per kamar
  - Automatic removal saat kamar dikosongkan
- **Booking Requests**:
  - Approve/reject permintaan booking
  - Tracking status pembayaran
  - Notifikasi booking baru

### Untuk User
- Browse daftar kamar tersedia
- Lihat detail kamar dan fasilitas
- Submit booking request
- Upload bukti pembayaran
- Track status booking

## 🛠️ Teknologi

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Instalasi

### Prerequisites
- Node.js 18.x atau lebih tinggi
- npm/yarn/pnpm/bun
- Akun Supabase

### Langkah Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd <project-folder>
```

2. **Install dependencies**
```bash
npm install
# atau
yarn install
# atau
pnpm install
# atau
bun install
```

3. **Setup environment variables**

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Setup Database**

Jalankan migration SQL di Supabase SQL Editor (lihat bagian [Struktur Database](#struktur-database))

5. **Run development server**
```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

## 📖 Cara Menggunakan

### Login Admin

1. Navigate ke `/login/admin`
2. Masukkan kredensial admin
3. Akan redirect ke dashboard admin

### Mengelola Kamar

#### Menambah Kamar Baru

1. Dashboard Admin → **Manage Rooms**
2. Klik **"Tambah Kamar"**
3. Isi form:
   - Nomor Kamar (contoh: A101, 201)
   - Harga Sewa Bulanan
   - Fasilitas (pisahkan dengan koma)
   - Status Ketersediaan
4. Klik **"Simpan"**

#### Mengedit Kamar

1. Dashboard Admin → **Manage Rooms**
2. Pilih kamar yang ingin diedit
3. Klik ikon **edit** atau **Kelola**
4. Update informasi yang diperlukan
5. Klik **"Simpan Perubahan"**

#### Mengubah Status Ketersediaan

**⚠️ Perhatian**: Mengubah status dari "Terisi" ke "Tersedia" akan otomatis menghapus semua penyewa dari kamar tersebut.

1. Buka halaman edit kamar
2. Centang/uncheck checkbox **"Kamar Tersedia"**
3. Jika mengubah ke "Tersedia", konfirmasi pop-up akan muncul
4. Klik **"Ya, Lanjutkan"** untuk konfirmasi
5. Klik **"Simpan Perubahan"**

#### Menghapus Kamar

**⚠️ Zona Berbahaya**: Tindakan ini akan menghapus:
- Data kamar secara permanen
- Semua penyewa di kamar tersebut
- Semua booking requests terkait
- **TIDAK DAPAT DIBATALKAN**

1. Buka halaman edit kamar
2. Scroll ke bagian bawah (Zona Berbahaya)
3. Klik **"Hapus Kamar Permanen"**
4. Modal konfirmasi akan muncul
5. Ketik **"HAPUS"** (huruf kapital semua)
6. Klik **"Hapus Kamar"**
7. Success modal akan muncul setelah berhasil

### Mengelola Booking Requests

1. Dashboard Admin → **Booking Requests**
2. Lihat daftar pending requests
3. Review detail booking:
   - Informasi user
   - Kamar yang diminta
   - Durasi sewa
   - Bukti pembayaran (jika ada)
4. Pilih action:
   - **Approve**: Terima booking
   - **Reject**: Tolak booking

### Mengelola Penyewa

1. Dashboard Admin → **Manage Tenants**
2. Lihat daftar penyewa aktif
3. Filter berdasarkan kamar atau kost
4. Update informasi penyewa jika diperlukan

### Untuk User/Penyewa

#### Cara Booking Kamar

1. Browse halaman utama
2. Lihat daftar kamar tersedia
3. Klik **"Lihat Detail"** pada kamar yang diminati
4. Klik **"Book Now"** atau **"Pesan Kamar"**
5. Isi form booking:
   - Pilih durasi sewa
   - Pilih metode pembayaran
6. Submit booking request
7. Upload bukti pembayaran (jika diminta)
8. Tunggu approval dari admin

#### Tracking Status Booking

1. Login ke akun user
2. Navigate ke **"My Bookings"** atau **"Booking Saya"**
3. Lihat status:
   - 🟡 **Pending**: Menunggu review admin
   - 🟢 **Approved**: Booking diterima
   - 🔴 **Rejected**: Booking ditolak

## 🗄️ Struktur Database

### Tabel Utama

#### `rooms`
```sql
- id (uuid, primary key)
- kost_id (uuid, foreign key → kosts)
- room_number (text)
- price (numeric)
- facilities (text)
- is_available (boolean)
- created_at (timestamp)
```

#### `booking_requests`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- room_id (uuid, foreign key → rooms)
- kost_id (uuid, foreign key → kosts)
- status (text: pending/approved/rejected)
- duration (integer)
- due_date (date)
- payment_proof_url (text)
- created_at (timestamp)
```

#### `penyewa` (tenants)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- room_id (uuid, foreign key → rooms)
- kost_id (uuid, foreign key → kosts)
- start_date (date)
- end_date (date)
- status (text)
- created_at (timestamp)
```

### Foreign Key Dependencies

Urutan penghapusan data (penting untuk cascade deletes):
1. `booking_requests` (references rooms)
2. `penyewa` (references rooms)
3. `rooms` (main table)


**Built with ❤️ using Next.js and Supabase**