const { record, getResponseStats, reset } = require('../src/responseStats');
const express = require('express');
const request = require('supertest');
const { responseSizeMiddleware } = require('../src/responseSizeMiddleware');

beforeEach(() => reset());

describe('responseStats — record & getResponseStats', () => {
  test('records a single hit and computes avg', () => {
    record('/api/users', 'GET', 512);
    const stats = getResponseStats();
    expect(stats).toHaveLength(1);
    expect(stats[0]).toMatchObject({
      route: '/api/users',
      method: 'GET',
      totalBytes: 512,
      count: 1,
      avgBytes: 512,
      minBytes: 512,
      maxBytes: 512,
    });
  });

  test('accumulates multiple hits for the same route', () => {
    record('/api/items', 'GET', 100);
    record('/api/items', 'GET', 300);
    const stats = getResponseStats();
    expect(stats[0].count).toBe(2);
    expect(stats[0].totalBytes).toBe(400);
    expect(stats[0].avgBytes).toBe(200);
    expect(stats[0].minBytes).toBe(100);
    expect(stats[0].maxBytes).toBe(300);
  });

  test('tracks different method+route combinations separately', () => {
    record('/api/items', 'GET', 200);
    record('/api/items', 'POST', 50);
    const stats = getResponseStats();
    expect(stats).toHaveLength(2);
  });

  test('reset clears all stats', () => {
    record('/api/users', 'GET', 100);
    reset();
    expect(getResponseStats()).toHaveLength(0);
  });

  test('returns 0 for min/max when count is 0 after reset', () => {
    // fresh state after reset — nothing recorded
    expect(getResponseStats()).toEqual([]);
  });
});

describe('responseSizeMiddleware integration', () => {
  function buildApp() {
    const app = express();
    app.use(responseSizeMiddleware);
    app.get('/ping', (_req, res) => res.send('pong'));
    app.post('/data', express.json(), (req, res) => res.json({ ok: true }));
    return app;
  }

  test('records response size for GET /ping', async () => {
    const app = buildApp();
    await request(app).get('/ping');
    const stats = getResponseStats();
    const entry = stats.find((s) => s.route === '/ping' && s.method === 'GET');
    expect(entry).toBeDefined();
    expect(entry.count).toBe(1);
    expect(entry.totalBytes).toBeGreaterThan(0);
  });

  test('records response size for POST /data', async () => {
    const app = buildApp();
    await request(app).post('/data').send({ x: 1 });
    const stats = getResponseStats();
    const entry = stats.find((s) => s.route === '/data' && s.method === 'POST');
    expect(entry).toBeDefined();
    expect(entry.totalBytes).toBeGreaterThan(0);
  });
});
