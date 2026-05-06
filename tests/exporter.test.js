const { toJSON, toCSV, exportStats } = require('../src/exporter');
const fs = require('fs');
const path = require('path');
const os = require('os');

const sampleStats = [
  { method: 'GET', path: '/api/users', hits: 10, avgResponseTime: 42.5, lastCalledAt: '2024-01-01T00:00:00.000Z' },
  { method: 'POST', path: '/api/users', hits: 3, avgResponseTime: 120.0, lastCalledAt: '2024-01-02T00:00:00.000Z' },
];

describe('toJSON', () => {
  it('returns a valid JSON string with exportedAt and routes', () => {
    const result = toJSON(sampleStats);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('exportedAt');
    expect(parsed).toHaveProperty('routes');
    expect(parsed.routes).toHaveLength(2);
  });

  it('respects pretty=false', () => {
    const result = toJSON(sampleStats, false);
    expect(result).not.toContain('\n');
  });
});

describe('toCSV', () => {
  it('returns a string with a header row and data rows', () => {
    const result = toCSV(sampleStats);
    const lines = result.split('\n');
    expect(lines[0]).toBe('method,path,hits,avgResponseTime,lastCalledAt');
    expect(lines).toHaveLength(3);
  });

  it('formats avgResponseTime to 2 decimal places', () => {
    const result = toCSV(sampleStats);
    expect(result).toContain('42.50');
  });

  it('handles missing avgResponseTime gracefully', () => {
    const stats = [{ method: 'GET', path: '/health', hits: 1, avgResponseTime: null, lastCalledAt: '' }];
    const result = toCSV(stats);
    const dataRow = result.split('\n')[1];
    expect(dataRow).toBe('GET,/health,1,,');
  });
});

describe('exportStats', () => {
  it('throws if stats array is empty', () => {
    expect(() => exportStats([])).toThrow('No stats to export');
  });

  it('throws on unsupported format', () => {
    expect(() => exportStats(sampleStats, 'xml')).toThrow('Unsupported format');
  });

  it('returns JSON string when no outputPath given', () => {
    const result = exportStats(sampleStats, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('returns CSV string when no outputPath given', () => {
    const result = exportStats(sampleStats, 'csv');
    expect(result.startsWith('method,')).toBe(true);
  });

  it('writes file to disk when outputPath is provided', () => {
    const tmpFile = path.join(os.tmpdir(), `routewatch-test-${Date.now()}.json`);
    const written = exportStats(sampleStats, 'json', tmpFile);
    expect(written).toBe(path.resolve(tmpFile));
    const content = fs.readFileSync(tmpFile, 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
    fs.unlinkSync(tmpFile);
  });
});
