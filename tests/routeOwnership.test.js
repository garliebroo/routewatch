const {
  setOwner,
  setOwners,
  getOwner,
  getAllOwners,
  removeOwner,
  groupByOwner,
  reset,
} = require('../src/routeOwnership');

beforeEach(() => reset());

describe('setOwner / getOwner', () => {
  test('stores and retrieves a single owner', () => {
    setOwner('GET', '/users', 'team-alpha');
    const result = getOwner('GET', '/users');
    expect(result).toEqual({ method: 'GET', path: '/users', owner: 'team-alpha' });
  });

  test('is case-insensitive for method', () => {
    setOwner('get', '/items', 'team-beta');
    const result = getOwner('GET', '/items');
    expect(result).not.toBeNull();
    expect(result.owner).toBe('team-beta');
  });

  test('returns null for unknown route', () => {
    expect(getOwner('POST', '/unknown')).toBeNull();
  });
});

describe('setOwners', () => {
  test('bulk sets multiple owners', () => {
    setOwners([
      { method: 'GET', path: '/a', owner: 'alice' },
      { method: 'POST', path: '/b', owner: 'bob' },
    ]);
    expect(getOwner('GET', '/a').owner).toBe('alice');
    expect(getOwner('POST', '/b').owner).toBe('bob');
  });
});

describe('getAllOwners', () => {
  test('returns all entries', () => {
    setOwner('GET', '/x', 'team-x');
    setOwner('DELETE', '/y', 'team-y');
    const all = getAllOwners();
    expect(all).toHaveLength(2);
  });

  test('returns empty array when no owners set', () => {
    expect(getAllOwners()).toEqual([]);
  });
});

describe('removeOwner', () => {
  test('removes an existing owner', () => {
    setOwner('GET', '/remove-me', 'temp-team');
    const removed = removeOwner('GET', '/remove-me');
    expect(removed).toBe(true);
    expect(getOwner('GET', '/remove-me')).toBeNull();
  });

  test('returns false for non-existent entry', () => {
    expect(removeOwner('GET', '/nope')).toBe(false);
  });
});

describe('groupByOwner', () => {
  test('groups routes by owner name', () => {
    setOwners([
      { method: 'GET', path: '/a', owner: 'alice' },
      { method: 'POST', path: '/b', owner: 'alice' },
      { method: 'GET', path: '/c', owner: 'bob' },
    ]);
    const groups = groupByOwner();
    expect(groups['alice']).toHaveLength(2);
    expect(groups['bob']).toHaveLength(1);
  });

  test('returns empty object when no owners', () => {
    expect(groupByOwner()).toEqual({});
  });
});

describe('reset', () => {
  test('clears all ownership data', () => {
    setOwner('GET', '/z', 'someone');
    reset();
    expect(getAllOwners()).toHaveLength(0);
  });
});
