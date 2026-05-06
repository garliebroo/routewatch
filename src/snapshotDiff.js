/**
 * snapshotDiff.js
 * Compare two snapshots and surface changes in route usage.
 */

function diffSnapshots(snapshotA, snapshotB) {
  const statsA = snapshotA.stats || {};
  const statsB = snapshotB.stats || {};
  const allRoutes = new Set([...Object.keys(statsA), ...Object.keys(statsB)]);
  const diff = [];

  for (const route of allRoutes) {
    const a = statsA[route];
    const b = statsB[route];

    if (!a) {
      diff.push({ route, status: 'added', before: null, after: summarize(b) });
    } else if (!b) {
      diff.push({ route, status: 'removed', before: summarize(a), after: null });
    } else {
      const countDelta = b.count - a.count;
      const avgDelta = parseFloat((b.avgMs - a.avgMs).toFixed(2));
      const errorDelta = b.errorCount - a.errorCount;
      if (countDelta !== 0 || avgDelta !== 0 || errorDelta !== 0) {
        diff.push({
          route,
          status: 'changed',
          before: summarize(a),
          after: summarize(b),
          delta: { count: countDelta, avgMs: avgDelta, errorCount: errorDelta },
        });
      } else {
        diff.push({ route, status: 'unchanged', before: summarize(a), after: summarize(b) });
      }
    }
  }

  return diff;
}

function summarize(routeStats) {
  return {
    count: routeStats.count,
    avgMs: routeStats.avgMs,
    errorCount: routeStats.errorCount,
  };
}

function printDiff(diff) {
  const symbols = { added: '+', removed: '-', changed: '~', unchanged: ' ' };
  console.log('\n=== Snapshot Diff ===');
  for (const entry of diff) {
    const sym = symbols[entry.status] || '?';
    if (entry.status === 'changed') {
      const { count, avgMs, errorCount } = entry.delta;
      console.log(`[${sym}] ${entry.route}  calls:${count > 0 ? '+' : ''}${count}  avg:${avgMs > 0 ? '+' : ''}${avgMs}ms  errors:${errorCount > 0 ? '+' : ''}${errorCount}`);
    } else {
      console.log(`[${sym}] ${entry.route}  (${entry.status})`);
    }
  }
  console.log('=====================\n');
}

module.exports = { diffSnapshots, printDiff };
