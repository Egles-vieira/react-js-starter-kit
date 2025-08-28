const db = require('../config/db');

exports.getHistorico = async (req, res) => {
  const { id_motorista, data } = req.query;
  try {
    const result = await db.query(`
      SELECT * FROM localizacoes
      WHERE id_motorista = $1 AND DATE(timestamp) = $2
      ORDER BY timestamp ASC
    `, [id_motorista, data]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico de localizações.' });
  }
};
