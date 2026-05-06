const {
  attachTags,
  filterByTag,
  groupByTag,
  summarizeByTag,
} = require('../src/tagFilter');

const sampleStats = [
  { route: '/api/users', method: 'GET', count: 10, avgTime: 50 },
  { route: '/api/users', method: 'POST', count: 3, avgTime: 120 },
  { route: '/api/orders', method: 'GET', count: 7, avgTime: 80 },
  { route: '/api/health', method: 'GET', count: 20, avgTime: 5 },
];

const tagMap = {
  '/api/users': 'users',
  '/api/orders': 'orders',
};

describe('attachTags', () => {
  it('attaches correct tags based on tagMap', () => {
    const tagged = attachTags(sampleStats, tagMap);
    expect(tagged[0].tag).toBe('users');
    expect(tagged[1].tag).toBe('users');
    expect(tagged[2].tag).toBe('orders');
  });

  it('falls back to "untagged" for unmapped routes', () => {
    const tagged = attachTags(sampleStats, tagMap);
    expect(tagged[3].tag).toBe('untagged');
  });

  it('marks all entries as untagged when no tagMap provided', () => {
    const tagged = attachTags(sampleStats);
    tagged.forEach((e) => expect(e.tag).toBe('untagged'));
  });

  it('does not mutate original stats', () => {
    attachTags(sampleStats, tagMap);
    expect(sampleStats[0].tag).toBeUndefined();
  });
});

describe('filterByTag', () => {
  const tagged = attachTags(sampleStats, tagMap);

  it('returns only entries matching the tag', () => {
    const result = filterByTag(tagged, 'users');
    expect(result).toHaveLength(2);
    result.forEach((e) => expect(e.tag).toBe('users'));
  });

  it('returns empty array when no match', () => {
    const result = filterByTag(tagged, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('returns all stats when tag is falsy', () => {
    const result = filterByTag(tagged, null);
    expect(result).toHaveLength(tagged.length);
  });
});

describe('groupByTag', () => {
  const tagged = attachTags(sampleStats, tagMap);

  it('groups entries by tag', () => {
    const groups = groupByTag(tagged);
    expect(Object.keys(groups)).toContain('users');
    expect(Object.keys(groups)).toContain('orders');
    expect(Object.keys(groups)).toContain('untagged');
    expect(groups['users']).toHaveLength(2);
    expect(groups['orders']).toHaveLength(1);
  });
});

describe('summarizeByTag', () => {
  const tagged = attachTags(sampleStats, tagMap);
  const groups = groupByTag(tagged);

  it('returns a summary per tag', () => {
    const summary = summarizeByTag(groups);
    const usersSummary = summary.find((s) => s.tag === 'users');
    expect(usersSummary).toBeDefined();
    expect(usersSummary.totalHits).toBe(13);
    expect(usersSummary.routes).toBe(2);
  });

  it('calculates avgTime as average of entry avgTimes', () => {
    const summary = summarizeByTag(groups);
    const usersSummary = summary.find((s) => s.tag === 'users');
    expect(usersSummary.avgTime).toBe(Math.round((50 + 120) / 2));
  });

  it('handles empty groups gracefully', () => {
    const summary = summarizeByTag({ empty: [] });
    expect(summary[0].totalHits).toBe(0);
    expect(summary[0].avgTime).toBe(0);
  });
});
