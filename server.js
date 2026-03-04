const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config/config');

const app = express();

app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

app.use(express.json({ limit: config.upload.maxSize })); 
app.use(express.urlencoded({ limit: config.upload.maxSize, extended: true }));

const frontendPathInside = path.join(__dirname, 'frontend');
const frontendPathSibling = path.join(__dirname, '..', 'frontend');

let FRONTEND_DIR = null;

if (fs.existsSync(frontendPathInside)) {
  FRONTEND_DIR = frontendPathInside;
} else if (fs.existsSync(frontendPathSibling)) {
  FRONTEND_DIR = frontendPathSibling;
}

if (FRONTEND_DIR) {
  app.use(express.static(FRONTEND_DIR));

  app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });

  app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'admin', 'login.html'));
  });

  app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'admin', 'dashboard.html'));
  });

  app.get('/admin/peminjam', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'admin', 'peminjam.html'));
  });
}

mongoose.connect(config.database.uri, config.database.options);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const authRoutes = require('./routes/auth');
const bukuRoutes = require('./routes/buku');
const peminjamRoutes = require('./routes/peminjam');
const peminjamanRoutes = require('./routes/peminjaman');

app.use('/api/auth', authRoutes);
app.use('/api/buku', bukuRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/peminjam', peminjamRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Backend Peminjaman Buku Edukarya',
    version: '1.0.0',
    environment: config.server.env,
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
  console.log(`Environment: ${config.server.env}`);
  console.log(`JWT Expires In: ${config.jwt.expiresIn}`);
  console.log(`Publik: http://localhost:5173/`);
  console.log(`Admin login: http://localhost:5173/admin/login`);
  console.log(`Admin dashboard: http://localhost:5173/admin/dashboard`);
  if (FRONTEND_DIR) console.log(`Serving frontend from: ${FRONTEND_DIR}`);
});