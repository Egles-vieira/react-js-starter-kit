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

    let processedOccurrences = 0;
    if (response.data && transportadoraId) {
      processedOccurrences = await processTransporterResponse(response.data, transportadoraId, traceId);
    }

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
          trace_id: traceId,
          processed_occurrences: processedOccurrences
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

async function processTransporterResponse(responseData, transportadoraId, traceId) {
  const ocorrenciasRepo = require('../repositories/ocorrencias.repo');
  const transportadoraCodigoRepo = require('../repositories/transportadora-codigo-ocorrencia.repo');
  const errosRepo = require('../repositories/errors.repo');
  
  logger.info(`[worker] Processando resposta da transportadora`, {
    trace_id: traceId,
    transportadora_id: transportadoraId,
    records_count: Array.isArray(responseData) ? responseData.length : 1
  });

  const records = Array.isArray(responseData) ? responseData : [responseData];
  let processedCount = 0;
  
  for (const record of records) {
    try {
      const { chave_nf, codigo_externo, descricao, data_ocorrencia } = extractOccurrenceData(record);
      
      if (!chave_nf || !codigo_externo) {
        logger.warn(`[worker] Dados insuficientes para processar ocorrência`, {
          trace_id: traceId,
          record
        });
        continue;
      }

      const notaFiscal = await pool.query(
        'SELECT id FROM notas_fiscais WHERE chave_nf = $1',
        [chave_nf]
      );

      if (notaFiscal.rows.length === 0) {
        logger.warn(`[worker] Nota fiscal não encontrada`, {
          trace_id: traceId,
          chave_nf
        });
        continue;
      }

      const notaFiscalId = notaFiscal.rows[0].id;

      const mapeamento = await transportadoraCodigoRepo.getByTransportadoraAndCodigo(
        transportadoraId, 
        codigo_externo
      );

      let statusNormalizado = 'unknown';
      let codigoOcorrenciaId = null;

      if (mapeamento) {
        statusNormalizado = mapeamento.status_normalizado;
        codigoOcorrenciaId = mapeamento.codigo_ocorrencia_id;
      } else {
        await errosRepo.create({
          integracao_id: null,
          codigo: 'MAPEAMENTO_INEXISTENTE',
          mensagem: `Código externo não mapeado: ${codigo_externo}`,
          detalhe: {
            transportadora_id: transportadoraId,
            codigo_externo,
            trace_id: traceId
          }
        });
      }

      await ocorrenciasRepo.create({
        nota_fiscal_id: notaFiscalId,
        transportadora_id: transportadoraId,
        codigo_externo,
        codigo_ocorrencia_id: codigoOcorrenciaId,
        status_normalizado: statusNormalizado,
        descricao,
        data_ocorrencia: data_ocorrencia ? new Date(data_ocorrencia) : new Date(),
        dados_originais: record
      });

      await ocorrenciasRepo.updateNotaFiscalStatus(notaFiscalId);

      processedCount++;

      logger.info(`[worker] Ocorrência processada`, {
        trace_id: traceId,
        nota_fiscal_id: notaFiscalId,
        codigo_externo,
        status_normalizado
      });

    } catch (error) {
      logger.error(`[worker] Erro ao processar ocorrência`, {
        trace_id: traceId,
        error: error.message,
        record
      });
    }
  }
  
  return processedCount;
}

function extractOccurrenceData(record) {
  return {
    chave_nf: record.chave_nf || record.nf_key || record.invoice_key,
    codigo_externo: record.codigo || record.status_code || record.event_code,
    descricao: record.descricao || record.description || record.message,
    data_ocorrencia: record.data_ocorrencia || record.event_date || record.timestamp
  };
}

module.exports = { processAgendamento };

