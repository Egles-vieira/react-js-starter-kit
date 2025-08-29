require('dotenv').config();
const { dlq, enqueue } = require('../jobs.service');

const filter = process.argv[2];

(async () => {
  const jobs = await dlq.getJobs(['waiting', 'delayed', 'failed']);
  for (const job of jobs) {
    if (filter && job.name !== filter) continue;
    await enqueue(job.name, job.data);
    await job.remove();
    console.log(`Reenfileirado job ${job.id} (${job.name})`);
  }
  process.exit(0);
})();
