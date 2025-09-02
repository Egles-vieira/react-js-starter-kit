const db = require('../backend/config/db');

async function insertError({ integracao_id, codigo = null, mensagem, detalhe = null }) {
  const result = await db.query(
    `INSERT INTO erros_integracao (integracao_id, codigo, mensagem, detalhe)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      integracao_id,
      codigo,
      mensagem,
      detalhe ? JSON.stringify(detalhe) : null
    ]
  );
  return result.rows[0];
}

module.exports = {
  insertError,
};
