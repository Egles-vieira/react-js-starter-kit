const db = require('../config/db');

exports.index = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        m.id_motorista,
        m.nome,
        m.sobrenome,
        m.cpf,
        m.contato,
        m.status,
        m.foto_perfil,
        m.unidade,

        v.placa,
        v.modelo,
        v.cor,
        v.ano,

        l.id_localizacao,
        l.latitude,
        l.longitude,
        l.velocidade,
        l.bateria,
        l."timestamp" AT TIME ZONE 'America/Sao_Paulo' AS localizacao_timestamp,

        a.arquivo_url        AS audio_url,
        a.duracao_segundos   AS audio_duracao,
        a.created_at         AS audio_data

      FROM public.motoristas m
      LEFT JOIN LATERAL (
        SELECT * FROM public.veiculos
        WHERE id_motorista = m.id_motorista
        ORDER BY ano DESC
        LIMIT 1
      ) v ON true
      LEFT JOIN LATERAL (
        SELECT * FROM public.localizacoes
        WHERE id_motorista = m.id_motorista
          AND timestamp IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 1
      ) l ON true
      LEFT JOIN LATERAL (
        SELECT * FROM public.audios_motorista
        WHERE id_motorista = m.id_motorista
        ORDER BY created_at DESC
        LIMIT 1
      ) a ON true
      WHERE m.status = TRUE
      ORDER BY m.id_motorista;
    `);

    res.json(result.rows);
} catch (err) {
  console.error('Erro ao listar motoristas:', err);
  res.status(500).json({
    error:   'Erro ao listar motoristas.',
    message: err.message,
    // só inclua o stack em dev, se quiser
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
};