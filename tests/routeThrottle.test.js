const {
  setThrottle,
  setThrottleBulk,
  recordHit,
  getThrottleStatus,
  getAllThrottles,
  reset,
} = require('../src/routeThrottle');

beforeEach(() => reset());

describe('setThrottle', () => {
  it('registers a throttle config', () => {
    setThrottle('GET', '/api/data', { maxRequests: 10, windowMs: 5000 });
    const status = getThrottleStatus('GET', '/api/data');
    expect(status).not.toBeNull();
    expect(status.maxRequests).toBe(10);
    expect(status.windowMs).toBe(5000);
  });

  it('uses defaults when options omitted', () => {
    setThrottle('POST', '/submit');
    const status = getThrottleStatus('POST', '/submit');
    expect(status.maxRequests).toBe(100);
    expect(status.windowMs).toBe(60000);
    expect(status.blockOnExceed).toBe(true);
  });

  it('is case-insensitive for method', () => {
    setThrottle('get', '/ping');
    const status = getThrottleStatus('GET', '/ping');
    expect(status).not.toBeNull();
    expect(status.method).toBe('GET');
  });
});

describe('setThrottleBulk', () => {
  it('registers multiple throttles', () => {
    setThrottleBulk([
      { method: 'GET', path: '/a', options: { maxRequests: 5 } },
      { method: 'POST', path: '/b', options: { maxRequests: 20 } },
    ]);
    expect(getThrottleStatus('GET', '/a').maxRequests).toBe(5);
    expect(getThrottleStatus('POST', '/b').maxRequests).toBe(20);
  });
});

describe('recordHit', () => {
  it('returns null for unknown route', () => {
    expect(recordHit('GET', '/unknown')).toBeNull();
  });

  it('tracks hit count within window', () => {
    setThrottle('GET', '/api', { maxRequests: 3, windowMs: 5000 });
    recordHit('GET', '/api');
    recordHit('GET', '/api');
    const result = recordHit('GET', '/api');
    expect(result.count).toBe(3);
    expect(result.exceeded).toBe(false);
  });

  it('marks exceeded when over limit', () => {
    setThrottle('GET', '/api', { maxRequests: 2, windowMs: 5000 });
    recordHit('GET', '/api');
    recordHit('GET', '/api');
    const result = recordHit('GET', '/api');
    expect(result.exceeded).toBe(true);
    expect(result.count).toBe(3);
  });
});

describe('getThrottleStatus', () => {
  it('returns null for unregistered route', () => {
    expect(getThrottleStatus('DELETE', '/missing')).toBeNull();
  });

  it('reflects current window count', () => {
    setThrottle('PUT', '/update', { maxRequests: 10, windowMs: 60000 });
    recordHit('PUT', '/update');
    recordHit('PUT', '/update');
    const status = getThrottleStatus('PUT', '/update');
    expect(status.currentCount).toBe(2);
    expect(status.exceeded).toBe(false);
  });
});

describe('getAllThrottles', () => {
  it('returns empty array when none configured', () => {
    expect(getAllThrottles()).toEqual([]);
  });

  it('returns all configured throttles', () => {
    setThrottle('GET', '/x');
    setThrottle('POST', '/y');
    const all = getAllThrottles();
    expect(all).toHaveLength(2);
    expect(all.map(e => e.path)).toContain('/x');
    expect(all.map(e => e.path)).toContain('/y');
  });
});

describe('reset', () => {
  it('clears all throttle configs', () => {
    setThrottle('GET', '/clear-me');
    reset();
    expect(getAllThrottles()).toHaveLength(0);
  });
});
