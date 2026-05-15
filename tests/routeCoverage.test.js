const {
  registerRoute,
  registerRoutes,
  markHit,
  getCoverage,
  getAllRegistered,
  reset,
} = require('../src/routeCoverage');

beforeEach(() => reset());

describe('registerRoute / getAllRegistered', () => {
  test('registers a single route', () => {
    registerRoute('GET', '/users');
    const all = getAllRegistered();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual({ method: 'GET', path: '/users' });
  });

  test('normalises method to uppercase', () => {
    registerRoute('post', '/items');
    const all = getAllRegistered();
    expect(all[0].method).toBe('POST');
  });

  test('registerRoutes adds multiple routes', () => {
    registerRoutes([
      { method: 'GET', path: '/a' },
      { method: 'DELETE', path: '/b' },
    ]);
    expect(getAllRegistered()).toHaveLength(2);
  });
});

describe('getCoverage', () => {
  test('returns zero percent when nothing hit', () => {
    registerRoute('GET', '/users');
    registerRoute('POST', '/users');
    const cov = getCoverage();
    expect(cov.total).toBe(2);
    expect(cov.covered).toBe(0);
    expect(cov.percent).toBe(0);
    expect(cov.uncovered).toHaveLength(2);
  });

  test('returns 100 percent when all routes hit', () => {
    registerRoute('GET', '/ping');
    markHit('GET', '/ping');
    const cov = getCoverage();
    expect(cov.percent).toBe(100);
    expect(cov.uncovered).toHaveLength(0);
  });

  test('partial coverage', () => {
    registerRoutes([
      { method: 'GET', path: '/a' },
      { method: 'GET', path: '/b' },
      { method: 'GET', path: '/c' },
      { method: 'GET', path: '/d' },
    ]);
    markHit('GET', '/a');
    markHit('GET', '/c');
    const cov = getCoverage();
    expect(cov.covered).toBe(2);
    expect(cov.percent).toBe(50);
    expect(cov.uncovered.map(r => r.path)).toEqual(['/b', '/d']);
  });

  test('returns 0 percent with no registered routes', () => {
    const cov = getCoverage();
    expect(cov.total).toBe(0);
    expect(cov.percent).toBe(0);
  });

  test('markHit on unregistered route does not affect coverage total', () => {
    registerRoute('GET', '/known');
    markHit('GET', '/unknown');
    const cov = getCoverage();
    expect(cov.total).toBe(1);
    expect(cov.covered).toBe(0);
  });
});

describe('reset', () => {
  test('clears all state', () => {
    registerRoute('GET', '/x');
    markHit('GET', '/x');
    reset();
    expect(getAllRegistered()).toHaveLength(0);
    expect(getCoverage().total).toBe(0);
  });
});
