
const db = require('../config/db');

module.exports = {
  async create(data) {
    const { placa, modelo, cor, ano, motorista_id } = data;

    try {
      const result = await db.query(
        `INSERT INTO veiculos (
          placa, modelo, cor, ano, id_motorista, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, NOW()
        ) RETURNING *`,
        [placa, modelo, cor, ano, motorista_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Erro ao inserir veículo:", error);
      throw error;
    }
  },

  async findAll() {
    const result = await db.query('SELECT * FROM veiculos');
    return result.rows;
  }
};