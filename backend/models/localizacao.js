const db = require('../config/db');

module.exports = {
  async findAll() {
    const result = await db.query(`SELECT * FROM localizacoes ORDER BY id_localizacao DESC`);
    return result.rows;
  },

  async findById(id) {
    const result = await db.query(`SELECT * FROM localizacoes WHERE id_localizacao = $1`, [id]);
    return result.rows[0];
  },

  async create(data) {
    const { id_motorista, latitude, longitude, velocidade, bateria, timestamp } = data;
    const result = await db.query(`
      INSERT INTO localizacoes (id_motorista, latitude, longitude, velocidade, bateria, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id_motorista, latitude, longitude, velocidade, bateria, timestamp]);
    return result.rows[0];
  },

  async update(id, data) {
    const { id_motorista, latitude, longitude, velocidade, bateria, timestamp } = data;
    const result = await db.query(`
      UPDATE localizacoes SET
        id_motorista = $1, latitude = $2, longitude = $3,
        velocidade = $4, bateria = $5, timestamp = $6
      WHERE id_localizacao = $7 RETURNING *
    `, [id_motorista, latitude, longitude, velocidade, bateria, timestamp, id]);
    return result.rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM localizacoes WHERE id_localizacao = $1', [id]);
  }
};
