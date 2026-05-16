/**
 * dependenciesReporter.js
 * Print a formatted report of route dependencies.
 */

const { getAllDependencies } = require('./routeDependencies');

const COLORS = {
  GET: '\x1b[32m',
  POST: '\x1b[34m',
  PUT: '\x1b[33m',
  DELETE: '\x1b[31m',
  PATCH: '\x1b[35m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

function colorMethod(method) {
  const color = COLORS[method] || '';
  return `${color}${method.padEnd(7)}${COLORS.reset}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatDependencyRow(entry) {
  const method = colorMethod(entry.method);
  const path = pad(entry.path, 30);
  const depList = entry.dependencies.length
    ? entry.dependencies.join(', ')
    : `${COLORS.dim}(none)${COLORS.reset}`;
  return `  ${method} ${path} → ${depList}`;
}

function printDependenciesReport(entries = null) {
  const data = entries || getAllDependencies();

  console.log(`\n${COLORS.bold}Route Dependencies${COLORS.reset}`);
  console.log('─'.repeat(70));

  if (!data.length) {
    console.log(`  ${COLORS.dim}No dependencies registered.${COLORS.reset}`);
    console.log();
    return;
  }

  for (const entry of data) {
    console.log(formatDependencyRow(entry));
  }

  console.log();
}

module.exports = { colorMethod, pad, formatDependencyRow, printDependenciesReport };
