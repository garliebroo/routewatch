/**
 * slowRoutes.js
 * Detects and reports routes with high average response times.
 */

const DEFAULT_THRESHOLD_MS = 500;

/**
 * Filter stats to only include routes exceeding the threshold.
 * @param {Object} stats - route stats from getStats()
 * @param {number} thresholdMs
 * @returns {Array}
 */
function findSlowRoutes(stats, thresholdMs = DEFAULT_THRESHOLD_MS) {
  return Object.entries(stats)
    .map(([route, data]) => ({ route, ...data }))
    .filter((entry) => entry.avgTime >= thresholdMs)
    .sort((a, b) => b.avgTime - a.avgTime);
}

/**
 * Format a single slow route entry for display.
 * @param {Object} entry
 * @returns {string}
 */
function formatSlowRoute(entry) {
  const avg = entry.avgTime.toFixed(1);
  const max = entry.maxTime !== undefined ? ` (max: ${entry.maxTime.toFixed(1)}ms)` : '';
  return `  ${entry.route.padEnd(40)} avg: ${avg}ms${max}  hits: ${entry.count}`;
}

/**
 * Print a report of slow routes to the console.
 * @param {Object} stats
 * @param {Object} options
 */
function printSlowRoutes(stats, options = {}) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD_MS;
  const slow = findSlowRoutes(stats, threshold);

  if (slow.length === 0) {
    console.log(`\n✅  No routes exceeded ${threshold}ms average response time.\n`);
    return;
  }

  console.log(`\n🐢  Slow Routes (avg > ${threshold}ms)\n`);
  console.log('  ' + '-'.repeat(60));
  slow.forEach((entry) => console.log(formatSlowRoute(entry)));
  console.log('  ' + '-'.repeat(60));
  console.log(`  ${slow.length} slow route(s) detected.\n`);
}

module.exports = { findSlowRoutes, formatSlowRoute, printSlowRoutes };
