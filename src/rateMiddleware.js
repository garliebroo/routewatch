/**
 * rateMiddleware.js
 * Express middleware that uses rateDetector to warn about hot routes.
 */

const { createRateDetector } = require('./rateDetector');
const { resolveRoutePath } = require('./middleware');

/**
 * Create rate-monitoring middleware.
 *
 * @param {object} [options]
 * @param {number} [options.windowMs=60000]  - sliding window in ms
 * @param {number} [options.threshold=100]   - max requests per window before warning
 * @param {Function} [options.onExceeded]    - callback(method, path, count) when exceeded
 * @returns {Function} Express middleware
 */
function ratewatch(options = {}) {
  const detector = createRateDetector({
    windowMs: options.windowMs,
    threshold: options.threshold,
  });

  const onExceeded =
    options.onExceeded ??
    ((method, path, count) => {
      console.warn(
        `[routewatch] Rate alert: ${method} ${path} hit ${count} times in window`
      );
    });

  function middleware(req, res, next) {
    const method = req.method;
    const path = resolveRoutePath(req);

    const { exceeded, count } = detector.recordHit(method, path);

    if (exceeded) {
      onExceeded(method, path, count);
    }

    next();
  }

  /** Expose detector for inspection / testing */
  middleware.detector = detector;

  return middleware;
}

module.exports = { ratewatch };
