/**
 * healthReporter.js
 * Prints a color-coded health report for all tracked routes.
 */

const { getHealth } = require('./routeHealth');

const COLORS = {
  healthy: '\x1b[32m',
  degraded: '\x1b[33m',
  unhealthy: '\x1b[31m',
  insufficient_data: '\x1b[90m',
  reset: '\x1b[0m'
};

function colorStatus(status, text) {
  return `${COLORS[status] || ''}${text}${COLORS.reset}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatHealthRow(key, data) {
  const score = data.score !== null ? `${data.score}/100` : 'N/A';
  const statusLabel = colorStatus(data.status, data.status.toUpperCase());
  return (
    `  ${pad(key, 35)} ` +
    `${pad(data.hits, 8)} ` +
    `${pad(data.errors, 8)} ` +
    `${pad(data.avgTime + 'ms', 10)} ` +
    `${pad((data.errorRate * 100).toFixed(1) + '%', 10)} ` +
    `${pad(score, 10)} ` +
    statusLabel
  );
}

function printHealthReport() {
  const health = getHealth();
  const keys = Object.keys(health);
  if (keys.length === 0) {
    console.log('\n[routewatch] No health data recorded.\n');
    return;
  }
  console.log('\n[routewatch] Route Health Report');
  console.log('─'.repeat(90));
  console.log(
    `  ${pad('ROUTE', 35)} ${pad('HITS', 8)} ${pad('ERRORS', 8)} ${pad('AVG TIME', 10)} ${pad('ERR RATE', 10)} ${pad('SCORE', 10)} STATUS`
  );
  console.log('─'.repeat(90));
  for (const key of keys.sort()) {
    console.log(formatHealthRow(key, health[key]));
  }
  console.log('─'.repeat(90) + '\n');
}

module.exports = { colorStatus, formatHealthRow, printHealthReport };
