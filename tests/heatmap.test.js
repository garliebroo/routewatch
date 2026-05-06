const { recordHit, getHeatmap, peakHour, reset } = require('../src/heatmap');

beforeEach(() => reset());

describe('recordHit', () => {
  test('initialises 24-slot array for new route', () => {
    recordHit('GET /api/users', new Date('2024-01-01T10:00:00'));
    const data = getHeatmap('GET /api/users');
    expect(data['GET /api/users']).toHaveLength(24);
  });

  test('increments correct hour slot', () => {
    recordHit('GET /api/users', new Date('2024-01-01T14:00:00'));
    recordHit('GET /api/users', new Date('2024-01-01T14:30:00'));
    const data = getHeatmap('GET /api/users');
    expect(data['GET /api/users'][14]).toBe(2);
  });

  test('defaults to current time when no timestamp given', () => {
    recordHit('POST /api/items');
    const data = getHeatmap('POST /api/items');
    const total = data['POST /api/items'].reduce((a, b) => a + b, 0);
    expect(total).toBe(1);
  });
});

describe('getHeatmap', () => {
  test('returns all routes when no argument', () => {
    recordHit('GET /a', new Date('2024-01-01T08:00:00'));
    recordHit('GET /b', new Date('2024-01-01T09:00:00'));
    const data = getHeatmap();
    expect(Object.keys(data)).toEqual(['GET /a', 'GET /b']);
  });

  test('returns zeroed array for unknown route', () => {
    const data = getHeatmap('DELETE /unknown');
    expect(data['DELETE /unknown']).toEqual(new Array(24).fill(0));
  });
});

describe('peakHour', () => {
  test('identifies hour with most hits', () => {
    recordHit('GET /stats', new Date('2024-01-01T03:00:00'));
    recordHit('GET /stats', new Date('2024-01-01T03:15:00'));
    recordHit('GET /stats', new Date('2024-01-01T03:45:00'));
    recordHit('GET /stats', new Date('2024-01-01T22:00:00'));
    const { hour, count } = peakHour('GET /stats');
    expect(hour).toBe(3);
    expect(count).toBe(3);
  });

  test('returns hour 0 count 0 for unknown route', () => {
    const { hour, count } = peakHour('GET /nope');
    expect(hour).toBe(0);
    expect(count).toBe(0);
  });
});

describe('reset', () => {
  test('clears all data', () => {
    recordHit('GET /x', new Date('2024-01-01T01:00:00'));
    reset();
    expect(getHeatmap()).toEqual({});
  });
});
