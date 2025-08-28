const db = require('../config/db');

module.exports = {
  async findAll() {
    const result = await db.query(`
      SELECT
        m.*,
        jsonb_build_object(
          'id',     v.id_veiculo,  -- aqui: v.id_veiculo em vez de v.id
          'placa',  v.placa,
          'modelo', v.modelo,
          'cor',    v.cor,
          'ano',    v.ano
        ) AS veiculo
      FROM motoristas m
      LEFT JOIN veiculos v
        ON v.id_motorista = m.id_motorista
      ORDER BY m.id_motorista
    `);
    return result.rows;
  },

  async findById(id_motorista) {
    const result = await db.query('SELECT * FROM motoristas WHERE id_motorista = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const {
      nome, sobrenome, cpf, contato, email, foto_perfil,
      pais, estado, cidade, bairro, rua, numero, cep, unidade,
      send_mensagem, legislacao_id
    } = data;

    const result = await db.query(
      `INSERT INTO motoristas (
        nome, sobrenome, cpf, contato, email, foto_perfil,
        pais, estado, cidade, bairro, rua, numero, cep, unidade,
        send_mensagem, legislacao_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, NOW(), NOW()
      ) RETURNING *`,
      [
        nome, sobrenome, cpf, contato, email, foto_perfil,
        pais, estado, cidade, bairro, rua, numero, cep, unidade,
        send_mensagem ?? true, legislacao_id
      ]
    );
    return result.rows[0];
  },

  async update(id_motorista, data) {
    const {
      nome, sobrenome, cpf, contato, email, foto_perfil,
      pais, estado, cidade, bairro, rua, numero, cep, unidade,
      send_mensagem, legislacao_id
    } = data;

    const result = await db.query(
      `UPDATE motoristas SET
        nome = $1, sobrenome = $2, cpf = $3, contato = $4, email = $5, foto_perfil = $6,
        pais = $7, estado = $8, cidade = $9, bairro = $10, rua = $11, numero = $12, cep = $13, unidade = $14,
        send_mensagem = $15, legislacao_id = $16, updated_at = NOW()
      WHERE id_motorista = $17 RETURNING *`,
      [
        nome, sobrenome, cpf, contato, email, foto_perfil,
        pais, estado, cidade, bairro, rua, numero, cep, unidade,
        send_mensagem ?? true, legislacao_id, id_motorista
      ]
    );
    return result.rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM motoristas WHERE id_motorista = $1', [id]);
  }




  
};
