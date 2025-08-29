// controllers/localizacoesController.js
const db = require('../config/db');

/* Util: saneia limit/offset sem quebrar compatibilidade */
function coerceLimitOffset(req, defLimit = 1000, maxLimit = 5000) {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit ?? `${defLimit}`, 10), 0),
    maxLimit
  );
  const offset = Math.max(parseInt(req.query.offset ?? '0', 10), 0);
  return { limit, offset };
}

/**
 * GET /api/localizacoes
 * Lista localizações (compatível com o atual), agora com paginação opcional.
 * Se não enviar limit/offset, mantém o comportamento de retornar tudo.
 */
exports.index = async (req, res) => {
  try {
    // Se quiser manter “tudo”, não passe limit/offset. Se passar, pagina.
    const hasPage = 'limit' in req.query || 'offset' in req.query;
    let sql = `
      SELECT id_localizacao, id_motorista, latitude, longitude, velocidade, bateria, timestamp
      FROM public.localizacoes
      ORDER BY timestamp DESC NULLS LAST
    `;
    let params = [];

    if (hasPage) {
      const { limit, offset } = coerceLimitOffset(req, 1000, 5000);
      sql += ` LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro /api/localizacoes:', err);
    res.status(500).json({ error: 'Erro ao listar localizações.' });
  }
};

/**
 * GET /api/localizacoes/:id
 */
exports.show = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id_localizacao, id_motorista, latitude, longitude, velocidade, bateria, timestamp
       FROM public.localizacoes
       WHERE id_localizacao = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Localização não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro /api/localizacoes/:id:', err);
    res.status(500).json({ error: 'Erro ao buscar localização.' });
  }
};

/**
 * POST /api/localizacoes
 * Mantém o shape atual; se timestamp não vier, usa NOW().
 */
exports.store = async (req, res) => {
  try {
    const { id_motorista, latitude, longitude, velocidade, bateria, timestamp } = req.body;

    if (!id_motorista || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'id_motorista, latitude e longitude são obrigatórios.' });
    }

    const { rows } = await db.query(
      `INSERT INTO public.localizacoes
        (id_motorista, latitude, longitude, velocidade, bateria, timestamp)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
       RETURNING id_localizacao, id_motorista, latitude, longitude, velocidade, bateria, timestamp`,
      [id_motorista, latitude, longitude, velocidade ?? null, bateria ?? null, timestamp ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro POST /api/localizacoes:', err);
    res.status(500).json({ error: 'Erro ao criar localização.' });
  }
};

/**
 * PUT /api/localizacoes/:id
 */
exports.update = async (req, res) => {
  try {
    const { id_motorista, latitude, longitude, velocidade, bateria, timestamp } = req.body;

    const { rows } = await db.query(
      `UPDATE public.localizacoes SET
         id_motorista = COALESCE($1, id_motorista),
         latitude     = COALESCE($2, latitude),
         longitude    = COALESCE($3, longitude),
         velocidade   = COALESCE($4, velocidade),
         bateria      = COALESCE($5, bateria),
         timestamp    = COALESCE($6, timestamp)
       WHERE id_localizacao = $7
       RETURNING id_localizacao, id_motorista, latitude, longitude, velocidade, bateria, timestamp`,
      [id_motorista ?? null, latitude ?? null, longitude ?? null, velocidade ?? null, bateria ?? null, timestamp ?? null, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Localização não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro PUT /api/localizacoes/:id:', err);
    res.status(500).json({ error: 'Erro ao atualizar localização.' });
  }
};

/**
 * DELETE /api/localizacoes/:id
 */
exports.destroy = async (req, res) => {
  try {
    await db.query(`DELETE FROM public.localizacoes WHERE id_localizacao = $1`, [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro DELETE /api/localizacoes/:id:', err);
    res.status(500).json({ error: 'Erro ao excluir localização.' });
  }
};

/**
 * GET /api/localizacoes/ultimas
 * Mesma assinatura que você já usa, só que sem LATERAL.
 * Shape: { id, name, sobrenome, phone, plate, lat, lng, timestamp }
 * Query params: ?limit=&offset=
 */
exports.ultimasPorMotorista = async (req, res) => {
  try {
    const { limit, offset } = coerceLimitOffset(req, 100, 1000);

    const sql = `
      WITH latest AS (
        SELECT DISTINCT ON (l.id_motorista)
          l.id_motorista, l.latitude, l.longitude, l.timestamp
        FROM public.localizacoes l
        ORDER BY l.id_motorista, l.timestamp DESC NULLS LAST
      ),
      one_vehicle AS (
        SELECT DISTINCT ON (v.id_motorista)
          v.id_motorista, v.placa
        FROM public.veiculos v
        ORDER BY v.id_motorista, COALESCE(v.updated_at, 'epoch'::timestamp) DESC, v.id_veiculo DESC
      )
      SELECT 
        m.id_motorista AS id,
        m.nome         AS name,
        m.sobrenome    AS sobrenome,
        m.contato      AS phone,
        ov.placa       AS plate,
        lt.latitude    AS lat,
        lt.longitude   AS lng,
        (lt.timestamp AT TIME ZONE 'America/Sao_Paulo') AS timestamp
      FROM public.motoristas m
      LEFT JOIN one_vehicle ov ON ov.id_motorista = m.id_motorista
      LEFT JOIN latest lt      ON lt.id_motorista = m.id_motorista
      WHERE m.status = TRUE
      ORDER BY COALESCE(lt.timestamp, 'epoch'::timestamp) DESC, m.id_motorista
      LIMIT $1 OFFSET $2;
    `;

    const { rows } = await db.query(sql, [limit, offset]);
    res.json(rows);
  } catch (err) {
    console.error('Erro /api/localizacoes/ultimas:', err);
    res.status(500).json({ error: 'Erro ao buscar últimas localizações.' });
  }
};

/**
 * GET /api/localizacoes/raw-latest?limitPerDriver=50&sinceMinutes=180
 * Retorna top N posições por motorista (sem nulos), ordenadas por motorista e tempo desc.
 * Shape: igual ao atual “raw” (flat): id_localizacao, id_motorista, latitude, longitude, velocidade, bateria, timestamp
 */
exports.rawLatestPerDriver = async (req, res) => {
  try {
    const limitPerDriver = Math.min(parseInt(req.query.limitPerDriver ?? '50', 10), 200);
    const sinceMinutes = parseInt(req.query.sinceMinutes ?? '0', 10);

    const params = [limitPerDriver];
    let extra = '';

    if (!Number.isNaN(sinceMinutes) && sinceMinutes > 0) {
      extra = `AND l.timestamp >= NOW() - ($2::int || ' minutes')::interval`;
      params.push(sinceMinutes);
    }

    const sql = `
      WITH active AS (
        SELECT id_motorista
        FROM public.motoristas
        WHERE status = TRUE
      ),
      ranked AS (
        SELECT
          l.id_localizacao,
          l.id_motorista,
          l.latitude,
          l.longitude,
          l.velocidade,
          l.bateria,
          l.timestamp,
          ROW_NUMBER() OVER (PARTITION BY l.id_motorista ORDER BY l.timestamp DESC NULLS LAST) AS rn
        FROM public.localizacoes l
        JOIN active a ON a.id_motorista = l.id_motorista
        WHERE l.timestamp IS NOT NULL
        ${extra}
      )
      SELECT *
      FROM ranked
      WHERE rn <= $1
      ORDER BY id_motorista, timestamp DESC;
    `;

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro /api/localizacoes/raw-latest:', err);
    res.status(500).json({ error: 'Erro ao buscar histórico curto por motorista.' });
  }
};

/**
 * GET /api/localizacoes/health
 * Simples para ping em monitoramento.
 */
exports.health = async (_req, res) => {
  try {
    const { rows } = await db.query(`SELECT NOW() AS now`);
    res.json({ ok: true, now: rows[0].now });
  } catch (err) {
    console.error('Erro /api/localizacoes/health:', err);
    res.status(500).json({ ok: false });
  }
};
