require('dotenv').config();
const { queues } = require('../jobs.service');
const { FETCH_EXTERNO_PULL } = require('../jobs/definitions');

const concurrency = Number(process.env.FETCH_EXTERNO_CONCURRENCY || 1);

queues[FETCH_EXTERNO_PULL].process(concurrency, async (job) => {
  const { trace_id } = job.data;
  console.log(`[${trace_id}] Iniciando FETCH_EXTERNO_PULL`);
  try {
    console.log(`[${trace_id}] Processando FETCH_EXTERNO_PULL`);
    console.log(`[${trace_id}] Finalizado FETCH_EXTERNO_PULL`);
  } catch (err) {
    console.error(`[${trace_id}] Erro FETCH_EXTERNO_PULL`, err);
    throw err;
  }
});
