// routeBenchmark.js — track and compare route performance benchmarks

const benchmarks = new Map();

function buildKey(method, route) {
  return `${method.toUpperCase()}:${route}`;
}

function setBenchmark(method, route, thresholdMs) {
  const key = buildKey(method, route);
  benchmarks.set(key, { method: method.toUpperCase(), route, thresholdMs });
}

function setBenchmarks(entries) {
  for (const { method, route, thresholdMs } of entries) {
    setBenchmark(method, route, thresholdMs);
  }
}

function getBenchmark(method, route) {
  return benchmarks.get(buildKey(method, route)) || null;
}

function getAllBenchmarks() {
  return Object.fromEntries(benchmarks);
}

function evaluateAgainstBenchmark(method, route, avgMs) {
  const bench = getBenchmark(method, route);
  if (!bench) return null;
  const delta = avgMs - bench.thresholdMs;
  const passed = delta <= 0;
  return {
    method: bench.method,
    route: bench.route,
    thresholdMs: bench.thresholdMs,
    avgMs: Math.round(avgMs * 100) / 100,
    delta: Math.round(delta * 100) / 100,
    passed,
    status: passed ? 'PASS' : 'FAIL',
  };
}

function runBenchmarkReport(stats) {
  const results = [];
  for (const [, entry] of Object.entries(stats)) {
    const result = evaluateAgainstBenchmark(entry.method, entry.route, entry.avgTime || 0);
    if (result) results.push(result);
  }
  return results;
}

function removeBenchmark(method, route) {
  return benchmarks.delete(buildKey(method, route));
}

function reset() {
  benchmarks.clear();
}

module.exports = {
  buildKey,
  setBenchmark,
  setBenchmarks,
  getBenchmark,
  getAllBenchmarks,
  evaluateAgainstBenchmark,
  runBenchmarkReport,
  removeBenchmark,
  reset,
};
