/**
 * tagFilter.js — filter and group stats by custom route tags
 * Tags can be attached to routes via routewatch({ tags: { '/api/users': 'users' } })
 */

/**
 * Attach tags to stats entries based on a tag map.
 * @param {Object[]} stats - array of stat objects with `route` property
 * @param {Object} tagMap - { '/api/users': 'users', '/api/orders': 'orders' }
 * @returns {Object[]} stats with `tag` property added
 */
function attachTags(stats, tagMap = {}) {
  return stats.map((entry) => ({
    ...entry,
    tag: tagMap[entry.route] || 'untagged',
  }));
}

/**
 * Filter stats to only include entries matching a specific tag.
 * @param {Object[]} stats
 * @param {string} tag
 * @returns {Object[]}
 */
function filterByTag(stats, tag) {
  if (!tag) return stats;
  return stats.filter((entry) => entry.tag === tag);
}

/**
 * Group stats by their tag value.
 * @param {Object[]} stats - stats with `tag` property
 * @returns {Object} { tagName: [entries] }
 */
function groupByTag(stats) {
  return stats.reduce((groups, entry) => {
    const tag = entry.tag || 'untagged';
    if (!groups[tag]) groups[tag] = [];
    groups[tag].push(entry);
    return groups;
  }, {});
}

/**
 * Summarize grouped stats — total hits and avg response time per tag.
 * @param {Object} groups - result of groupByTag
 * @returns {Object[]} array of { tag, totalHits, avgTime }
 */
function summarizeByTag(groups) {
  return Object.entries(groups).map(([tag, entries]) => {
    const totalHits = entries.reduce((sum, e) => sum + (e.count || 0), 0);
    const avgTime =
      entries.length > 0
        ? Math.round(
            entries.reduce((sum, e) => sum + (e.avgTime || 0), 0) /
              entries.length
          )
        : 0;
    return { tag, totalHits, avgTime, routes: entries.length };
  });
}

module.exports = { attachTags, filterByTag, groupByTag, summarizeByTag };
