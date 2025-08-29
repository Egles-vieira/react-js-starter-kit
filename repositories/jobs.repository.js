const db = require('../backend/config/db');

async function insertExecution({ agendamento_id, status, tentativas = 0, erro_msg = null, payload_req = null, payload_res = null, trace_id }) {
  const result = await db.query(
    `INSERT INTO jobs_execucoes (agendamento_id, status, tentativas, erro_msg, payload_req, payload_res, trace_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      agendamento_id,
      status,
      tentativas,
      erro_msg,
      payload_req ? JSON.stringify(payload_req) : null,
      payload_res ? JSON.stringify(payload_res) : null,
      trace_id
    ]
  );
  return result.rows[0];
}

async function updateExecution(id, { status = null, tentativas = null, erro_msg = null, payload_req = null, payload_res = null }) {
  const result = await db.query(
    `UPDATE jobs_execucoes
       SET status = COALESCE($2, status),
           tentativas = COALESCE($3, tentativas),
           erro_msg = COALESCE($4, erro_msg),
           payload_req = COALESCE($5, payload_req),
           payload_res = COALESCE($6, payload_res),
           updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      status,
      tentativas,
      erro_msg,
      payload_req ? JSON.stringify(payload_req) : null,
      payload_res ? JSON.stringify(payload_res) : null
    ]
  );
  return result.rows[0];
}

module.exports = {
  insertExecution,
  updateExecution,
};
