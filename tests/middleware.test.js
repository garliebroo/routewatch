const express = require('express');
const request = require('supertest');
const { routewatch, getStats, reset } = require('../src/index');

function buildApp(options) {
  const app = express();
  app.use(routewatch(options));

  app.get('/users', (_req, res) => res.json([]));
  app.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
  app.post('/users', (_req, res) => res.status(201).json({ created: true }));
  app.get('/error', (_req, res) => res.status(500).json({ error: 'oops' }));

  return app;
}

beforeEach(() => reset());

describe('routewatch middleware', () => {
  it('records a GET request', async () => {
    const app = buildApp();
    await request(app).get('/users').expect(200);

    const stats = getStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].method).toBe('GET');
    expect(stats[0].path).toBe('/users');
    expect(stats[0].hits).toBe(1);
    expect(stats[0].statusCodes[200]).toBe(1);
  });

  it('accumulates multiple hits on the same route', async () => {
    const app = buildApp();
    await request(app).get('/users');
    await request(app).get('/users');
    await request(app).get('/users');

    const stats = getStats();
    expect(stats[0].hits).toBe(3);
  });

  it('resolves parameterised routes correctly', async () => {
    const app = buildApp();
    await request(app).get('/users/42');
    await request(app).get('/users/99');

    const stats = getStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].path).toBe('/users/:id');
    expect(stats[0].hits).toBe(2);
  });

  it('tracks status codes separately', async () => {
    const app = buildApp();
    await request(app).post('/users');
    await request(app).get('/error');

    const stats = getStats();
    const post = stats.find(s => s.method === 'POST');
    expect(post.statusCodes[201]).toBe(1);

    const err = stats.find(s => s.path === '/error');
    expect(err.statusCodes[500]).toBe(1);
  });

  it('computes avgDuration as a positive number', async () => {
    const app = buildApp();
    await request(app).get('/users');

    const stats = getStats();
    expect(stats[0].avgDuration).toBeGreaterThanOrEqual(0);
  });

  it('reset clears all stats', async () => {
    const app = buildApp();
    await request(app).get('/users');
    reset();
    expect(getStats()).toHaveLength(0);
  });
});
