/**
 * Route usage tracker — records hits, timing, and status codes
 * for each unique method + path combination.
 */

const store = new Map();

/**
 * Record a single request.
 * @param {string} method  HTTP method (uppercase)
 * @param {string} path    Normalized route path
 * @param {number} status  HTTP response status code
 * @param {number} duration  Response time in ms
 */
function record(method, path, status, duration) {
  const key = `${method} ${path}`;

  if (!store.has(key)) {
    store.set(key, {
      method,
      path,
      hits: 0,
      totalDuration: 0,
      avgDuration: 0,
      statusCodes: {},
      lastSeen: null,
    });
  }

  const entry = store.get(key);
  entry.hits += 1;
  entry.totalDuration += duration;
  entry.avgDuration = Math.round(entry.totalDuration / entry.hits);
  entry.statusCodes[status] = (entry.statusCodes[status] || 0) + 1;
  entry.lastSeen = new Date().toISOString();
}

/**
 * Return all recorded route stats as an array, sorted by hits desc.
 */
function getStats() {
  return Array.from(store.values()).sort((a, b) => b.hits - a.hits);
}

/**
 * Clear all recorded data (useful in tests).
 */
function reset() {
  store.clear();
}

module.exports = { record, getStats, reset };
