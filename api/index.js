console.log('[Vercel] API Entry point loaded');
// This is the Vercel serverless entry point
// It wraps your Express app and makes it work on Vercel
try {
  const app = require('../server/index');
  module.exports = app;
} catch (err) {
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Failed to load server/index', 
      message: err.message, 
      stack: err.stack 
    });
  };
}
