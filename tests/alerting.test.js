const { evaluateRoute, checkAlerts } = require('../src/alerting');
const tracker = require('../src/tracker');

describe('evaluateRoute', () => {
  const base = { method: 'GET', path: '/api/test', count: 10, errorCount: 2, totalDuration: 500 };

  test('returns empty array when no thresholds set', () => {
    expect(evaluateRoute(base, {})).toEqual([]);
  });

  test('alerts when count exceeds maxCount', () => {
    const alerts = evaluateRoute(base, { maxCount: 5 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatch(/exceeded maxCount/);
    expect(alerts[0]).toMatch(/GET \/api\/test/);
  });

  test('no alert when count is within maxCount', () => {
    expect(evaluateRoute(base, { maxCount: 20 })).toEqual([]);
  });

  test('alerts when count is below minCount', () => {
    const alerts = evaluateRoute(base, { minCount: 20 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatch(/below minCount/);
  });

  test('no alert when count meets minCount', () => {
    expect(evaluateRoute(base, { minCount: 10 })).toEqual([]);
  });

  test('alerts when error rate exceeds maxErrorRate', () => {
    // errorCount=2, count=10 => 20% error rate
    const alerts = evaluateRoute(base, { maxErrorRate: 0.1 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatch(/error rate too high/);
    expect(alerts[0]).toMatch(/20.0%/);
  });

  test('no alert when error rate is within maxErrorRate', () => {
    expect(evaluateRoute(base, { maxErrorRate: 0.5 })).toEqual([]);
  });

  test('alerts when avg duration exceeds maxAvgDuration', () => {
    // totalDuration=500, count=10 => avg=50ms
    const alerts = evaluateRoute(base, { maxAvgDuration: 30 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatch(/avg duration too slow/);
    expect(alerts[0]).toMatch(/50.0ms/);
  });

  test('no alert when avg duration is within maxAvgDuration', () => {
    expect(evaluateRoute(base, { maxAvgDuration: 100 })).toEqual([]);
  });

  test('can trigger multiple alerts at once', () => {
    const alerts = evaluateRoute(base, { maxCount: 5, maxErrorRate: 0.1 });
    expect(alerts).toHaveLength(2);
  });
});

describe('checkAlerts', () => {
  beforeEach(() => {
    tracker.reset();
  });

  test('returns empty array when no stats recorded', () => {
    const alerts = checkAlerts({ maxCount: 5 });
    expect(alerts).toEqual([]);
  });

  test('calls onAlert for each triggered alert', () => {
    tracker.record('GET', '/users', 200, 40);
    tracker.record('GET', '/users', 200, 40);
    tracker.record('GET', '/users', 200, 40);

    const received = [];
    const alerts = checkAlerts({ maxCount: 2 }, (msg) => received.push(msg));

    expect(alerts).toHaveLength(1);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatch(/exceeded maxCount/);
  });

  test('uses console.warn as default onAlert', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    tracker.record('POST', '/login', 500, 20);
    checkAlerts({ maxErrorRate: 0.5 });
    spy.mockRestore();
  });
});
