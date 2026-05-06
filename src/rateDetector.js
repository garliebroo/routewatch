/**
 * rateDetector.js
 * Detects routes with unusually high request rates over a sliding window.
 */

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_THRESHOLD = 100;    // requests per window

/**
 * Build a rate detector instance with its own hit log.
 * @param {object} options
 * @param {number} [options.windowMs]
 * @param {number} [options.threshold]
 */
function createRateDetector(options = {}) {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

  // Map<routeKey, number[]> — timestamps of recent hits
  const hits = new Map();

  /**
   * Record a hit for a route and return whether it exceeds the threshold.
   * @param {string} method
   * @param {string} path
   * @returns {{ exceeded: boolean, count: number }}
   */
  function recordHit(method, path) {
    const key = `${method.toUpperCase()} ${path}`;
    const now = Date.now();
    const cutoff = now - windowMs;

    const timestamps = (hits.get(key) ?? []).filter(t => t >= cutoff);
    timestamps.push(now);
    hits.set(key, timestamps);

    const count = timestamps.length;
    return { exceeded: count > threshold, count };
  }

  /**
   * Return current rate info for all tracked routes.
   * @returns {Array<{ route: string, count: number, exceeded: boolean }>}
   */
  function getRates() {
    const now = Date.now();
    const cutoff = now - windowMs;
    const result = [];

    for (const [key, timestamps] of hits.entries()) {
      const recent = timestamps.filter(t => t >= cutoff);
      hits.set(key, recent);
      result.push({ route: key, count: recent.length, exceeded: recent.length > threshold });
    }

    return result;
  }

  /** Clear all hit data. */
  function reset() {
    hits.clear();
  }

  return { recordHit, getRates, reset };
}

module.exports = { createRateDetector };
