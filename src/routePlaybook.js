/**
 * routePlaybook.js
 * Store and retrieve named "playbooks" — sets of expected routes with metadata
 * useful for documenting and validating API surface area.
 */

const playbooks = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function createPlaybook(name) {
  if (!playbooks.has(name)) {
    playbooks.set(name, new Map());
  }
  return playbooks.get(name);
}

function addRoute(playbookName, method, path, meta = {}) {
  const book = createPlaybook(playbookName);
  const key = buildKey(method, path);
  book.set(key, { method: method.toUpperCase(), path, ...meta, addedAt: Date.now() });
}

function addRoutes(playbookName, routes) {
  for (const { method, path, ...meta } of routes) {
    addRoute(playbookName, method, path, meta);
  }
}

function getPlaybook(name) {
  return playbooks.has(name)
    ? Array.from(playbooks.get(name).values())
    : [];
}

function getAllPlaybooks() {
  const result = {};
  for (const [name, book] of playbooks.entries()) {
    result[name] = Array.from(book.values());
  }
  return result;
}

function hasRoute(playbookName, method, path) {
  const book = playbooks.get(playbookName);
  if (!book) return false;
  return book.has(buildKey(method, path));
}

function removePlaybook(name) {
  playbooks.delete(name);
}

function reset() {
  playbooks.clear();
}

module.exports = {
  addRoute,
  addRoutes,
  getPlaybook,
  getAllPlaybooks,
  hasRoute,
  removePlaybook,
  reset,
};
