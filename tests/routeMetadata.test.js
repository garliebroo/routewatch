const { setMeta, setMetaBulk, getMeta, getAllMeta, removeMeta, reset, buildKey } = require('../src/routeMetadata');

beforeEach(() => reset());

describe('buildKey', () => {
  it('uppercases method and joins with colon', () => {
    expect(buildKey('get', '/users')).toBe('GET:/users');
    expect(buildKey('POST', '/items')).toBe('POST:/items');
  });
});

describe('setMeta / getMeta', () => {
  it('stores and retrieves a single key', () => {
    setMeta('GET', '/users', 'owner', 'auth-team');
    expect(getMeta('GET', '/users', 'owner')).toBe('auth-team');
  });

  it('returns undefined for missing route', () => {
    expect(getMeta('GET', '/nope', 'owner')).toBeUndefined();
  });

  it('returns full meta object when no key specified', () => {
    setMeta('GET', '/users', 'owner', 'team-a');
    setMeta('GET', '/users', 'version', 2);
    const meta = getMeta('GET', '/users');
    expect(meta).toEqual({ owner: 'team-a', version: 2 });
  });

  it('overwrites existing key', () => {
    setMeta('GET', '/users', 'owner', 'old');
    setMeta('GET', '/users', 'owner', 'new');
    expect(getMeta('GET', '/users', 'owner')).toBe('new');
  });
});

describe('setMetaBulk', () => {
  it('merges multiple keys at once', () => {
    setMetaBulk('POST', '/items', { owner: 'team-b', stable: true });
    expect(getMeta('POST', '/items', 'owner')).toBe('team-b');
    expect(getMeta('POST', '/items', 'stable')).toBe(true);
  });

  it('merges with existing meta without overwriting unrelated keys', () => {
    setMeta('GET', '/ping', 'version', 1);
    setMetaBulk('GET', '/ping', { owner: 'ops' });
    expect(getMeta('GET', '/ping', 'version')).toBe(1);
    expect(getMeta('GET', '/ping', 'owner')).toBe('ops');
  });
});

describe('getAllMeta', () => {
  it('returns all routes and their metadata', () => {
    setMeta('GET', '/a', 'x', 1);
    setMeta('POST', '/b', 'y', 2);
    const all = getAllMeta();
    expect(all['GET:/a']).toEqual({ x: 1 });
    expect(all['POST:/b']).toEqual({ y: 2 });
  });

  it('returns empty object when nothing stored', () => {
    expect(getAllMeta()).toEqual({});
  });
});

describe('removeMeta', () => {
  it('removes a specific key', () => {
    setMeta('GET', '/z', 'k', 'v');
    removeMeta('GET', '/z', 'k');
    expect(getMeta('GET', '/z', 'k')).toBeUndefined();
  });

  it('removes entire route entry when no key given', () => {
    setMeta('DELETE', '/gone', 'info', 'yes');
    removeMeta('DELETE', '/gone');
    expect(getMeta('DELETE', '/gone')).toBeUndefined();
  });

  it('returns false for missing route', () => {
    expect(removeMeta('GET', '/missing')).toBe(false);
  });
});

describe('reset', () => {
  it('clears all metadata', () => {
    setMeta('GET', '/x', 'a', 1);
    reset();
    expect(getAllMeta()).toEqual({});
  });
});
