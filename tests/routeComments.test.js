const {
  setComment,
  setComments,
  getComment,
  getAllComments,
  removeComment,
  clearComments,
} = require('../src/routeComments');

beforeEach(() => clearComments());

describe('setComment / getComment', () => {
  test('stores and retrieves a comment', () => {
    setComment('GET', '/users', 'Returns all users');
    expect(getComment('GET', '/users')).toBe('Returns all users');
  });

  test('is case-insensitive on method', () => {
    setComment('post', '/login', 'Auth endpoint');
    expect(getComment('POST', '/login')).toBe('Auth endpoint');
  });

  test('trims whitespace from comment', () => {
    setComment('GET', '/ping', '  health check  ');
    expect(getComment('GET', '/ping')).toBe('health check');
  });

  test('returns null for unknown route', () => {
    expect(getComment('GET', '/nope')).toBeNull();
  });

  test('throws on missing args', () => {
    expect(() => setComment('', '/x', 'hi')).toThrow();
    expect(() => setComment('GET', '', 'hi')).toThrow();
    expect(() => setComment('GET', '/x', 42)).toThrow();
  });
});

describe('setComments', () => {
  test('bulk sets multiple comments', () => {
    setComments([
      { method: 'GET', path: '/a', comment: 'alpha' },
      { method: 'DELETE', path: '/b', comment: 'beta' },
    ]);
    expect(getComment('GET', '/a')).toBe('alpha');
    expect(getComment('DELETE', '/b')).toBe('beta');
  });

  test('throws if not an array', () => {
    expect(() => setComments({ method: 'GET', path: '/x', comment: 'y' })).toThrow();
  });
});

describe('getAllComments', () => {
  test('returns all stored comments', () => {
    setComment('GET', '/users', 'list users');
    setComment('POST', '/users', 'create user');
    const all = getAllComments();
    expect(all).toHaveLength(2);
    expect(all.map(e => e.path)).toContain('/users');
  });

  test('returns empty array when none set', () => {
    expect(getAllComments()).toEqual([]);
  });
});

describe('removeComment', () => {
  test('removes an existing comment', () => {
    setComment('GET', '/x', 'to remove');
    expect(removeComment('GET', '/x')).toBe(true);
    expect(getComment('GET', '/x')).toBeNull();
  });

  test('returns false for non-existent comment', () => {
    expect(removeComment('GET', '/ghost')).toBe(false);
  });
});

describe('clearComments', () => {
  test('removes all comments', () => {
    setComment('GET', '/a', 'a');
    setComment('POST', '/b', 'b');
    clearComments();
    expect(getAllComments()).toEqual([]);
  });
});
