const { findSlowRoutes, formatSlowRoute, printSlowRoutes } = require('../src/slowRoutes');

const mockStats = {
  'GET /fast': { count: 10, avgTime: 45.2, maxTime: 80.0 },
  'GET /medium': { count: 5, avgTime: 300.0, maxTime: 450.0 },
  'POST /slow': { count: 3, avgTime: 820.5, maxTime: 1200.0 },
  'DELETE /very-slow': { count: 1, avgTime: 1500.0, maxTime: 1500.0 },
};

describe('findSlowRoutes', () => {
  it('returns routes exceeding default threshold of 500ms', () => {
    const result = findSlowRoutes(mockStats);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.route)).toContain('POST /slow');
    expect(result.map((r) => r.route)).toContain('DELETE /very-slow');
  });

  it('respects a custom threshold', () => {
    const result = findSlowRoutes(mockStats, 200);
    expect(result).toHaveLength(3);
  });

  it('returns empty array when no routes are slow', () => {
    const result = findSlowRoutes(mockStats, 2000);
    expect(result).toHaveLength(0);
  });

  it('sorts results by avgTime descending', () => {
    const result = findSlowRoutes(mockStats, 0);
    expect(result[0].avgTime).toBeGreaterThanOrEqual(result[1].avgTime);
  });

  it('handles empty stats', () => {
    expect(findSlowRoutes({})).toEqual([]);
  });
});

describe('formatSlowRoute', () => {
  it('includes route, avgTime, maxTime, and count', () => {
    const entry = { route: 'POST /slow', count: 3, avgTime: 820.5, maxTime: 1200.0 };
    const line = formatSlowRoute(entry);
    expect(line).toContain('POST /slow');
    expect(line).toContain('820.5ms');
    expect(line).toContain('1200.0ms');
    expect(line).toContain('hits: 3');
  });

  it('omits max when maxTime is undefined', () => {
    const entry = { route: 'GET /x', count: 1, avgTime: 600.0 };
    const line = formatSlowRoute(entry);
    expect(line).not.toContain('max');
  });
});

describe('printSlowRoutes', () => {
  let consoleSpy;
  beforeEach(() => { consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => consoleSpy.mockRestore());

  it('prints slow routes when found', () => {
    printSlowRoutes(mockStats, { threshold: 500 });
    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('Slow Routes');
    expect(output).toContain('POST /slow');
  });

  it('prints a clean message when no slow routes exist', () => {
    printSlowRoutes(mockStats, { threshold: 9999 });
    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('No routes exceeded');
  });
});
