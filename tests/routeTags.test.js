const { setTag, setTags, getTag, getAllTags, removeTag, findByTag, findByTags, reset } = require('../src/routeTags');

beforeEach(() => reset());

describe('setTag / getTag', () => {
  it('stores and retrieves a tag list', () => {
    setTag('GET', '/users', ['auth', 'public']);
    expect(getTag('GET', '/users')).toEqual(['auth', 'public']);
  });

  it('accepts a single string tag', () => {
    setTag('POST', '/login', 'auth');
    expect(getTag('POST', '/login')).toEqual(['auth']);
  });

  it('is case-insensitive for method', () => {
    setTag('get', '/items', ['read']);
    expect(getTag('GET', '/items')).toEqual(['read']);
  });

  it('returns empty array for unknown route', () => {
    expect(getTag('GET', '/missing')).toEqual([]);
  });
});

describe('setTags', () => {
  it('bulk-registers multiple routes', () => {
    setTags([
      { method: 'GET', path: '/a', tags: ['x'] },
      { method: 'POST', path: '/b', tags: ['y', 'z'] },
    ]);
    expect(getTag('GET', '/a')).toEqual(['x']);
    expect(getTag('POST', '/b')).toEqual(['y', 'z']);
  });
});

describe('getAllTags', () => {
  it('returns all registered tag entries', () => {
    setTag('GET', '/a', ['x']);
    setTag('DELETE', '/b', ['y']);
    const all = getAllTags();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toEqual(['x']);
  });
});

describe('removeTag', () => {
  it('removes a tag entry', () => {
    setTag('GET', '/users', ['auth']);
    removeTag('GET', '/users');
    expect(getTag('GET', '/users')).toEqual([]);
  });

  it('returns false for non-existent route', () => {
    expect(removeTag('GET', '/nope')).toBe(false);
  });
});

describe('findByTag', () => {
  it('returns routes matching a tag', () => {
    setTag('GET', '/users', ['auth', 'admin']);
    setTag('POST', '/posts', ['auth']);
    setTag('GET', '/public', ['open']);
    const results = findByTag('auth');
    expect(results).toHaveLength(2);
    expect(results.every(r => r.tags.includes('auth'))).toBe(true);
  });

  it('returns empty array when no match', () => {
    setTag('GET', '/x', ['foo']);
    expect(findByTag('bar')).toEqual([]);
  });
});

describe('findByTags', () => {
  it('returns routes matching all provided tags', () => {
    setTag('GET', '/users', ['auth', 'admin']);
    setTag('POST', '/posts', ['auth']);
    setTag('GET', '/public', ['open']);
    const results = findByTags(['auth', 'admin']);
    expect(results).toHaveLength(1);
    expect(results[0].tags).toEqual(['auth', 'admin']);
  });

  it('returns empty array when no route matches all tags', () => {
    setTag('GET', '/x', ['foo', 'bar']);
    expect(findByTags(['foo', 'baz'])).toEqual([]);
  });

  it('returns empty array when no routes are registered', () => {
    expect(findByTags(['auth'])).toEqual([]);
  });
});

describe('reset', () => {
  it('clears all tags', () => {
    setTag('GET', '/a', ['x']);
    reset();
    expect(getAllTags()).toEqual({});
  });
});
