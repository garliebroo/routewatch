/**
 * filterStats.js
 * Utilities for filtering and querying route stats.
 */

/**
 * Filter stats by HTTP method.
 * @param {Object} stats - route stats from getStats()
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {Object}
 */
function filterByMethod(stats, method) {
  const upper = method.toUpperCase();
  return Object.fromEntries(
    Object.entries(stats).filter(([key]) => key.startsWith(upper + ' '))
  );
}

/**
 * Filter stats to only routes with count >= minCount.
 * @param {Object} stats
 * @param {number} minCount
 * @returns {Object}
 */
function filterByMinCount(stats, minCount) {
  return Object.fromEntries(
    Object.entries(stats).filter(([, data]) => data.count >= minCount)
  );
}

/**
 * Filter stats to routes whose average response time exceeds threshold (ms).
 * @param {Object} stats
 * @param {number} thresholdMs
 * @returns {Object}
 */
function filterByAvgTime(stats, thresholdMs) {
  return Object.fromEntries(
    Object.entries(stats).filter(([, data]) => {
      if (!data.totalTime || !data.count) return false;
      return data.totalTime / data.count > thresholdMs;
    })
  );
}

/**
 * Sort stats entries by a given field ('count' or 'avgTime').
 * @param {Object} stats
 * @param {'count'|'avgTime'} field
 * @param {'asc'|'desc'} order
 * @returns {Array} sorted array of [key, data] pairs
 */
function sortStats(stats, field = 'count', order = 'desc') {
  const entries = Object.entries(stats).map(([key, data]) => {
    const avgTime = data.count ? data.totalTime / data.count : 0;
    return [key, { ...data, avgTime }];
  });

  entries.sort((a, b) => {
    const valA = field === 'avgTime' ? a[1].avgTime : a[1].count;
    const valB = field === 'avgTime' ? b[1].avgTime : b[1].count;
    return order === 'asc' ? valA - valB : valB - valA;
  });

  return entries;
}

module.exports = { filterByMethod, filterByMinCount, filterByAvgTime, sortStats };
