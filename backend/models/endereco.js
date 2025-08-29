const db = require('../config/db');

module.exports = {
  async findAll() {
    const result = await db.query('SELECT * FROM endereco_entrega ORDER BY id');
    return result.rows;
  },

  async findById(id) {
    const result = await db.query('SELECT * FROM endereco_entrega WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByClienteId(cliente_id) {
    const result = await db.query('SELECT * FROM endereco_entrega WHERE cliente_id = $1', [cliente_id]);
    return result.rows;
  },

async create(data) {
  const {
    cliente_id, endereco, bairro, cep, cidade, uf,
    coordenadas, janela_horario, doca, endereco_completo,
    lat, lon, restricao_logistica_id, restrito,
    janela1, janela2, janela3, janela4, rota
  } = data;

  // Adicione essa checagem:
  const checaDuplicado = await db.query(
    `SELECT 1 FROM endereco_entrega 
     WHERE cliente_id = $1 
       AND endereco = $2 
       AND bairro = $3 
       AND cidade = $4 
       AND uf = $5 
       AND cep = $6
     LIMIT 1`,
    [cliente_id, endereco, bairro, cidade, uf, cep]
  );
  if (checaDuplicado.rows.length > 0) {
    // Retorne null ou lance erro. Aqui, vou lançar erro.
    const error = new Error('Endereço já cadastrado para este cliente.');
    error.code = 'DUPLICATE_ADDRESS';
    throw error;
  }

  // ... segue igual como já está ...
  const result = await db.query(
    `INSERT INTO endereco_entrega (
      cliente_id, endereco, bairro, cep, cidade, uf,
      coordenadas, janela_horario, doca, endereco_completo,
      lat, lon, restricao_logistica_id, restrito,
      janela1, janela2, janela3, janela4, rota,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14,
      $15, $16, $17, $18, $19,
      NOW(), NOW()
    ) RETURNING *`,
    [cliente_id, endereco, bairro, cep, cidade, uf,
     coordenadas, janela_horario, doca, endereco_completo,
     lat, lon, restricao_logistica_id, restrito,
     janela1, janela2, janela3, janela4, rota]
  );
  return result.rows[0];
},


  async update(id, data) {
    const {
      cliente_id, endereco, bairro, cep, cidade, uf,
      coordenadas, janela_horario, doca, endereco_completo,
      lat, lon, restricao_logistica_id, restrito,
      janela1, janela2, janela3, janela4, rota
    } = data;

    const result = await db.query(
      `UPDATE endereco_entrega SET
        cliente_id = $1, endereco = $2, bairro = $3, cep = $4, cidade = $5, uf = $6,
        coordenadas = $7, janela_horario = $8, doca = $9, endereco_completo = $10,
        lat = $11, lon = $12, restricao_logistica_id = $13, restrito = $14,
        janela1 = $15, janela2 = $16, janela3 = $17, janela4 = $18, rota = $19,
        updated_at = NOW()
      WHERE id = $20 RETURNING *`,
      [cliente_id, endereco, bairro, cep, cidade, uf,
       coordenadas, janela_horario, doca, endereco_completo,
       lat, lon, restricao_logistica_id, restrito,
       janela1, janela2, janela3, janela4, rota, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM endereco_entrega WHERE id = $1', [id]);
  }
};