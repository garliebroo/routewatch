const { setSLA, setSLABulk, getSLA, getAllSLAs, evaluateSLA, removeSLA, reset } = require('../src/routeSLA');

beforeEach(() => reset());

describe('setSLA / getSLA', () => {
  test('stores and retrieves an SLA', () => {
    setSLA('GET', '/api/users', { maxAvgMs: 200 });
    expect(getSLA('GET', '/api/users')).toEqual({ maxAvgMs: 200, maxErrorRate: undefined, maxP95Ms: undefined });
  });

  test('returns null for unknown route', () => {
    expect(getSLA('GET', '/nope')).toBeNull();
  });

  test('is case-insensitive on method', () => {
    setSLA('get', '/ping', { maxAvgMs: 50 });
    expect(getSLA('GET', '/ping')).not.toBeNull();
  });
});

describe('setSLABulk', () => {
  test('sets multiple SLAs at once', () => {
    setSLABulk([
      { method: 'GET', path: '/a', maxAvgMs: 100 },
      { method: 'POST', path: '/b', maxErrorRate: 0.05 },
    ]);
    expect(getSLA('GET', '/a')).toMatchObject({ maxAvgMs: 100 });
    expect(getSLA('POST', '/b')).toMatchObject({ maxErrorRate: 0.05 });
  });
});

describe('evaluateSLA', () => {
  test('returns null when no SLA defined', () => {
    expect(evaluateSLA('GET', '/unknown', { avgMs: 500 })).toBeNull();
  });

  test('passes when all metrics within limits', () => {
    setSLA('GET', '/fast', { maxAvgMs: 300, maxErrorRate: 0.1 });
    const result = evaluateSLA('GET', '/fast', { avgMs: 100, errorRate: 0.02 });
    expect(result.passing).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  test('fails when avgMs exceeds limit', () => {
    setSLA('GET', '/slow', { maxAvgMs: 100 });
    const result = evaluateSLA('GET', '/slow', { avgMs: 350 });
    expect(result.passing).toBe(false);
    expect(result.violations[0]).toMatchObject({ field: 'avgMs', actual: 350, limit: 100 });
  });

  test('fails when errorRate exceeds limit', () => {
    setSLA('POST', '/submit', { maxErrorRate: 0.05 });
    const result = evaluateSLA('POST', '/submit', { errorRate: 0.2 });
    expect(result.passing).toBe(false);
    expect(result.violations[0].field).toBe('errorRate');
  });

  test('reports multiple violations', () => {
    setSLA('GET', '/bad', { maxAvgMs: 50, maxP95Ms: 100 });
    const result = evaluateSLA('GET', '/bad', { avgMs: 200, p95Ms: 400 });
    expect(result.violations).toHaveLength(2);
  });
});

describe('removeSLA', () => {
  test('removes an existing SLA', () => {
    setSLA('DELETE', '/item', { maxAvgMs: 100 });
    removeSLA('DELETE', '/item');
    expect(getSLA('DELETE', '/item')).toBeNull();
  });
});

describe('getAllSLAs', () => {
  test('returns all defined SLAs', () => {
    setSLA('GET', '/x', { maxAvgMs: 100 });
    setSLA('POST', '/y', { maxErrorRate: 0.1 });
    const all = getAllSLAs();
    expect(Object.keys(all)).toHaveLength(2);
  });
});
