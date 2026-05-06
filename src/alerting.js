/**
 * alerting.js
 * Threshold-based alerting for route usage stats.
 * Emits warnings when routes exceed defined thresholds.
 */

const { getStats } = require('./tracker');

const defaultThresholds = {
  maxCount: null,       // alert if a route is called more than N times
  minCount: null,       // alert if a route is called fewer than N times
  maxErrorRate: null,   // alert if error rate (4xx+5xx / total) exceeds this fraction
  maxAvgDuration: null, // alert if average duration (ms) exceeds this value
};

/**
 * Evaluate stats for a single route entry against thresholds.
 * Returns an array of alert message strings (empty if no alerts).
 */
function evaluateRoute(entry, thresholds) {
  const alerts = [];
  const { method, path, count, errorCount, totalDuration } = entry;
  const label = `${method} ${path}`;

  if (thresholds.maxCount != null && count > thresholds.maxCount) {
    alerts.push(`[routewatch] ALERT: ${label} exceeded maxCount (${count} > ${thresholds.maxCount})`);
  }

  if (thresholds.minCount != null && count < thresholds.minCount) {
    alerts.push(`[routewatch] ALERT: ${label} below minCount (${count} < ${thresholds.minCount})`);
  }

  if (thresholds.maxErrorRate != null && count > 0) {
    const errorRate = (errorCount || 0) / count;
    if (errorRate > thresholds.maxErrorRate) {
      alerts.push(
        `[routewatch] ALERT: ${label} error rate too high (${(errorRate * 100).toFixed(1)}% > ${(thresholds.maxErrorRate * 100).toFixed(1)}%)`
      );
    }
  }

  if (thresholds.maxAvgDuration != null && count > 0) {
    const avg = (totalDuration || 0) / count;
    if (avg > thresholds.maxAvgDuration) {
      alerts.push(
        `[routewatch] ALERT: ${label} avg duration too slow (${avg.toFixed(1)}ms > ${thresholds.maxAvgDuration}ms)`
      );
    }
  }

  return alerts;
}

/**
 * Check all current stats against provided thresholds.
 * Calls onAlert(message) for each triggered alert.
 * Returns the full list of alert messages.
 */
function checkAlerts(userThresholds = {}, onAlert = console.warn) {
  const thresholds = { ...defaultThresholds, ...userThresholds };
  const stats = getStats();
  const allAlerts = [];

  for (const entry of Object.values(stats)) {
    const alerts = evaluateRoute(entry, thresholds);
    for (const msg of alerts) {
      allAlerts.push(msg);
      onAlert(msg);
    }
  }

  return allAlerts;
}

module.exports = { evaluateRoute, checkAlerts };
