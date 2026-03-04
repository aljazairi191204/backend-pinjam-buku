```markdown
# Backend Pinjam Buku - Perpustakaan Edukarya

Backend API untuk sistem manajemen peminjaman buku perpustakaan Edukarya. Dibangun dengan Node.js, Express, dan MongoDB.

## ✨ Fitur Utama

- **Manajemen Buku**: CRUD buku dengan status otomatis (tersedia/dipinjam semua)
- **Manajemen Peminjam**: CRUD data peminjam dengan ID unik
- **Manajemen Peminjaman**: 
  - Peminjaman buku dengan pengurangan stok otomatis
  - Pengembalian buku dengan deteksi keterlambatan
  - Laporan buku hilang
  - Riwayat peminjaman
- **Autentikasi Admin**: Register & Login dengan JWT
- **Keamanan**: Password di-hash dengan bcrypt
- **CORS**: Terkonfigurasi untuk frontend

## 🛠️ Teknologi

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB dengan Mongoose ODM
- **Autentikasi**: JWT (JSON Web Tokens)
- **Keamanan**: bcryptjs untuk hashing password
- **Lainnya**: 
  - cors
  - dotenv
  - uuid untuk generate ID unik

## 📋 Prasyarat

- Node.js (v14 atau lebih baru)
- npm atau yarn
- MongoDB (lokal atau Atlas)

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/aljazairi191204/backend-pinjam-buku.git
   cd backend-pinjam-buku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Buat file environment**
   ```bash
   cp .env.example .env
   ```

4. **Edit file `.env`** sesuai konfigurasi Anda
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/peminjaman_buku
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=8h
   MAX_FILE_SIZE=20mb
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Jalankan aplikasi**
   
   Development mode (dengan nodemon):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## 📁 Struktur Folder

```
backend-pinjam-buku/
├── config/
│   └── config.js           # Konfigurasi aplikasi
├── middleware/
│   └── auth.js             # Middleware autentikasi JWT
├── models/
│   ├── Admin.js             # Model admin
│   ├── Buku.js              # Model buku
│   ├── Peminjam.js          # Model peminjam
│   └── Peminjaman.js        # Model peminjaman
├── routes/
│   ├── auth.js              # Route autentikasi
│   ├── buku.js              # Route manajemen buku
│   ├── peminjam.js          # Route manajemen peminjam
│   └── peminjaman.js        # Route manajemen peminjaman
├── .env.example              # Contoh environment variables
├── .gitignore                # File yang diabaikan git
├── package.json              # Dependencies dan scripts
├── server.js                 # Entry point aplikasi
└── README.md                 # Dokumentasi
```

## 🔌 API Endpoints

### Autentikasi
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| POST | `/api/auth/register` | Register admin baru | Public |
| POST | `/api/auth/login` | Login admin | Public |

### Buku
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/buku` | Lihat semua buku | Public |
| GET | `/api/buku/:id` | Lihat detail buku | Public |
| POST | `/api/buku` | Tambah buku baru | Admin |
| PUT | `/api/buku/:id` | Update data buku | Admin |
| DELETE | `/api/buku/:id` | Hapus buku | Admin |

### Peminjam
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/peminjam/public` | Lihat semua peminjam | Public |
| GET | `/api/peminjam` | Lihat semua peminjam | Admin |
| GET | `/api/peminjam/:id` | Lihat detail peminjam | Admin |
| POST | `/api/peminjam` | Tambah peminjam baru | Admin |
| PUT | `/api/peminjam/:id` | Update data peminjam | Admin |
| DELETE | `/api/peminjam/:id` | Hapus peminjam | Admin |

### Peminjaman
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/peminjaman/active` | Lihat peminjaman aktif | Public |
| POST | `/api/peminjaman/pinjam` | Pinjam buku | Public |
| POST | `/api/peminjaman/kembali` | Kembalikan buku | Public |
| POST | `/api/peminjaman/hilang` | Lapor buku hilang | Admin |
| GET | `/api/peminjaman/admin` | Lihat semua peminjaman | Admin |
| DELETE | `/api/peminjaman/admin/:id` | Hapus data peminjaman | Admin |
| DELETE | `/api/peminjaman/admin` | Hapus semua data | Admin |

