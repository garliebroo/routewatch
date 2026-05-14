const { getOwner } = require('./routeOwnership');

function resolveRoute(req) {
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return base + req.route.path;
  }
  return req.path;
}

function ownershipMiddleware(req, res, next) {
  res.on('finish', () => {
    const method = req.method;
    const path = resolveRoute(req);
    const ownerEntry = getOwner(method, path);
    if (ownerEntry) {
      req._routeOwner = ownerEntry.owner;
    }
  });
  next();
}

module.exports = { resolveRoute, ownershipMiddleware };
