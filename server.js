const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config/config');

const app = express();

// ==================== PERBAIKAN CORS ====================
// Konfigurasi CORS yang lebih baik untuk production
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman atau mobile apps)
    if (!origin) return callback(null, true);
    
    // Daftar origin yang diizinkan
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://frontend-pinjam-buku-production.up.railway.app'
    ];
    
    // Tambahkan dari config jika ada
    if (config.cors.origin && Array.isArray(config.cors.origin)) {
      allowedOrigins.push(...config.cors.origin);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || config.cors.origin === '*') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests untuk semua routes
app.options('*', cors(corsOptions));

// Middleware tambahan untuk CORS headers (fallback)
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://frontend-pinjam-buku-production.up.railway.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
// ==================== END CORS ====================

app.use(express.json({ limit: config.upload.maxSize })); 
app.use(express.urlencoded({ limit: config.upload.maxSize, extended: true }));

// Static files untuk frontend (jika digabung dalam satu project)
const frontendPathInside = path.join(__dirname, 'frontend');
const frontendPathSibling = path.join(__dirname, '..', 'frontend');
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

let FRONTEND_DIR = null;

// Cek beberapa kemungkinan lokasi frontend
if (fs.existsSync(frontendDistPath)) {
  FRONTEND_DIR = frontendDistPath;
  console.log('Found frontend dist at:', frontendDistPath);
} else if (fs.existsSync(frontendPathInside)) {
  FRONTEND_DIR = frontendPathInside;
  console.log('Found frontend at:', frontendPathInside);
} else if (fs.existsSync(frontendPathSibling)) {
  FRONTEND_DIR = frontendPathSibling;
  console.log('Found frontend at:', frontendPathSibling);
}

if (FRONTEND_DIR) {
  app.use(express.static(FRONTEND_DIR));

  // Untuk SPA Vue, handle semua route dengan mengirim index.html
  app.get('*', (req, res) => {
    // Jangan tangani route API
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });
}

// Koneksi MongoDB
console.log('Connecting to MongoDB...');
console.log('Database URI:', config.database.uri.replace(/:[^:]*@/, ':****@')); // Sembunyikan password

mongoose.connect(config.database.uri, config.database.options)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Routes
const authRoutes = require('./routes/auth');
const bukuRoutes = require('./routes/buku');
const peminjamRoutes = require('./routes/peminjam');
const peminjamanRoutes = require('./routes/peminjaman');

app.use('/api/auth', authRoutes);
app.use('/api/buku', bukuRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/peminjam', peminjamRoutes);

// API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Backend Peminjaman Buku Edukarya',
    version: '1.0.0',
    environment: config.server.env,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler untuk API
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// 404 handler untuk non-API (jika tidak serve frontend)
app.use('*', (req, res) => {
  if (!FRONTEND_DIR) {
    res.status(404).json({ message: 'Endpoint not found' });
  }
  // Jika serve frontend, biarkan vue-router yang handle
});

// Start server
const PORT = config.server.port || process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.server.env}`);
  console.log(`🔐 JWT Expires In: ${config.jwt.expiresIn}`);
  console.log(`=================================`);
  console.log(`📡 API URL: https://backend-pinjam-buku-production.up.railway.app/api`);
  console.log(`🌐 Frontend URL: https://frontend-pinjam-buku-production.up.railway.app`);
  console.log(`=================================`);
  if (FRONTEND_DIR) console.log(`📁 Serving frontend from: ${FRONTEND_DIR}`);
});
