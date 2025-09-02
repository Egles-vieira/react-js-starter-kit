// backend/controllers/cron.controller.js
const agRepo = require('../repositories/agendamentos.repo');
const execRepo = require('../repositories/jobsExec.repo');
const { runNow, getQueueStats } = require('../services/jobs.service');

module.exports = {
  listAgendamentosAtivos: async (req, res) => {
    try {
      const rows = await agRepo.listAtivos();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  listarExecucoes: async (req, res) => {
    try {
      const { agendamento_id, status, limit } = req.query;
      const rows = await execRepo.list({
        agendamento_id,
        status,
        limit: Number(limit) || 100,
      });
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  runNow: async (req, res) => {
    try {
      const { id } = req.params;
      const jobId = await runNow(id);
      res.json({ enqueued: true, jobId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getQueueStats: async (req, res) => {
    try {
      const stats = await getQueueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
