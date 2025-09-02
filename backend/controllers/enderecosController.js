const Endereco = require('../models/endereco');

exports.index = async (req, res) => {
  try {
    if (req.query.cliente_id) {
      const data = await Endereco.findByClienteId(req.query.cliente_id);
      return res.json(data);
    }

    const data = await Endereco.findAll(); // fallback
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar endereços.' });
  }
};

exports.show = async (req, res) => {
  try {
    const item = await Endereco.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Endereço não encontrado.' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar endereço.' });
  }
};

exports.byCliente = async (req, res) => {
  try {
    const itens = await Endereco.findByClienteId(req.params.cliente_id);
    res.json(itens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar endereços do cliente.' });
  }
};

exports.store = async (req, res) => {
  try {
    const novo = await Endereco.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    // Aqui detecta o erro de duplicidade
    if (err.code === 'DUPLICATE_ADDRESS') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao criar endereço.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await Endereco.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar endereço.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Endereco.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir endereço.' });
  }
};