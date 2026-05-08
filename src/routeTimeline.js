// routeTimeline.js — tracks recent hits per route with timestamps

const timelines = new Map();
const MAX_ENTRIES = 50;

function record(route, method, durationMs) {
  const key = `${method.toUpperCase()} ${route}`;
  if (!timelines.has(key)) {
    timelines.set(key, []);
  }
  const entries = timelines.get(key);
  entries.push({
    timestamp: Date.now(),
    durationMs: durationMs != null ? durationMs : null,
  });
  if (entries.length > MAX_ENTRIES) {
    entries.shift();
  }
}

function getTimeline(route, method) {
  const key = `${method.toUpperCase()} ${route}`;
  return timelines.get(key) || [];
}

function getAllTimelines() {
  const result = {};
  for (const [key, entries] of timelines.entries()) {
    result[key] = [...entries];
  }
  return result;
}

function summarizeTimeline(route, method) {
  const entries = getTimeline(route, method);
  if (entries.length === 0) return null;

  const durations = entries
    .map((e) => e.durationMs)
    .filter((d) => d != null);

  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  const first = entries[0].timestamp;
  const last = entries[entries.length - 1].timestamp;

  return {
    key: `${method.toUpperCase()} ${route}`,
    totalHits: entries.length,
    firstSeen: new Date(first).toISOString(),
    lastSeen: new Date(last).toISOString(),
    spanMs: last - first,
    avgDurationMs: avgDuration,
  };
}

function reset() {
  timelines.clear();
}

module.exports = { record, getTimeline, getAllTimelines, summarizeTimeline, reset };
