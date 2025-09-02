require('dotenv').config();
const { dlq, enqueue } = require('../jobs.service');

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    const [key, value] = arg.split('=');
    args[key.replace(/^--/, '')] = value || true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const { name, data, inicio, fim, transportadora } = args;

function matchDate(job) {
  const jobDate = new Date(job.timestamp);
  if (data) {
    return jobDate.toISOString().slice(0, 10) === data;
  }
  if (inicio && jobDate < new Date(inicio)) return false;
  if (fim && jobDate > new Date(fim)) return false;
  return true;
}

(async () => {
  const jobs = await dlq.getJobs(['waiting', 'delayed', 'failed']);
  const filtered = jobs.filter(job => {
    if (name && job.name !== name) return false;
    if (!matchDate(job)) return false;
    if (transportadora) {
      const t = job.data.transportadora || job.data.transportadora_id || job.data.transportadoraSlug;
      if (!t || String(t) !== String(transportadora)) return false;
    }
    return true;
  });

  console.log(`Encontrados ${filtered.length} jobs na DLQ`);

  for (const job of filtered) {
    console.log(`Job ${job.id} (${job.name}) - ${new Date(job.timestamp).toISOString()} - transportadora: ${job.data.transportadora || job.data.transportadora_id || 'N/A'}`);
    await enqueue(job.name, job.data);
    await job.remove();
    console.log(`Reenfileirado job ${job.id} (${job.name})`);
  }
  process.exit(0);
})();
