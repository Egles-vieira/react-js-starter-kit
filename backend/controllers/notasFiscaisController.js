const NotaFiscal = require('../models/notaFiscal');

exports.index = async (req, res) => {
  try {
    const data = await NotaFiscal.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar notas fiscais.' });
  }
};

exports.show = async (req, res) => {
  try {
    const nota = await NotaFiscal.findById(req.params.id);
    if (!nota) return res.status(404).json({ error: 'Nota fiscal não encontrada.' });
    res.json(nota);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar nota fiscal.' });
  }
};

exports.store = async (req, res) => {
  try {
    const novo = await NotaFiscal.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar nota fiscal.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await NotaFiscal.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar nota fiscal.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await NotaFiscal.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir nota fiscal.' });
  }
};
