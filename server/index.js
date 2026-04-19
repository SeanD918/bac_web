require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const examRoutes  = require('./routes/exams');
const uploadRoutes = require('./routes/upload');
const chatRoutes  = require('./routes/chat');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[Request]: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Serve uploaded files statically (local dev only — Vercel is read-only)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
// Mount both with and without /api prefix for maximum compatibility on Vercel
app.use('/api', examRoutes);
app.use('/api', uploadRoutes);
app.use('/api', chatRoutes);

// Fallback for direct function calls
app.use(examRoutes);
app.use(uploadRoutes);
app.use(chatRoutes);

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
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`BacWeb Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
