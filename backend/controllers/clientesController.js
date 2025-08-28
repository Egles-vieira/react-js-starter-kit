const Cliente = require('../models/cliente');

exports.index = async (req, res) => {
  try {
    const data = await Cliente.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar clientes.' });
  }
};

exports.show = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar cliente.' });
  }
};

exports.store = async (req, res) => {
  try {
    const existe = await Cliente.findByDocumento(req.body.documento);
    if (existe) return res.status(409).json({ error: 'Documento já cadastrado.' });

    const novo = await Cliente.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await Cliente.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Cliente.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir cliente.' });
  }
};