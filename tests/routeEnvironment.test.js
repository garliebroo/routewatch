const {
  setEnvironment,
  setEnvironments,
  getEnvironment,
  getAllEnvironments,
  filterByEnv,
  isEnabled,
  removeEnvironment,
  reset,
} = require('../src/routeEnvironment');

beforeEach(() => reset());

describe('setEnvironment / getEnvironment', () => {
  it('stores and retrieves an environment entry', () => {
    setEnvironment('GET', '/users', { env: 'production', enabled: true });
    const entry = getEnvironment('GET', '/users');
    expect(entry).not.toBeNull();
    expect(entry.env).toBe('production');
    expect(entry.enabled).toBe(true);
  });

  it('normalises method to uppercase', () => {
    setEnvironment('post', '/items', { env: 'staging' });
    expect(getEnvironment('POST', '/items')).not.toBeNull();
  });

  it('returns null for unknown route', () => {
    expect(getEnvironment('GET', '/nope')).toBeNull();
  });

  it('defaults enabled to true and env to all when not provided', () => {
    setEnvironment('GET', '/ping', {});
    const entry = getEnvironment('GET', '/ping');
    expect(entry.enabled).toBe(true);
    expect(entry.env).toBe('all');
  });

  it('stores optional notes', () => {
    setEnvironment('DELETE', '/admin', { env: 'staging', notes: 'staging only' });
    expect(getEnvironment('DELETE', '/admin').notes).toBe('staging only');
  });
});

describe('setEnvironments', () => {
  it('bulk-sets multiple entries', () => {
    setEnvironments([
      { method: 'GET', path: '/a', env: 'production' },
      { method: 'POST', path: '/b', env: 'staging' },
    ]);
    expect(getEnvironment('GET', '/a').env).toBe('production');
    expect(getEnvironment('POST', '/b').env).toBe('staging');
  });
});

describe('getAllEnvironments', () => {
  it('returns all stored entries', () => {
    setEnvironment('GET', '/x', { env: 'production' });
    setEnvironment('GET', '/y', { env: 'staging' });
    expect(getAllEnvironments()).toHaveLength(2);
  });
});

describe('filterByEnv', () => {
  it('returns routes matching the given env or all', () => {
    setEnvironment('GET', '/prod-only', { env: 'production' });
    setEnvironment('GET', '/stage-only', { env: 'staging' });
    setEnvironment('GET', '/everywhere', { env: 'all' });
    const results = filterByEnv('production');
    expect(results.map((r) => r.path)).toEqual(
      expect.arrayContaining(['/prod-only', '/everywhere'])
    );
    expect(results.map((r) => r.path)).not.toContain('/stage-only');
  });
});

describe('isEnabled', () => {
  it('returns true when route matches current env', () => {
    setEnvironment('GET', '/route', { env: 'production', enabled: true });
    expect(isEnabled('GET', '/route', 'production')).toBe(true);
  });

  it('returns false when route is disabled', () => {
    setEnvironment('GET', '/route', { env: 'production', enabled: false });
    expect(isEnabled('GET', '/route', 'production')).toBe(false);
  });

  it('returns false when env does not match', () => {
    setEnvironment('GET', '/route', { env: 'staging', enabled: true });
    expect(isEnabled('GET', '/route', 'production')).toBe(false);
  });

  it('returns true for unknown routes (permissive default)', () => {
    expect(isEnabled('GET', '/unknown', 'production')).toBe(true);
  });
});

describe('removeEnvironment', () => {
  it('removes an entry', () => {
    setEnvironment('GET', '/temp', { env: 'staging' });
    removeEnvironment('GET', '/temp');
    expect(getEnvironment('GET', '/temp')).toBeNull();
  });
});
