const { colorPass, pad, formatSLARow, printSLAReport } = require('../src/slaReporter');
const sla = require('../src/routeSLA');

beforeEach(() => sla.reset());

const strip = str => str.replace(/\x1b\[[0-9;]*m/g, '');

describe('colorPass', () => {
  test('returns PASS for true', () => {
    expect(strip(colorPass(true))).toBe('PASS');
  });

  test('returns FAIL for false', () => {
    expect(strip(colorPass(false))).toBe('FAIL');
  });
});

describe('pad', () => {
  test('pads string to given length', () => {
    expect(pad('hi', 10)).toBe('hi        ');
  });
});

describe('formatSLARow', () => {
  test('formats a passing result', () => {
    const result = { key: 'GET /api', passing: true, violations: [] };
    const row = strip(formatSLARow(result));
    expect(row).toContain('GET /api');
    expect(row).toContain('PASS');
  });

  test('formats a failing result with violation details', () => {
    const result = {
      key: 'POST /submit',
      passing: false,
      violations: [{ field: 'avgMs', actual: 500, limit: 100 }],
    };
    const row = strip(formatSLARow(result));
    expect(row).toContain('FAIL');
    expect(row).toContain('avgMs');
    expect(row).toContain('500');
  });
});

describe('printSLAReport', () => {
  test('prints no-SLA message when none defined', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printSLAReport({});
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No SLA'));
    spy.mockRestore();
  });

  test('prints report rows for defined SLAs', () => {
    sla.setSLA('GET', '/health', { maxAvgMs: 200 });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printSLAReport({ 'GET /health': { avgMs: 50 } });
    const output = spy.mock.calls.map(c => strip(c[0])).join('\n');
    expect(output).toContain('GET /health');
    spy.mockRestore();
  });

  test('counts passing and failing routes', () => {
    sla.setSLA('GET', '/ok', { maxAvgMs: 500 });
    sla.setSLA('POST', '/slow', { maxAvgMs: 10 });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printSLAReport({
      'GET /ok': { avgMs: 100 },
      'POST /slow': { avgMs: 999 },
    });
    const output = spy.mock.calls.map(c => strip(c[0])).join('\n');
    expect(output).toContain('1 passing');
    expect(output).toContain('1 failing');
    spy.mockRestore();
  });
});
