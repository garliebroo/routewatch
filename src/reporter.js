/**
 * reporter.js
 * Formats and prints route usage stats to the console.
 */

const { getStats } = require('./tracker');

const METHODS_COLOR = {
  GET: '\x1b[32m',
  POST: '\x1b[34m',
  PUT: '\x1b[33m',
  PATCH: '\x1b[35m',
  DELETE: '\x1b[31m',
};

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

function colorMethod(method) {
  const color = METHODS_COLOR[method.toUpperCase()] || '';
  return `${color}${method.toUpperCase()}${RESET}`;
}

function formatBar(count, max, width = 20) {
  const filled = max === 0 ? 0 : Math.round((count / max) * width);
  return '█'.repeat(filled) + DIM + '░'.repeat(width - filled) + RESET;
}

function printReport(options = {}) {
  const { title = 'RouteWatch — Route Usage Report', minCount = 0 } = options;
  const stats = getStats();

  const entries = Object.entries(stats).filter(([, data]) => data.count > minCount);

  if (entries.length === 0) {
    console.log(`\n${BOLD}${title}${RESET}\n  No routes recorded.\n`);
    return;
  }

  const maxCount = Math.max(...entries.map(([, d]) => d.count));

  console.log(`\n${BOLD}${title}${RESET}`);
  console.log(DIM + '─'.repeat(60) + RESET);

  const sorted = entries.sort(([, a], [, b]) => b.count - a.count);

  for (const [key, data] of sorted) {
    const [method, path] = key.split(' ');
    const bar = formatBar(data.count, maxCount);
    const avgMs = data.totalMs > 0 ? `${Math.round(data.totalMs / data.count)}ms avg` : '';
    console.log(
      `  ${colorMethod(method).padEnd(18)} ${path.padEnd(30)} ${bar} ${String(data.count).padStart(4)} hits  ${DIM}${avgMs}${RESET}`
    );
  }

  console.log(DIM + '─'.repeat(60) + RESET + '\n');
}

module.exports = { printReport };
