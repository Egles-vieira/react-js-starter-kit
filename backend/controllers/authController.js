const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

const SECRET = process.env.JWT_SECRET || 'segredo123';

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = await Usuario.findByEmail(email);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      await Usuario.incrementarTentativas(usuario.id);
      return res.status(403).json({ error: 'Senha incorreta.' });
    }

    const token = jwt.sign({ id: usuario.id, perfil_id: usuario.perfil_id }, SECRET, { expiresIn: '1d' });

    await Usuario.registrarLogin(usuario.id, req.ip, req.headers['user-agent']);

    res.json({ token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: {
        id: usuario.perfil_id,
        nome: usuario.perfil_nome,
        descricao: usuario.perfil_descricao
    }} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao autenticar.' });
  }
};