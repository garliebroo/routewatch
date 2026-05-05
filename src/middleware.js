/**
 * Express middleware that intercepts every request,
 * measures response time, and feeds data to the tracker.
 */

const tracker = require('./tracker');

/**
 * Resolve the matched Express route pattern (e.g. /users/:id)
 * falling back to the raw URL path when no route is matched yet.
 */
function resolveRoutePath(req) {
  // req.route is populated after the route handler is matched
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return base + req.route.path;
  }
  return req.path || req.url;
}

/**
 * Create the routewatch middleware.
 * @param {object} [options]
 * @param {boolean} [options.verbose=false]  Log each request to stdout
 */
function routewatch(options = {}) {
  const { verbose = false } = options;

  return function routewatchMiddleware(req, res, next) {
    const startAt = process.hrtime.bigint();

    res.on('finish', () => {
      const endAt = process.hrtime.bigint();
      const durationMs = Number(endAt - startAt) / 1e6;
      const path = resolveRoutePath(req);
      const method = req.method.toUpperCase();
      const status = res.statusCode;

      tracker.record(method, path, status, durationMs);

      if (verbose) {
        console.log(
          `[routewatch] ${method} ${path} → ${status} (${durationMs.toFixed(1)}ms)`
        );
      }
    });

    next();
  };
}

module.exports = routewatch;
