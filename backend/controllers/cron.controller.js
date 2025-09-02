// backend/controllers/cron.controller.js
const agRepo = require('../repositories/agendamentos.repo');
const execRepo = require('../repositories/jobsExec.repo');
const { runNow } = require('../services/jobs.service');

module.exports = {
  listAgendamentosAtivos: async (req, res) => {
    const rows = await agRepo.listAtivos();
    res.json(rows);
  },
  listarExecucoes: async (req, res) => {
    const { agendamento_id, status, limit } = req.query;
    const rows = await execRepo.list({
      agendamento_id,
      status,
      limit: Number(limit) || 100,
    });
    res.json(rows);
  },
  runNow: async (req, res) => {
    const { id } = req.params;
    await runNow(id);
    res.json({ enqueued: true });
  },
};
