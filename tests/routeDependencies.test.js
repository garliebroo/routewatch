const {
  setDependency,
  setDependencies,
  getDependency,
  getAllDependencies,
  addDep,
  removeDependency,
  findDependents,
  reset
} = require('../src/routeDependencies');

beforeEach(() => reset());

describe('setDependency / getDependency', () => {
  test('stores and retrieves a single dependency entry', () => {
    setDependency('GET', '/users', ['db:users']);
    const result = getDependency('GET', '/users');
    expect(result).not.toBeNull();
    expect(result.method).toBe('GET');
    expect(result.path).toBe('/users');
    expect(result.dependencies).toEqual(['db:users']);
  });

  test('returns null for unknown route', () => {
    expect(getDependency('POST', '/unknown')).toBeNull();
  });

  test('normalizes method to uppercase', () => {
    setDependency('post', '/login', ['auth-service']);
    const result = getDependency('POST', '/login');
    expect(result).not.toBeNull();
    expect(result.method).toBe('POST');
  });

  test('wraps single string dependency in array', () => {
    setDependency('GET', '/ping', 'health-service');
    const result = getDependency('GET', '/ping');
    expect(result.dependencies).toEqual(['health-service']);
  });
});

describe('setDependencies', () => {
  test('registers multiple entries at once', () => {
    setDependencies([
      { method: 'GET', path: '/a', dependencies: ['svc-a'] },
      { method: 'POST', path: '/b', dependencies: ['svc-b'] }
    ]);
    expect(getDependency('GET', '/a').dependencies).toEqual(['svc-a']);
    expect(getDependency('POST', '/b').dependencies).toEqual(['svc-b']);
  });
});

describe('addDep', () => {
  test('adds a dep to existing entry', () => {
    setDependency('GET', '/orders', ['db:orders']);
    addDep('GET', '/orders', 'cache');
    expect(getDependency('GET', '/orders').dependencies).toContain('cache');
  });

  test('does not duplicate deps', () => {
    setDependency('GET', '/orders', ['db:orders']);
    addDep('GET', '/orders', 'db:orders');
    expect(getDependency('GET', '/orders').dependencies).toHaveLength(1);
  });

  test('creates entry if not exists', () => {
    addDep('DELETE', '/items', 'db:items');
    expect(getDependency('DELETE', '/items')).not.toBeNull();
  });
});

describe('removeDependency', () => {
  test('removes an existing entry', () => {
    setDependency('GET', '/remove-me', ['x']);
    expect(removeDependency('GET', '/remove-me')).toBe(true);
    expect(getDependency('GET', '/remove-me')).toBeNull();
  });

  test('returns false for non-existent entry', () => {
    expect(removeDependency('GET', '/ghost')).toBe(false);
  });
});

describe('findDependents', () => {
  test('finds all routes depending on a service', () => {
    setDependency('GET', '/a', ['shared-db']);
    setDependency('POST', '/b', ['shared-db', 'auth']);
    setDependency('GET', '/c', ['auth']);
    const results = findDependents('shared-db');
    expect(results).toHaveLength(2);
    expect(results.map(r => r.path)).toContain('/a');
    expect(results.map(r => r.path)).toContain('/b');
  });

  test('returns empty array when no matches', () => {
    expect(findDependents('nonexistent')).toEqual([]);
  });
});

describe('getAllDependencies', () => {
  test('returns all registered entries', () => {
    setDependency('GET', '/x', ['a']);
    setDependency('POST', '/y', ['b']);
    expect(getAllDependencies()).toHaveLength(2);
  });
});

describe('reset', () => {
  test('clears all entries', () => {
    setDependency('GET', '/z', ['svc']);
    reset();
    expect(getAllDependencies()).toHaveLength(0);
  });
});
