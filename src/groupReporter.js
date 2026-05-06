/**
 * groupReporter.js
 * Print a grouped summary of route stats to the console.
 */

const { groupByPrefix, sortedGroups } = require('./routeGroups');
const { colorMethod } = require('./reporter');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';

/**
 * Format a number to fixed decimal places.
 * @param {number} n
 * @param {number} places
 * @returns {string}
 */
function fmt(n, places = 1) {
  return n.toFixed(places);
}

/**
 * Print a grouped route usage report.
 * @param {Array} stats - raw stats array from getStats()
 * @param {object} options
 * @param {number} [options.depth=2] - prefix depth
 * @param {boolean} [options.showRoutes=false] - show individual routes under each group
 */
function printGroupReport(stats, { depth = 2, showRoutes = false } = {}) {
  if (!stats || stats.length === 0) {
    console.log(`${DIM}No route data to display.${RESET}`);
    return;
  }

  const groups = groupByPrefix(stats, depth);
  const sorted = sortedGroups(groups);

  console.log(`\n${BOLD}${CYAN}=== RouteWatch — Grouped Report ===${RESET}\n`);
  console.log(
    `${BOLD}${'Prefix'.padEnd(25)} ${'Methods'.padEnd(20)} ${'Hits'.padStart(6)} ${'Avg ms'.padStart(8)}${RESET}`
  );
  console.log('─'.repeat(65));

  for (const group of sorted) {
    const methods = group.methods.map(colorMethod).join(', ');
    const methodsRaw = group.methods.join(', ').padEnd(20);
    const line =
      `${CYAN}${group.prefix.padEnd(25)}${RESET} ` +
      `${methods.padEnd(20 + (methods.length - methodsRaw.length))} ` +
      `${String(group.totalCount).padStart(6)} ` +
      `${fmt(group.avgTime).padStart(8)}`;
    console.log(line);

    if (showRoutes) {
      for (const r of group.routes) {
        console.log(
          `  ${DIM}${colorMethod(r.method)} ${r.route.padEnd(30)} hits: ${r.count}  avg: ${fmt(r.avgTime)}ms${RESET}`
        );
      }
    }
  }

  console.log();
}

module.exports = { printGroupReport };
