const repo = require('../repositories/transportadora-codigo-ocorrencia.repo');

module.exports = {
  list: async (req, res) => {
    try {
      const rows = await repo.list();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await repo.getById(id);
      if (!row) {
        return res.status(404).json({ error: 'Mapeamento não encontrado' });
      }
      res.json(row);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  create: async (req, res) => {
    try {
      const row = await repo.create(req.body);
      res.status(201).json(row);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Mapeamento já existe para esta transportadora e código externo' });
      }
      res.status(500).json({ error: error.message });
    }
  },
  
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await repo.update(id, req.body);
      if (!row) {
        return res.status(404).json({ error: 'Mapeamento não encontrado' });
      }
      res.json(row);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await repo.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
