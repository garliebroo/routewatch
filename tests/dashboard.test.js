const http = require('http');
const { buildHtml } = require('../src/dashboard');
const { reset, record } = require('../src/tracker');

describe('buildHtml', () => {
  beforeEach(() => reset());

  it('shows empty message when no stats', () => {
    const html = buildHtml([]);
    expect(html).toContain('No routes recorded yet.');
  });

  it('renders a row for each route', () => {
    const stats = [
      { method: 'GET', path: '/users', count: 5, lastCalled: Date.now(), avgDuration: 12.4 },
      { method: 'POST', path: '/users', count: 2, lastCalled: Date.now(), avgDuration: 34.1 },
    ];
    const html = buildHtml(stats);
    expect(html).toContain('/users');
    expect(html).toContain('method-get');
    expect(html).toContain('method-post');
    expect(html).toContain('12.4 ms');
    expect(html).toContain('34.1 ms');
  });

  it('renders bar proportional to count (max 30 blocks)', () => {
    const stats = [{ method: 'GET', path: '/ping', count: 50, lastCalled: null, avgDuration: null }];
    const html = buildHtml(stats);
    const bar = '█'.repeat(30);
    expect(html).toContain(bar);
  });

  it('shows — for missing avgDuration and lastCalled', () => {
    const stats = [{ method: 'DELETE', path: '/item', count: 1, lastCalled: null, avgDuration: null }];
    const html = buildHtml(stats);
    expect(html.match(/—/g).length).toBeGreaterThanOrEqual(2);
  });

  it('includes meta refresh tag', () => {
    const html = buildHtml([]);
    expect(html).toContain('http-equiv="refresh"');
    expect(html).toContain('content="3"');
  });
});

describe('startDashboard HTTP server', () => {
  let server;
  const PORT = 14242;

  beforeAll((done) => {
    reset();
    record('GET', '/test', 10);
    const { startDashboard } = require('../src/dashboard');
    server = startDashboard(PORT);
    server.on('listening', done);
  });

  afterAll((done) => server.close(done));

  function get(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${PORT}${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      }).on('error', reject);
    });
  }

  it('serves HTML on /', async () => {
    const { status, headers } = await get('/');
    expect(status).toBe(200);
    expect(headers['content-type']).toContain('text/html');
  });

  it('serves JSON stats on /api/stats', async () => {
    const { status, body, headers } = await get('/api/stats');
    expect(status).toBe(200);
    expect(headers['content-type']).toContain('application/json');
    const stats = JSON.parse(body);
    expect(Array.isArray(stats)).toBe(true);
    expect(stats[0].path).toBe('/test');
  });

  it('serves CSS on /dashboard.css', async () => {
    const { status, headers } = await get('/dashboard.css');
    expect(status).toBe(200);
    expect(headers['content-type']).toContain('text/css');
  });
});
