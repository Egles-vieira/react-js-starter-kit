const express = require('express');
const repo = require('../repositories/agendamentos.repo');
const router = express.Router();
const { celebrate, Joi, Segments } = require('celebrate');
const cron = require('cron-validator');

// GET /api/agendamentos
router.get('/', async (req, res) => {
  try {
    const rows = await repo.list();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/agendamentos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await repo.getById(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/agendamentos
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      nome: Joi.string().required(),
      cron: Joi.string().required(),
      transportadora_id: Joi.number().integer().optional(),
      url: Joi.string().optional(),
      metodo: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').default('POST'),
      janela_minutos: Joi.number().integer().min(1).default(5),
      ativo: Joi.boolean().default(true),
      headers: Joi.object().optional(),
      payload: Joi.object().optional(),
      metas: Joi.object().optional()
    })
  }),
  async (req, res) => {
    try {
      const { cron: cronExpr } = req.body;
      if (!cron.isValidCron(cronExpr)) {
        return res.status(400).json({ message: 'Expressão CRON inválida' });
      }
      const agendamento = await repo.create(req.body);
      res.status(201).json(agendamento);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// PUT /api/agendamentos/:id
router.put(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object({ id: Joi.string().required() }),
    [Segments.BODY]: Joi.object({
      nome: Joi.string().required(),
      cron: Joi.string().required(),
      transportadora_id: Joi.number().integer().optional(),
      url: Joi.string().optional(),
      metodo: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').default('POST'),
      janela_minutos: Joi.number().integer().min(1).default(5),
      ativo: Joi.boolean().default(true),
      headers: Joi.object().optional(),
      payload: Joi.object().optional(),
      metas: Joi.object().optional()
    })
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { cron: cronExpr } = req.body;
      
      if (!cron.isValidCron(cronExpr)) {
        return res.status(400).json({ message: 'Expressão CRON inválida' });
      }
      
      const agendamento = await repo.update(id, req.body);
      if (!agendamento) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      res.json(agendamento);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// PATCH /api/agendamentos/:id/status
router.patch(
  '/:id/status',
  celebrate({
    [Segments.PARAMS]: Joi.object({ id: Joi.string().required() }),
    [Segments.BODY]: Joi.object({ ativo: Joi.boolean().required() })
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { ativo } = req.body;
      
      await repo.updatePartial(id, { ativo });
      const agendamento = await repo.getById(id);
      
      if (!agendamento) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      res.json(agendamento);
    } catch (error) {
      console.error('Erro ao alterar status do agendamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// POST /api/agendamentos/:id/run
router.post(
  '/:id/run',
  celebrate({
    [Segments.PARAMS]: Joi.object({ id: Joi.string().required() })
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const agendamento = await repo.getById(id);
      if (!agendamento) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      // Simula execução do job (aqui você integraria com o sistema de jobs real)
      console.log(`Executando agendamento ${id} manualmente...`);
      
      res.json({ 
        message: 'Job executado com sucesso', 
        agendamento_id: id,
        executed_at: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Erro ao executar agendamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// DELETE /api/agendamentos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const agendamento = await repo.getById(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    await repo.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
