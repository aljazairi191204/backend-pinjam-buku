const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/config');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password diperlukan' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const admin = new Admin({ username, password });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      message: 'Admin berhasil didaftarkan',
      token,
      user: { id: admin._id, username: admin.username }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      // Ubah dari 401 ke 400
      return res.status(400).json({ message: 'Username dan password salah' });
    }

    const isValidPassword = await admin.comparePassword(password);

    if (!isValidPassword) {
      // Ubah dari 401 ke 400
      return res.status(400).json({ message: 'Username dan password salah' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: admin._id, username: admin.username }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;