const { diffSnapshots, printDiff } = require('../src/snapshotDiff');

const snapA = {
  label: 'before',
  timestamp: '2024-01-01T00:00:00.000Z',
  stats: {
    'GET /users':  { count: 10, avgMs: 50, errorCount: 0 },
    'POST /items': { count: 5,  avgMs: 80, errorCount: 1 },
    'DELETE /old': { count: 2,  avgMs: 30, errorCount: 0 },
  },
};

const snapB = {
  label: 'after',
  timestamp: '2024-01-02T00:00:00.000Z',
  stats: {
    'GET /users':  { count: 20, avgMs: 55, errorCount: 2 },
    'POST /items': { count: 5,  avgMs: 80, errorCount: 1 },
    'GET /new':    { count: 3,  avgMs: 20, errorCount: 0 },
  },
};

describe('diffSnapshots', () => {
  let diff;

  beforeEach(() => {
    diff = diffSnapshots(snapA, snapB);
  });

  it('detects added routes', () => {
    const added = diff.find(d => d.route === 'GET /new');
    expect(added).toBeDefined();
    expect(added.status).toBe('added');
    expect(added.before).toBeNull();
    expect(added.after.count).toBe(3);
  });

  it('detects removed routes', () => {
    const removed = diff.find(d => d.route === 'DELETE /old');
    expect(removed).toBeDefined();
    expect(removed.status).toBe('removed');
    expect(removed.after).toBeNull();
  });

  it('detects changed routes with correct deltas', () => {
    const changed = diff.find(d => d.route === 'GET /users');
    expect(changed.status).toBe('changed');
    expect(changed.delta.count).toBe(10);
    expect(changed.delta.avgMs).toBe(5);
    expect(changed.delta.errorCount).toBe(2);
  });

  it('marks unchanged routes correctly', () => {
    const unchanged = diff.find(d => d.route === 'POST /items');
    expect(unchanged.status).toBe('unchanged');
  });

  it('handles empty snapshots gracefully', () => {
    const result = diffSnapshots({ stats: {} }, { stats: {} });
    expect(result).toEqual([]);
  });

  it('handles missing stats key', () => {
    const result = diffSnapshots({}, {});
    expect(result).toEqual([]);
  });
});

describe('printDiff', () => {
  it('calls console.log without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const diff = diffSnapshots(snapA, snapB);
    expect(() => printDiff(diff)).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
