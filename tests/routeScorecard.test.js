const { scoreRoute, getScorecards, WEIGHTS } = require('../src/routeScorecard');
const routeHealth = require('../src/routeHealth');
const statusTracker = require('../src/statusTracker');

jest.mock('../src/routeHealth');
jest.mock('../src/statusTracker');

describe('routeScorecard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WEIGHTS', () => {
    it('should sum to 1', () => {
      const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1);
    });
  });

  describe('scoreRoute', () => {
    it('returns grade A for a healthy route with no errors and fast response', () => {
      routeHealth.getHealth.mockReturnValue({ score: 100, avgTime: 50 });
      statusTracker.getStatusStats.mockReturnValue({
        total: 100,
        counts: { '2xx': 100, '4xx': 0, '5xx': 0 },
      });

      const result = scoreRoute('GET', '/api/users');
      expect(result.grade).toBe('A');
      expect(result.composite).toBeGreaterThanOrEqual(85);
      expect(result.method).toBe('GET');
      expect(result.path).toBe('/api/users');
      expect(result.key).toBe('GET /api/users');
    });

    it('returns grade F for a very unhealthy route', () => {
      routeHealth.getHealth.mockReturnValue({ score: 10, avgTime: 2000 });
      statusTracker.getStatusStats.mockReturnValue({
        total: 100,
        counts: { '2xx': 20, '4xx': 40, '5xx': 40 },
      });

      const result = scoreRoute('POST', '/api/broken');
      expect(result.grade).toBe('F');
      expect(result.composite).toBeLessThan(40);
    });

    it('handles missing health data gracefully', () => {
      routeHealth.getHealth.mockReturnValue(null);
      statusTracker.getStatusStats.mockReturnValue(null);

      const result = scoreRoute('GET', '/api/unknown');
      expect(result).toHaveProperty('grade');
      expect(result.composite).toBeGreaterThan(0);
    });

    it('handles zero total requests in status stats', () => {
      routeHealth.getHealth.mockReturnValue({ score: 80, avgTime: 100 });
      statusTracker.getStatusStats.mockReturnValue({
        total: 0,
        counts: {},
      });

      const result = scoreRoute('DELETE', '/api/items');
      expect(result.errorScore).toBe(100);
    });

    it('includes all expected fields', () => {
      routeHealth.getHealth.mockReturnValue({ score: 75, avgTime: 200 });
      statusTracker.getStatusStats.mockReturnValue({
        total: 50,
        counts: { '2xx': 45, '4xx': 5, '5xx': 0 },
      });

      const result = scoreRoute('PUT', '/api/data');
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('method');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('healthScore');
      expect(result).toHaveProperty('errorScore');
      expect(result).toHaveProperty('timeScore');
      expect(result).toHaveProperty('composite');
      expect(result).toHaveProperty('grade');
    });
  });

  describe('getScorecards', () => {
    it('returns a scorecard for each route', () => {
      routeHealth.getHealth.mockReturnValue({ score: 90, avgTime: 80 });
      statusTracker.getStatusStats.mockReturnValue({
        total: 10,
        counts: { '2xx': 10 },
      });

      const routes = [
        { method: 'GET', path: '/a' },
        { method: 'POST', path: '/b' },
      ];

      const results = getScorecards(routes);
      expect(results).toHaveLength(2);
      expect(results[0].path).toBe('/a');
      expect(results[1].path).toBe('/b');
    });

    it('returns empty array for no routes', () => {
      expect(getScorecards([])).toEqual([]);
    });
  });
});
