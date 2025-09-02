const express = require('express');
const webhooksRoutes = require('../routes/webhooks');
const jobsRoutes = require('../routes/jobs');
const { postWithRetry } = require('../utils/httpClient');
const webhooksController = require('../controllers/webhooksController');
const jobsController = require('../controllers/jobsController');

let server;
let baseURL;

beforeAll(() => {
  const app = express();
  app.use(express.json());
  app.use('/api/webhooks', webhooksRoutes);
  app.use('/api/jobs', jobsRoutes);
  server = app.listen(0);
  baseURL = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  webhooksController._reset();
  jobsController._reset();
});

test('webhooks endpoint with retry', async () => {
  const url = `${baseURL}/api/webhooks/jadlog/status?failSequence=429,500`;
  const res = await postWithRetry(url, { ok: true }, { retries: 5, backoff: 10 });
  expect(res.status).toBe(200);
  expect(res.data).toEqual({ transportadora: 'jadlog', slug: 'status', received: true });
});

test('jobs run endpoint with retry', async () => {
  const url = `${baseURL}/api/jobs/run/123?failSequence=500`;
  const res = await postWithRetry(url, {}, { retries: 3, backoff: 10 });
  expect(res.status).toBe(200);
  expect(res.data).toEqual({ agendamentoId: '123', run: true });
});
