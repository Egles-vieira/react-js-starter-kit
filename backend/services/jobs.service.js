// backend/services/jobs.service.js
const Queue = require('bull');
const { processAgendamento } = require('../workers/agendamento.worker');
const logger = require('../config/logger');

const jobsQueue = new Queue('jobs', {
  redis: { 
    host: process.env.REDIS_HOST || '127.0.0.1', 
    port: Number(process.env.REDIS_PORT) || 6379 
  },
  defaultJobOptions: {
    removeOnComplete: 100, // Manter apenas os últimos 100 jobs completos
    removeOnFail: 50,      // Manter apenas os últimos 50 jobs falhos
    attempts: 3,           // Tentar até 3 vezes
    backoff: {
      type: 'exponential',
      delay: 2000,         // Começar com 2 segundos de delay
    },
  }
});

// Configurar o processamento de jobs
jobsQueue.process('processAgendamento', 5, async (job) => {
  logger.info(`[jobs] Processando job: ${job.id}`, {
    job_id: job.id,
    job_data: job.data
  });
  
  try {
    const result = await processAgendamento(job);
    logger.info(`[jobs] Job processado com sucesso: ${job.id}`, {
      job_id: job.id,
      result: result
    });
    return result;
  } catch (error) {
    logger.error(`[jobs] Erro ao processar job: ${job.id}`, {
      job_id: job.id,
      error: error.message,
      attempt: job.attemptsMade + 1,
      max_attempts: job.opts.attempts
    });
    throw error;
  }
});

// Event listeners para monitoramento
jobsQueue.on('completed', (job, result) => {
  logger.info(`[jobs] Job completado: ${job.id}`, {
    job_id: job.id,
    result: result
  });
});

jobsQueue.on('failed', (job, err) => {
  logger.error(`[jobs] Job falhou: ${job.id}`, {
    job_id: job.id,
    error: err.message,
    attempts_made: job.attemptsMade,
    max_attempts: job.opts.attempts
  });
});

jobsQueue.on('stalled', (job) => {
  logger.warn(`[jobs] Job travado: ${job.id}`, {
    job_id: job.id
  });
});

// compat: alguns arquivos esperam { queue }
const queue = jobsQueue;

async function enqueue(name, data = {}, options = {}) {
  try {
    const job = await jobsQueue.add(name, data, options);
    logger.info(`[jobs] Job enfileirado: ${job.id}`, {
      job_id: job.id,
      job_name: name,
      job_data: data
    });
    return job.id;
  } catch (error) {
    logger.error(`[jobs] Erro ao enfileirar job`, {
      job_name: name,
      error: error.message
    });
    throw error;
  }
}

async function status(id) {
  try {
    const job = await jobsQueue.getJob(id);
    if (!job) return null;
    const state = await job.getState();
    return { 
      id: job.id, 
      state,
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason
    };
  } catch (error) {
    logger.error(`[jobs] Erro ao obter status do job: ${id}`, {
      job_id: id,
      error: error.message
    });
    throw error;
  }
}

async function runNow(agendamentoId) {
  try {
    // Buscar dados do agendamento no banco
    const pool = require('../config/db');
    const { rows } = await pool.query(`
      SELECT 
        id, 
        nome, 
        cron, 
        integracao_id,
        transportadora_id,
        url,
        metodo,
        COALESCE(headers, '{}') AS headers,
        COALESCE(payload, '{}') AS payload,
        COALESCE(metas, '{}') AS metas
      FROM agendamentos 
      WHERE id = $1 AND ativo = true
    `, [agendamentoId]);

    if (rows.length === 0) {
      throw new Error(`Agendamento ${agendamentoId} não encontrado ou inativo`);
    }

    const agendamento = rows[0];
    
    // Enfileirar o job imediatamente
    const jobId = await enqueue('processAgendamento', {
      agendamentoId: agendamento.id,
      nome: agendamento.nome,
      url: agendamento.url,
      metodo: agendamento.metodo,
      headers: agendamento.headers,
      payload: agendamento.payload,
      metas: agendamento.metas,
      integracaoId: agendamento.integracao_id,
      transportadoraId: agendamento.transportadora_id
    }, {
      priority: 10 // Alta prioridade para execução manual
    });

    logger.info(`[jobs] Agendamento executado manualmente`, {
      agendamento_id: agendamentoId,
      job_id: jobId
    });

    return jobId;
  } catch (error) {
    logger.error(`[jobs] Erro ao executar agendamento manualmente`, {
      agendamento_id: agendamentoId,
      error: error.message
    });
    throw error;
  }
}

// Função para obter estatísticas da fila
async function getQueueStats() {
  try {
    const waiting = await jobsQueue.getWaiting();
    const active = await jobsQueue.getActive();
    const completed = await jobsQueue.getCompleted();
    const failed = await jobsQueue.getFailed();
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  } catch (error) {
    logger.error(`[jobs] Erro ao obter estatísticas da fila`, {
      error: error.message
    });
    throw error;
  }
}

module.exports = { 
  enqueue, 
  status, 
  runNow, 
  getQueueStats,
  jobsQueue, 
  queue 
};
