// backend/services/scheduler.service.js
require('dotenv').config();
const cron = require('node-cron');
// se você usa Pool/Knex, importe o central:
const pool = require('../config/db'); // ou: const knex = require('../shared/knex');

let task = null;
let started = false;

async function executarAgendamentos() {
  try {
    console.log('[scheduler] Verificando agendamentos ativos...');
    
    // Buscar agendamentos ativos do banco de dados
    const { rows } = await pool.query(`
      SELECT 
        id, 
        nome, 
        cron, 
        integracao_id,
        transportadora_id,
        url,
        metodo,
        COALESCE(janela_minutos, 5) AS janela_minutos, 
        COALESCE(headers, '{}') AS headers,
        COALESCE(payload, '{}') AS payload,
        COALESCE(metas, '{}') AS metas,
        created_at,
        updated_at
      FROM agendamentos 
      WHERE ativo = true
    `);

    console.log(`[scheduler] Encontrados ${rows.length} agendamentos ativos`);

    for (const agendamento of rows) {
      try {
        // Verificar se o agendamento deve ser executado agora
        const shouldRun = await shouldExecuteNow(agendamento);
        
        if (shouldRun) {
          console.log(`[scheduler] Enfileirando job para agendamento: ${agendamento.nome} (${agendamento.id})`);
          
          // Enfileirar o job usando o Bull
          const jobsService = require('./jobs.service');
          await jobsService.enqueue('processAgendamento', {
            agendamentoId: agendamento.id,
            nome: agendamento.nome,
            url: agendamento.url,
            metodo: agendamento.metodo,
            headers: agendamento.headers,
            payload: agendamento.payload,
            metas: agendamento.metas,
            integracaoId: agendamento.integracao_id,
            transportadoraId: agendamento.transportadora_id
          });
        }
      } catch (jobError) {
        console.error(`[scheduler] Erro ao processar agendamento ${agendamento.id}:`, jobError);
      }
    }
  } catch (err) {
    console.error('[scheduler] Erro ao executar scheduler:', err);
  }
}

// Função auxiliar para verificar se um agendamento deve ser executado
async function shouldExecuteNow(agendamento) {
  const cron = require('node-cron');
  
  // Validar se a expressão cron é válida
  if (!cron.validate(agendamento.cron)) {
    console.warn(`[scheduler] Expressão cron inválida para agendamento ${agendamento.id}: ${agendamento.cron}`);
    return false;
  }

  // Verificar se já foi executado recentemente (dentro da janela de minutos)
  const janelaMinutos = agendamento.janela_minutos || 5;
  const agora = new Date();
  const janelaInicio = new Date(agora.getTime() - (janelaMinutos * 60 * 1000));

  try {
    const { rows } = await pool.query(`
      SELECT id FROM jobs_execucoes 
      WHERE agendamento_id = $1 
      AND executado_em >= $2 
      AND status IN ('success', 'running')
      LIMIT 1
    `, [agendamento.id, janelaInicio]);

    if (rows.length > 0) {
      console.log(`[scheduler] Agendamento ${agendamento.id} já foi executado recentemente`);
      return false;
    }
  } catch (dbError) {
    console.error(`[scheduler] Erro ao verificar execuções recentes para ${agendamento.id}:`, dbError);
    return false;
  }

  // Verificar se o momento atual corresponde à expressão cron
  // Para simplificar, vamos executar se estamos dentro do minuto correto
  // Uma implementação mais robusta usaria uma biblioteca como 'cron-parser'
  return true; // Por enquanto, sempre retorna true se passou pelas outras verificações
}

function startScheduler() {
  if (String(process.env.SCHEDULER_ENABLED || 'true').toLowerCase() === 'false') {
    console.log('[scheduler] SCHEDULER_ENABLED=false — não iniciando');
    return;
  }
  if (started) {
    console.log('[scheduler] já iniciado, ignorando');
    return;
  }
  // roda a cada minuto
  task = cron.schedule('* * * * *', () => {
    executarAgendamentos().catch((e) => console.error('Erro ao executar scheduler:', e));
  });
  task.start();
  started = true;
  console.log('[scheduler] iniciado');
}

function stopScheduler() {
  if (task) {
    task.stop();
    task = null;
    started = false;
    console.log('[scheduler] parado');
  }
}

module.exports = { startScheduler, stopScheduler };
