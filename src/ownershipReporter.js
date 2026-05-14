const { getAllOwners, groupByOwner } = require('./routeOwnership');

const METHOD_COLORS = {
  GET: '\x1b[32m',
  POST: '\x1b[34m',
  PUT: '\x1b[33m',
  PATCH: '\x1b[35m',
  DELETE: '\x1b[31m',
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function colorMethod(method) {
  const color = METHOD_COLORS[method] || '\x1b[37m';
  return `${color}${method}${RESET}`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatOwnerRow(entry) {
  return `  ${colorMethod(pad(entry.method, 7))} ${pad(entry.path, 35)} ${entry.owner}`;
}

function printOwnershipReport() {
  const groups = groupByOwner();
  const ownerNames = Object.keys(groups).sort();

  if (ownerNames.length === 0) {
    console.log('No route ownership data available.');
    return;
  }

  console.log(`\n${BOLD}Route Ownership Report${RESET}`);
  console.log('='.repeat(60));

  for (const owner of ownerNames) {
    console.log(`\n${BOLD}Owner: ${owner}${RESET}`);
    for (const route of groups[owner]) {
      console.log(formatOwnerRow({ ...route, owner }));
    }
  }

  console.log('');
}

module.exports = { colorMethod, pad, formatOwnerRow, printOwnershipReport };
