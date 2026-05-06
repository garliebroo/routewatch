const { toBlock, printHeatmapReport } = require('../src/heatmapReporter');
const heatmap = require('../src/heatmap');

beforeEach(() => heatmap.reset());

describe('toBlock', () => {
  test('returns empty block when max is 0', () => {
    expect(toBlock(0, 0)).toBe(' ');
  });

  test('returns full block at 100% fill', () => {
    expect(toBlock(10, 10)).toBe('█');
  });

  test('returns partial block for mid-range values', () => {
    const block = toBlock(5, 10);
    expect(['░', '▒', '▓']).toContain(block);
  });

  test('returns empty block for zero count with non-zero max', () => {
    expect(toBlock(0, 100)).toBe(' ');
  });
});

describe('printHeatmapReport', () => {
  test('prints no-data message when empty', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printHeatmapReport();
    expect(spy).toHaveBeenCalledWith('No heatmap data available.');
    spy.mockRestore();
  });

  test('prints header and route rows when data exists', () => {
    heatmap.recordHit('GET /api/test', new Date('2024-06-01T10:00:00'));
    heatmap.recordHit('GET /api/test', new Date('2024-06-01T10:30:00'));

    const lines = [];
    const spy = jest.spyOn(console, 'log').mockImplementation(msg => lines.push(msg));
    printHeatmapReport();
    spy.mockRestore();

    const combined = lines.join('\n');
    expect(combined).toContain('Heatmap');
    expect(combined).toContain('GET /api/test');
    expect(combined).toContain('10h');
  });
});
