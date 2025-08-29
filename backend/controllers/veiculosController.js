const Veiculo = require('../models/veiculo');

exports.index = async (req, res) => {
  try {
    const data = await Veiculo.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar veículos.' });
  }
};

exports.show = async (req, res) => {
  try {
    const item = await Veiculo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Veículo não encontrado.' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar veículo.' });
  }
};

exports.store = async (req, res) => {
  try {
    const novo = await Veiculo.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar veículo.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await Veiculo.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar veículo.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Veiculo.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir veículo.' });
  }
};
