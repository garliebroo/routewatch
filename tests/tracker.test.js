const { record, getStats, reset } = require('../src/tracker');

describe('tracker', () => {
  beforeEach(() => {
    reset();
  });

  describe('record', () => {
    it('records a basic route hit', () => {
      record('GET', '/api/users', 200, 45);
      const stats = getStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toMatchObject({
        method: 'GET',
        path: '/api/users',
        count: 1,
        avgDuration: 45,
      });
    });

    it('increments count for repeated route hits', () => {
      record('GET', '/api/users', 200, 40);
      record('GET', '/api/users', 200, 60);
      const stats = getStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].count).toBe(2);
    });

    it('calculates average duration correctly', () => {
      record('GET', '/api/users', 200, 40);
      record('GET', '/api/users', 200, 60);
      const stats = getStats();
      expect(stats[0].avgDuration).toBe(50);
    });

    it('tracks different methods on the same path separately', () => {
      record('GET', '/api/users', 200, 30);
      record('POST', '/api/users', 201, 80);
      const stats = getStats();
      expect(stats).toHaveLength(2);
    });

    it('tracks multiple distinct routes', () => {
      record('GET', '/api/users', 200, 30);
      record('GET', '/api/posts', 200, 50);
      record('DELETE', '/api/users/:id', 204, 20);
      const stats = getStats();
      expect(stats).toHaveLength(3);
    });

    it('tracks status codes', () => {
      record('GET', '/api/users', 200, 30);
      record('GET', '/api/users', 404, 10);
      const stats = getStats();
      expect(stats[0].statusCodes).toEqual(expect.objectContaining({ 200: 1, 404: 1 }));
    });

    it('tracks the last hit timestamp', () => {
      const before = Date.now();
      record('GET', '/api/users', 200, 30);
      const after = Date.now();
      const stats = getStats();
      expect(stats[0].lastHit).toBeGreaterThanOrEqual(before);
      expect(stats[0].lastHit).toBeLessThanOrEqual(after);
    });
  });

  describe('getStats', () => {
    it('returns an empty array when no routes recorded', () => {
      expect(getStats()).toEqual([]);
    });

    it('returns stats sorted by count descending', () => {
      record('GET', '/api/posts', 200, 20);
      record('GET', '/api/users', 200, 20);
      record('GET', '/api/users', 200, 20);
      const stats = getStats();
      expect(stats[0].path).toBe('/api/users');
      expect(stats[1].path).toBe('/api/posts');
    });
  });

  describe('reset', () => {
    it('clears all recorded stats', () => {
      record('GET', '/api/users', 200, 30);
      reset();
      expect(getStats()).toEqual([]);
    });
  });
});
