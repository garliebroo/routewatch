const { formatDependencyRow, printDependenciesReport } = require('../src/dependenciesReporter');
const { setDependency, reset } = require('../src/routeDependencies');

function strip(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

beforeEach(() => reset());

describe('formatDependencyRow', () => {
  test('includes method, path and dependencies', () => {
    const row = formatDependencyRow({
      method: 'GET',
      path: '/users',
      dependencies: ['db:users', 'cache']
    });
    const plain = strip(row);
    expect(plain).toContain('GET');
    expect(plain).toContain('/users');
    expect(plain).toContain('db:users');
    expect(plain).toContain('cache');
  });

  test('shows (none) when dependencies are empty', () => {
    const row = formatDependencyRow({
      method: 'POST',
      path: '/ping',
      dependencies: []
    });
    expect(strip(row)).toContain('(none)');
  });

  test('uses → separator', () => {
    const row = formatDependencyRow({
      method: 'DELETE',
      path: '/item',
      dependencies: ['svc']
    });
    expect(strip(row)).toContain('→');
  });
});

describe('printDependenciesReport', () => {
  test('prints header and rows without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    setDependency('GET', '/api/users', ['db:users']);
    setDependency('POST', '/api/auth', ['auth-service', 'db:sessions']);
    printDependenciesReport();
    const output = spy.mock.calls.map(c => strip(c[0] || '')).join('\n');
    expect(output).toContain('Route Dependencies');
    expect(output).toContain('/api/users');
    expect(output).toContain('/api/auth');
    spy.mockRestore();
  });

  test('prints empty message when no dependencies registered', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printDependenciesReport();
    const output = spy.mock.calls.map(c => strip(c[0] || '')).join('\n');
    expect(output).toContain('No dependencies registered');
    spy.mockRestore();
  });

  test('accepts an explicit entries array', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printDependenciesReport([
      { method: 'GET', path: '/explicit', dependencies: ['x'] }
    ]);
    const output = spy.mock.calls.map(c => strip(c[0] || '')).join('\n');
    expect(output).toContain('/explicit');
    spy.mockRestore();
  });
});
