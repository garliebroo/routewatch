// quotaMiddleware.js — middleware to enforce and track route quotas

const { recordUsage } = require('./routeQuota');

function resolveRoute(req) {
  const path = (req.route && req.route.path) || req.path || req.url;
  return { method: req.method, path };
}

function quotaMiddleware(options = {}) {
  const { onExceeded } = options;

  return function (req, res, next) {
    const { method, path } = resolveRoute(req);
    const result = recordUsage(method, path);

    if (!result) return next();

    res.setHeader('X-Quota-Limit', result.limit);
    res.setHeader('X-Quota-Remaining', result.remaining);
    res.setHeader('X-Quota-Used', result.count);

    if (result.exceeded) {
      if (typeof onExceeded === 'function') {
        return onExceeded(req, res, next, result);
      }
      return res.status(429).json({
        error: 'Quota exceeded',
        route: result.key,
        limit: result.limit,
        count: result.count,
      });
    }

    next();
  };
}

module.exports = { resolveRoute, quotaMiddleware };
