const {
  setBenchmark,
  setBenchmarks,
  getBenchmark,
  getAllBenchmarks,
  evaluateAgainstBenchmark,
  runBenchmarkReport,
  removeBenchmark,
  reset,
} = require('../src/routeBenchmark');

beforeEach(() => reset());

describe('setBenchmark / getBenchmark', () => {
  test('stores and retrieves a benchmark', () => {
    setBenchmark('GET', '/api/users', 100);
    const bench = getBenchmark('GET', '/api/users');
    expect(bench).toEqual({ method: 'GET', route: '/api/users', thresholdMs: 100 });
  });

  test('returns null for unknown route', () => {
    expect(getBenchmark('POST', '/nope')).toBeNull();
  });

  test('is case-insensitive for method', () => {
    setBenchmark('get', '/ping', 50);
    expect(getBenchmark('GET', '/ping')).not.toBeNull();
  });
});

describe('setBenchmarks', () => {
  test('sets multiple benchmarks at once', () => {
    setBenchmarks([
      { method: 'GET', route: '/a', thresholdMs: 80 },
      { method: 'POST', route: '/b', thresholdMs: 200 },
    ]);
    expect(getBenchmark('GET', '/a').thresholdMs).toBe(80);
    expect(getBenchmark('POST', '/b').thresholdMs).toBe(200);
  });
});

describe('getAllBenchmarks', () => {
  test('returns all stored benchmarks', () => {
    setBenchmark('DELETE', '/item', 60);
    const all = getAllBenchmarks();
    expect(Object.keys(all).length).toBe(1);
  });
});

describe('evaluateAgainstBenchmark', () => {
  test('returns PASS when avgMs is below threshold', () => {
    setBenchmark('GET', '/fast', 100);
    const result = evaluateAgainstBenchmark('GET', '/fast', 75);
    expect(result.passed).toBe(true);
    expect(result.status).toBe('PASS');
    expect(result.delta).toBeLessThan(0);
  });

  test('returns FAIL when avgMs exceeds threshold', () => {
    setBenchmark('GET', '/slow', 100);
    const result = evaluateAgainstBenchmark('GET', '/slow', 150);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('FAIL');
    expect(result.delta).toBeGreaterThan(0);
  });

  test('returns null for unregistered route', () => {
    expect(evaluateAgainstBenchmark('GET', '/unknown', 50)).toBeNull();
  });
});

describe('runBenchmarkReport', () => {
  test('evaluates all matching routes from stats', () => {
    setBenchmark('GET', '/api/data', 100);
    const stats = {
      'GET:/api/data': { method: 'GET', route: '/api/data', avgTime: 120 },
      'POST:/other': { method: 'POST', route: '/other', avgTime: 30 },
    };
    const results = runBenchmarkReport(stats);
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('FAIL');
  });

  test('returns empty array when no benchmarks match', () => {
    const stats = { 'GET:/x': { method: 'GET', route: '/x', avgTime: 10 } };
    expect(runBenchmarkReport(stats)).toEqual([]);
  });
});

describe('removeBenchmark', () => {
  test('removes a benchmark', () => {
    setBenchmark('GET', '/temp', 50);
    removeBenchmark('GET', '/temp');
    expect(getBenchmark('GET', '/temp')).toBeNull();
  });
});

describe('reset', () => {
  test('clears all benchmarks', () => {
    setBenchmark('GET', '/x', 100);
    reset();
    expect(Object.keys(getAllBenchmarks()).length).toBe(0);
  });
});
