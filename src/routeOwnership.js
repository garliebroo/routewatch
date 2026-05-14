// Track ownership (team/person) for routes

const owners = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setOwner(method, path, owner) {
  const key = buildKey(method, path);
  owners.set(key, { method: method.toUpperCase(), path, owner });
}

function setOwners(entries) {
  for (const { method, path, owner } of entries) {
    setOwner(method, path, owner);
  }
}

function getOwner(method, path) {
  const key = buildKey(method, path);
  return owners.get(key) || null;
}

function getAllOwners() {
  return Array.from(owners.values());
}

function removeOwner(method, path) {
  const key = buildKey(method, path);
  return owners.delete(key);
}

function groupByOwner() {
  const groups = {};
  for (const entry of owners.values()) {
    const { owner } = entry;
    if (!groups[owner]) groups[owner] = [];
    groups[owner].push({ method: entry.method, path: entry.path });
  }
  return groups;
}

function reset() {
  owners.clear();
}

module.exports = { buildKey, setOwner, setOwners, getOwner, getAllOwners, removeOwner, groupByOwner, reset };
