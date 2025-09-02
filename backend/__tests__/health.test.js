const request = require('supertest');
const app = require('../server');

describe('Health and metrics endpoints', () => {
  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /api/metrics', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memoryUsage');
  });
});
