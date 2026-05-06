const http = require('http');
const { getStats } = require('./tracker');
const { colorMethod } = require('./reporter');

const DEFAULT_PORT = 4242;

function buildHtmlRow(route) {
  const { method, path, count, lastCalled, avgDuration } = route;
  const bar = '█'.repeat(Math.min(count, 30));
  return `
    <tr>
      <td class="method method-${method.toLowerCase()}">${method}</td>
      <td class="path">${path}</td>
      <td class="count">${count}</td>
      <td class="bar">${bar}</td>
      <td class="avg">${avgDuration != null ? avgDuration.toFixed(1) + ' ms' : '—'}</td>
      <td class="last">${lastCalled ? new Date(lastCalled).toLocaleTimeString() : '—'}</td>
    </tr>`;
}

function buildHtml(stats) {
  const rows = stats.length
    ? stats.map(buildHtmlRow).join('')
    : '<tr><td colspan="6" class="empty">No routes recorded yet.</td></tr>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="3" />
  <title>RouteWatch Dashboard</title>
  <link rel="stylesheet" href="/dashboard.css" />
</head>
<body>
  <h1>🛣 RouteWatch</h1>
  <p class="subtitle">Live route usage — refreshes every 3 s</p>
  <table>
    <thead>
      <tr><th>Method</th><th>Path</th><th>Hits</th><th>Bar</th><th>Avg</th><th>Last Called</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function startDashboard(port = DEFAULT_PORT) {
  const server = http.createServer((req, res) => {
    if (req.url === '/dashboard.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(require('./dashboardStyles').css);
      return;
    }
    if (req.url === '/api/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getStats()));
      return;
    }
    const stats = getStats();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(buildHtml(stats));
  });

  server.listen(port, () => {
    console.log(`[routewatch] Dashboard running at http://localhost:${port}`);
  });

  return server;
}

module.exports = { startDashboard, buildHtml };
