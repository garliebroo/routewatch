const { formatTagRow, printTagsReport, pad, colorMethod } = require('../src/tagsReporter');

// Strip ANSI escape codes for easier assertions
function strip(str) {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

describe('pad', () => {
  it('pads a string to the given length', () => {
    expect(pad('hi', 10)).toBe('hi        ');
  });

  it('does not truncate longer strings', () => {
    expect(pad('hello world', 5)).toBe('hello world');
  });
});

describe('colorMethod', () => {
  it('returns a padded method string', () => {
    expect(strip(colorMethod('GET'))).toBe('GET   ');
    expect(strip(colorMethod('DELETE'))).toBe('DELETE');
  });
});

describe('formatTagRow', () => {
  it('includes method, path and tags', () => {
    const row = strip(formatTagRow('GET', '/users', ['auth', 'admin']));
    expect(row).toContain('GET');
    expect(row).toContain('/users');
    expect(row).toContain('#auth');
    expect(row).toContain('#admin');
  });

  it('handles a single tag', () => {
    const row = strip(formatTagRow('POST', '/login', ['auth']));
    expect(row).toContain('#auth');
  });
});

describe('printTagsReport', () => {
  let logs;
  beforeEach(() => {
    logs = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
  });
  afterEach(() => jest.restoreAllMocks());

  it('prints a no-tags message when empty', () => {
    printTagsReport({});
    expect(logs.some(l => strip(l).includes('No route tags'))).toBe(true);
  });

  it('prints rows for each tagged route', () => {
    printTagsReport({
      'GET:/users': ['auth'],
      'POST:/items': ['write', 'admin'],
    });
    const output = logs.map(strip).join('\n');
    expect(output).toContain('/users');
    expect(output).toContain('/items');
    expect(output).toContain('#auth');
    expect(output).toContain('#write');
    expect(output).toContain('2 route(s) tagged');
  });
});
