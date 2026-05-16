/**
 * routeDependencies.js
 * Track which routes depend on or call other routes/services.
 */

const deps = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setDependency(method, path, dependencies = []) {
  const key = buildKey(method, path);
  deps.set(key, {
    method: method.toUpperCase(),
    path,
    dependencies: Array.isArray(dependencies) ? dependencies : [dependencies],
    addedAt: new Date().toISOString()
  });
}

function setDependencies(entries = []) {
  for (const { method, path, dependencies } of entries) {
    setDependency(method, path, dependencies);
  }
}

function getDependency(method, path) {
  return deps.get(buildKey(method, path)) || null;
}

function getAllDependencies() {
  return Array.from(deps.values());
}

function addDep(method, path, dep) {
  const key = buildKey(method, path);
  const existing = deps.get(key);
  if (existing) {
    if (!existing.dependencies.includes(dep)) {
      existing.dependencies.push(dep);
    }
  } else {
    setDependency(method, path, [dep]);
  }
}

function removeDependency(method, path) {
  return deps.delete(buildKey(method, path));
}

function findDependents(dep) {
  return getAllDependencies().filter(entry =>
    entry.dependencies.includes(dep)
  );
}

function reset() {
  deps.clear();
}

module.exports = {
  buildKey,
  setDependency,
  setDependencies,
  getDependency,
  getAllDependencies,
  addDep,
  removeDependency,
  findDependents,
  reset
};
