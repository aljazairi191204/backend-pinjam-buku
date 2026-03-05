const dotenv = require('dotenv');
dotenv.config();

// DEBUG: Lihat semua environment variable (kecuali yang sensitif)
console.log('========== ALL ENV VARIABLES ==========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URL:', process.env.MONGODB_URL ? '✅ ADA' : '❌ TIDAK ADA');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ ADA' : '❌ TIDAK ADA');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ ADA' : '❌ TIDAK ADA');
console.log('=======================================');

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },

  database: {
    // Urutan prioritas: MONGODB_URL (Railway) → MONGODB_URI (manual) → localhost
    uri: process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/peminjaman_buku',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    expiresInMs: 8 * 60 * 60 * 1000,
  },

  upload: {
    maxSize: process.env.MAX_FILE_SIZE || '20mb',
    maxSizeBytes: 20 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },

  cors: {
    // PERBAIKAN DI SINI - tambahkan URL frontend Railway
    origin: [
      'http://localhost:5173',
      'https://frontend-pinjam-buku-production.up.railway.app'
    ],
    credentials: true,
  },

  api: {
    baseUrl: '/api',
    timeout: 30000,
  },

  loanRules: {
    maxLoanDays: 14,
    maxBooksPerPerson: null,
    allowMultipleSameBook: false,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    console: true,
    file: process.env.LOG_FILE || false,
  },
};
