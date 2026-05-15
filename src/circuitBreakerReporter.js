/**
 * circuitBreakerReporter.js
 * Prints a formatted report of circuit breaker states for all tracked routes.
 */

const { getAllCircuits } = require('./routeCircuitBreaker');

function colorState(state) {
  if (state === 'open') return `\x1b[31m${state.toUpperCase()}\x1b[0m`;
  if (state === 'half-open') return `\x1b[33m${state.toUpperCase()}\x1b[0m`;
  return `\x1b[32m${state.toUpperCase()}\x1b[0m`;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatCircuitRow(key, circuit) {
  const [method, ...pathParts] = key.split(':');
  const path = pathParts.join(':');
  const trippedAgo = circuit.trippedAt
    ? `${Math.round((Date.now() - circuit.trippedAt) / 1000)}s ago`
    : '-';
  return (
    `  ${pad(method, 8)} ${pad(path, 30)} ` +
    `${pad(colorState(circuit.state), 20)} ` +
    `errors: ${pad(circuit.consecutiveErrors, 4)} ` +
    `tripped: ${trippedAgo}`
  );
}

function printCircuitReport() {
  const all = getAllCircuits();
  const keys = Object.keys(all);

  console.log('\n\x1b[1m=== Circuit Breaker Report ===\x1b[0m');

  if (keys.length === 0) {
    console.log('  No circuit data recorded.');
    console.log();
    return;
  }

  const header = `  ${'METHOD'.padEnd(8)} ${'PATH'.padEnd(30)} ${'STATE'.padEnd(12)} ERRORS   TRIPPED`;
  console.log(header);
  console.log('  ' + '-'.repeat(72));

  for (const key of keys) {
    console.log(formatCircuitRow(key, all[key]));
  }

  const openCount = keys.filter(k => all[k].state === 'open').length;
  const halfCount = keys.filter(k => all[k].state === 'half-open').length;
  console.log('\n  ' + '-'.repeat(72));
  console.log(`  Total: ${keys.length} routes | Open: ${openCount} | Half-open: ${halfCount}`);
  console.log();
}

module.exports = { colorState, pad, formatCircuitRow, printCircuitReport };
