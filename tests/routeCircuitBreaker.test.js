const {
  recordResult,
  getCircuitState,
  getAllCircuits,
  isOpen,
  reset,
} = require('../src/routeCircuitBreaker');

beforeEach(() => reset());

describe('recordResult', () => {
  test('starts in closed state', () => {
    recordResult('GET', '/api/users', false);
    const state = getCircuitState('GET', '/api/users');
    expect(state.state).toBe('closed');
    expect(state.consecutiveErrors).toBe(0);
  });

  test('increments consecutiveErrors on error', () => {
    recordResult('GET', '/api/users', true);
    recordResult('GET', '/api/users', true);
    const state = getCircuitState('GET', '/api/users');
    expect(state.consecutiveErrors).toBe(2);
    expect(state.state).toBe('closed');
  });

  test('trips circuit after threshold errors', () => {
    for (let i = 0; i < 5; i++) {
      recordResult('POST', '/api/orders', true, { threshold: 5 });
    }
    const state = getCircuitState('POST', '/api/orders');
    expect(state.state).toBe('open');
    expect(state.trippedAt).not.toBeNull();
  });

  test('resets consecutiveErrors on success', () => {
    recordResult('GET', '/api/users', true);
    recordResult('GET', '/api/users', true);
    recordResult('GET', '/api/users', false);
    const state = getCircuitState('GET', '/api/users');
    expect(state.consecutiveErrors).toBe(0);
    expect(state.state).toBe('closed');
  });

  test('transitions to half-open after resetAfterMs', () => {
    for (let i = 0; i < 5; i++) {
      recordResult('DELETE', '/api/items', true, { threshold: 5, resetAfterMs: 0 });
    }
    // Immediately trigger check with reset window of 0ms
    recordResult('DELETE', '/api/items', false, { threshold: 5, resetAfterMs: 0 });
    const state = getCircuitState('DELETE', '/api/items');
    expect(state.state).toBe('closed');
  });
});

describe('isOpen', () => {
  test('returns false for unknown route', () => {
    expect(isOpen('GET', '/unknown')).toBe(false);
  });

  test('returns true when circuit is open', () => {
    for (let i = 0; i < 5; i++) {
      recordResult('GET', '/fail', true, { threshold: 5 });
    }
    expect(isOpen('GET', '/fail')).toBe(true);
  });

  test('returns false when circuit is closed', () => {
    recordResult('GET', '/ok', false);
    expect(isOpen('GET', '/ok')).toBe(false);
  });
});

describe('getAllCircuits', () => {
  test('returns all tracked circuits', () => {
    recordResult('GET', '/a', false);
    recordResult('POST', '/b', true);
    const all = getAllCircuits();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toBeDefined();
    expect(all['POST:/b']).toBeDefined();
  });

  test('returns empty object after reset', () => {
    recordResult('GET', '/a', false);
    reset();
    expect(getAllCircuits()).toEqual({});
  });
});
