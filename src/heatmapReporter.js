/**
 * heatmapReporter.js
 * Renders an ASCII heatmap of route usage by hour of day.
 */

const { getHeatmap, peakHour } = require('./heatmap');

const BLOCK_CHARS = [' ', '░', '▒', '▓', '█'];

/**
 * Map a count to a block character based on max value.
 * @param {number} count
 * @param {number} max
 * @returns {string}
 */
function toBlock(count, max) {
  if (max === 0) return BLOCK_CHARS[0];
  const idx = Math.ceil((count / max) * (BLOCK_CHARS.length - 1));
  return BLOCK_CHARS[idx];
}

/**
 * Print a full heatmap report to console.
 */
function printHeatmapReport() {
  const data = getHeatmap();
  const routes = Object.keys(data);

  if (routes.length === 0) {
    console.log('No heatmap data available.');
    return;
  }

  const hourLabels = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  ).join(' ');

  console.log('\n\x1b[1mRoute Usage Heatmap (by hour)\x1b[0m');
  console.log(`${'Route'.padEnd(30)} ${hourLabels}  peak`);
  console.log('─'.repeat(90));

  routes.forEach(route => {
    const slots = data[route];
    const max = Math.max(...slots);
    const blocks = slots.map(c => toBlock(c, max)).join(' ');
    const { hour, count } = peakHour(route);
    const peakStr = count > 0 ? `${String(hour).padStart(2, '0')}h (${count})` : 'n/a';
    console.log(`${route.padEnd(30)} ${blocks}  ${peakStr}`);
  });

  console.log('');
}

module.exports = { toBlock, printHeatmapReport };
