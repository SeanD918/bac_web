const express = require('express');
const router = express.Router();
const { SECTIONS, SUBJECTS, EXAM_TYPES } = require('../data/constants');
const { loadDB } = require('../db/store');

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const normalized = message.toLowerCase();
  
  // Extracting details from message
  let foundSection = null;
  let foundSubject = null;
  let foundYear = null;
  let foundSession = null;

  // 1. Find year (looking for 4 digit numbers between 1994 and 2024)
  const yearMatch = message.match(/\b(199\d|20[012]\d)\b/);
  if (yearMatch) foundYear = yearMatch[0];

  // 2. Find section
  for (const s of SECTIONS) {
    if (normalized.includes(s.label.toLowerCase()) || normalized.includes(s.id.toLowerCase())) {
      foundSection = s.id;
      break;
    }
  }

  // 3. Find subject with better fuzzy matching
  const allSubjects = [...new Set(Object.values(SUBJECTS).flat())];
  // Simple mapping for common terms
  const synonyms = {
    'math': 'Mathématiques',
    'physique': 'Sciences Physiques',
    'svt': 'Sciences Naturelles',
    'info': 'Informatique',
    'arabe': 'Arabe',
    'français': 'Français',
    'anglais': 'Anglais',
    'philo': 'Philosophie',
    'éco': 'Économie',
    'gestion': 'Gestion'
  };

  for (const [key, val] of Object.entries(synonyms)) {
    if (normalized.includes(key)) {
      foundSubject = val;
      break;
    }
  }

  if (!foundSubject) {
    for (const sub of allSubjects) {
      if (normalized.includes(sub.toLowerCase())) {
        foundSubject = sub;
        break;
      }
    }
  }

  // 4. Find session (Principale / Contrôle)
  for (const session of EXAM_TYPES) {
    if (normalized.includes(session.toLowerCase())) {
      foundSession = session;
      break;
    }
    // Handle common abbreviations or French variations
    if (session === 'Principale' && (normalized.includes('principal') || normalized.includes('main'))) {
      foundSession = 'Principale';
      break;
    }
    if (session === 'Contrôle' && (normalized.includes('controle') || normalized.includes('control'))) {
      foundSession = 'Contrôle';
      break;
    }
  }

  // If we found something, let's search in DB
  const db = loadDB();
  let results = db;

  if (foundYear)    results = results.filter(e => e.year === parseInt(foundYear));
  if (foundSection) results = results.filter(e => e.section === foundSection);
  if (foundSubject) results = results.filter(e => e.subject.toLowerCase().includes(foundSubject.toLowerCase()));
  if (foundSession) results = results.filter(e => e.type === foundSession);

  // Sort and limit
  results.sort((a, b) => b.year - a.year);
  const finalResults = results.slice(0, 3);

  let responseText = "";
  if (finalResults.length > 0) {
    responseText = `Found ${results.length} exams matching your request. Here are the most relevant ones:`;
  } else {
    if (!foundSection && !foundSubject && !foundYear && !foundSession) {
      responseText = "I can help you find exams! Try asking for a specific subject, section, year, and session. For example: 'Math exams for Informatique 2023 Principale'";
    } else {
      responseText = "I couldn't find any exams matching exactly those criteria. Try being less specific or check the spelling.";
    }
  }

  res.json({
    text: responseText,
    results: finalResults,
    context: {
      year: foundYear,
      section: foundSection,
      subject: foundSubject,
      session: foundSession
    }
  });
});

module.exports = router;
