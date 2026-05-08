/**
 * routeHistory.js
 * Tracks a rolling history of recent requests per route.
 */

const histories = new Map();
const DEFAULT_MAX = 20;

function record(method, path, statusCode, duration, maxEntries = DEFAULT_MAX) {
  const key = `${method.toUpperCase()} ${path}`;
  if (!histories.has(key)) {
    histories.set(key, []);
  }
  const entries = histories.get(key);
  entries.push({
    timestamp: Date.now(),
    statusCode,
    duration,
  });
  if (entries.length > maxEntries) {
    entries.shift();
  }
}

function getHistory(method, path) {
  const key = `${method.toUpperCase()} ${path}`;
  return histories.get(key) || [];
}

function getAllHistory() {
  const result = {};
  for (const [key, entries] of histories.entries()) {
    result[key] = entries;
  }
  return result;
}

function summarizeHistory(method, path) {
  const entries = getHistory(method, path);
  if (entries.length === 0) return null;

  const durations = entries.map((e) => e.duration);
  const statusCodes = entries.map((e) => e.statusCode);
  const errors = statusCodes.filter((s) => s >= 400).length;

  return {
    count: entries.length,
    avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    errorCount: errors,
    errorRate: parseFloat(((errors / entries.length) * 100).toFixed(1)),
    latest: entries[entries.length - 1].timestamp,
  };
}

function reset() {
  histories.clear();
}

module.exports = { record, getHistory, getAllHistory, summarizeHistory, reset };
