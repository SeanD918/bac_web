// This is the Vercel serverless entry point
// It wraps your Express app and makes it work on Vercel
const app = require('../server/index');
module.exports = (req, res) => {
  return app(req, res);
};
