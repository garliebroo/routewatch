const {
  deprecate,
  deprecateMany,
  recordHit,
  isDeprecated,
  getDeprecated,
  getEntry,
  reset,
} = require('../src/routeDeprecator');

beforeEach(() => reset());

describe('deprecate / isDeprecated', () => {
  test('marks a route as deprecated', () => {
    deprecate('GET /api/v1/users');
    expect(isDeprecated('GET /api/v1/users')).toBe(true);
  });

  test('unknown route is not deprecated', () => {
    expect(isDeprecated('GET /api/v2/users')).toBe(false);
  });

  test('stores custom message and sunsetDate', () => {
    deprecate('DELETE /api/v1/items', {
      message: 'Use v2 instead',
      sunsetDate: '2025-12-31',
    });
    const entry = getEntry('DELETE /api/v1/items');
    expect(entry.message).toBe('Use v2 instead');
    expect(entry.sunsetDate).toBe('2025-12-31');
  });

  test('defaults message when none provided', () => {
    deprecate('GET /old');
    const entry = getEntry('GET /old');
    expect(entry.message).toContain('GET /old');
  });
});

describe('deprecateMany', () => {
  test('registers multiple routes at once', () => {
    deprecateMany([
      { route: 'GET /a' },
      { route: 'POST /b', message: 'gone', sunsetDate: '2025-01-01' },
    ]);
    expect(isDeprecated('GET /a')).toBe(true);
    expect(isDeprecated('POST /b')).toBe(true);
    expect(getEntry('POST /b').sunsetDate).toBe('2025-01-01');
  });
});

describe('recordHit', () => {
  test('increments hitCount on each call', () => {
    deprecate('GET /legacy');
    recordHit('GET /legacy');
    recordHit('GET /legacy');
    expect(getEntry('GET /legacy').hitCount).toBe(2);
  });

  test('ignores hits for non-deprecated routes', () => {
    expect(() => recordHit('GET /unknown')).not.toThrow();
  });
});

describe('getDeprecated', () => {
  test('returns all deprecated entries', () => {
    deprecate('GET /x');
    deprecate('POST /y');
    const all = getDeprecated();
    expect(all).toHaveLength(2);
    expect(all.map(e => e.route)).toContain('GET /x');
  });

  test('returns empty array when nothing registered', () => {
    expect(getDeprecated()).toEqual([]);
  });
});

describe('reset', () => {
  test('clears all deprecated entries', () => {
    deprecate('GET /tmp');
    reset();
    expect(getDeprecated()).toHaveLength(0);
    expect(isDeprecated('GET /tmp')).toBe(false);
  });
});
