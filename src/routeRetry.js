/**
 * routeRetry.js
 * Track retry attempts and failure patterns per route.
 */

const store = {};

function buildKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function recordAttempt(method, path, { success, attemptNumber = 1 } = {}) {
  const key = buildKey(method, path);
  if (!store[key]) {
    store[key] = {
      method: method.toUpperCase(),
      path,
      totalAttempts: 0,
      successCount: 0,
      failureCount: 0,
      retryCount: 0,
      maxAttemptSeen: 0,
    };
  }
  const entry = store[key];
  entry.totalAttempts += 1;
  if (attemptNumber > 1) entry.retryCount += 1;
  if (attemptNumber > entry.maxAttemptSeen) entry.maxAttemptSeen = attemptNumber;
  if (success) {
    entry.successCount += 1;
  } else {
    entry.failureCount += 1;
  }
}

function getRetryStats(method, path) {
  const key = buildKey(method, path);
  const entry = store[key];
  if (!entry) return null;
  const retryRate =
    entry.totalAttempts > 0
      ? ((entry.retryCount / entry.totalAttempts) * 100).toFixed(1)
      : '0.0';
  return { ...entry, retryRate: `${retryRate}%` };
}

function getAllRetryStats() {
  return Object.values(store).map((entry) => {
    const retryRate =
      entry.totalAttempts > 0
        ? ((entry.retryCount / entry.totalAttempts) * 100).toFixed(1)
        : '0.0';
    return { ...entry, retryRate: `${retryRate}%` };
  });
}

function getHighRetryRoutes(threshold = 20) {
  return getAllRetryStats().filter(
    (s) => parseFloat(s.retryRate) >= threshold
  );
}

function reset() {
  Object.keys(store).forEach((k) => delete store[k]);
}

module.exports = {
  buildKey,
  recordAttempt,
  getRetryStats,
  getAllRetryStats,
  getHighRetryRoutes,
  reset,
};
