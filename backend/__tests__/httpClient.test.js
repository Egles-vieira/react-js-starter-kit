const nock = require('nock');
const { postWithRetry } = require('../utils/httpClient');

const BASE_URL = 'http://example.com';

describe('postWithRetry', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('resolves on first attempt', async () => {
    nock(BASE_URL).post('/test').reply(200, { ok: true });
    const res = await postWithRetry(`${BASE_URL}/test`, { a: 1 });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ok: true });
  });

  test('retries on 429 and 500 and eventually succeeds', async () => {
    const scope = nock(BASE_URL)
      .post('/retry')
      .reply(429)
      .post('/retry')
      .reply(500)
      .post('/retry')
      .reply(200, { ok: true });
    const res = await postWithRetry(`${BASE_URL}/retry`, {} , { retries: 5, backoff: 10 });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ok: true });
    expect(scope.isDone()).toBe(true);
  });

  test('fails after exceeding retries', async () => {
    const scope = nock(BASE_URL)
      .post('/fail')
      .times(3)
      .reply(500);
    await expect(postWithRetry(`${BASE_URL}/fail`, {}, { retries: 2, backoff: 10 })).rejects.toBeDefined();
    expect(scope.isDone()).toBe(true);
  });
});
