const mongoose = require('mongoose');

const bukuSchema = new mongoose.Schema({
  id_buku: {
    type: String,
    required: true,
    unique: true,
  },
  nama_buku: {
    type: String,
    required: true,
  },
  gambar_buku: {
    type: String,
    required: false,
  },
  penulis_buku: {
    type: String,
    required: true,
  },
  jumlah: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['tersedia', 'dipinjam semua'],
    default: 'tersedia',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

bukuSchema.pre('save', function(next) {
  if (this.jumlah === 0) {
    this.status = 'dipinjam semua';
  } else {
    this.status = 'tersedia';
  }
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.models.Buku || mongoose.model('Buku', bukuSchema);