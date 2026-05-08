const {
  record,
  getTimeline,
  getAllTimelines,
  summarizeTimeline,
  reset,
} = require('../src/routeTimeline');

beforeEach(() => reset());

describe('record / getTimeline', () => {
  test('stores a hit with timestamp and duration', () => {
    record('/api/users', 'GET', 42);
    const tl = getTimeline('/api/users', 'GET');
    expect(tl).toHaveLength(1);
    expect(tl[0].durationMs).toBe(42);
    expect(typeof tl[0].timestamp).toBe('number');
  });

  test('returns empty array for unknown route', () => {
    expect(getTimeline('/nope', 'GET')).toEqual([]);
  });

  test('normalizes method to uppercase', () => {
    record('/health', 'get', 5);
    expect(getTimeline('/health', 'GET')).toHaveLength(1);
  });

  test('caps entries at 50', () => {
    for (let i = 0; i < 60; i++) {
      record('/big', 'POST', i);
    }
    expect(getTimeline('/big', 'POST')).toHaveLength(50);
  });

  test('accepts null duration', () => {
    record('/ping', 'GET', null);
    const tl = getTimeline('/ping', 'GET');
    expect(tl[0].durationMs).toBeNull();
  });
});

describe('getAllTimelines', () => {
  test('returns all recorded routes', () => {
    record('/a', 'GET', 10);
    record('/b', 'POST', 20);
    const all = getAllTimelines();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET /a']).toHaveLength(1);
    expect(all['POST /b']).toHaveLength(1);
  });

  test('returns copies, not references', () => {
    record('/a', 'GET', 10);
    const all = getAllTimelines();
    all['GET /a'].push({ fake: true });
    expect(getTimeline('/a', 'GET')).toHaveLength(1);
  });
});

describe('summarizeTimeline', () => {
  test('returns null for unknown route', () => {
    expect(summarizeTimeline('/nope', 'GET')).toBeNull();
  });

  test('returns correct summary', () => {
    record('/api/items', 'GET', 100);
    record('/api/items', 'GET', 200);
    const summary = summarizeTimeline('/api/items', 'GET');
    expect(summary.key).toBe('GET /api/items');
    expect(summary.totalHits).toBe(2);
    expect(summary.avgDurationMs).toBe(150);
    expect(summary.spanMs).toBeGreaterThanOrEqual(0);
    expect(summary.firstSeen).toBeTruthy();
    expect(summary.lastSeen).toBeTruthy();
  });

  test('avgDurationMs is null when all durations are null', () => {
    record('/ping', 'GET', null);
    const summary = summarizeTimeline('/ping', 'GET');
    expect(summary.avgDurationMs).toBeNull();
  });
});

describe('reset', () => {
  test('clears all timelines', () => {
    record('/x', 'DELETE', 5);
    reset();
    expect(getAllTimelines()).toEqual({});
  });
});
