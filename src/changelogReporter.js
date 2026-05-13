/**
 * changelogReporter.js
 * Print a formatted changelog report for routes
 */

const { getAllChangelogs } = require('./routeChangelog');

const TYPE_COLORS = {
  added: '\x1b[32m',
  deprecated: '\x1b[33m',
  modified: '\x1b[36m',
  removed: '\x1b[31m',
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function colorType(type) {
  const color = TYPE_COLORS[type] || '\x1b[37m';
  return `${color}${type.toUpperCase()}${RESET}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatChangelogRow(key, entry) {
  const ts = entry.timestamp.slice(0, 19).replace('T', ' ');
  return `  ${pad(colorType(entry.type), 22)} ${pad(ts, 20)} ${entry.message}`;
}

function printChangelogReport(output = console.log) {
  const all = getAllChangelogs();
  const keys = Object.keys(all);

  if (keys.length === 0) {
    output('No changelog entries recorded.');
    return;
  }

  output(`\n${BOLD}Route Changelog${RESET}`);
  output('='.repeat(60));

  for (const key of keys) {
    const log = all[key];
    output(`\n${BOLD}${key}${RESET} (${log.length} entr${log.length === 1 ? 'y' : 'ies'})`);
    for (const entry of log) {
      output(formatChangelogRow(key, entry));
    }
  }

  output('');
}

module.exports = { colorType, formatChangelogRow, printChangelogReport };
