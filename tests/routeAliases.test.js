const {
  setAlias,
  setAliases,
  resolveAlias,
  getAllAliases,
  removeAlias,
  reset,
} = require('../src/routeAliases');

beforeEach(() => {
  reset();
});

describe('setAlias / resolveAlias', () => {
  test('registers and resolves a single alias', () => {
    setAlias('/api/users/:id', 'Get User');
    expect(resolveAlias('/api/users/:id')).toBe('Get User');
  });

  test('falls back to route when no alias registered', () => {
    expect(resolveAlias('/api/unknown')).toBe('/api/unknown');
  });

  test('throws on non-string route', () => {
    expect(() => setAlias(123, 'name')).toThrow(TypeError);
  });

  test('throws on non-string alias', () => {
    expect(() => setAlias('/route', null)).toThrow(TypeError);
  });
});

describe('setAliases', () => {
  test('registers multiple aliases from object', () => {
    setAliases({
      '/api/users': 'List Users',
      '/api/posts': 'List Posts',
    });
    expect(resolveAlias('/api/users')).toBe('List Users');
    expect(resolveAlias('/api/posts')).toBe('List Posts');
  });

  test('throws if map is not an object', () => {
    expect(() => setAliases('bad')).toThrow(TypeError);
    expect(() => setAliases(null)).toThrow(TypeError);
  });
});

describe('getAllAliases', () => {
  test('returns empty object when no aliases set', () => {
    expect(getAllAliases()).toEqual({});
  });

  test('returns all registered aliases', () => {
    setAlias('/a', 'Alpha');
    setAlias('/b', 'Beta');
    expect(getAllAliases()).toEqual({ '/a': 'Alpha', '/b': 'Beta' });
  });
});

describe('removeAlias', () => {
  test('removes a specific alias', () => {
    setAlias('/api/items', 'Items');
    removeAlias('/api/items');
    expect(resolveAlias('/api/items')).toBe('/api/items');
  });

  test('does not throw when removing non-existent alias', () => {
    expect(() => removeAlias('/nope')).not.toThrow();
  });
});

describe('reset', () => {
  test('clears all aliases', () => {
    setAliases({ '/x': 'X', '/y': 'Y' });
    reset();
    expect(getAllAliases()).toEqual({});
  });
});
