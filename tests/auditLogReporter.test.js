const { colorType, pad, formatAuditRow, printAuditReport } = require('../src/auditLogReporter');
const auditLog = require('../src/routeAuditLog');

function strip(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

beforeEach(() => auditLog.reset());

describe('colorType', () => {
  it('wraps error in red', () => {
    expect(colorType('error')).toContain('error');
    expect(colorType('error')).toContain('\x1b[31m');
  });

  it('wraps slow in yellow', () => {
    expect(colorType('slow')).toContain('\x1b[33m');
  });

  it('wraps client_error in cyan', () => {
    expect(colorType('client_error')).toContain('\x1b[36m');
  });

  it('wraps access in gray', () => {
    expect(colorType('access')).toContain('\x1b[90m');
  });
});

describe('pad', () => {
  it('pads string to given length', () => {
    expect(pad('hi', 10)).toBe('hi        ');
  });

  it('handles numbers', () => {
    expect(pad(5, 4)).toBe('5   ');
  });
});

describe('formatAuditRow', () => {
  it('includes key, total, and type counts', () => {
    const summary = { total: 3, byType: { access: 2, error: 1 } };
    const row = strip(formatAuditRow('GET /api/users', summary));
    expect(row).toContain('GET /api/users');
    expect(row).toContain('total=3');
    expect(row).toContain('access:2');
    expect(row).toContain('error:1');
  });
});

describe('printAuditReport', () => {
  it('prints no-events message when log is empty', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printAuditReport();
    const output = spy.mock.calls.map(c => strip(c.join(' '))).join('\n');
    expect(output).toContain('No audit events recorded');
    spy.mockRestore();
  });

  it('prints report with route summaries', () => {
    auditLog.addEvent('GET', '/api/items', { type: 'access', status: 200, duration: 20 });
    auditLog.addEvent('GET', '/api/items', { type: 'slow', status: 200, duration: 600 });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printAuditReport();
    const output = spy.mock.calls.map(c => strip(c.join(' '))).join('\n');
    expect(output).toContain('Audit Log Report');
    expect(output).toContain('GET /api/items');
    expect(output).toContain('total=2');
    spy.mockRestore();
  });
});
