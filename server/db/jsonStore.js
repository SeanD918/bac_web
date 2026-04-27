const fs = require('fs');
const path = require('path');
const os = require('os');

function getStore(filename) {
  const staticPath = path.join(__dirname, '..', filename);
  let filePath = staticPath;

  // On Vercel, we use the system temp directory for writable storage
  if (process.env.VERCEL === '1') {
    const tmpPath = path.join(os.tmpdir(), filename);
    try {
      if (!fs.existsSync(tmpPath)) {
        if (fs.existsSync(staticPath)) {
          fs.copyFileSync(staticPath, tmpPath);
        } else {
          fs.writeFileSync(tmpPath, JSON.stringify([], null, 2));
        }
      }
      filePath = tmpPath;
    } catch (e) {
      console.error(`[BacWeb] Failed to setup /tmp storage for ${filename}:`, e.message);
    }
  }


  function load() {
    try {
      if (!fs.existsSync(filePath)) return [];
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error loading ${filename}:`, err.message);
      return [];
    }
  }

  function save(data) {
    try {
      // We can write to /tmp on Vercel
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      if (process.env.VERCEL === '1') {
        console.warn(`Vercel write failed for ${filename} (Read-only?):`, err.message);
      } else {
        console.error(`Error saving to ${filename}:`, err.message);
      }
    }
  }

  return { load, save };
}

module.exports = getStore;
