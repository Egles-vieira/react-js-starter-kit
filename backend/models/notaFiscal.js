const db = require('../config/db');

module.exports = {
  
async findAll() {
  const result = await db.query(`
    SELECT 
      nf.*,
      c.id AS cliente_id,
      c.nome AS cliente_nome,
      c.cod_cliente AS cliente_cod_cliente,
      t.id AS transportadora_id,
      t.nome AS transportadora_nome,
      ee.endereco_completo AS endereco_entrega_completo
    FROM notas_fiscais nf
    LEFT JOIN clientes c ON nf.cliente_id = c.id
    LEFT JOIN transportadoras t ON nf.transportadora_id = t.id
    LEFT JOIN endereco_entrega ee ON nf.endereco_entrega_id = ee.id
    ORDER BY nf.id DESC
  `);
  return result.rows;
},

  async findById(id) {
    const result = await db.query(`
      SELECT 
        nf.*,
        c.id AS cliente_id,
        c.nome AS cliente_nome,
        c.cod_cliente AS cliente_cod_cliente,
        t.id AS transportadora_id,
        t.nome AS transportadora_nome
      FROM notas_fiscais nf
      LEFT JOIN clientes c ON nf.cliente_id = c.id
      LEFT JOIN transportadoras t ON nf.transportadora_id = t.id
      WHERE nf.id = $1
    `, [id]);
    return result.rows[0];
  },

  async create(data) {
    // Trate números caso queira
    const {
      romaneio_id, cliente_id, embarcador_id, transportadora_id, chave_cte,
      cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo, ordem,
      observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
      peso_real, qtd_volumes, mensagem, valor, finalizada,
      dias_entrega, dias_atraso
    } = data;

    const result = await db.query(
      `INSERT INTO notas_fiscais (
        romaneio_id, cliente_id, embarcador_id, transportadora_id, chave_cte,
        cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo, ordem,
        observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
        peso_real, qtd_volumes, mensagem, valor, finalizada,
        dias_entrega, dias_atraso, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23,
        $24, $25, NOW(), NOW()
      ) RETURNING *`,
      [
        romaneio_id, cliente_id, embarcador_id, transportadora_id, chave_cte,
        cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo, ordem,
        observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
        peso_real, qtd_volumes, mensagem, valor, finalizada,
        dias_entrega, dias_atraso
      ]
    );

    return result.rows[0];
  },

  async update(id, data) {
    const {
      romaneio_id, cliente_id, embarcador_id, transportadora_id, chave_cte,
      cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo, ordem,
      observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
      peso_real, qtd_volumes, mensagem, valor, finalizada,
      dias_entrega, dias_atraso
    } = data;

    const result = await db.query(
      `UPDATE notas_fiscais SET
        romaneio_id = $1, cliente_id = $2, embarcador_id = $3, transportadora_id = $4, chave_cte = $5,
        cod_rep = $6, nome_rep = $7, emi_nf = $8, ser_ctrc = $9, nro_ctrc = $10, peso_calculo = $11, ordem = $12,
        observacoes = $13, previsao_entrega = $14, chave_nf = $15, ser = $16, nro = $17, nro_pedido = $18,
        peso_real = $19, qtd_volumes = $20, mensagem = $21, valor = $22, finalizada = $23,
        dias_entrega = $24, dias_atraso = $25, updated_at = NOW()
      WHERE id = $26 RETURNING *`,
      [
        romaneio_id, cliente_id, embarcador_id, transportadora_id, chave_cte,
        cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo, ordem,
        observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
        peso_real, qtd_volumes, mensagem, valor, finalizada,
        dias_entrega, dias_atraso, id
      ]
    );
    return result.rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM notas_fiscais WHERE id = $1', [id]);
  }
};
