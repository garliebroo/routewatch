/**
 * throttleReporter.js
 * Console reporter for route throttle status.
 */

const { getAllThrottles } = require('./routeThrottle');

function colorExceeded(exceeded) {
  return exceeded ? '\x1b[31m' : '\x1b[32m';
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatThrottleRow(entry) {
  const reset = '\x1b[0m';
  const color = colorExceeded(entry.exceeded);
  const status = entry.exceeded ? 'EXCEEDED' : 'OK      ';
  const window = `${entry.windowMs / 1000}s`;
  return (
    `  ${color}${pad(entry.method, 7)}${reset}` +
    `${pad(entry.path, 30)}` +
    `${pad(entry.currentCount + '/' + entry.maxRequests, 12)}` +
    `${pad(window, 8)}` +
    `${color}${status}${reset}`
  );
}

function printThrottleReport(throttles = null) {
  const entries = throttles ?? getAllThrottles();
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  console.log(`\n${bold}=== Route Throttle Report ===${reset}`);

  if (entries.length === 0) {
    console.log('  No throttle configurations found.');
    console.log();
    return;
  }

  console.log(
    `  ${bold}${pad('METHOD', 7)}${pad('PATH', 30)}${pad('USAGE', 12)}${pad('WINDOW', 8)}STATUS${reset}`
  );
  console.log('  ' + '-'.repeat(65));

  for (const entry of entries) {
    console.log(formatThrottleRow(entry));
  }

  const exceeded = entries.filter(e => e.exceeded).length;
  console.log('  ' + '-'.repeat(65));
  console.log(`  ${bold}Total: ${entries.length} configured  |  Exceeded: ${exceeded}${reset}`);
  console.log();
}

module.exports = { colorExceeded, pad, formatThrottleRow, printThrottleReport };
