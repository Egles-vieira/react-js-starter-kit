require('dotenv').config();
const { queues } = require('../jobs.service');
const { CALLBACK_PUSH } = require('../jobs/definitions');
const jobsRepository = require('../repositories/jobs.repository');
const errorsRepository = require('../repositories/errors.repository');

const concurrency = Number(process.env.CALLBACK_PUSH_CONCURRENCY || 1);

queues[CALLBACK_PUSH].process(concurrency, async (job) => {
  const { trace_id } = job.data;
  console.log(`[${trace_id}] Iniciando CALLBACK_PUSH`);
  const exec = await jobsRepository.insertExecution({
    agendamento_id: job.data.agendamento_id,
    status: 'RUNNING',
    tentativas: job.attemptsMade + 1,
    payload_req: job.data,
    trace_id,
  });
  try {
    console.log(`[${trace_id}] Processando CALLBACK_PUSH`);
    await jobsRepository.updateExecution(exec.id, {
      status: 'SUCCESS',
      tentativas: job.attemptsMade + 1,
      payload_res: null,
    });
    console.log(`[${trace_id}] Finalizado CALLBACK_PUSH`);
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
    console.error(`[${trace_id}] Erro CALLBACK_PUSH`, err);
    throw err;
  }
});
