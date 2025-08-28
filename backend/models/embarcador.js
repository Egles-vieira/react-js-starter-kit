const db = require('../config/db');

module.exports = {
  async getAll() {
    const result = await db.query('SELECT * FROM embarcadores ORDER BY id DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await db.query('SELECT * FROM embarcadores WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const { documento, nome, inscricao_estadual, cnpj, endereco, bairro, cidade, cep } = data;
    const result = await db.query(
      `INSERT INTO embarcadores 
        (documento, nome, inscricao_estadual, cnpj, endereco, bairro, cidade, cep, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [documento, nome, inscricao_estadual, cnpj, endereco, bairro, cidade, cep]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { documento, nome, inscricao_estadual, cnpj, endereco, bairro, cidade, cep } = data;
    const result = await db.query(
      `UPDATE embarcadores SET 
        documento = $1, nome = $2, inscricao_estadual = $3, cnpj = $4, 
        endereco = $5, bairro = $6, cidade = $7, cep = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [documento, nome, inscricao_estadual, cnpj, endereco, bairro, cidade, cep, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    await db.query('DELETE FROM embarcadores WHERE id = $1', [id]);
  },

  async findByDocumento(documento) {
  const result = await db.query('SELECT * FROM embarcadores WHERE documento = $1', [documento]);
  return result.rows[0];
}
};