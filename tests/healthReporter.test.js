const { record, reset } = require('../src/routeHealth');
const { colorStatus, formatHealthRow, printHealthReport } = require('../src/healthReporter');

beforeEach(() => reset());

describe('colorStatus', () => {
  test('wraps text in color codes for healthy', () => {
    const result = colorStatus('healthy', 'HEALTHY');
    expect(result).toContain('HEALTHY');
    expect(result).toContain('\x1b[32m');
  });

  test('wraps text in red for unhealthy', () => {
    const result = colorStatus('unhealthy', 'UNHEALTHY');
    expect(result).toContain('\x1b[31m');
  });

  test('wraps text in grey for insufficient_data', () => {
    const result = colorStatus('insufficient_data', 'N/A');
    expect(result).toContain('\x1b[90m');
  });
});

describe('formatHealthRow', () => {
  test('includes route key in output', () => {
    const row = formatHealthRow('GET:/api/users', {
      hits: 10, errors: 1, avgTime: 120, errorRate: 0.1, score: 75, status: 'healthy'
    });
    expect(row).toContain('GET:/api/users');
    expect(row).toContain('120ms');
    expect(row).toContain('75/100');
  });

  test('shows N/A for null score', () => {
    const row = formatHealthRow('POST:/api/x', {
      hits: 2, errors: 0, avgTime: 50, errorRate: 0, score: null, status: 'insufficient_data'
    });
    expect(row).toContain('N/A');
  });
});

describe('printHealthReport', () => {
  test('prints no data message when store is empty', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printHealthReport();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No health data'));
    spy.mockRestore();
  });

  test('prints report rows when data exists', () => {
    for (let i = 0; i < 6; i++) {
      record('/api/ping', 'GET', { statusCode: 200, responseTime: 80 });
    }
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printHealthReport();
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('GET:/api/ping');
    spy.mockRestore();
  });
});
