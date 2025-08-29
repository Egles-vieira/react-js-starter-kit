require('dotenv').config();
const { queues } = require('../jobs.service');
const { PROCESSA_ARQUIVO } = require('../jobs/definitions');

const concurrency = Number(process.env.PROCESSA_ARQUIVO_CONCURRENCY || 1);

queues[PROCESSA_ARQUIVO].process(concurrency, async (job) => {
  const { trace_id } = job.data;
  console.log(`[${trace_id}] Iniciando PROCESSA_ARQUIVO`);
  try {
    console.log(`[${trace_id}] Processando PROCESSA_ARQUIVO`);
    console.log(`[${trace_id}] Finalizado PROCESSA_ARQUIVO`);
  } catch (err) {
    console.error(`[${trace_id}] Erro PROCESSA_ARQUIVO`, err);
    throw err;
  }
});
