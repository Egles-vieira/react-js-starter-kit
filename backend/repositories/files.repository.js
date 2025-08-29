const db = require('../config/db');

async function findByIdempotencyKey(idempotencyKey) {
  const result = await db.query(
    'SELECT * FROM arquivos_processados WHERE idempotency_key = $1',
    [idempotencyKey]
  );
  return result.rows[0] || null;
}

async function insertProcessedFile(idempotencyKey, status, meta) {
  const result = await db.query(
    'INSERT INTO arquivos_processados (idempotency_key, status, meta) VALUES ($1, $2, $3) RETURNING *',
    [idempotencyKey, status, meta]
  );
  return result.rows[0];
}

module.exports = {
  findByIdempotencyKey,
  insertProcessedFile,
};
