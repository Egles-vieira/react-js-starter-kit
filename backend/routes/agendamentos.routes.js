const express = require('express');
const cron = require('node-cron');
const { celebrate, Joi, Segments } = require('celebrate');

const router = express.Router();

const agendamentos = [];
let nextId = 1;

// GET /api/agendamentos
router.get('/', (req, res) => {
  res.json(agendamentos);
});

// POST /api/agendamentos
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      nome: Joi.string().required(),
      cron: Joi.string().required()
    })
  }),
  (req, res) => {
    const { nome, cron: cronExpr } = req.body;
    if (!cron.validate(cronExpr)) {
      return res.status(400).json({ message: 'Expressão CRON inválida' });
    }
    const agendamento = { id: nextId++, nome, cron: cronExpr };
    agendamentos.push(agendamento);
    res.status(201).json(agendamento);
  }
);

// PATCH /api/agendamentos/:id
router.patch(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object({ id: Joi.number().integer().required() }),
    [Segments.BODY]: Joi.object({ cron: Joi.string().required() })
  }),
  (req, res) => {
    const { id } = req.params;
    const agendamento = agendamentos.find(a => a.id === Number(id));
    if (!agendamento) return res.sendStatus(404);
    if (!cron.validate(req.body.cron)) {
      return res.status(400).json({ message: 'Expressão CRON inválida' });
    }
    agendamento.cron = req.body.cron;
    res.json(agendamento);
  }
);

module.exports = router;
