const { addEvent, addEvents, getLog, getAllLogs, filterByType, summarizeLog, reset } = require('../src/routeAuditLog');

beforeEach(() => reset());

describe('addEvent', () => {
  it('stores an event for a route', () => {
    addEvent('GET', '/api/users', { type: 'access', status: 200, duration: 50 });
    const log = getLog('GET', '/api/users');
    expect(log).toHaveLength(1);
    expect(log[0].type).toBe('access');
    expect(log[0].status).toBe(200);
  });

  it('adds a timestamp if not provided', () => {
    addEvent('POST', '/api/login', { type: 'access', status: 200, duration: 30 });
    const log = getLog('POST', '/api/login');
    expect(log[0].timestamp).toBeDefined();
  });

  it('preserves existing timestamp', () => {
    const ts = '2024-01-01T00:00:00.000Z';
    addEvent('GET', '/ping', { type: 'access', status: 200, duration: 5, timestamp: ts });
    expect(getLog('GET', '/ping')[0].timestamp).toBe(ts);
  });
});

describe('addEvents', () => {
  it('bulk adds multiple events', () => {
    addEvents([
      { method: 'GET', path: '/a', event: { type: 'access', status: 200, duration: 10 } },
      { method: 'POST', path: '/b', event: { type: 'error', status: 500, duration: 20 } }
    ]);
    expect(getLog('GET', '/a')).toHaveLength(1);
    expect(getLog('POST', '/b')).toHaveLength(1);
  });
});

describe('getLog / getAllLogs', () => {
  it('returns empty array for unknown route', () => {
    expect(getLog('DELETE', '/nope')).toEqual([]);
  });

  it('getAllLogs returns all routes', () => {
    addEvent('GET', '/x', { type: 'access', status: 200, duration: 1 });
    addEvent('GET', '/y', { type: 'slow', status: 200, duration: 600 });
    const all = getAllLogs();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe('filterByType', () => {
  it('filters events by type', () => {
    addEvent('GET', '/api', { type: 'access', status: 200, duration: 10 });
    addEvent('GET', '/api', { type: 'error', status: 500, duration: 20 });
    addEvent('GET', '/api', { type: 'error', status: 503, duration: 30 });
    const errors = filterByType('GET', '/api', 'error');
    expect(errors).toHaveLength(2);
  });
});

describe('summarizeLog', () => {
  it('returns totals and byType counts', () => {
    addEvent('GET', '/summary', { type: 'access', status: 200, duration: 5 });
    addEvent('GET', '/summary', { type: 'slow', status: 200, duration: 700 });
    addEvent('GET', '/summary', { type: 'error', status: 500, duration: 100 });
    const s = summarizeLog('GET', '/summary');
    expect(s.total).toBe(3);
    expect(s.byType.access).toBe(1);
    expect(s.byType.slow).toBe(1);
    expect(s.byType.error).toBe(1);
  });

  it('returns zero total for unknown route', () => {
    const s = summarizeLog('GET', '/unknown');
    expect(s.total).toBe(0);
    expect(s.byType).toEqual({});
  });
});

describe('reset', () => {
  it('clears all logs', () => {
    addEvent('GET', '/reset-test', { type: 'access', status: 200, duration: 1 });
    reset();
    expect(getAllLogs()).toEqual({});
  });
});
