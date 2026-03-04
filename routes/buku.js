const express = require('express');
const Buku = require('../models/Buku');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const buku = await Buku.find().sort({ created_at: -1 });
    res.json(buku);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const buku = await Buku.findOne({ id_buku: req.params.id });
    if (!buku) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(buku);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id_buku, nama_buku, gambar_buku, penulis_buku, jumlah } = req.body;
    
    const existingBook = await Buku.findOne({ id_buku });
    if (existingBook) {
      return res.status(400).json({ message: 'Book ID already exists' });
    }
    
    const buku = new Buku({
      id_buku,
      nama_buku,
      gambar_buku,
      penulis_buku,
      jumlah
    });
    
    await buku.save();
    res.status(201).json({ message: 'Book created successfully', buku });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { nama_buku, gambar_buku, penulis_buku, jumlah } = req.body;
    
    const buku = await Buku.findOneAndUpdate(
      { id_buku: req.params.id },
      { 
        nama_buku, 
        gambar_buku, 
        penulis_buku, 
        jumlah,
        updated_at: Date.now()
      },
      { new: true }
    );
    
    if (!buku) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book updated successfully', buku });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const buku = await Buku.findOneAndDelete({ id_buku: req.params.id });
    
    if (!buku) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;