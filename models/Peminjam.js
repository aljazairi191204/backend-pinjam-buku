const mongoose = require('mongoose');

const peminjamSchema = new mongoose.Schema(
  {
    id_peminjam: {
      type: String,
      required: true,
      unique: true,
    },
    nama_peminjam: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Peminjam', peminjamSchema);