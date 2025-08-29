const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const jobsService = require('../services/jobs.service');

const router = express.Router();

const execucoes = [];

// POST /api/jobs/run/:agendamentoId
router.post(
  '/run/:agendamentoId',
  celebrate({
    [Segments.PARAMS]: Joi.object({ agendamentoId: Joi.number().integer().required() })
  }),
  async (req, res) => {
    const { agendamentoId } = req.params;
    const jobId = await jobsService.enqueue('agendamento', { agendamentoId });
    execucoes.push({ agendamentoId: Number(agendamentoId), jobId });
    res.status(202).json({ jobId });
  }
);

// GET /api/jobs/execucoes
router.get('/execucoes', (req, res) => {
  res.json(execucoes);
});

module.exports = router;
