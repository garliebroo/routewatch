/**
 * heatmap.js
 * Generates time-of-day usage heatmap data for API routes.
 * Buckets hits into hourly slots (0-23) per route.
 */

const heatmapData = {};

/**
 * Record a hit for a route at a given timestamp.
 * @param {string} route - e.g. "GET /api/users"
 * @param {Date} [timestamp] - defaults to now
 */
function recordHit(route, timestamp = new Date()) {
  const hour = timestamp.getHours();
  if (!heatmapData[route]) {
    heatmapData[route] = new Array(24).fill(0);
  }
  heatmapData[route][hour]++;
}

/**
 * Get heatmap data for all routes or a specific route.
 * @param {string} [route]
 * @returns {Object}
 */
function getHeatmap(route) {
  if (route) {
    return { [route]: heatmapData[route] || new Array(24).fill(0) };
  }
  return { ...heatmapData };
}

/**
 * Find the peak hour for a given route.
 * @param {string} route
 * @returns {{ hour: number, count: number }}
 */
function peakHour(route) {
  const slots = heatmapData[route] || new Array(24).fill(0);
  let maxCount = 0;
  let maxHour = 0;
  slots.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      maxHour = hour;
    }
  });
  return { hour: maxHour, count: maxCount };
}

/**
 * Reset all heatmap data (useful for tests).
 */
function reset() {
  Object.keys(heatmapData).forEach(k => delete heatmapData[k]);
}

module.exports = { recordHit, getHeatmap, peakHour, reset };
