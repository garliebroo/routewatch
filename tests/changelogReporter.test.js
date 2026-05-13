const { addEntry, reset } = require('../src/routeChangelog');
const { colorType, formatChangelogRow, printChangelogReport } = require('../src/changelogReporter');

const strip = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');

beforeEach(() => reset());

describe('colorType', () => {
  it('returns a string containing the type name uppercased', () => {
    expect(strip(colorType('added'))).toBe('ADDED');
    expect(strip(colorType('deprecated'))).toBe('DEPRECATED');
    expect(strip(colorType('removed'))).toBe('REMOVED');
    expect(strip(colorType('modified'))).toBe('MODIFIED');
  });

  it('handles unknown types gracefully', () => {
    expect(strip(colorType('custom'))).toBe('CUSTOM');
  });
});

describe('formatChangelogRow', () => {
  it('includes the message in the row', () => {
    const entry = {
      type: 'added',
      message: 'Route was added',
      meta: {},
      timestamp: '2024-06-01T12:00:00.000Z',
    };
    const row = strip(formatChangelogRow('GET:/users', entry));
    expect(row).toContain('Route was added');
    expect(row).toContain('2024-06-01 12:00:00');
    expect(row).toContain('ADDED');
  });
});

describe('printChangelogReport', () => {
  it('prints a no-entries message when empty', () => {
    const lines = [];
    printChangelogReport((line) => lines.push(line));
    expect(lines.some((l) => l.includes('No changelog entries'))).toBe(true);
  });

  it('prints route key and entries', () => {
    addEntry('GET', '/products', 'added', 'Products route created');
    addEntry('GET', '/products', 'modified', 'Added pagination');
    const lines = [];
    printChangelogReport((line) => lines.push(line));
    const joined = strip(lines.join('\n'));
    expect(joined).toContain('GET:/products');
    expect(joined).toContain('Products route created');
    expect(joined).toContain('Added pagination');
    expect(joined).toContain('ADDED');
    expect(joined).toContain('MODIFIED');
  });

  it('shows entry count per route', () => {
    addEntry('POST', '/orders', 'added', 'Orders created');
    const lines = [];
    printChangelogReport((line) => lines.push(line));
    const joined = strip(lines.join('\n'));
    expect(joined).toContain('1 entry');
  });

  it('uses plural for multiple entries', () => {
    addEntry('DELETE', '/orders/:id', 'added', 'A');
    addEntry('DELETE', '/orders/:id', 'removed', 'B');
    const lines = [];
    printChangelogReport((line) => lines.push(line));
    const joined = strip(lines.join('\n'));
    expect(joined).toContain('2 entries');
  });
});
