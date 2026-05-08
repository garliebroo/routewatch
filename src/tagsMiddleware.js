// Middleware that attaches route tags to res.locals for downstream use

const { getTag } = require('./routeTags');

function resolveRoute(req) {
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return base + req.route.path;
  }
  return req.path || req.url;
}

function tagsMiddleware(req, res, next) {
  res.on('finish', () => {
    const path = resolveRoute(req);
    const method = req.method || 'GET';
    const routeTags = getTag(method, path);
    if (routeTags.length > 0) {
      res.locals.routeTags = routeTags;
    }
  });

  next();
}

module.exports = { tagsMiddleware };
