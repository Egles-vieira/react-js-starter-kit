const repo = require('../repositories/ocorrencias.repo');

module.exports = {
  list: async (req, res) => {
    try {
      const filters = {};
      if (req.query.nota_fiscal_id) filters.nota_fiscal_id = req.query.nota_fiscal_id;
      if (req.query.transportadora_id) filters.transportadora_id = req.query.transportadora_id;
      if (req.query.status_normalizado) filters.status_normalizado = req.query.status_normalizado;
      
      const rows = await repo.list(filters);
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
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      res.json(row);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  create: async (req, res) => {
    try {
      const row = await repo.create(req.body);
      
      if (req.body.nota_fiscal_id) {
        await repo.updateNotaFiscalStatus(req.body.nota_fiscal_id);
      }
      
      res.status(201).json(row);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
