/**
 * routeCoverage.js
 * Tracks which registered routes have been hit vs never called.
 */

const registered = new Map();
const hit = new Set();

function buildKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function registerRoute(method, path) {
  const key = buildKey(method, path);
  registered.set(key, { method: method.toUpperCase(), path });
}

function registerRoutes(routes) {
  for (const { method, path } of routes) {
    registerRoute(method, path);
  }
}

function markHit(method, path) {
  const key = buildKey(method, path);
  hit.add(key);
}

function getCoverage() {
  const total = registered.size;
  const covered = [...registered.keys()].filter(k => hit.has(k)).length;
  const uncovered = [...registered.keys()].filter(k => !hit.has(k));
  const percent = total === 0 ? 0 : Math.round((covered / total) * 100);

  return {
    total,
    covered,
    uncovered: uncovered.map(k => registered.get(k)),
    percent,
  };
}

function getAllRegistered() {
  return [...registered.values()];
}

function reset() {
  registered.clear();
  hit.clear();
}

module.exports = {
  registerRoute,
  registerRoutes,
  markHit,
  getCoverage,
  getAllRegistered,
  reset,
};
