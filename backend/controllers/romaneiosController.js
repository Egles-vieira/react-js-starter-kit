const Romaneio = require('../models/romaneio');

exports.index = async (req, res) => {
  try {
    const data = await Romaneio.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar romaneios.' });
  }
};

exports.show = async (req, res) => {
  try {
    const item = await Romaneio.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Romaneio não encontrado.' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar romaneio.' });
  }
};

exports.store = async (req, res) => {
  try {
    const novo = await Romaneio.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar romaneio.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await Romaneio.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar romaneio.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Romaneio.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir romaneio.' });
  }
};
