/**
 * Tracks response size statistics per route.
 */

const stats = {};

function record(route, method, sizeBytes) {
  const key = `${method}:${route}`;
  if (!stats[key]) {
    stats[key] = {
      route,
      method,
      totalBytes: 0,
      count: 0,
      minBytes: Infinity,
      maxBytes: -Infinity,
    };
  }
  const entry = stats[key];
  entry.totalBytes += sizeBytes;
  entry.count += 1;
  if (sizeBytes < entry.minBytes) entry.minBytes = sizeBytes;
  if (sizeBytes > entry.maxBytes) entry.maxBytes = sizeBytes;
}

function getResponseStats() {
  return Object.values(stats).map((entry) => ({
    ...entry,
    avgBytes: entry.count > 0 ? Math.round(entry.totalBytes / entry.count) : 0,
    minBytes: entry.minBytes === Infinity ? 0 : entry.minBytes,
    maxBytes: entry.maxBytes === -Infinity ? 0 : entry.maxBytes,
  }));
}

function reset() {
  Object.keys(stats).forEach((k) => delete stats[k]);
}

module.exports = { record, getResponseStats, reset };
