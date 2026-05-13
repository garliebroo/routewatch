const { getAllMeta } = require('./routeMetadata');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatMetaRow(routeKey, meta) {
  const entries = Object.entries(meta);
  if (entries.length === 0) return null;
  const metaStr = entries.map(([k, v]) => `${YELLOW}${k}${RESET}=${DIM}${JSON.stringify(v)}${RESET}`).join('  ');
  return `  ${CYAN}${pad(routeKey, 35)}${RESET} ${metaStr}`;
}

function printMetadataReport() {
  const all = getAllMeta();
  const keys = Object.keys(all);

  if (keys.length === 0) {
    console.log(`${DIM}No route metadata recorded.${RESET}`);
    return;
  }

  console.log(`\n${BOLD}Route Metadata${RESET}`);
  console.log(`${DIM}${'─'.repeat(60)}${RESET}`);

  for (const key of keys.sort()) {
    const row = formatMetaRow(key, all[key]);
    if (row) console.log(row);
  }

  console.log(`${DIM}${'─'.repeat(60)}${RESET}\n`);
}

module.exports = { pad, formatMetaRow, printMetadataReport };
