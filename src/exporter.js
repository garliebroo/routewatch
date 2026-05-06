/**
 * exporter.js
 * Exports collected route stats to JSON or CSV format
 */

const fs = require('fs');
const path = require('path');

function toJSON(stats, pretty = true) {
  const payload = {
    exportedAt: new Date().toISOString(),
    routes: stats,
  };
  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

function toCSV(stats) {
  const headers = ['method', 'path', 'hits', 'avgResponseTime', 'lastCalledAt'];
  const rows = stats.map((s) => [
    s.method,
    s.path,
    s.hits,
    s.avgResponseTime != null ? s.avgResponseTime.toFixed(2) : '',
    s.lastCalledAt || '',
  ]);

  const lines = [headers.join(','), ...rows.map((r) => r.join(','))];
  return lines.join('\n');
}

function exportStats(stats, format = 'json', outputPath = null) {
  if (!Array.isArray(stats) || stats.length === 0) {
    throw new Error('No stats to export');
  }

  const supported = ['json', 'csv'];
  if (!supported.includes(format)) {
    throw new Error(`Unsupported format "${format}". Use one of: ${supported.join(', ')}`);
  }

  const content = format === 'csv' ? toCSV(stats) : toJSON(stats);

  if (outputPath) {
    const resolved = path.resolve(outputPath);
    fs.writeFileSync(resolved, content, 'utf8');
    return resolved;
  }

  return content;
}

module.exports = { toJSON, toCSV, exportStats };
