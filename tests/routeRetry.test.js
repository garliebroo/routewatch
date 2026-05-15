const {
  recordAttempt,
  getRetryStats,
  getAllRetryStats,
  getHighRetryRoutes,
  reset,
} = require('../src/routeRetry');

beforeEach(() => reset());

describe('recordAttempt / getRetryStats', () => {
  test('records a successful first attempt', () => {
    recordAttempt('GET', '/api/users', { success: true, attemptNumber: 1 });
    const stats = getRetryStats('GET', '/api/users');
    expect(stats.totalAttempts).toBe(1);
    expect(stats.successCount).toBe(1);
    expect(stats.failureCount).toBe(0);
    expect(stats.retryCount).toBe(0);
    expect(stats.retryRate).toBe('0.0%');
  });

  test('records a retry attempt (attemptNumber > 1)', () => {
    recordAttempt('POST', '/api/orders', { success: false, attemptNumber: 1 });
    recordAttempt('POST', '/api/orders', { success: true, attemptNumber: 2 });
    const stats = getRetryStats('POST', '/api/orders');
    expect(stats.totalAttempts).toBe(2);
    expect(stats.retryCount).toBe(1);
    expect(stats.maxAttemptSeen).toBe(2);
    expect(stats.retryRate).toBe('50.0%');
  });

  test('is case-insensitive for method', () => {
    recordAttempt('get', '/ping', { success: true, attemptNumber: 1 });
    const stats = getRetryStats('GET', '/ping');
    expect(stats).not.toBeNull();
    expect(stats.method).toBe('GET');
  });

  test('returns null for unknown route', () => {
    expect(getRetryStats('DELETE', '/unknown')).toBeNull();
  });

  test('tracks multiple failures and max attempt', () => {
    recordAttempt('GET', '/flaky', { success: false, attemptNumber: 1 });
    recordAttempt('GET', '/flaky', { success: false, attemptNumber: 2 });
    recordAttempt('GET', '/flaky', { success: false, attemptNumber: 3 });
    recordAttempt('GET', '/flaky', { success: true, attemptNumber: 4 });
    const stats = getRetryStats('GET', '/flaky');
    expect(stats.failureCount).toBe(3);
    expect(stats.successCount).toBe(1);
    expect(stats.maxAttemptSeen).toBe(4);
    expect(stats.retryCount).toBe(3);
  });
});

describe('getAllRetryStats', () => {
  test('returns empty array when no data', () => {
    expect(getAllRetryStats()).toEqual([]);
  });

  test('returns stats for all recorded routes', () => {
    recordAttempt('GET', '/a', { success: true, attemptNumber: 1 });
    recordAttempt('POST', '/b', { success: false, attemptNumber: 1 });
    const all = getAllRetryStats();
    expect(all).toHaveLength(2);
    const paths = all.map((s) => s.path);
    expect(paths).toContain('/a');
    expect(paths).toContain('/b');
  });
});

describe('getHighRetryRoutes', () => {
  test('returns routes above default threshold of 20%', () => {
    // 1 retry out of 2 = 50%
    recordAttempt('GET', '/high', { success: false, attemptNumber: 1 });
    recordAttempt('GET', '/high', { success: true, attemptNumber: 2 });
    // 0 retries
    recordAttempt('GET', '/low', { success: true, attemptNumber: 1 });
    const high = getHighRetryRoutes();
    expect(high).toHaveLength(1);
    expect(high[0].path).toBe('/high');
  });

  test('respects custom threshold', () => {
    recordAttempt('GET', '/mid', { success: false, attemptNumber: 1 });
    recordAttempt('GET', '/mid', { success: true, attemptNumber: 2 });
    expect(getHighRetryRoutes(60)).toHaveLength(0);
    expect(getHighRetryRoutes(50)).toHaveLength(1);
  });
});

describe('reset', () => {
  test('clears all stored data', () => {
    recordAttempt('GET', '/x', { success: true, attemptNumber: 1 });
    reset();
    expect(getAllRetryStats()).toEqual([]);
    expect(getRetryStats('GET', '/x')).toBeNull();
  });
});
