/**
 * routeDeprecator.js
 * Track and report deprecated routes with optional sunset dates.
 */

const deprecated = new Map();

/**
 * Mark a route as deprecated.
 * @param {string} route - e.g. "GET /api/v1/users"
 * @param {object} options - { message, sunsetDate }
 */
function deprecate(route, options = {}) {
  deprecated.set(route, {
    route,
    message: options.message || `${route} is deprecated`,
    sunsetDate: options.sunsetDate || null,
    hitCount: 0,
  });
}

/**
 * Bulk-register deprecated routes.
 * @param {Array<{ route: string, message?: string, sunsetDate?: string }>} entries
 */
function deprecateMany(entries = []) {
  entries.forEach(({ route, message, sunsetDate }) =>
    deprecate(route, { message, sunsetDate })
  );
}

function recordHit(route) {
  if (deprecated.has(route)) {
    deprecated.get(route).hitCount += 1;
  }
}

function isDeprecated(route) {
  return deprecated.has(route);
}

function getDeprecated() {
  return Array.from(deprecated.values());
}

function getEntry(route) {
  return deprecated.get(route) || null;
}

function reset() {
  deprecated.clear();
}

module.exports = { deprecate, deprecateMany, recordHit, isDeprecated, getDeprecated, getEntry, reset };
