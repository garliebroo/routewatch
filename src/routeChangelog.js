/**
 * routeChangelog.js
 * Track and manage a changelog of route-level changes (added, deprecated, modified, removed)
 */

const entries = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function addEntry(method, path, type, message, meta = {}) {
  const key = buildKey(method, path);
  if (!entries.has(key)) {
    entries.set(key, []);
  }
  entries.get(key).push({
    type,
    message,
    meta,
    timestamp: new Date().toISOString(),
  });
}

function addEntries(routes) {
  for (const r of routes) {
    addEntry(r.method, r.path, r.type, r.message, r.meta || {});
  }
}

function getChangelog(method, path) {
  return entries.get(buildKey(method, path)) || [];
}

function getAllChangelogs() {
  const result = {};
  for (const [key, log] of entries.entries()) {
    result[key] = log;
  }
  return result;
}

function summarizeChangelog(method, path) {
  const log = getChangelog(method, path);
  const counts = {};
  for (const entry of log) {
    counts[entry.type] = (counts[entry.type] || 0) + 1;
  }
  return { key: buildKey(method, path), total: log.length, counts };
}

function removeChangelog(method, path) {
  return entries.delete(buildKey(method, path));
}

function reset() {
  entries.clear();
}

module.exports = {
  buildKey,
  addEntry,
  addEntries,
  getChangelog,
  getAllChangelogs,
  summarizeChangelog,
  removeChangelog,
  reset,
};
