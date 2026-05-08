/**
 * healthMiddleware.js
 * Express middleware that feeds response data into routeHealth tracker.
 */

const { record } = require('./routeHealth');

function resolveRoute(req) {
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return base + req.route.path;
  }
  return req.path || req.url || 'unknown';
}

function healthMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const route = resolveRoute(req);
    const method = req.method;
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;
    record(route, method, { statusCode, responseTime });
  });

  next();
}

module.exports = { healthMiddleware };
