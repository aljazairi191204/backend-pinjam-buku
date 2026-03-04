const express = require('express');
const router = express.Router();

const Buku = require('../models/Buku');
const Peminjam = require('../models/Peminjam');
const Peminjaman = require('../models/Peminjaman');
const { authenticateToken } = require('../middleware/auth');

router.get('/active', async (req, res) => {
  try {
    const rows = await Peminjaman.find({ status_pengembalian: 'dipinjam' })
      .sort({ tanggal_pinjam: -1 })
      .lean();

    const byBookId = {};
    for (const r of rows) {
      const key = r.id_buku;
      if (!byBookId[key]) byBookId[key] = [];
      byBookId[key].push({
        id_peminjaman: r._id.toString(),
        id_peminjam: r.id_peminjam,
        nama_peminjam: r.nama_peminjam,
        tanggal_pinjam: r.tanggal_pinjam,
      });
    }

    res.json({ byBookId });
  } catch (err) {
    console.error('GET /peminjaman/active error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.post('/pinjam', async (req, res) => {
  try {
    const { id_buku, id_peminjam } = req.body;

    if (!id_buku || !id_peminjam) {
      return res.status(400).json({ message: 'id_buku dan id_peminjam wajib diisi' });
    }

    const buku = await Buku.findOne({ id_buku });
    if (!buku) return res.status(404).json({ message: 'Buku tidak ditemukan' });
    if (Number(buku.jumlah) <= 0) return res.status(400).json({ message: 'Stok buku habis' });

    const peminjam = await Peminjam.findOne({ id_peminjam });
    if (!peminjam) return res.status(404).json({ message: 'Peminjam tidak ditemukan' });

    const existingSameBook = await Peminjaman.findOne({
      id_buku,
      id_peminjam,
      status_pengembalian: 'dipinjam',
    });

    if (existingSameBook) {
      return res.status(400).json({ message: 'Peminjam masih meminjam buku ini (belum dikembalikan)' });
    }

    buku.jumlah = Number(buku.jumlah) - 1;
    await buku.save();

    const row = await Peminjaman.create({
      id_buku,
      id_peminjam,
      nama_peminjam: peminjam.nama_peminjam,
      tanggal_pinjam: new Date(),
      status_pengembalian: 'dipinjam',
    });

    res.status(201).json({
      message: 'Berhasil meminjam',
      data: {
        id_peminjaman: row._id.toString(),
        ...row.toObject(),
      },
    });
  } catch (err) {
    console.error('POST /peminjaman/pinjam error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.post('/kembali', async (req, res) => {
  try {
    const { id_peminjaman, bukti_pengembalian } = req.body;
    if (!id_peminjaman) {
      return res.status(400).json({ message: 'id_peminjaman wajib diisi' });
    }

    const row = await Peminjaman.findById(id_peminjaman);
    if (!row) return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
    if (row.status_pengembalian !== 'dipinjam') {
      return res.status(400).json({ message: 'Peminjaman ini sudah dikembalikan' });
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(row.tanggal_pinjam).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    row.tanggal_pengembalian = now;
    row.status_pengembalian = diffDays <= 7 ? 'dikembalikan tepat waktu' : 'dikembalikan terlambat';
    
    if (bukti_pengembalian) {
      row.bukti_pengembalian = bukti_pengembalian;
    }
    
    await row.save();

    const buku = await Buku.findOne({ id_buku: row.id_buku });
    if (buku) {
      buku.jumlah = Number(buku.jumlah) + 1;
      await buku.save();
    }

    res.json({
      message: 'Pengembalian berhasil',
      data: row.toObject(),
      status_pengembalian: row.status_pengembalian,
    });
  } catch (err) {
    console.error('POST /peminjaman/kembali error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ENDPOINT: Buku Hilang
router.post('/hilang', authenticateToken, async (req, res) => {
  try {
    const { id_peminjaman, keterangan } = req.body;
    if (!id_peminjaman) {
      return res.status(400).json({ message: 'id_peminjaman wajib diisi' });
    }

    const row = await Peminjaman.findById(id_peminjaman);
    if (!row) return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
    
    if (row.status_pengembalian !== 'dipinjam') {
      return res.status(400).json({ message: 'Peminjaman ini sudah diproses' });
    }

    const now = new Date();
    row.tanggal_pengembalian = now;
    row.status_pengembalian = 'buku hilang';
    
    if (keterangan) {
      row.keterangan = keterangan;
    }
    
    await row.save();

    // Catat log bahwa buku hilang (stok sudah berkurang saat peminjaman)
    console.log(`Buku hilang: ${row.id_buku}, stok tetap berkurang 1`);

    res.json({
      message: 'Buku berhasil dilaporkan hilang',
      data: row.toObject(),
      status_pengembalian: 'buku hilang'
    });
  } catch (err) {
    console.error('POST /peminjaman/hilang error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const rows = await Peminjaman.find().sort({ created_at: -1 }).lean();

    if (!rows.length) return res.json([]);

    const bookIds = [...new Set(rows.map(r => r.id_buku).filter(Boolean))];
    const books = await Buku.find({ id_buku: { $in: bookIds } }).select('id_buku gambar_buku').lean();

    const mapCover = {};
    for (const b of books) {
      mapCover[b.id_buku] = b.gambar_buku || '';
    }

    const enriched = rows.map(r => ({
      ...r,
      gambar_buku: mapCover[r.id_buku] || ''
    }));

    res.json(enriched);
  } catch (err) {
    console.error('GET /peminjaman/admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const row = await Peminjaman.findById(id);
    if (!row) return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });

    if (row.status_pengembalian === 'dipinjam') {
      return res.status(400).json({ 
        message: 'Tidak dapat menghapus data peminjaman yang masih berstatus "dipinjam". Silakan proses terlebih dahulu.' 
      });
    }

    await Peminjaman.findByIdAndDelete(id);
    res.json({ message: 'Data peminjaman berhasil dihapus' });
  } catch (err) {
    console.error('DELETE /peminjaman/admin/:id error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.delete('/admin', authenticateToken, async (req, res) => {
  try {
    const dipinjamRows = await Peminjaman.find({ status_pengembalian: 'dipinjam' }).lean();
    
    if (dipinjamRows.length > 0) {
      return res.status(400).json({ 
        message: `Tidak dapat menghapus semua data. Masih terdapat ${dipinjamRows.length} data peminjaman dengan status "dipinjam". Silakan proses semua data terlebih dahulu.` 
      });
    }

    await Peminjaman.deleteMany({});
    res.json({ message: 'Semua data peminjaman berhasil dihapus' });
  } catch (err) {
    console.error('DELETE /peminjaman/admin error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;