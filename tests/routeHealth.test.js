const { record, getHealth, scoreRoute, reset } = require('../src/routeHealth');

beforeEach(() => reset());

describe('record', () => {
  test('creates a new entry on first record', () => {
    record('/api/users', 'GET', { statusCode: 200, responseTime: 100 });
    const health = getHealth();
    expect(health['GET:/api/users']).toBeDefined();
    expect(health['GET:/api/users'].hits).toBe(1);
  });

  test('accumulates hits and errors', () => {
    record('/api/users', 'GET', { statusCode: 200, responseTime: 50 });
    record('/api/users', 'GET', { statusCode: 500, responseTime: 200 });
    const h = getHealth()['GET:/api/users'];
    expect(h.hits).toBe(2);
    expect(h.errors).toBe(1);
  });

  test('tracks 4xx as errors', () => {
    record('/api/items', 'DELETE', { statusCode: 404, responseTime: 30 });
    const h = getHealth()['DELETE:/api/items'];
    expect(h.errors).toBe(1);
  });
});

describe('getHealth', () => {
  test('returns insufficient_data when hits < 5', () => {
    record('/api/x', 'GET', { statusCode: 200, responseTime: 100 });
    const h = getHealth()['GET:/api/x'];
    expect(h.status).toBe('insufficient_data');
    expect(h.score).toBeNull();
  });

  test('returns healthy status for good routes', () => {
    for (let i = 0; i < 10; i++) {
      record('/api/good', 'GET', { statusCode: 200, responseTime: 50 });
    }
    const h = getHealth()['GET:/api/good'];
    expect(h.status).toBe('healthy');
    expect(h.score).toBeGreaterThanOrEqual(70);
  });

  test('returns unhealthy for high error rate', () => {
    for (let i = 0; i < 10; i++) {
      record('/api/bad', 'POST', { statusCode: 500, responseTime: 200 });
    }
    const h = getHealth()['POST:/api/bad'];
    expect(h.status).toBe('unhealthy');
  });

  test('computes avgTime correctly', () => {
    record('/api/t', 'GET', { statusCode: 200, responseTime: 100 });
    record('/api/t', 'GET', { statusCode: 200, responseTime: 300 });
    const h = getHealth()['GET:/api/t'];
    expect(h.avgTime).toBe(200);
  });

  test('computes errorRate correctly', () => {
    record('/api/r', 'GET', { statusCode: 200, responseTime: 50 });
    record('/api/r', 'GET', { statusCode: 400, responseTime: 50 });
    const h = getHealth()['GET:/api/r'];
    expect(h.errorRate).toBe(0.5);
  });
});

describe('scoreRoute', () => {
  test('returns null for insufficient hits', () => {
    expect(scoreRoute({ hits: 3, errors: 0, totalTime: 300 })).toBeNull();
  });

  test('returns a number 0-100', () => {
    const score = scoreRoute({ hits: 20, errors: 1, totalTime: 2000 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('reset', () => {
  test('clears all data', () => {
    record('/api/z', 'GET', { statusCode: 200, responseTime: 100 });
    reset();
    expect(Object.keys(getHealth())).toHaveLength(0);
  });
});
