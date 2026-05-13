const {
  addEntry,
  addEntries,
  getChangelog,
  getAllChangelogs,
  summarizeChangelog,
  removeChangelog,
  reset,
  buildKey,
} = require('../src/routeChangelog');

beforeEach(() => reset());

describe('buildKey', () => {
  it('normalizes method to uppercase', () => {
    expect(buildKey('get', '/users')).toBe('GET:/users');
  });
});

describe('addEntry / getChangelog', () => {
  it('adds a single entry and retrieves it', () => {
    addEntry('GET', '/users', 'added', 'Initial route added');
    const log = getChangelog('GET', '/users');
    expect(log).toHaveLength(1);
    expect(log[0].type).toBe('added');
    expect(log[0].message).toBe('Initial route added');
  });

  it('returns empty array for unknown route', () => {
    expect(getChangelog('POST', '/unknown')).toEqual([]);
  });

  it('stores timestamp as ISO string', () => {
    addEntry('GET', '/ping', 'modified', 'Updated handler');
    const log = getChangelog('GET', '/ping');
    expect(log[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('accumulates multiple entries for same route', () => {
    addEntry('GET', '/items', 'added', 'Created');
    addEntry('GET', '/items', 'modified', 'Updated response shape');
    expect(getChangelog('GET', '/items')).toHaveLength(2);
  });

  it('stores optional meta', () => {
    addEntry('DELETE', '/items/:id', 'removed', 'Removed endpoint', { author: 'alice' });
    const log = getChangelog('DELETE', '/items/:id');
    expect(log[0].meta.author).toBe('alice');
  });
});

describe('addEntries', () => {
  it('adds multiple entries at once', () => {
    addEntries([
      { method: 'GET', path: '/a', type: 'added', message: 'Route A' },
      { method: 'POST', path: '/b', type: 'added', message: 'Route B' },
    ]);
    expect(getChangelog('GET', '/a')).toHaveLength(1);
    expect(getChangelog('POST', '/b')).toHaveLength(1);
  });
});

describe('getAllChangelogs', () => {
  it('returns all entries keyed by route', () => {
    addEntry('GET', '/x', 'added', 'X added');
    addEntry('POST', '/y', 'deprecated', 'Y deprecated');
    const all = getAllChangelogs();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/x']).toHaveLength(1);
  });
});

describe('summarizeChangelog', () => {
  it('counts entries by type', () => {
    addEntry('GET', '/z', 'added', 'Added');
    addEntry('GET', '/z', 'modified', 'Modified once');
    addEntry('GET', '/z', 'modified', 'Modified twice');
    const summary = summarizeChangelog('GET', '/z');
    expect(summary.total).toBe(3);
    expect(summary.counts.added).toBe(1);
    expect(summary.counts.modified).toBe(2);
  });
});

describe('removeChangelog', () => {
  it('removes entries for a route', () => {
    addEntry('GET', '/remove-me', 'added', 'temp');
    removeChangelog('GET', '/remove-me');
    expect(getChangelog('GET', '/remove-me')).toEqual([]);
  });
});

describe('reset', () => {
  it('clears all entries', () => {
    addEntry('GET', '/reset', 'added', 'test');
    reset();
    expect(getAllChangelogs()).toEqual({});
  });
});
