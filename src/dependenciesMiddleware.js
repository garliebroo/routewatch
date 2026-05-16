/**
 * dependenciesMiddleware.js
 * Middleware that attaches dependency info to matched routes.
 */

const { getDependency } = require('./routeDependencies');

function resolveRoute(req) {
  if (req.route && req.route.path) {
    return req.route.path;
  }
  return req.path || req.url || '?';
}

function dependenciesMiddleware(req, res, next) {
  res.on('finish', () => {
    const method = req.method;
    const path = resolveRoute(req);
    const info = getDependency(method, path);
    if (info) {
      req._routeDependencies = info.dependencies;
    }
  });
  next();
}

module.exports = { resolveRoute, dependenciesMiddleware };
