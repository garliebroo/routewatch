/**
 * Public API for routewatch.
 * Exports the middleware factory and the tracker helpers
 * so consumers can access raw stats programmatically.
 */

const routewatch = require('./middleware');
const tracker = require('./tracker');

module.exports = {
  /**
   * Express middleware factory.
   * Usage:
   *   const { routewatch } = require('routewatch');
   *   app.use(routewatch({ verbose: true }));
   */
  routewatch,

  /**
   * Retrieve current route usage stats.
   * Returns an array sorted by hit count (descending).
   */
  getStats: tracker.getStats,

  /**
   * Reset all recorded stats (handy for testing).
   */
  reset: tracker.reset,
};
