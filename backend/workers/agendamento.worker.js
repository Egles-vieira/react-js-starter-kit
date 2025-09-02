// backend/workers/agendamento.worker.js
const axios = require('axios');
const pool = require('../config/db');
const logger = require('../config/logger');

/**
 * Worker para processar jobs de agendamento
 * @param {Object} job - Job do Bull contendo os dados do agendamento
 */
async function processAgendamento(job) {
  const { data } = job;
  const { 
    agendamentoId, 
    nome, 
    url, 
    metodo = 'POST', 
    headers = {}, 
    payload = {}, 
    metas = {},
    integracaoId,
    transportadoraId 
  } = data;

  const traceId = `job_${job.id}_${Date.now()}`;
  
  logger.info(`[worker] Iniciando processamento do agendamento: ${nome}`, {
    trace_id: traceId,
    agendamento_id: agendamentoId,
    job_id: job.id
  });

  // Registrar início da execução no banco de dados (apenas se não for teste)
  let execucaoId;
  if (agendamentoId !== 'test-123') {
    try {
      const { rows } = await pool.query(`
        INSERT INTO jobs_execucoes (agendamento_id, status, executado_em, log)
        VALUES ($1, $2, NOW(), $3)
        RETURNING id
      `, [agendamentoId, 'running', `Iniciando execução - Job ID: ${job.id}`]);
      
      execucaoId = rows[0].id;
      
      logger.info(`[worker] Execução registrada no banco`, {
        trace_id: traceId,
        execucao_id: execucaoId
      });
    } catch (dbError) {
      logger.error(`[worker] Erro ao registrar início da execução`, {
        trace_id: traceId,
        error: dbError.message
      });
      throw dbError;
    }
  } else {
    logger.info(`[worker] Modo de teste - pulando registro no banco`, {
      trace_id: traceId
    });
  }

  try {
    // Preparar headers da requisição
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'RoadGuard-Scheduler/1.0',
      ...headers
    };

    // Configurar a requisição HTTP
    const requestConfig = {
      method: metodo.toUpperCase(),
      url: url,
      headers: requestHeaders,
      timeout: 30000, // 30 segundos de timeout
    };

    // Adicionar payload se for POST, PUT ou PATCH
    if (['POST', 'PUT', 'PATCH'].includes(metodo.toUpperCase())) {
      requestConfig.data = payload;
    }

    logger.info(`[worker] Executando requisição HTTP`, {
      trace_id: traceId,
      method: metodo,
      url: url,
      headers: requestHeaders
    });

    // Executar a requisição
    const startTime = Date.now();
    const response = await axios(requestConfig);
    const duration = Date.now() - startTime;

    logger.info(`[worker] Requisição executada com sucesso`, {
      trace_id: traceId,
      status_code: response.status,
      duration_ms: duration,
      response_size: JSON.stringify(response.data).length
    });

    // Atualizar status da execução para sucesso (apenas se não for teste)
    if (agendamentoId !== 'test-123' && execucaoId) {
      await pool.query(`
        UPDATE jobs_execucoes 
        SET status = $1, log = $2, updated_at = NOW()
        WHERE id = $3
      `, [
        'success', 
        JSON.stringify({
          status_code: response.status,
          duration_ms: duration,
          response_headers: response.headers,
          response_data: response.data,
          trace_id: traceId
        }), 
        execucaoId
      ]);
    }

    return {
      success: true,
      statusCode: response.status,
      duration: duration,
      traceId: traceId
    };

  } catch (error) {
    logger.error(`[worker] Erro ao executar agendamento`, {
      trace_id: traceId,
      error: error.message,
      stack: error.stack
    });

    // Atualizar status da execução para falha (apenas se não for teste)
    if (agendamentoId !== 'test-123' && execucaoId) {
      await pool.query(`
        UPDATE jobs_execucoes 
        SET status = $1, log = $2, updated_at = NOW()
        WHERE id = $3
      `, [
        'failed', 
        JSON.stringify({
          error: error.message,
          stack: error.stack,
          trace_id: traceId,
          timestamp: new Date().toISOString()
        }), 
        execucaoId
      ]);
    }

    // Re-lançar o erro para que o Bull possa lidar com retries
    throw error;
  }
}

module.exports = { processAgendamento };

