const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');
const { SECTIONS }   = require('../data/constants');
const { loadDB, saveDB } = require('../db/store');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create uploads directory (likely read-only environment like Vercel).");
}

// ─── Multer config ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${name}_${crypto.randomUUID().slice(0, 8)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

// ─── Middleware ───────────────────────────────────────────────────────────────

const auth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  const secret = process.env.ADMIN_SECRET || 'bacweb_admin_2024';
  if (token === secret) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/admin/add
router.post(
  '/admin/add',
  auth,
  upload.fields([
    { name: 'examFile',       maxCount: 1 },
    { name: 'correctionFile', maxCount: 1 },
  ]),
  (req, res) => {
    const { year, section, subject, type } = req.body;

    if (!year || !section || !subject || !type) {
      return res.status(400).json({ error: 'year, section, subject and type are required.' });
    }

    const examFile       = req.files?.examFile?.[0];
    const correctionFile = req.files?.correctionFile?.[0];

    if (!examFile) {
      return res.status(400).json({ error: 'At least an exam file is required.' });
    }

    const hasCorrection  = !!correctionFile;
    const examUrl        = `/uploads/${examFile.filename}`;
    const correctionUrl  = hasCorrection ? `/uploads/${correctionFile.filename}` : null;

    const record = {
      id:             crypto.randomUUID(),
      year:           parseInt(year),
      section,
      sectionLabel:   SECTIONS.find(s => s.id === section)?.label || section,
      subject,
      type,
      hasCorrection,
      examUrl,
      correctionUrl,
      downloads:      0,
      uploadedAt:     new Date().toISOString(),
      source:         'uploaded',
    };

    const db = loadDB();
    db.push(record);
    saveDB(db);

    res.status(201).json({ message: 'Uploaded successfully', exam: record });
  }
);

// GET /api/admin/items
router.get('/admin/items', auth, (_req, res) => {
  const db = loadDB();
  res.json({ total: db.length, results: db });
});

// POST /api/admin/verify
router.post('/admin/verify', auth, (_req, res) => {
  res.json({ success: true });
});

// DELETE /api/admin/items/:id
router.delete('/admin/items/:id', auth, (req, res) => {
  let db = loadDB();
  const record = db.find(e => e.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Not found' });

  const tryDelete = (url) => {
    if (!url) return;
    const filename = path.basename(url);
    const filepath = path.join(UPLOADS_DIR, filename);
    try {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch (err) {
      console.warn("Could not delete file (likely read-only environment like Vercel).");
    }
  };
  tryDelete(record.examUrl);
  tryDelete(record.correctionUrl);

  db = db.filter(e => e.id !== req.params.id);
  saveDB(db);
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;
