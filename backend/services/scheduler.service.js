// backend/services/scheduler.service.js
require('dotenv').config();
const cron = require('node-cron');
// se você usa Pool/Knex, importe o central:
const pool = require('../config/db'); // ou: const knex = require('../shared/knex');

let task = null;
let started = false;

async function executarAgendamentos() {
  try {
    // SUA lógica atual aqui:
    // - ler agendamentos ativos (COALESCE em colunas novas: janela_minutos, metas, etc.)
    // - lock em scheduler_locks
    // - enfileirar no Bull
    // Exemplo: const { rows } = await pool.query('SELECT id, nome, cron, COALESCE(janela_minutos,5) AS janela_minutos, COALESCE(metas, \'{}\'::jsonb) AS metas FROM public.agendamentos WHERE ativo = true');
  } catch (err) {
    console.error('Erro ao executar scheduler:', err);
  }
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
