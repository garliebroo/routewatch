/**
 * routeSLA.js — Define and evaluate SLA targets for routes
 */

const slas = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function setSLA(method, path, { maxAvgMs, maxErrorRate, maxP95Ms } = {}) {
  const key = buildKey(method, path);
  slas.set(key, { maxAvgMs, maxErrorRate, maxP95Ms });
}

function setSLABulk(entries) {
  for (const { method, path, ...targets } of entries) {
    setSLA(method, path, targets);
  }
}

function getSLA(method, path) {
  return slas.get(buildKey(method, path)) || null;
}

function getAllSLAs() {
  const result = {};
  for (const [key, val] of slas.entries()) {
    result[key] = val;
  }
  return result;
}

function evaluateSLA(method, path, { avgMs, errorRate, p95Ms } = {}) {
  const sla = getSLA(method, path);
  if (!sla) return null;

  const violations = [];

  if (sla.maxAvgMs != null && avgMs != null && avgMs > sla.maxAvgMs) {
    violations.push({ field: 'avgMs', actual: avgMs, limit: sla.maxAvgMs });
  }
  if (sla.maxErrorRate != null && errorRate != null && errorRate > sla.maxErrorRate) {
    violations.push({ field: 'errorRate', actual: errorRate, limit: sla.maxErrorRate });
  }
  if (sla.maxP95Ms != null && p95Ms != null && p95Ms > sla.maxP95Ms) {
    violations.push({ field: 'p95Ms', actual: p95Ms, limit: sla.maxP95Ms });
  }

  return {
    key: buildKey(method, path),
    passing: violations.length === 0,
    violations,
  };
}

function removeSLA(method, path) {
  return slas.delete(buildKey(method, path));
}

function reset() {
  slas.clear();
}

module.exports = { setSLA, setSLABulk, getSLA, getAllSLAs, evaluateSLA, removeSLA, reset };
