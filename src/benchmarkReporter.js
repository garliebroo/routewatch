// benchmarkReporter.js — print benchmark evaluation results to console

const { runBenchmarkReport } = require('./routeBenchmark');

function colorStatus(status) {
  if (status === 'PASS') return `\x1b[32m${status}\x1b[0m`;
  if (status === 'FAIL') return `\x1b[31m${status}\x1b[0m`;
  return status;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function formatBenchmarkRow(result) {
  const method = pad(result.method, 7);
  const route = pad(result.route, 30);
  const threshold = pad(`${result.thresholdMs}ms`, 12);
  const avg = pad(`${result.avgMs}ms`, 12);
  const delta = result.delta > 0 ? `+${result.delta}ms` : `${result.delta}ms`;
  const paddedDelta = pad(delta, 10);
  const status = colorStatus(result.status);
  return `  ${method} ${route} threshold: ${threshold} avg: ${avg} delta: ${paddedDelta} [${status}]`;
}

function printBenchmarkReport(stats) {
  const results = runBenchmarkReport(stats);

  if (results.length === 0) {
    console.log('\n\x1b[33mNo benchmark thresholds configured.\x1b[0m\n');
    return;
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  console.log('\n\x1b[1m=== Route Benchmark Report ===\x1b[0m');
  for (const result of results) {
    console.log(formatBenchmarkRow(result));
  }
  console.log(`\n  Total: ${results.length}  \x1b[32mPassed: ${passed}\x1b[0m  \x1b[31mFailed: ${failed}\x1b[0m\n`);
}

module.exports = { formatBenchmarkRow, printBenchmarkReport };
