// Route metadata store: attach arbitrary key-value metadata to routes

const store = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setMeta(method, path, key, value) {
  const routeKey = buildKey(method, path);
  if (!store.has(routeKey)) store.set(routeKey, {});
  store.get(routeKey)[key] = value;
}

function setMetaBulk(method, path, meta = {}) {
  const routeKey = buildKey(method, path);
  const existing = store.get(routeKey) || {};
  store.set(routeKey, { ...existing, ...meta });
}

function getMeta(method, path, key) {
  const routeKey = buildKey(method, path);
  const entry = store.get(routeKey);
  if (!entry) return undefined;
  return key !== undefined ? entry[key] : { ...entry };
}

function getAllMeta() {
  const result = {};
  for (const [key, meta] of store.entries()) {
    result[key] = { ...meta };
  }
  return result;
}

function removeMeta(method, path, key) {
  const routeKey = buildKey(method, path);
  if (!store.has(routeKey)) return false;
  if (key !== undefined) {
    delete store.get(routeKey)[key];
  } else {
    store.delete(routeKey);
  }
  return true;
}

function reset() {
  store.clear();
}

module.exports = { buildKey, setMeta, setMetaBulk, getMeta, getAllMeta, removeMeta, reset };
