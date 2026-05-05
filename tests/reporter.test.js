const { printReport } = require('../src/reporter');
const tracker = require('../src/tracker');

describe('printReport', () => {
  let consoleSpy;

  beforeEach(() => {
    tracker.reset();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints a no-routes message when stats are empty', () => {
    printReport();
    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/No routes recorded/i);
  });

  it('prints route entries after recording hits', () => {
    tracker.record('GET', '/api/users', 45);
    tracker.record('GET', '/api/users', 30);
    tracker.record('POST', '/api/users', 120);

    printReport();

    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/\/api\/users/);
    expect(output).toMatch(/GET/);
    expect(output).toMatch(/POST/);
  });

  it('respects minCount option and filters low-traffic routes', () => {
    tracker.record('GET', '/api/users', 10);
    tracker.record('DELETE', '/api/old', 5);

    printReport({ minCount: 1 });

    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/\/api\/users/);
    expect(output).toMatch(/\/api\/old/);
  });

  it('filters out routes at or below minCount', () => {
    tracker.record('GET', '/ping', 2);

    printReport({ minCount: 2 });

    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/No routes recorded/i);
  });

  it('uses a custom title when provided', () => {
    tracker.record('GET', '/health', 1);
    printReport({ title: 'My Custom Report' });

    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/My Custom Report/);
  });

  it('sorts routes by hit count descending', () => {
    tracker.record('GET', '/rare', 1);
    tracker.record('GET', '/popular', 99);

    printReport();

    const calls = consoleSpy.mock.calls.flat().join('\n');
    const popularIdx = calls.indexOf('/popular');
    const rareIdx = calls.indexOf('/rare');
    expect(popularIdx).toBeLessThan(rareIdx);
  });
});
