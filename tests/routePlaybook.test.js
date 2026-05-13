const {
  addRoute,
  addRoutes,
  getPlaybook,
  getAllPlaybooks,
  hasRoute,
  removePlaybook,
  reset,
} = require('../src/routePlaybook');

beforeEach(() => reset());

describe('addRoute / getPlaybook', () => {
  it('adds a route to a named playbook', () => {
    addRoute('v1', 'GET', '/users');
    const book = getPlaybook('v1');
    expect(book).toHaveLength(1);
    expect(book[0]).toMatchObject({ method: 'GET', path: '/users' });
  });

  it('stores extra meta on the route entry', () => {
    addRoute('v1', 'POST', '/users', { description: 'Create user', owner: 'team-a' });
    const [entry] = getPlaybook('v1');
    expect(entry.description).toBe('Create user');
    expect(entry.owner).toBe('team-a');
  });

  it('normalises method to uppercase', () => {
    addRoute('v1', 'delete', '/users/:id');
    const [entry] = getPlaybook('v1');
    expect(entry.method).toBe('DELETE');
  });

  it('returns empty array for unknown playbook', () => {
    expect(getPlaybook('nope')).toEqual([]);
  });
});

describe('addRoutes', () => {
  it('bulk-adds multiple routes', () => {
    addRoutes('v2', [
      { method: 'GET', path: '/items' },
      { method: 'POST', path: '/items' },
      { method: 'DELETE', path: '/items/:id', description: 'Remove item' },
    ]);
    const book = getPlaybook('v2');
    expect(book).toHaveLength(3);
  });
});

describe('getAllPlaybooks', () => {
  it('returns all playbooks keyed by name', () => {
    addRoute('alpha', 'GET', '/a');
    addRoute('beta', 'GET', '/b');
    const all = getAllPlaybooks();
    expect(Object.keys(all)).toEqual(expect.arrayContaining(['alpha', 'beta']));
    expect(all.alpha).toHaveLength(1);
    expect(all.beta).toHaveLength(1);
  });
});

describe('hasRoute', () => {
  it('returns true when route exists in playbook', () => {
    addRoute('v1', 'GET', '/ping');
    expect(hasRoute('v1', 'GET', '/ping')).toBe(true);
  });

  it('returns false for missing route', () => {
    expect(hasRoute('v1', 'GET', '/missing')).toBe(false);
  });

  it('returns false for unknown playbook', () => {
    expect(hasRoute('ghost', 'GET', '/ping')).toBe(false);
  });
});

describe('removePlaybook', () => {
  it('removes a playbook entirely', () => {
    addRoute('temp', 'GET', '/x');
    removePlaybook('temp');
    expect(getPlaybook('temp')).toEqual([]);
    expect(getAllPlaybooks()).not.toHaveProperty('temp');
  });
});

describe('reset', () => {
  it('clears all playbooks', () => {
    addRoute('a', 'GET', '/a');
    addRoute('b', 'POST', '/b');
    reset();
    expect(getAllPlaybooks()).toEqual({});
  });
});
