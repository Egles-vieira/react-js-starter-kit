const Transportadora = require('../models/transportadora');

exports.index = async (req, res) => {
  try {
    const data = await Transportadora.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar transportadoras.' });
  }
};

exports.show = async (req, res) => {
  try {
    const item = await Transportadora.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transportadora não encontrada.' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar transportadora.' });
  }
};

exports.store = async (req, res) => {
  try {
    const nova = await Transportadora.create(req.body);
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar transportadora.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizada = await Transportadora.update(req.params.id, req.body);
    res.json(atualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar transportadora.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Transportadora.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir transportadora.' });
  }
};
