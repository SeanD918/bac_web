const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'uploaded_exams.json');

function loadDB() {
  try {
    // Read directly from filesystem as require() can be cached or bundled oddly in Vercel
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading DB file:', err.message);
    return [];
  }
}

function saveDB(data) {
  // Vercel has a read-only filesystem — writes will fail gracefully
  if (process.env.VERCEL === '1') {
    console.warn('Skipping saveDB: Vercel read-only filesystem.');
    return;
  }
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving to DB file:', err.message);
  }
}

module.exports = { loadDB, saveDB };

