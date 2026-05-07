/**
 * aliasReporter.js
 * Print a stats report using human-friendly route aliases.
 */

const { resolveAlias } = require('./routeAliases');
const { colorMethod } = require('./reporter');

const COL_ALIAS = 32;
const COL_ROUTE = 28;

function pad(str, len) {
  return String(str).padEnd(len);
}

/**
 * Format a single stats entry row with alias.
 * @param {string} route
 * @param {Object} stat - { method, count, avgTime }
 * @returns {string}
 */
function formatAliasRow(route, stat) {
  const alias = resolveAlias(route);
  const method = colorMethod(stat.method);
  const avg = stat.avgTime != null ? `${stat.avgTime.toFixed(1)}ms` : 'N/A';
  return `  ${pad(alias, COL_ALIAS)} ${pad(route, COL_ROUTE)} ${method.padEnd(18)} hits: ${String(stat.count).padStart(4)}  avg: ${avg}`;
}

/**
 * Print a full alias-aware report to stdout.
 * @param {Array<{ route: string, method: string, count: number, avgTime: number }>} stats
 */
function printAliasReport(stats) {
  if (!stats || stats.length === 0) {
    console.log('\n[routewatch] No route data to display.\n');
    return;
  }

  console.log('\n[routewatch] Route Usage Report (with aliases)\n');
  console.log(
    `  ${'Alias'.padEnd(COL_ALIAS)} ${'Route'.padEnd(COL_ROUTE)} ${'Method'.padEnd(10)}   Hits    Avg Time`
  );
  console.log('  ' + '-'.repeat(COL_ALIAS + COL_ROUTE + 38));

  for (const entry of stats) {
    console.log(formatAliasRow(entry.route, entry));
  }

  console.log();
}

module.exports = { formatAliasRow, printAliasReport };
