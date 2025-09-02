const Queue = require('bull');
const { FETCH_EXTERNO_PULL, PROCESSA_ARQUIVO, CALLBACK_PUSH } = require('./jobs/definitions');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379
};

const dlq = new Queue('dlq', { redis: redisConfig });

function createQueue(name) {
  const queue = new Queue(name, { redis: redisConfig });
  queue.on('failed', async (job, err) => {
    const payload = {
      ...job.data,
      trace_id: job.data.trace_id,
      failedReason: err.message
    };
    await dlq.add(job.name, payload);
  });
  return queue;
}

const queues = {
  [FETCH_EXTERNO_PULL]: createQueue(FETCH_EXTERNO_PULL),
  [PROCESSA_ARQUIVO]: createQueue(PROCESSA_ARQUIVO),
  [CALLBACK_PUSH]: createQueue(CALLBACK_PUSH)
};

async function enqueue(name, data = {}, opts = {}) {
  const queue = queues[name];
  if (!queue) throw new Error(`Queue ${name} not defined`);
  const trace_id = opts.trace_id || require('crypto').randomUUID();
  const attempts = Number(opts.attempts || process.env.JOB_RETRIES || 3);
  const backoffDelay = Number(opts.backoffDelay || process.env.JOB_BACKOFF || 1000);
  return queue.add(name, { trace_id, ...data }, {
    attempts,
    backoff: { type: 'exponential', delay: backoffDelay }
  });
}

module.exports = {
  queues,
  enqueue,
  dlq
};
