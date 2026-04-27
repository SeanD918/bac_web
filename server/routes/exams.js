const express = require('express');
const router = express.Router();
const { SECTIONS, SUBJECTS, EXAM_TYPES } = require('../data/constants');
const { loadDB } = require('../db/store');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ─── Link Verification Logic ──────────────────────────────────────────────────

// Link status cache: url -> { exists: boolean, lastChecked: number }
const LINK_CACHE = global.LINK_CACHE || (global.LINK_CACHE = new Map());
global.LINK_CACHE = LINK_CACHE;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const checkLink = async (url) => {
  if (!url) return false;
  const cached = LINK_CACHE.get(url);
  if (cached && (Date.now() - cached.lastChecked < CACHE_TTL)) {
    return cached.exists;
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  try {
    // Try HEAD first (fastest)
    const res = await axios.head(url, { timeout: 2000, headers });
    const exists = res.status >= 200 && res.status < 400;
    LINK_CACHE.set(url, { exists, lastChecked: Date.now() });
    return exists;
  } catch (err) {
    // Fallback to GET with Range (first byte only) if HEAD is blocked or fails
    try {
      const res = await axios.get(url, { 
        timeout: 2500, 
        headers: { ...headers, Range: 'bytes=0-0' } 
      });
      const exists = res.status >= 200 && res.status < 400;
      LINK_CACHE.set(url, { exists, lastChecked: Date.now() });
      return exists;
    } catch (getErr) {
      LINK_CACHE.set(url, { exists: false, lastChecked: Date.now() });
      return false;
    }
  }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/sections
router.get('/sections', (_req, res) => {
  const uploaded = loadDB();
  const withCounts = SECTIONS.map(s => ({
    ...s,
    count: uploaded.filter(e => e.section === s.id).length,
  }));
  res.json(withCounts);
});

// GET /api/subjects/:section
router.get('/subjects/:section', (req, res) => {
  const subjects = SUBJECTS[req.params.section] || [];
  res.json(subjects);
});

// GET /api/verify-link?url=...
router.get('/verify-link', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');
  const exists = await checkLink(url);
  res.json({ exists });
});

// GET /api/exams — Main search/filter endpoint
router.get('/exams', async (req, res) => {
  const { year, section, subject, type, q, page = 1, limit = 20 } = req.query;

  const uploaded = loadDB().map(e => ({ ...e, source: 'uploaded' }));
  let results = [...uploaded];

  if (year)    results = results.filter(e => e.year === parseInt(year));
  if (section) results = results.filter(e => e.section === section);
  if (subject) results = results.filter(e => e.subject === subject);
  if (type)    results = results.filter(e => e.type === type);
  if (q) {
    const lower = q.toLowerCase();
    results = results.filter(e =>
      e.subject.toLowerCase().includes(lower) ||
      e.sectionLabel.toLowerCase().includes(lower) ||
      e.type.toLowerCase().includes(lower) ||
      String(e.year).includes(lower)
    );
  }

  // Sort by year desc for better UX
  results.sort((a,b) => b.year - a.year);

  const total     = results.length;
  const start     = (parseInt(page) - 1) * parseInt(limit);
  const paginated = results.slice(start, start + parseInt(limit));

  const resultsWithFlags = await Promise.all(paginated.map(async (e) => {
    let exists = true;
    let correctionExists = !!e.hasCorrection;
    
    const isVercel = process.env.VERCEL === '1';

    // If it's a local file in uploads, check disk (only if not on Vercel)
    if (e.examUrl && e.examUrl.startsWith('/uploads/')) {
      if (isVercel) {
        exists = true; // Assume exists on Vercel if in DB
      } else {
        const fullPath = path.join(process.cwd(), 'server', 'uploads', path.basename(e.examUrl));
        exists = fs.existsSync(fullPath);
      }
    } else if (e.examUrl) {
      exists = await checkLink(e.examUrl);
    }
    
    if (e.correctionUrl && e.correctionUrl.startsWith('/uploads/')) {
      if (isVercel) {
        correctionExists = true;
      } else {
        const fullPath = path.join(process.cwd(), 'server', 'uploads', path.basename(e.correctionUrl));
        correctionExists = fs.existsSync(fullPath);
      }
    } else if (e.correctionUrl) {
      correctionExists = await checkLink(e.correctionUrl);
    }

    return { 
      ...e, 
      exists: e.exists !== undefined ? e.exists : exists, 
      correctionExists: e.correctionExists !== undefined ? e.correctionExists : correctionExists 
    };
  }));

  res.json({ total, page: parseInt(page), limit: parseInt(limit), results: resultsWithFlags });
});

// GET /api/stats
router.get('/stats', (_req, res) => {
  const uploaded = loadDB();
  res.json({
    totalExams:       uploaded.length,
    totalCorrections: uploaded.filter(e => e.hasCorrection).length,
    totalSections:    SECTIONS.length,
    yearRange:        { from: 1994, to: 2024 },
    totalDownloads:   0,
    uploadedCount:    uploaded.length,
  });
});

// GET /api/exams/featured
router.get('/exams/featured', async (_req, res) => {
  const uploaded = loadDB();
  const allExams = [...uploaded];
  
  const featured = SECTIONS.map(s => {
    const latest = allExams
      .filter(e => e.section === s.id && e.year >= 2021)
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 2);
    return latest;
  }).flat().slice(0, 8);
  
  const featuredWithFlags = await Promise.all(featured.map(async (e) => {
    let exists = true;
    let correctionExists = !!e.hasCorrection;
    
    const isVercel = process.env.VERCEL === '1';

    if (e.examUrl && e.examUrl.startsWith('/uploads/')) {
      if (isVercel) {
        exists = true;
      } else {
        const fullPath = path.join(process.cwd(), 'server', 'uploads', path.basename(e.examUrl));
        exists = fs.existsSync(fullPath);
      }
    } else if (e.examUrl) {
      exists = await checkLink(e.examUrl);
    }

    if (e.correctionUrl && e.correctionUrl.startsWith('/uploads/')) {
      if (isVercel) {
        correctionExists = true;
      } else {
        const fullPath = path.join(process.cwd(), 'server', 'uploads', path.basename(e.correctionUrl));
        correctionExists = fs.existsSync(fullPath);
      }
    } else if (e.correctionUrl) {
      correctionExists = await checkLink(e.correctionUrl);
    }

    return { 
      ...e, 
      exists: e.exists !== undefined ? e.exists : exists, 
      correctionExists: e.correctionExists !== undefined ? e.correctionExists : correctionExists 
    };
  }));

  res.json(featuredWithFlags);
});

// GET /api/exams/:id
router.get('/exams/:id', (req, res) => {
  const { id } = req.params;
  const uploaded = loadDB();
  const exam = uploaded.find(e => e.id === id);
  
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  
  res.json(exam);
});

// GET /api/proxy-pdf?url=...
router.get('/proxy-pdf', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).send('Error loading PDF');
  }
});

module.exports = router;
