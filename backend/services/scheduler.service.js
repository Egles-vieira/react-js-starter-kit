const cron = require('node-cron');
const pool = require('../config/db');

/**
 * Agenda a leitura dos agendamentos ativos a cada minuto.
 * Para cada agendamento, tenta criar um lock (agendamento:{id}:lock)
 * com TTL baseado em `janela_minutos`. Caso o lock seja adquirido,
 * um job FETCH_EXTERNO_PULL é enfileirado em tabela de jobs.
 */
async function executarAgendamentos() {
  try {
    // remove locks expirados antes de processar
    await pool.query('DELETE FROM scheduler_locks WHERE expires_at < NOW()');

    const { rows: agendamentos } = await pool.query(
      'SELECT id, trace_id, janela_minutos, metas FROM agendamentos WHERE ativo = true'
    );

    for (const agendamento of agendamentos) {
      const lockKey = `agendamento:${agendamento.id}:lock`;
      const ttlMinutos = agendamento.janela_minutos || 1;

      const result = await pool.query(
        `INSERT INTO scheduler_locks (lock_key, expires_at)
         VALUES ($1, NOW() + ($2 || ' minutes')::interval)
         ON CONFLICT DO NOTHING`,
        [lockKey, ttlMinutos]
      );

      if (result.rowCount > 0) {
        await pool.query(
          'INSERT INTO jobs (tipo, payload) VALUES ($1, $2)',
          [
            'FETCH_EXTERNO_PULL',
            JSON.stringify({
              trace_id: agendamento.trace_id,
              metas: agendamento.metas,
            }),
          ]
        );
      }
    }
  } catch (err) {
    console.error('Erro ao executar scheduler:', err);
  }
}

cron.schedule('* * * * *', executarAgendamentos);

module.exports = { executarAgendamentos };
