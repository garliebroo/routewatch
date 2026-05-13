/**
 * routeScorecard.js
 * Aggregates multiple signals (health, rate, slow routes, status errors)
 * into a single composite score per route.
 */

const { getHealth } = require('./routeHealth');
const { getStatusStats } = require('./statusTracker');

const WEIGHTS = {
  health: 0.4,
  errorRate: 0.35,
  avgTime: 0.25,
};

const AVG_TIME_THRESHOLD_MS = 500;

function calcErrorRate(statusStats) {
  if (!statusStats) return 0;
  const total = statusStats.total || 0;
  if (total === 0) return 0;
  const errors = (statusStats.counts['4xx'] || 0) + (statusStats.counts['5xx'] || 0);
  return errors / total;
}

function scoreRoute(method, path) {
  const key = `${method.toUpperCase()} ${path}`;

  const health = getHealth(method, path);
  const healthScore = health ? health.score / 100 : 1;

  const statusStats = getStatusStats(method, path);
  const errorRate = calcErrorRate(statusStats);
  const errorScore = 1 - Math.min(errorRate, 1);

  const avgTime = health ? health.avgTime : 0;
  const timeScore = avgTime === 0
    ? 1
    : Math.max(0, 1 - avgTime / (AVG_TIME_THRESHOLD_MS * 2));

  const composite =
    healthScore * WEIGHTS.health +
    errorScore * WEIGHTS.errorRate +
    timeScore * WEIGHTS.avgTime;

  const grade =
    composite >= 0.85 ? 'A' :
    composite >= 0.70 ? 'B' :
    composite >= 0.55 ? 'C' :
    composite >= 0.40 ? 'D' : 'F';

  return {
    key,
    method: method.toUpperCase(),
    path,
    healthScore: +(healthScore * 100).toFixed(1),
    errorScore: +(errorScore * 100).toFixed(1),
    timeScore: +(timeScore * 100).toFixed(1),
    composite: +(composite * 100).toFixed(1),
    grade,
  };
}

function getScorecards(routes) {
  return routes.map(({ method, path }) => scoreRoute(method, path));
}

module.exports = { scoreRoute, getScorecards, WEIGHTS };
