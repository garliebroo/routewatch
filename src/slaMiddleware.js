/**
 * slaMiddleware.js — Middleware to collect per-request metrics for SLA evaluation
 */

const { evaluateSLA } = require('./routeSLA');

function resolveRoute(req) {
  return (req.route && req.route.path) ? req.route.path : req.path;
}

function slaMiddleware({ onViolation } = {}) {
  return function middleware(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
      const method = req.method;
      const path = resolveRoute(req);
      const duration = Date.now() - start;
      const isError = res.statusCode >= 400;

      const result = evaluateSLA(method, path, {
        avgMs: duration,
        errorRate: isError ? 1 : 0,
        p95Ms: duration,
      });

      if (result && !result.passing && typeof onViolation === 'function') {
        onViolation(result, req, res);
      }
    });

    next();
  };
}

module.exports = { resolveRoute, slaMiddleware };
