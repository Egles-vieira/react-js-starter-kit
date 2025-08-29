// backend/controllers/usuariosController.js
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

exports.index = async (req, res) => {
  try {
    const lista = await Usuario.findAll();
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

exports.show = async (req, res) => {
  try {
    const u = await Usuario.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Não encontrado' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

exports.store = async (req, res) => {
  try {
    const { senha, ...rest } = req.body;
    const hash = await bcrypt.hash(senha, 10);
    const novo = await Usuario.create({ ...rest, senha: hash });
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }
    const atualizado = await Usuario.update(req.params.id, data);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Usuario.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }

  
};


/**
 * POST /api/usuarios/:id/change-password
 * Body: { currentPassword, newPassword }
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    // 1) Buscar usuário
    const user = await Usuario.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // 2) Validar senha atual
    const match = await bcrypt.compare(currentPassword, user.senha);
    if (!match) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    // 3) Hashear a nova senha e atualizar
    const hash = await bcrypt.hash(newPassword, 10);
    await Usuario.updatePassword(id, hash);

    return res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
};