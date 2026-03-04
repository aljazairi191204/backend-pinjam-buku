const mongoose = require('mongoose');

const peminjamanSchema = new mongoose.Schema(
  {
    id_buku: {
      type: String,
      required: true,
      ref: 'Buku',
    },
    id_peminjam: {
      type: String,
      required: true,
      ref: 'Peminjam',
    },
    nama_peminjam: {
      type: String,
      required: true,
    },
    tanggal_pinjam: {
      type: Date,
      default: Date.now,
    },
    tanggal_pengembalian: {
      type: Date,
      default: Date.now,
    },
    status_pengembalian: {
      type: String,
      enum: ['dipinjam', 'dikembalikan tepat waktu', 'dikembalikan terlambat', 'buku hilang'],
      default: 'dipinjam',
    },
    bukti_pengembalian: {
      type: String,
      required: false,
    },
    keterangan: {
      type: String,
      required: false,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Peminjaman', peminjamanSchema);