const {
  record,
  getHistory,
  getAllHistory,
  summarizeHistory,
  reset,
} = require('../src/routeHistory');

beforeEach(() => reset());

describe('record / getHistory', () => {
  it('stores entries for a route', () => {
    record('GET', '/users', 200, 45);
    record('GET', '/users', 200, 60);
    const history = getHistory('GET', '/users');
    expect(history).toHaveLength(2);
    expect(history[0].statusCode).toBe(200);
    expect(history[0].duration).toBe(45);
  });

  it('returns empty array for unknown route', () => {
    expect(getHistory('POST', '/nope')).toEqual([]);
  });

  it('normalizes method to uppercase', () => {
    record('get', '/ping', 200, 10);
    const history = getHistory('GET', '/ping');
    expect(history).toHaveLength(1);
  });

  it('respects maxEntries cap', () => {
    for (let i = 0; i < 25; i++) {
      record('GET', '/capped', 200, i, 20);
    }
    const history = getHistory('GET', '/capped');
    expect(history).toHaveLength(20);
    expect(history[0].duration).toBe(5); // oldest 5 were shifted out
  });

  it('stores timestamp on each entry', () => {
    const before = Date.now();
    record('DELETE', '/item', 204, 30);
    const after = Date.now();
    const [entry] = getHistory('DELETE', '/item');
    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('getAllHistory', () => {
  it('returns all routes', () => {
    record('GET', '/a', 200, 10);
    record('POST', '/b', 201, 20);
    const all = getAllHistory();
    expect(Object.keys(all)).toContain('GET /a');
    expect(Object.keys(all)).toContain('POST /b');
  });

  it('returns empty object when no history', () => {
    expect(getAllHistory()).toEqual({});
  });
});

describe('summarizeHistory', () => {
  it('returns null for unknown route', () => {
    expect(summarizeHistory('GET', '/ghost')).toBeNull();
  });

  it('calculates summary stats', () => {
    record('GET', '/stats', 200, 100);
    record('GET', '/stats', 200, 200);
    record('GET', '/stats', 500, 300);
    const summary = summarizeHistory('GET', '/stats');
    expect(summary.count).toBe(3);
    expect(summary.avgDuration).toBe(200);
    expect(summary.minDuration).toBe(100);
    expect(summary.maxDuration).toBe(300);
    expect(summary.errorCount).toBe(1);
    expect(summary.errorRate).toBe(33.3);
  });

  it('reports zero errors when all successful', () => {
    record('GET', '/ok', 200, 50);
    record('GET', '/ok', 204, 60);
    const summary = summarizeHistory('GET', '/ok');
    expect(summary.errorCount).toBe(0);
    expect(summary.errorRate).toBe(0);
  });

  it('includes latest timestamp', () => {
    const before = Date.now();
    record('GET', '/ts', 200, 10);
    const summary = summarizeHistory('GET', '/ts');
    expect(summary.latest).toBeGreaterThanOrEqual(before);
  });
});
