const { record, getStatusStats, getErrorRoutes, reset } = require('../src/statusTracker');

beforeEach(() => reset());

describe('record', () => {
  test('creates an entry for a new route', () => {
    record('GET', '/users', 200);
    const stats = getStatusStats();
    expect(stats['GET /users']).toBeDefined();
    expect(stats['GET /users'].codes['200']).toBe(1);
  });

  test('increments count for repeated status codes', () => {
    record('GET', '/users', 200);
    record('GET', '/users', 200);
    record('GET', '/users', 200);
    const stats = getStatusStats();
    expect(stats['GET /users'].codes['200']).toBe(3);
  });

  test('tracks multiple status codes for the same route', () => {
    record('POST', '/items', 201);
    record('POST', '/items', 400);
    record('POST', '/items', 201);
    const stats = getStatusStats();
    expect(stats['POST /items'].codes['201']).toBe(2);
    expect(stats['POST /items'].codes['400']).toBe(1);
  });

  test('normalizes method to uppercase', () => {
    record('get', '/ping', 200);
    const stats = getStatusStats();
    expect(stats['GET /ping']).toBeDefined();
    expect(stats['GET /ping'].method).toBe('GET');
  });

  test('tracks different methods separately', () => {
    record('GET', '/data', 200);
    record('DELETE', '/data', 204);
    const stats = getStatusStats();
    expect(stats['GET /data']).toBeDefined();
    expect(stats['DELETE /data']).toBeDefined();
  });
});

describe('getStatusStats', () => {
  test('returns empty object when nothing recorded', () => {
    expect(getStatusStats()).toEqual({});
  });

  test('returns a deep copy, not a reference', () => {
    record('GET', '/copy', 200);
    const stats = getStatusStats();
    stats['GET /copy'].codes['200'] = 999;
    expect(getStatusStats()['GET /copy'].codes['200']).toBe(1);
  });
});

describe('getErrorRoutes', () => {
  test('returns empty array when no errors recorded', () => {
    record('GET', '/ok', 200);
    expect(getErrorRoutes()).toHaveLength(0);
  });

  test('returns routes with 4xx codes', () => {
    record('GET', '/missing', 404);
    record('GET', '/ok', 200);
    const errors = getErrorRoutes();
    expect(errors).toHaveLength(1);
    expect(errors[0].route).toBe('/missing');
  });

  test('returns routes with 5xx codes', () => {
    record('POST', '/broken', 500);
    const errors = getErrorRoutes();
    expect(errors).toHaveLength(1);
    expect(errors[0].codes['500']).toBe(1);
  });

  test('includes route that has both success and error codes', () => {
    record('GET', '/flaky', 200);
    record('GET', '/flaky', 503);
    const errors = getErrorRoutes();
    expect(errors).toHaveLength(1);
  });
});

describe('reset', () => {
  test('clears all recorded data', () => {
    record('GET', '/reset-me', 200);
    reset();
    expect(getStatusStats()).toEqual({});
  });
});
