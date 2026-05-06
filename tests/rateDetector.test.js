const { createRateDetector } = require('../src/rateDetector');

describe('createRateDetector', () => {
  let detector;

  beforeEach(() => {
    detector = createRateDetector({ windowMs: 5000, threshold: 3 });
  });

  test('returns exceeded: false when under threshold', () => {
    detector.recordHit('GET', '/api/users');
    detector.recordHit('GET', '/api/users');
    const result = detector.recordHit('GET', '/api/users');
    expect(result.exceeded).toBe(false);
    expect(result.count).toBe(3);
  });

  test('returns exceeded: true when over threshold', () => {
    detector.recordHit('GET', '/api/users');
    detector.recordHit('GET', '/api/users');
    detector.recordHit('GET', '/api/users');
    const result = detector.recordHit('GET', '/api/users');
    expect(result.exceeded).toBe(true);
    expect(result.count).toBe(4);
  });

  test('treats different methods as different routes', () => {
    detector.recordHit('GET', '/api/items');
    detector.recordHit('POST', '/api/items');
    const rates = detector.getRates();
    expect(rates).toHaveLength(2);
  });

  test('getRates returns exceeded flag correctly', () => {
    for (let i = 0; i < 5; i++) detector.recordHit('DELETE', '/api/thing');
    const rates = detector.getRates();
    const entry = rates.find(r => r.route === 'DELETE /api/thing');
    expect(entry).toBeDefined();
    expect(entry.exceeded).toBe(true);
    expect(entry.count).toBe(5);
  });

  test('getRates returns exceeded: false when under threshold', () => {
    detector.recordHit('POST', '/api/login');
    const rates = detector.getRates();
    const entry = rates.find(r => r.route === 'POST /api/login');
    expect(entry.exceeded).toBe(false);
  });

  test('reset clears all data', () => {
    detector.recordHit('GET', '/api/users');
    detector.reset();
    const rates = detector.getRates();
    expect(rates).toHaveLength(0);
  });

  test('old hits outside window are not counted', (done) => {
    const shortDetector = createRateDetector({ windowMs: 50, threshold: 2 });
    shortDetector.recordHit('GET', '/fast');
    shortDetector.recordHit('GET', '/fast');
    shortDetector.recordHit('GET', '/fast');

    setTimeout(() => {
      // all old hits expired
      const result = shortDetector.recordHit('GET', '/fast');
      expect(result.count).toBe(1);
      expect(result.exceeded).toBe(false);
      done();
    }, 100);
  });

  test('uses default threshold of 100 when none provided', () => {
    const d = createRateDetector({ windowMs: 60000 });
    for (let i = 0; i < 100; i++) d.recordHit('GET', '/bulk');
    const result = d.recordHit('GET', '/bulk');
    expect(result.exceeded).toBe(true);
    expect(result.count).toBe(101);
  });
});
