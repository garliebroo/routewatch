const { extractPrefix, groupByPrefix, sortedGroups } = require('../src/routeGroups');

const sampleStats = [
  { route: '/api/users', method: 'GET', count: 10, avgTime: 20 },
  { route: '/api/users/:id', method: 'GET', count: 5, avgTime: 30 },
  { route: '/api/users/:id', method: 'DELETE', count: 2, avgTime: 15 },
  { route: '/api/posts', method: 'GET', count: 8, avgTime: 25 },
  { route: '/health', method: 'GET', count: 50, avgTime: 2 },
];

describe('extractPrefix', () => {
  test('returns top 2 segments by default', () => {
    expect(extractPrefix('/api/users/:id')).toBe('/api/users');
  });

  test('returns top 1 segment when depth=1', () => {
    expect(extractPrefix('/api/users/:id', 1)).toBe('/api');
  });

  test('handles short paths gracefully', () => {
    expect(extractPrefix('/health')).toBe('/health');
  });

  test('handles root path', () => {
    expect(extractPrefix('/')).toBe('/');
  });
});

describe('groupByPrefix', () => {
  test('groups routes under correct prefixes', () => {
    const groups = groupByPrefix(sampleStats, 2);
    expect(groups).toHaveProperty('/api/users');
    expect(groups).toHaveProperty('/api/posts');
    expect(groups).toHaveProperty('/health');
  });

  test('aggregates totalCount correctly', () => {
    const groups = groupByPrefix(sampleStats, 2);
    // /api/users: 10 + 5 + 2 = 17
    expect(groups['/api/users'].totalCount).toBe(17);
  });

  test('collects unique methods', () => {
    const groups = groupByPrefix(sampleStats, 2);
    expect(groups['/api/users'].methods).toContain('GET');
    expect(groups['/api/users'].methods).toContain('DELETE');
    expect(groups['/api/users'].methods).toHaveLength(2);
  });

  test('calculates weighted avgTime', () => {
    const groups = groupByPrefix(sampleStats, 2);
    // (10*20 + 5*30 + 2*15) / 17 = (200+150+30)/17 = 380/17 ≈ 22.35
    expect(groups['/api/users'].avgTime).toBeCloseTo(380 / 17, 2);
  });

  test('returns empty object for empty stats', () => {
    expect(groupByPrefix([])).toEqual({});
  });

  test('groups by depth=1 correctly', () => {
    const groups = groupByPrefix(sampleStats, 1);
    expect(groups).toHaveProperty('/api');
    expect(groups['/api'].totalCount).toBe(25);
  });
});

describe('sortedGroups', () => {
  test('returns array sorted by totalCount descending', () => {
    const groups = groupByPrefix(sampleStats, 2);
    const sorted = sortedGroups(groups);
    expect(Array.isArray(sorted)).toBe(true);
    expect(sorted[0].totalCount).toBeGreaterThanOrEqual(sorted[1].totalCount);
  });

  test('first entry is /health with count 50', () => {
    const groups = groupByPrefix(sampleStats, 2);
    const sorted = sortedGroups(groups);
    expect(sorted[0].prefix).toBe('/health');
    expect(sorted[0].totalCount).toBe(50);
  });
});
