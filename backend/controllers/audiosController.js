const db = require('../config/db');

exports.index = async (req, res) => {
  const { id_motorista } = req.params;
  try {
    const result = await db.query(`
      SELECT id_audio, arquivo_url, duracao_segundos, tamanho_kb, tipo_mime, created_at AS data_gravacao
      FROM audios_motorista
      WHERE id_motorista = $1
      ORDER BY created_at DESC
    `, [id_motorista]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar áudios do motorista.' });
  }
};