### Root
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api` | Informasi API |

## 📊 Model Data

### Admin
```javascript
{
  username: String (unique),
  password: String (hashed),
  created_at: Date
}
```

### Buku
```javascript
{
  id_buku: String (unique),
  nama_buku: String,
  gambar_buku: String,
  penulis_buku: String,
  jumlah: Number,
  status: ["tersedia", "dipinjam semua"],
  created_at: Date,
  updated_at: Date
}
```

### Peminjam
```javascript
{
  id_peminjam: String (unique),
  nama_peminjam: String,
  created_at: Date,
  updated_at: Date
}
```

### Peminjaman
```javascript
{
  id_buku: String,
  id_peminjam: String,
  nama_peminjam: String,
  tanggal_pinjam: Date,
  tanggal_pengembalian: Date,
  status_pengembalian: ["dipinjam", "dikembalikan tepat waktu", "dikembalikan terlambat", "buku hilang"],
  bukti_pengembalian: String,
  keterangan: String,
  created_at: Date,
  updated_at: Date
}
```

## 🔒 Environment Variables

| Variabel | Deskripsi | Default |
|----------|-----------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Port aplikasi | 5000 |
| `MONGODB_URI` | URL koneksi MongoDB | mongodb://localhost:27017/peminjaman_buku |
| `JWT_SECRET` | Secret key untuk JWT | your-secret-key-change-in-production |
| `JWT_EXPIRES_IN` | Masa berlaku token | 8h |
| `MAX_FILE_SIZE` | Maksimal ukuran file upload | 20mb |
| `CORS_ORIGIN` | Origin yang diizinkan | http://localhost:5173 |
| `LOG_LEVEL` | Level logging | info |
| `LOG_FILE` | Simpan log ke file | false |

## 🚦 Menjalankan dengan PM2 (Production)

```bash
# Install PM2 global
npm install -g pm2

# Jalankan aplikasi
pm2 start server.js --name backend-pinjam-buku

# Save PM2 config
pm2 save
pm2 startup
```

## 📝 Catatan Penggunaan

1. **Autentikasi**: 
   - Setelah login, simpan token yang didapat
   - Kirim token di header: `Authorization: Bearer <token>`

2. **ID Buku**: 
   - ID buku bersifat unique, tentukan sendiri saat create

3. **ID Peminjam**:
   - Auto-generated dengan format `PMJ-XXXXXXXX`

4. **Stok Buku**:
   - Otomatis berkurang saat peminjaman
   - Otomatis bertambah saat pengembalian
   - Status berubah otomatis berdasarkan jumlah

5. **Keterlambatan**:
   - Dihitung otomatis (7 hari batas waktu)
   - Status berubah jadi "dikembalikan terlambat" jika >7 hari

## 🤝 Kontribusi

Silakan fork repository ini dan buat pull request untuk kontribusi. Untuk perubahan besar, buka issue dulu untuk diskusi.

## 📄 Lisensi

MIT License - silakan gunakan untuk keperluan belajar atau komersial.

## 📞 Kontak

- **GitHub**: [@aljazairi191204](https://github.com/aljazairi191204)
- **Email**: aljazairi191204@gmail.com

---
**Dibuat dengan ❤️ untuk Perpustakaan Edukarya**
```

## Cara Menggunakan:

1. **Copy semua teks di atas** (dari "```markdown" sampai "```")
2. Buka folder backend Anda
3. Buat file baru dengan nama `README.md`
4. **Paste** teks yang sudah di-copy
5. **Save** file tersebut
6. Add, commit, dan push ke GitHub:

```bash
git add README.md
git commit -m "Add README documentation"
git push
```

## Tampilan README:
Setelah di-push, README akan tampil cantik di halaman repository GitHub Anda dengan:
- Emoji yang menarik
- Tabel yang rapi
- Format kode yang jelas
- Struktur yang terorganisir
