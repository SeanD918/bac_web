const express = require('express');
const router = express.Router();
const { SECTIONS, SUBJECTS, EXAM_TYPES } = require('../data/constants');
const { loadDB } = require('../db/store');
const axios = require('axios');

// ─── Mock Data Generation ─────────────────────────────────────────────────────

const subjectMap = {
  'Mathématiques': 'math',
  'Physique': 'physique',
  'Sciences Naturelles': 'svt',
  'Philosophie': 'philo',
  'Arabe': 'arabe',
  'Français': 'francais',
  'Anglais': 'anglais',
  'Chimie': 'chimie',
  'Économie': 'economie',
  'Gestion': 'gestion',
  'Histoire-Géo': 'hg',
  'Droit': 'droit',
  'Technologie': 'tech',
  'Sciences Physiques': 'physique',
  'Dessin Technique': 'dessin',
  'Informatique': 'info',
  'Algorithmes': 'algo',
  'Base de données': 'bd',
  'Education Physique': 'sport'
};

// Since we now rely exclusively on the scraped `uploaded_exams` from bacweb's real <a href> tags,
// we no longer simulate incorrect or unverified exams.
function generateExams() {
  return []; // Pure, unadulterated source of truth now comes only from `loadDB()` !
}

const GENERATED_EXAMS = generateExams();

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/sections
router.get('/sections', (_req, res) => {
  const uploaded = loadDB();
  const withCounts = SECTIONS.map(s => ({
    ...s,
    count: GENERATED_EXAMS.filter(e => e.section === s.id).length
         + uploaded.filter(e => e.section === s.id).length,
  }));
  res.json(withCounts);
});

// GET /api/subjects/:section
router.get('/subjects/:section', (req, res) => {
  const subjects = SUBJECTS[req.params.section] || [];
  res.json(subjects);
});

// GET /api/exams — Main search/filter endpoint
router.get('/exams', (req, res) => {
  const { year, section, subject, type, q, page = 1, limit = 20 } = req.query;

  const uploaded = loadDB().map(e => ({ ...e, source: 'uploaded' }));
  let results = [...GENERATED_EXAMS, ...uploaded];

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

  res.json({ total, page: parseInt(page), limit: parseInt(limit), results: paginated });
});

// GET /api/stats
router.get('/stats', (_req, res) => {
  const uploaded = loadDB();
  res.json({
    totalExams:       GENERATED_EXAMS.length + uploaded.length,
    totalCorrections: GENERATED_EXAMS.filter(e => e.hasCorrection).length
                    + uploaded.filter(e => e.hasCorrection).length,
    totalSections:    SECTIONS.length,
    yearRange:        { from: 1994, to: 2024 },
    totalDownloads:   GENERATED_EXAMS.reduce((sum, e) => sum + e.downloads, 0),
    uploadedCount:    uploaded.length,
  });
});

// GET /api/exams/featured
router.get('/exams/featured', (_req, res) => {
  const uploaded = loadDB();
  const allExams = [...GENERATED_EXAMS, ...uploaded];
  
  const featured = SECTIONS.map(s => {
    const latest = allExams
      .filter(e => e.section === s.id && e.year >= 2021) // Include slightly older but recent
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 2);
    return latest;
  }).flat().slice(0, 8);
  
  res.json(featured);
});

// GET /api/exams/:id
router.get('/exams/:id', (req, res) => {
  const { id } = req.params;
  const uploaded = loadDB();
  const exam = [...GENERATED_EXAMS, ...uploaded].find(e => e.id === id);
  
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
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'application/pdf');
    // Security: avoid passing through potentially harmful headers from source
    // but keep content-disposition if we want to allow download with name
    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).send('Error loading PDF');
  }
});

module.exports = router;
