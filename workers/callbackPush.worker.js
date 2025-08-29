require('dotenv').config();
const { queues } = require('../jobs.service');
const { CALLBACK_PUSH } = require('../jobs/definitions');

const concurrency = Number(process.env.CALLBACK_PUSH_CONCURRENCY || 1);

queues[CALLBACK_PUSH].process(concurrency, async (job) => {
  const { trace_id } = job.data;
  console.log(`[${trace_id}] Iniciando CALLBACK_PUSH`);
  try {
    console.log(`[${trace_id}] Processando CALLBACK_PUSH`);
    console.log(`[${trace_id}] Finalizado CALLBACK_PUSH`);
  } catch (err) {
    console.error(`[${trace_id}] Erro CALLBACK_PUSH`, err);
    throw err;
  }
});
