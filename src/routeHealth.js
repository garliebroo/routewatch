/**
 * routeHealth.js
 * Tracks health scores for routes based on error rate, avg response time, and hit count.
 */

const store = new Map();

const WEIGHTS = {
  errorRate: 0.5,
  avgTime: 0.3,
  hitCount: 0.2
};

const THRESHOLDS = {
  errorRate: 0.2,   // >20% errors = unhealthy
  avgTime: 1000,    // >1000ms avg = unhealthy
  minHits: 5        // need at least 5 hits to score
};

function record(route, method, { statusCode, responseTime }) {
  const key = `${method}:${route}`;
  if (!store.has(key)) {
    store.set(key, { hits: 0, errors: 0, totalTime: 0 });
  }
  const entry = store.get(key);
  entry.hits += 1;
  entry.totalTime += responseTime;
  if (statusCode >= 400) entry.errors += 1;
}

function scoreRoute(entry) {
  if (entry.hits < THRESHOLDS.minHits) return null;
  const errorRate = entry.errors / entry.hits;
  const avgTime = entry.totalTime / entry.hits;
  const errorScore = Math.max(0, 1 - errorRate / THRESHOLDS.errorRate);
  const timeScore = Math.max(0, 1 - avgTime / THRESHOLDS.avgTime);
  const hitScore = Math.min(1, entry.hits / 50);
  return Math.round(
    (errorScore * WEIGHTS.errorRate +
      timeScore * WEIGHTS.avgTime +
      hitScore * WEIGHTS.hitCount) * 100
  );
}

function getHealth() {
  const result = {};
  for (const [key, entry] of store.entries()) {
    const score = scoreRoute(entry);
    result[key] = {
      hits: entry.hits,
      errors: entry.errors,
      avgTime: entry.hits > 0 ? Math.round(entry.totalTime / entry.hits) : 0,
      errorRate: entry.hits > 0 ? +(entry.errors / entry.hits).toFixed(3) : 0,
      score,
      status: score === null ? 'insufficient_data' : score >= 70 ? 'healthy' : score >= 40 ? 'degraded' : 'unhealthy'
    };
  }
  return result;
}

function reset() {
  store.clear();
}

module.exports = { record, getHealth, scoreRoute, reset };
