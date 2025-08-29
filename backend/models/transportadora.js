const db = require('../config/db');

module.exports = {
  async findAll() {
    const result = await db.query('SELECT * FROM transportadoras ORDER BY id');
    return result.rows;
  },

  async findById(id) {
    const result = await db.query('SELECT * FROM transportadoras WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const {
      cnpj, nome, endereco, municipio, uf,
      integracao_ocorrencia, romaneio_auto, roterizacao_automatica
    } = data;

    const result = await db.query(
      `INSERT INTO transportadoras (
        cnpj, nome, endereco, municipio, uf,
        integracao_ocorrencia, romaneio_auto, roterizacao_automatica,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        NOW(), NOW()
      ) RETURNING *`,
      [
        cnpj, nome, endereco, municipio, uf,
        integracao_ocorrencia,
        romaneio_auto ?? false,
        roterizacao_automatica ?? false
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const {
      cnpj, nome, endereco, municipio, uf,
      integracao_ocorrencia, romaneio_auto, roterizacao_automatica
    } = data;

    const result = await db.query(
      `UPDATE transportadoras SET
        cnpj = $1, nome = $2, endereco = $3, municipio = $4, uf = $5,
        integracao_ocorrencia = $6, romaneio_auto = $7, roterizacao_automatica = $8,
        updated_at = NOW()
      WHERE id = $9 RETURNING *`,
      [
        cnpj, nome, endereco, municipio, uf,
        integracao_ocorrencia,
        romaneio_auto ?? false,
        roterizacao_automatica ?? false,
        id
      ]
    );
    return result.rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM transportadoras WHERE id = $1', [id]);
  }
};
