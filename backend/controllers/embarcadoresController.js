const Embarcador = require('../models/embarcador');

exports.index = async (req, res) => {
  try {
    const embarcadores = await Embarcador.getAll();
    res.json(embarcadores);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar embarcadores.' });
  }
};

exports.show = async (req, res) => {
  try {
    const embarcador = await Embarcador.getById(req.params.id);
    if (!embarcador) return res.status(404).json({ error: 'Embarcador não encontrado.' });
    res.json(embarcador);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar embarcador.' });
  }
};

exports.store = async (req, res) => {
  try {
    const { documento } = req.body;

    // Verifica se já existe um embarcador com o mesmo documento
    const existente = await Embarcador.findByDocumento(documento);
    if (existente) {
      return res.status(409).json({ error: 'Já existe um embarcador com este documento.' });
    }

    const novo = await Embarcador.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar embarcador.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await Embarcador.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar embarcador.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Embarcador.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar embarcador.' });
  }
};