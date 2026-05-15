// quotaReporter.js — print a formatted quota usage report

const { getAllQuotaStatuses } = require('./routeQuota');

function colorExceeded(exceeded) {
  return exceeded ? '\x1b[31m' : '\x1b[32m';
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatQuotaRow({ key, limit, count, remaining, exceeded, windowMs }) {
  const reset = '\x1b[0m';
  const color = colorExceeded(exceeded);
  const status = exceeded ? 'EXCEEDED' : 'OK      ';
  const win = `${windowMs / 1000}s`;
  return `${color}${pad(status, 10)}${reset} ${pad(key, 30)} ${pad(count + '/' + limit, 10)} remaining: ${pad(remaining, 5)} window: ${win}`;
}

function printQuotaReport(statuses) {
  const rows = statuses || getAllQuotaStatuses();
  if (rows.length === 0) {
    console.log('No quota definitions found.');
    return;
  }

  console.log('\n\x1b[1m=== Route Quota Report ===\x1b[0m');
  console.log(pad('STATUS', 10), pad('ROUTE', 30), pad('USAGE', 10), 'REMAINING', 'WINDOW');
  console.log('-'.repeat(70));

  for (const row of rows) {
    console.log(formatQuotaRow(row));
  }

  const exceeded = rows.filter((r) => r.exceeded);
  console.log('-'.repeat(70));
  console.log(`\x1b[33m${exceeded.length} route(s) exceeding quota\x1b[0m\n`);
}

module.exports = { colorExceeded, pad, formatQuotaRow, printQuotaReport };
