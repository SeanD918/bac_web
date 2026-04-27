require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const examRoutes  = require('./routes/exams');
const uploadRoutes = require('./routes/upload');
const chatRoutes  = require('./routes/chat');
const { router: authRoutes } = require('./routes/auth');
const communityRoutes = require('./routes/community');
const messageRoutes = require('./routes/messages');
const { router: notificationRoutes } = require('./routes/notifications');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[BacWeb API] ${req.method} ${req.url} (Env: ${process.env.VERCEL ? 'Vercel' : 'Local'})`);
  next();
});

app.use(cors());
app.use(express.json());

// Serve uploaded files statically (local dev only — Vercel is read-only)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  try {
    const db = require('./db/store');
    const count = db.loadDB().length;
    res.json({ 
      status: 'ok', 
      count,
      environment: process.env.NODE_ENV, 
      vercel: process.env.VERCEL 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: err.message, 
      stack: err.stack 
    });
  }
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount both with and without /api prefix for maximum compatibility on Vercel
app.use('/api', examRoutes);
app.use('/api', uploadRoutes);
app.use('/api', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback for direct function calls
app.use(examRoutes);
app.use(uploadRoutes);
app.use(chatRoutes);
app.use('/auth', authRoutes);
app.use('/community', communityRoutes);
app.use('/messages', messageRoutes);
app.use('/notifications', notificationRoutes);

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]:', err.message);
  res.status(err.status || 400).json({
    error: err.message || 'An unexpected error occurred'
  });
});

// ─── Server Start ────────────────────────────────────────────────────────────
if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`BacWeb Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
