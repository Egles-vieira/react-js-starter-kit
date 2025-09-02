require('dotenv').config();
// workers/fetchExterno.worker.js (e similares)

const { queue } = require('../backend/services/jobs.service'); // <— ajustar path
const { FETCH_EXTERNO_PULL } = require('../jobs/definitions');
const jobsRepository = require('../repositories/jobs.repository');
const errorsRepository = require('../repositories/errors.repository');
const concurrency = Number(process.env.FETCH_EXTERNO_CONCURRENCY || 1);

queues[FETCH_EXTERNO_PULL].process(concurrency, async (job) => {
  const { trace_id } = job.data;
  console.log(`[${trace_id}] Iniciando FETCH_EXTERNO_PULL`);
  const exec = await jobsRepository.insertExecution({
    agendamento_id: job.data.agendamento_id,
    status: 'RUNNING',
    tentativas: job.attemptsMade + 1,
    payload_req: job.data,
    trace_id,
  });
  try {
    console.log(`[${trace_id}] Processando FETCH_EXTERNO_PULL`);
    await jobsRepository.updateExecution(exec.id, {
      status: 'SUCCESS',
      tentativas: job.attemptsMade + 1,
      payload_res: null,
    });
    console.log(`[${trace_id}] Finalizado FETCH_EXTERNO_PULL`);
  } catch (err) {
    await jobsRepository.updateExecution(exec.id, {
      status: 'ERROR',
      tentativas: job.attemptsMade + 1,
      erro_msg: err.message,
    });
    await errorsRepository.insertError({
      integracao_id: job.data.integracao_id,
      codigo: err.code,
      mensagem: err.message,
      detalhe: { trace_id, stack: err.stack, payload: job.data },
    });
    console.error(`[${trace_id}] Erro FETCH_EXTERNO_PULL`, err);
    throw err;
  }
});
