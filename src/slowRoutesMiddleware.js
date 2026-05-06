/**
 * slowRoutesMiddleware.js
 * Express middleware that integrates slow-route detection with routewatch.
 */

const { getStats } = require('./tracker');
const { printSlowRoutes } = require('./slowRoutes');

const DEFAULT_THRESHOLD_MS = 500;
const DEFAULT_INTERVAL_MS = 60_000;

/**
 * Creates middleware that periodically logs slow routes.
 * @param {Object} options
 * @param {number} [options.threshold=500]   - ms threshold for "slow"
 * @param {number} [options.interval=60000]  - how often to print the report (ms)
 * @param {boolean} [options.printOnExit=true] - print report when process exits
 * @returns {Function} Express middleware
 */
function slowwatchMiddleware(options = {}) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD_MS;
  const interval = options.interval ?? DEFAULT_INTERVAL_MS;
  const printOnExit = options.printOnExit !== false;

  const timer = setInterval(() => {
    printSlowRoutes(getStats(), { threshold });
  }, interval);

  // Don't keep the process alive just for reporting
  if (timer.unref) timer.unref();

  if (printOnExit) {
    process.once('exit', () => {
      printSlowRoutes(getStats(), { threshold });
    });
  }

  return function slowwatch(req, res, next) {
    next();
  };
}

module.exports = { slowwatchMiddleware };
