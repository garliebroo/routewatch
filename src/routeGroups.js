/**
 * routeGroups.js
 * Group and aggregate route stats by prefix or pattern.
 */

/**
 * Extract the top-level prefix from a route path.
 * e.g. "/api/users/:id" => "/api"
 * @param {string} route
 * @param {number} depth - number of segments to include (default 2)
 * @returns {string}
 */
function extractPrefix(route, depth = 2) {
  const parts = route.split('/').filter(Boolean);
  const prefix = parts.slice(0, depth).join('/');
  return prefix ? `/${prefix}` : '/';
}

/**
 * Group an array of stat entries by route prefix.
 * @param {Array<{route: string, method: string, count: number, avgTime: number}>} stats
 * @param {number} depth
 * @returns {Object} map of prefix => aggregated stats
 */
function groupByPrefix(stats, depth = 2) {
  const groups = {};

  for (const entry of stats) {
    const prefix = extractPrefix(entry.route, depth);

    if (!groups[prefix]) {
      groups[prefix] = {
        prefix,
        routes: [],
        totalCount: 0,
        totalTime: 0,
        methods: new Set(),
      };
    }

    const group = groups[prefix];
    group.routes.push(entry);
    group.totalCount += entry.count;
    group.totalTime += entry.avgTime * entry.count;
    group.methods.add(entry.method);
  }

  // Finalize averages and convert Set to Array
  for (const key of Object.keys(groups)) {
    const g = groups[key];
    g.avgTime = g.totalCount > 0 ? g.totalTime / g.totalCount : 0;
    g.methods = Array.from(g.methods);
    delete g.totalTime;
  }

  return groups;
}

/**
 * Return groups sorted by totalCount descending.
 * @param {Object} groups
 * @returns {Array}
 */
function sortedGroups(groups) {
  return Object.values(groups).sort((a, b) => b.totalCount - a.totalCount);
}

module.exports = { extractPrefix, groupByPrefix, sortedGroups };
