/**
 * slaReporter.js — Print SLA evaluation results to the console
 */

const { evaluateSLA, getAllSLAs } = require('./routeSLA');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

function colorPass(passing) {
  return passing ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatSLARow(result) {
  const status = colorPass(result.passing);
  const label = pad(result.key, 35);
  if (result.passing) {
    return `  ${label} ${status}`;
  }
  const details = result.violations
    .map(v => `${YELLOW}${v.field}${RESET}: ${v.actual} > ${v.limit}`)
    .join(', ');
  return `  ${label} ${status}  (${details})`;
}

function printSLAReport(stats) {
  const allSLAs = getAllSLAs();
  const keys = Object.keys(allSLAs);

  if (keys.length === 0) {
    console.log('\nNo SLA targets defined.\n');
    return;
  }

  console.log(`\n${BOLD}SLA Report${RESET}`);
  console.log('─'.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const key of keys) {
    const [method, ...rest] = key.split(' ');
    const path = rest.join(' ');
    const routeStats = stats[key] || {};
    const result = evaluateSLA(method, path, routeStats);
    if (!result) continue;
    console.log(formatSLARow(result));
    result.passing ? passed++ : failed++;
  }

  console.log('─'.repeat(60));
  console.log(`  ${GREEN}${passed} passing${RESET}  ${RED}${failed} failing${RESET}\n`);
}

module.exports = { colorPass, pad, formatSLARow, printSLAReport };
