// auditLogReporter.js — print audit log summary to console

const { getAllLogs, summarizeLog } = require('./routeAuditLog');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorType(type) {
  if (type === 'error') return `${COLORS.red}${type}${COLORS.reset}`;
  if (type === 'slow') return `${COLORS.yellow}${type}${COLORS.reset}`;
  if (type === 'client_error') return `${COLORS.cyan}${type}${COLORS.reset}`;
  return `${COLORS.gray}${type}${COLORS.reset}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatAuditRow(key, summary) {
  const types = Object.entries(summary.byType)
    .map(([t, c]) => `${colorType(t)}:${c}`)
    .join('  ');
  return `  ${pad(key, 35)} total=${pad(summary.total, 5)} ${types}`;
}

function printAuditReport() {
  const logs = getAllLogs();
  const keys = Object.keys(logs);
  if (keys.length === 0) {
    console.log(`${COLORS.gray}[routewatch] No audit events recorded.${COLORS.reset}`);
    return;
  }
  console.log(`\n${COLORS.bold}[routewatch] Audit Log Report${COLORS.reset}`);
  console.log(`${COLORS.gray}${'─'.repeat(60)}${COLORS.reset}`);
  for (const key of keys) {
    const [method, ...rest] = key.split(' ');
    const path = rest.join(' ');
    const summary = summarizeLog(method, path);
    console.log(formatAuditRow(key, summary));
  }
  console.log();
}

module.exports = { colorType, pad, formatAuditRow, printAuditReport };
