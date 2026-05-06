const { filterByMethod, filterByMinCount, filterByAvgTime, sortStats } = require('../src/filterStats');

const sampleStats = {
  'GET /users': { count: 10, totalTime: 500 },
  'POST /users': { count: 3, totalTime: 900 },
  'GET /posts': { count: 7, totalTime: 210 },
  'DELETE /users/1': { count: 1, totalTime: 80 },
};

describe('filterByMethod', () => {
  it('returns only GET routes', () => {
    const result = filterByMethod(sampleStats, 'GET');
    expect(Object.keys(result)).toEqual(['GET /users', 'GET /posts']);
  });

  it('returns only POST routes', () => {
    const result = filterByMethod(sampleStats, 'POST');
    expect(Object.keys(result)).toEqual(['POST /users']);
  });

  it('is case-insensitive', () => {
    const result = filterByMethod(sampleStats, 'delete');
    expect(Object.keys(result)).toEqual(['DELETE /users/1']);
  });

  it('returns empty object for unknown method', () => {
    const result = filterByMethod(sampleStats, 'PATCH');
    expect(result).toEqual({});
  });
});

describe('filterByMinCount', () => {
  it('filters routes with count >= 7', () => {
    const result = filterByMinCount(sampleStats, 7);
    expect(Object.keys(result)).toEqual(['GET /users', 'GET /posts']);
  });

  it('returns all routes when minCount is 1', () => {
    const result = filterByMinCount(sampleStats, 1);
    expect(Object.keys(result)).toHaveLength(4);
  });

  it('returns empty when minCount exceeds all counts', () => {
    const result = filterByMinCount(sampleStats, 100);
    expect(result).toEqual({});
  });
});

describe('filterByAvgTime', () => {
  it('returns routes with avg time > 50ms', () => {
    const result = filterByAvgTime(sampleStats, 50);
    // GET /users: 50ms avg, POST /users: 300ms, GET /posts: 30ms, DELETE: 80ms
    expect(result).toHaveProperty('POST /users');
    expect(result).toHaveProperty('DELETE /users/1');
    expect(result).not.toHaveProperty('GET /posts');
  });

  it('returns empty when threshold is very high', () => {
    const result = filterByAvgTime(sampleStats, 10000);
    expect(result).toEqual({});
  });

  it('handles missing totalTime gracefully', () => {
    const stats = { 'GET /empty': { count: 5 } };
    const result = filterByAvgTime(stats, 10);
    expect(result).toEqual({});
  });
});

describe('sortStats', () => {
  it('sorts by count descending by default', () => {
    const result = sortStats(sampleStats);
    expect(result[0][0]).toBe('GET /users');
    expect(result[result.length - 1][0]).toBe('DELETE /users/1');
  });

  it('sorts by count ascending', () => {
    const result = sortStats(sampleStats, 'count', 'asc');
    expect(result[0][0]).toBe('DELETE /users/1');
  });

  it('sorts by avgTime descending', () => {
    const result = sortStats(sampleStats, 'avgTime', 'desc');
    // POST /users: 300ms avg is highest
    expect(result[0][0]).toBe('POST /users');
  });

  it('includes avgTime in returned entries', () => {
    const result = sortStats(sampleStats, 'avgTime');
    result.forEach(([, data]) => {
      expect(data).toHaveProperty('avgTime');
    });
  });
});
