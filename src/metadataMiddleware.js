const { setMetaBulk } = require('./routeMetadata');

function resolveRoute(req) {
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return base + req.route.path;
  }
  return req.path || req.url || 'unknown';
}

/**
 * Returns middleware that attaches static metadata to a route on first hit.
 * Usage: router.get('/users', metadataMiddleware({ owner: 'auth-team' }), handler)
 */
function metadataMiddleware(meta = {}) {
  return function (req, res, next) {
    res.on('finish', () => {
      const method = req.method || 'GET';
      const path = resolveRoute(req);
      if (Object.keys(meta).length > 0) {
        setMetaBulk(method, path, meta);
      }
    });
    next();
  };
}

module.exports = { resolveRoute, metadataMiddleware };
