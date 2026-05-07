/**
 * deprecatorMiddleware.js
 * Express middleware that warns when a deprecated route is hit.
 */

const { isDeprecated, recordHit, getEntry } = require('./routeDeprecator');

/**
 * Build the route key the same way the rest of routewatch does.
 */
function buildKey(req) {
  const method = req.method.toUpperCase();
  const path = req.route ? req.route.path : req.path;
  return `${method} ${path}`;
}

/**
 * Returns Express middleware that:
 * - Records a hit on the deprecated entry
 * - Adds a `Deprecation` response header
 * - Optionally logs a console warning
 *
 * @param {object} options
 * @param {boolean} [options.silent=false]  suppress console warnings
 * @param {boolean} [options.header=true]   add Deprecation header
 */
function deprecatorMiddleware(options = {}) {
  const silent = options.silent === true;
  const addHeader = options.header !== false;

  return function (req, res, next) {
    res.on('finish', () => {
      const key = buildKey(req);
      if (!isDeprecated(key)) return;

      const entry = getEntry(key);
      recordHit(key);

      if (!silent) {
        const sunset = entry.sunsetDate ? ` (sunset: ${entry.sunsetDate})` : '';
        console.warn(`[routewatch] DEPRECATED: ${entry.message}${sunset}`);
      }

      if (addHeader) {
        // Headers may already be sent; guard against that
        if (!res.headersSent) {
          res.setHeader('Deprecation', 'true');
          if (entry.sunsetDate) {
            res.setHeader('Sunset', entry.sunsetDate);
          }
        }
      }
    });

    next();
  };
}

module.exports = { deprecatorMiddleware };
