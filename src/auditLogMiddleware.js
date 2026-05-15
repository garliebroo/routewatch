// auditLogMiddleware.js — Express middleware that auto-logs audit events

const auditLog = require('./routeAuditLog');

const SLOW_THRESHOLD_MS = 500;

function resolveRoute(req) {
  return req.route ? req.route.path : req.path;
}

function auditLogMiddleware(req, res, next) {
  const start = Date.now();
  const method = req.method;

  res.on('finish', () => {
    const path = resolveRoute(req);
    const duration = Date.now() - start;
    const status = res.statusCode;

    const event = {
      type: 'access',
      status,
      duration,
      ip: req.ip || req.connection?.remoteAddress || 'unknown'
    };

    if (status >= 500) event.type = 'error';
    else if (status >= 400) event.type = 'client_error';
    else if (duration >= SLOW_THRESHOLD_MS) event.type = 'slow';

    auditLog.addEvent(method, path, event);
  });

  next();
}

module.exports = { resolveRoute, auditLogMiddleware };
