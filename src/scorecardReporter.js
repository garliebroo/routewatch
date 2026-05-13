/**
 * scorecardReporter.js
 * Pretty-prints the route scorecard report to the console.
 */

const { getScorecards } = require('./routeScorecard');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function colorGrade(grade) {
  if (grade === 'A') return `${COLORS.green}${grade}${COLORS.reset}`;
  if (grade === 'B') return `${COLORS.cyan}${grade}${COLORS.reset}`;
  if (grade === 'C') return `${COLORS.yellow}${grade}${COLORS.reset}`;
  return `${COLORS.red}${grade}${COLORS.reset}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatScorecardRow(entry) {
  const method = pad(entry.method, 7);
  const path = pad(entry.path, 30);
  const composite = pad(`${entry.composite}%`, 8);
  const grade = colorGrade(entry.grade);
  const detail = `${COLORS.dim}[H:${entry.healthScore}% E:${entry.errorScore}% T:${entry.timeScore}%]${COLORS.reset}`;
  return `  ${method} ${path} ${composite} ${grade}  ${detail}`;
}

function printScorecardReport(routes) {
  const cards = getScorecards(routes);

  console.log(`\n${COLORS.bold}=== Route Scorecard ===${COLORS.reset}`);

  const header = `  ${pad('METHOD', 7)} ${pad('PATH', 30)} ${pad('SCORE', 8)} GRADE  BREAKDOWN`;
  console.log(`${COLORS.dim}${header}${COLORS.reset}`);
  console.log(`${COLORS.dim}${'─'.repeat(80)}${COLORS.reset}`);

  const sorted = [...cards].sort((a, b) => b.composite - a.composite);
  sorted.forEach(entry => console.log(formatScorecardRow(entry)));

  const avg = sorted.reduce((sum, c) => sum + c.composite, 0) / (sorted.length || 1);
  console.log(`${COLORS.dim}${'─'.repeat(80)}${COLORS.reset}`);
  console.log(`  ${COLORS.bold}Overall average score: ${avg.toFixed(1)}%${COLORS.reset}\n`);
}

module.exports = { formatScorecardRow, printScorecardReport, colorGrade };
