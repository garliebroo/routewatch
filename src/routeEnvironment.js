// routeEnvironment.js — tag routes with environment metadata and query by env

const store = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setEnvironment(method, path, envData) {
  const key = buildKey(method, path);
  store.set(key, {
    method: method.toUpperCase(),
    path,
    env: envData.env || 'all',
    enabled: envData.enabled !== undefined ? envData.enabled : true,
    notes: envData.notes || null,
  });
}

function setEnvironments(entries) {
  for (const entry of entries) {
    setEnvironment(entry.method, entry.path, entry);
  }
}

function getEnvironment(method, path) {
  return store.get(buildKey(method, path)) || null;
}

function getAllEnvironments() {
  return Array.from(store.values());
}

function filterByEnv(env) {
  return getAllEnvironments().filter(
    (e) => e.env === env || e.env === 'all'
  );
}

function isEnabled(method, path, currentEnv) {
  const entry = getEnvironment(method, path);
  if (!entry) return true;
  if (!entry.enabled) return false;
  return entry.env === 'all' || entry.env === currentEnv;
}

function removeEnvironment(method, path) {
  return store.delete(buildKey(method, path));
}

function reset() {
  store.clear();
}

module.exports = {
  setEnvironment,
  setEnvironments,
  getEnvironment,
  getAllEnvironments,
  filterByEnv,
  isEnabled,
  removeEnvironment,
  reset,
};
