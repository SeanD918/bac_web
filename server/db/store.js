const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'server', 'uploaded_exams.json');

function loadDB() {
  try {
    // Using require() is more reliable for bundling on Vercel and faster
    return require('../uploaded_exams.json');
  } catch (err) {
    try {
      // Fallback to absolute path if require fails
      const data = fs.readFileSync(path.join(process.cwd(), 'server', 'uploaded_exams.json'), 'utf8');
      return JSON.parse(data);
    } catch (fsErr) {
      console.error('Error loading DB file:', fsErr.message);
      return [];
    }
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

