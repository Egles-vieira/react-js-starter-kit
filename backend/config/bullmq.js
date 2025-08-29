const { Queue, Worker, QueueScheduler } = require('bullmq');
const env = require('./env');

function createQueue(name, processor, options = {}) {
  const queueName = `${env.bullmq.prefix}:${name}`;
  const queue = new Queue(queueName, options);
  const worker = processor ? new Worker(queueName, processor, options) : null;
  const scheduler = new QueueScheduler(queueName, options);
  return { queue, worker, scheduler };
}

module.exports = { createQueue };
