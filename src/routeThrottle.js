/**
 * routeThrottle.js
 * Per-route throttle configuration and status tracking.
 */

const throttles = new Map();

function buildKey(method, path) {
  return `${method.toUpperCase()}:${path}`;
}

function setThrottle(method, path, options = {}) {
  const key = buildKey(method, path);
  throttles.set(key, {
    method: method.toUpperCase(),
    path,
    maxRequests: options.maxRequests ?? 100,
    windowMs: options.windowMs ?? 60000,
    blockOnExceed: options.blockOnExceed ?? true,
    hits: [],
  });
}

function setThrottleBulk(entries = []) {
  for (const { method, path, options } of entries) {
    setThrottle(method, path, options);
  }
}

function recordHit(method, path) {
  const key = buildKey(method, path);
  const config = throttles.get(key);
  if (!config) return null;

  const now = Date.now();
  config.hits = config.hits.filter(ts => now - ts < config.windowMs);
  config.hits.push(now);

  const count = config.hits.length;
  const exceeded = count > config.maxRequests;
  return { count, exceeded, maxRequests: config.maxRequests, windowMs: config.windowMs };
}

function getThrottleStatus(method, path) {
  const key = buildKey(method, path);
  const config = throttles.get(key);
  if (!config) return null;

  const now = Date.now();
  const recent = config.hits.filter(ts => now - ts < config.windowMs);
  return {
    method: config.method,
    path: config.path,
    maxRequests: config.maxRequests,
    windowMs: config.windowMs,
    currentCount: recent.length,
    exceeded: recent.length > config.maxRequests,
    blockOnExceed: config.blockOnExceed,
  };
}

function getAllThrottles() {
  return Array.from(throttles.values()).map(config => {
    const now = Date.now();
    const recent = config.hits.filter(ts => now - ts < config.windowMs);
    return {
      method: config.method,
      path: config.path,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      currentCount: recent.length,
      exceeded: recent.length > config.maxRequests,
      blockOnExceed: config.blockOnExceed,
    };
  });
}

function reset() {
  throttles.clear();
}

module.exports = { buildKey, setThrottle, setThrottleBulk, recordHit, getThrottleStatus, getAllThrottles, reset };
