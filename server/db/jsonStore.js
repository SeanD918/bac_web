const fs = require('fs');
const path = require('path');

function getStore(filename) {
  const filePath = path.join(process.cwd(), 'server', filename);
  
  // Ensure file exists
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    } catch (e) {
      console.error(`Failed to create ${filename}:`, e.message);
    }
  }

  function load() {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error loading ${filename}:`, err.message);
      return [];
    }
  }

  function save(data) {
    if (process.env.VERCEL === '1') {
      console.warn(`Skipping save to ${filename}: Vercel read-only filesystem.`);
      return;
    }
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error saving to ${filename}:`, err.message);
    }
  }

  return { load, save };
}

module.exports = getStore;
