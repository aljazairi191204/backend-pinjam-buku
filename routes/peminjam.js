const express = require('express');
const Peminjam = require('../models/Peminjam');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.get('/public', async (req, res) => {
  try {
    const rows = await Peminjam.find().sort({ created_at: -1 });
    res.json(rows);
  } catch (err) {
    console.error('GET /peminjam/public error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await Peminjam.find().sort({ created_at: -1 });
    res.json(rows);
  } catch (err) {
    console.error('GET /peminjam error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const row = await Peminjam.findOne({ id_peminjam: req.params.id });
    if (!row) return res.status(404).json({ message: 'Peminjam not found' });
    res.json(row);
  } catch (err) {
    console.error('GET /peminjam/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nama_peminjam } = req.body;
    if (!nama_peminjam) return res.status(400).json({ message: 'Nama peminjam diperlukan' });

    const id_peminjam = `PMJ-${uuidv4().substring(0, 8).toUpperCase()}`;
    const peminjam = await Peminjam.create({ id_peminjam, nama_peminjam });

    res.status(201).json({ message: 'Peminjam created successfully', peminjam });
  } catch (err) {
    console.error('POST /peminjam error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { nama_peminjam } = req.body;
    if (!nama_peminjam) return res.status(400).json({ message: 'Nama peminjam diperlukan' });

    const peminjam = await Peminjam.findOneAndUpdate(
      { id_peminjam: req.params.id },
      { nama_peminjam },
      { new: true }
    );

    if (!peminjam) return res.status(404).json({ message: 'Peminjam not found' });
    res.json({ message: 'Peminjam updated successfully', peminjam });
  } catch (err) {
    console.error('PUT /peminjam/:id error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const Peminjaman = require('../models/Peminjaman');
    const activeLoans = await Peminjaman.find({
      id_peminjam: req.params.id,
      status_pengembalian: 'dipinjam'
    });

    if (activeLoans.length > 0) {
      return res.status(400).json({ message: 'Tidak dapat menghapus peminjam yang masih memiliki pinjaman aktif' });
    }

    const peminjam = await Peminjam.findOneAndDelete({ id_peminjam: req.params.id });
    if (!peminjam) return res.status(404).json({ message: 'Peminjam not found' });

    res.json({ message: 'Peminjam deleted successfully' });
  } catch (err) {
    console.error('DELETE /peminjam/:id error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;