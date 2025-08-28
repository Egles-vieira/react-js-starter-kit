const db = require('../config/db');

module.exports = {
  async findAll() {
    const result = await db.query('SELECT * FROM clientes ORDER BY id');
    return result.rows;
  },

  async findById(id) {
    const result = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByDocumento(documento) {
    const result = await db.query('SELECT * FROM clientes WHERE documento = $1', [documento]);
    return result.rows[0];
  },

  async create(data) {
    const {
      documento, cod_cliente, nome, endereco, bairro, cep,
      cidade, uf, contato, inscricao_estadual, cnpj
    } = data;

    const result = await db.query(
      `INSERT INTO clientes (
        documento, cod_cliente, nome, endereco, bairro, cep,
        cidade, uf, contato, inscricao_estadual, cnpj,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        NOW(), NOW()
      ) RETURNING *`,
      [documento, cod_cliente, nome, endereco, bairro, cep, cidade, uf, contato, inscricao_estadual, cnpj]
    );

    return result.rows[0];
  },

  async update(id, data) {
    const {
      documento, cod_cliente, nome, endereco, bairro, cep,
      cidade, uf, contato, inscricao_estadual, cnpj
    } = data;

    const result = await db.query(
      `UPDATE clientes SET
        documento = $1, cod_cliente = $2, nome = $3,
        endereco = $4, bairro = $5, cep = $6,
        cidade = $7, uf = $8, contato = $9,
        inscricao_estadual = $10, cnpj = $11,
        updated_at = NOW()
      WHERE id = $12 RETURNING *`,
      [documento, cod_cliente, nome, endereco, bairro, cep,
       cidade, uf, contato, inscricao_estadual, cnpj, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM clientes WHERE id = $1', [id]);
  }
};