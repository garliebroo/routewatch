/**
 * heatmapMiddleware.js
 * Express middleware that hooks into routewatch to record
 * per-route hits with timestamps for heatmap tracking.
 */

const { resolveRoutePath } = require('./middleware');
const { recordHit } = require('./heatmap');

/**
 * Returns Express middleware that records timestamped hits.
 * Should be mounted after routewatch().
 */
function heatwatchMiddleware() {
  return function heatwatch(req, res, next) {
    res.on('finish', () => {
      const route = resolveRoutePath(req);
      if (!route) return;
      const key = `${req.method} ${route}`;
      recordHit(key, new Date());
    });
    next();
  };
}

module.exports = { heatwatchMiddleware };
