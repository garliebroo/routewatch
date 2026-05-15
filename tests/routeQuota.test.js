const {
  setQuota,
  setQuotaBulk,
  recordUsage,
  getQuotaStatus,
  getAllQuotaStatuses,
  reset,
} = require('../src/routeQuota');

beforeEach(() => reset());

describe('setQuota / getQuotaStatus', () => {
  it('stores a quota and returns status', () => {
    setQuota('GET', '/api/data', 100, 60000);
    const status = getQuotaStatus('GET', '/api/data');
    expect(status).not.toBeNull();
    expect(status.limit).toBe(100);
    expect(status.count).toBe(0);
    expect(status.exceeded).toBe(false);
    expect(status.remaining).toBe(100);
  });

  it('returns null for unknown route', () => {
    expect(getQuotaStatus('GET', '/unknown')).toBeNull();
  });
});

describe('setQuotaBulk', () => {
  it('registers multiple quotas', () => {
    setQuotaBulk([
      { method: 'GET', path: '/a', limit: 10 },
      { method: 'POST', path: '/b', limit: 5 },
    ]);
    expect(getQuotaStatus('GET', '/a').limit).toBe(10);
    expect(getQuotaStatus('POST', '/b').limit).toBe(5);
  });
});

describe('recordUsage', () => {
  it('increments usage count', () => {
    setQuota('GET', '/items', 10);
    recordUsage('GET', '/items');
    recordUsage('GET', '/items');
    const status = getQuotaStatus('GET', '/items');
    expect(status.count).toBe(2);
    expect(status.remaining).toBe(8);
  });

  it('flags exceeded when count exceeds limit', () => {
    setQuota('POST', '/submit', 2);
    recordUsage('POST', '/submit');
    recordUsage('POST', '/submit');
    const result = recordUsage('POST', '/submit');
    expect(result.exceeded).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('returns null for unregistered route', () => {
    expect(recordUsage('DELETE', '/ghost')).toBeNull();
  });

  it('resets window after windowMs elapses', () => {
    jest.useFakeTimers();
    setQuota('GET', '/fast', 2, 1000);
    recordUsage('GET', '/fast');
    recordUsage('GET', '/fast');
    jest.advanceTimersByTime(1001);
    const result = recordUsage('GET', '/fast');
    expect(result.count).toBe(1);
    expect(result.exceeded).toBe(false);
    jest.useRealTimers();
  });
});

describe('getAllQuotaStatuses', () => {
  it('returns all registered quotas', () => {
    setQuota('GET', '/x', 5);
    setQuota('GET', '/y', 10);
    const all = getAllQuotaStatuses();
    expect(all).toHaveLength(2);
    expect(all.map((s) => s.key)).toContain('GET /x');
  });

  it('returns empty array when no quotas set', () => {
    expect(getAllQuotaStatuses()).toEqual([]);
  });
});

describe('reset', () => {
  it('clears all quotas and usage', () => {
    setQuota('GET', '/z', 3);
    recordUsage('GET', '/z');
    reset();
    expect(getQuotaStatus('GET', '/z')).toBeNull();
    expect(getAllQuotaStatuses()).toEqual([]);
  });
});
