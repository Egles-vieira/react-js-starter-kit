// backend/models/usuario.js

const db = require('../config/db');

const Usuario = {
  /**
   * Busca um usuário pelo email (usado no login)
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const res = await db.query(`
      SELECT
        u.*,
        p.nome        AS perfil_nome,
        p.descricao   AS perfil_descricao
      FROM usuarios u
      LEFT JOIN perfis p ON p.id = u.perfil_id
      WHERE u.email = $1
    `, [email]);
    return res.rows[0] || null;
  },

  /**
   * Incrementa contador de tentativas de login
   * @param {number} id
   */
  async incrementarTentativas(id) {
    await db.query(`
      UPDATE usuarios
      SET tentativas_login = tentativas_login + 1
      WHERE id = $1
    `, [id]);
  },

  /**
   * Registra um login bem-sucedido: limpa tentativas e atualiza dados
   * @param {number} id
   * @param {string} ip
   * @param {string} userAgent
   */
  async registrarLogin(id, ip, userAgent) {
    await db.query(`
      UPDATE usuarios
      SET
        tentativas_login = 0,
        ultimo_login = NOW(),
        ip_ultimo_login = $2,
        user_agent_ultimo_login = $3,
        updated_at = NOW()
      WHERE id = $1
    `, [id, ip, userAgent]);
  },

  /**
   * Lista todos os usuários
   * @returns {Promise<Array>}
   */
  async findAll() {
    const res = await db.query(`
      SELECT
        u.*,
        p.nome        AS perfil_nome,
        p.descricao   AS perfil_descricao
      FROM usuarios u
      LEFT JOIN perfis p ON p.id = u.perfil_id
      WHERE u.ativo = true
      ORDER BY u.id
    `);
    return res.rows;
 },

  /**
   * Busca um usuário por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const res = await db.query(`
      SELECT
        u.*,
        p.nome        AS perfil_nome,
        p.descricao   AS perfil_descricao
      FROM usuarios u
      LEFT JOIN perfis p ON p.id = u.perfil_id
      WHERE u.id = $1
    `, [id]);
    return res.rows[0] || null;
  },

  /**
   * Cria um novo usuário
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      nome, email, senha, perfil_id,
      ativo = true,
      token_recuperacao = null,
      expira_token     = null,
      foto_url         = null,
      telefone         = null,
      ip_ultimo_login  = null,
      user_agent_ultimo_login = null,
      created_by       = null,
      updated_by       = null
    } = data;

    const res = await db.query(`
      INSERT INTO usuarios (
        nome, email, senha, perfil_id, ativo,
        token_recuperacao, expira_token, foto_url,
        telefone, ip_ultimo_login, user_agent_ultimo_login,
        created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13, NOW(), NOW()
      )
      RETURNING *
    `, [
      nome, email, senha, perfil_id, ativo,
      token_recuperacao, expira_token, foto_url,
      telefone, ip_ultimo_login, user_agent_ultimo_login,
      created_by, updated_by
    ]);

    return res.rows[0];
  },

  /**
   * Atualiza dados de um usuário (exceto senha)
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const {
      nome, email, perfil_id, ativo,
      token_recuperacao, expira_token, foto_url,
      telefone, ip_ultimo_login, user_agent_ultimo_login,
      updated_by = null
    } = data;

    const res = await db.query(`
      UPDATE usuarios SET
        nome = $1,
        email = $2,
        perfil_id = $3,
        ativo = $4,
        token_recuperacao = $5,
        expira_token = $6,
        foto_url = $7,
        telefone = $8,
        ip_ultimo_login = $9,
        user_agent_ultimo_login = $10,
        updated_by = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *
    `, [
      nome, email, perfil_id, ativo,
      token_recuperacao, expira_token, foto_url,
      telefone, ip_ultimo_login, user_agent_ultimo_login,
      updated_by, id
    ]);

    return res.rows[0];
  },

  /**
   * Marca usuário como inativo (soft delete)
   * @param {number} id
   */
  async remove(id) {
    await db.query(`
      UPDATE usuarios
      SET ativo = false, updated_at = NOW()
      WHERE id = $1
    `, [id]);
  },

  /**
   * Atualiza apenas a senha do usuário
   * @param {number} id
   * @param {string} hashNovaSenha
   * @returns {Promise<Object>}
   */
  async updatePassword(id, hashNovaSenha) {
    const res = await db.query(`
      UPDATE usuarios
      SET senha = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, nome, email
    `, [hashNovaSenha, id]);
    return res.rows[0];
  }
};

module.exports = Usuario;
