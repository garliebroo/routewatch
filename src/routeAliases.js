/**
 * routeAliases.js
 * Map raw route paths to human-friendly display names/aliases.
 */

const aliases = new Map();

/**
 * Register an alias for a route path.
 * @param {string} route - e.g. '/api/v1/users/:id'
 * @param {string} alias - e.g. 'Get User by ID'
 */
function setAlias(route, alias) {
  if (typeof route !== 'string' || typeof alias !== 'string') {
    throw new TypeError('route and alias must be strings');
  }
  aliases.set(route, alias);
}

/**
 * Bulk register aliases from a plain object.
 * @param {Object} map - { [route]: alias }
 */
function setAliases(map) {
  if (!map || typeof map !== 'object') {
    throw new TypeError('map must be a plain object');
  }
  for (const [route, alias] of Object.entries(map)) {
    setAlias(route, alias);
  }
}

/**
 * Resolve the display name for a route.
 * Falls back to the raw route if no alias is registered.
 * @param {string} route
 * @returns {string}
 */
function resolveAlias(route) {
  return aliases.get(route) || route;
}

/**
 * Return all registered aliases as a plain object.
 * @returns {Object}
 */
function getAllAliases() {
  return Object.fromEntries(aliases);
}

/**
 * Remove a single alias.
 * @param {string} route
 */
function removeAlias(route) {
  aliases.delete(route);
}

/**
 * Clear all registered aliases.
 */
function reset() {
  aliases.clear();
}

module.exports = { setAlias, setAliases, resolveAlias, getAllAliases, removeAlias, reset };
