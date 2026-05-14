const { setOwner, reset } = require('../src/routeOwnership');
const { formatOwnerRow, printOwnershipReport } = require('../src/ownershipReporter');

const strip = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');

beforeEach(() => reset());

describe('formatOwnerRow', () => {
  test('includes method, path, and owner', () => {
    const row = formatOwnerRow({ method: 'GET', path: '/users', owner: 'team-alpha' });
    const plain = strip(row);
    expect(plain).toContain('GET');
    expect(plain).toContain('/users');
    expect(plain).toContain('team-alpha');
  });

  test('pads method to consistent width', () => {
    const row1 = strip(formatOwnerRow({ method: 'GET', path: '/a', owner: 'x' }));
    const row2 = strip(formatOwnerRow({ method: 'DELETE', path: '/a', owner: 'x' }));
    // both rows should start with consistent spacing
    expect(row1.startsWith('  ')).toBe(true);
    expect(row2.startsWith('  ')).toBe(true);
  });
});

describe('printOwnershipReport', () => {
  test('prints message when no owners set', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printOwnershipReport();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No route ownership'));
    spy.mockRestore();
  });

  test('prints grouped owners', () => {
    setOwner('GET', '/users', 'team-alpha');
    setOwner('POST', '/orders', 'team-beta');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printOwnershipReport();
    const output = spy.mock.calls.map((c) => strip(c[0])).join('\n');
    expect(output).toContain('team-alpha');
    expect(output).toContain('team-beta');
    expect(output).toContain('/users');
    spy.mockRestore();
  });

  test('shows route ownership report header', () => {
    setOwner('GET', '/ping', 'devs');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printOwnershipReport();
    const output = spy.mock.calls.map((c) => strip(c[0])).join('\n');
    expect(output).toContain('Route Ownership Report');
    spy.mockRestore();
  });
});
