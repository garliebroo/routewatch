/**
 * statusTracker.js
 * Tracks HTTP response status codes per route for quick health overview.
 */

const stats = {};

/**
 * Record a status code hit for a given route + method.
 * @param {string} method
 * @param {string} route
 * @param {number} statusCode
 */
function record(method, route, statusCode) {
  const key = `${method.toUpperCase()} ${route}`;
  if (!stats[key]) {
    stats[key] = { method: method.toUpperCase(), route, codes: {} };
  }
  const bucket = String(statusCode);
  stats[key].codes[bucket] = (stats[key].codes[bucket] || 0) + 1;
}

/**
 * Return a copy of all tracked status stats.
 */
function getStatusStats() {
  return JSON.parse(JSON.stringify(stats));
}

/**
 * Return entries where any 4xx or 5xx code has been recorded.
 */
function getErrorRoutes() {
  return Object.values(stats).filter(entry =>
    Object.keys(entry.codes).some(code => parseInt(code, 10) >= 400)
  );
}

/**
 * Reset all status tracking data.
 */
function reset() {
  Object.keys(stats).forEach(k => delete stats[k]);
}

module.exports = { record, getStatusStats, getErrorRoutes, reset };
