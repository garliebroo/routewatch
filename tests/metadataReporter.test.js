const { formatMetaRow, printMetadataReport } = require('../src/metadataReporter');
const meta = require('../src/routeMetadata');

const strip = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');

beforeEach(() => meta.reset());

describe('formatMetaRow', () => {
  it('formats a route key with its metadata pairs', () => {
    const row = formatMetaRow('GET:/users', { owner: 'team-a', version: 2 });
    const clean = strip(row);
    expect(clean).toContain('GET:/users');
    expect(clean).toContain('owner');
    expect(clean).toContain('team-a');
    expect(clean).toContain('version');
    expect(clean).toContain('2');
  });

  it('returns null for empty metadata', () => {
    expect(formatMetaRow('GET:/empty', {})).toBeNull();
  });

  it('JSON-stringifies values', () => {
    const row = formatMetaRow('POST:/data', { active: true });
    expect(strip(row)).toContain('true');
  });
});

describe('printMetadataReport', () => {
  it('prints a message when no metadata exists', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printMetadataReport();
    const output = spy.mock.calls.map(c => strip(c[0])).join('\n');
    expect(output).toContain('No route metadata recorded');
    spy.mockRestore();
  });

  it('prints rows for each route with metadata', () => {
    meta.setMeta('GET', '/health', 'owner', 'ops');
    meta.setMeta('POST', '/login', 'auth', 'required');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printMetadataReport();
    const output = spy.mock.calls.map(c => strip(c[0])).join('\n');
    expect(output).toContain('GET:/health');
    expect(output).toContain('owner');
    expect(output).toContain('POST:/login');
    expect(output).toContain('auth');
    spy.mockRestore();
  });

  it('includes a header and dividers', () => {
    meta.setMeta('GET', '/ping', 'stable', true);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printMetadataReport();
    const output = spy.mock.calls.map(c => strip(c[0])).join('\n');
    expect(output).toContain('Route Metadata');
    expect(output).toContain('─');
    spy.mockRestore();
  });
});
