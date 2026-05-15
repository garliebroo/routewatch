// routeAuditLog.js — track audit events per route (access, errors, slow responses)

const log = {};

function buildKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function addEvent(method, path, event) {
  const key = buildKey(method, path);
  if (!log[key]) log[key] = [];
  log[key].push({
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  });
}

function addEvents(entries) {
  for (const { method, path, event } of entries) {
    addEvent(method, path, event);
  }
}

function getLog(method, path) {
  return log[buildKey(method, path)] || [];
}

function getAllLogs() {
  return { ...log };
}

function filterByType(method, path, type) {
  return getLog(method, path).filter(e => e.type === type);
}

function summarizeLog(method, path) {
  const events = getLog(method, path);
  const counts = {};
  for (const e of events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
  }
  return { key: buildKey(method, path), total: events.length, byType: counts };
}

function reset() {
  for (const key of Object.keys(log)) delete log[key];
}

module.exports = { buildKey, addEvent, addEvents, getLog, getAllLogs, filterByType, summarizeLog, reset };
