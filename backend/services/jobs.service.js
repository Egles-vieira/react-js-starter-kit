const Queue = require('bull');

const jobsQueue = new Queue('jobs', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379
  }
});

async function enqueue(name, data = {}) {
  const job = await jobsQueue.add(name, data);
  return job.id;
}

async function status(id) {
  const job = await jobsQueue.getJob(id);
  if (!job) return null;
  const state = await job.getState();
  return { id: job.id, state };
}

module.exports = {
  enqueue,
  status,
  jobsQueue
};
