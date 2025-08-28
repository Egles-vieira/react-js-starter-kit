const db = require('../config/db');

function parseDateOrNull(value) {
  return value === '' || value === undefined ? null : value;
}

module.exports = {
  async findByChave(chave_nf) {
    const result = await db.query('SELECT * FROM notas_fiscais WHERE chave_nf = $1', [chave_nf]);
    return result.rows[0];
  },

  async create(nota) {
    const {
      cliente_id, endereco_entrega_id, embarcador_id, transportadora_id,
      cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo,
      ordem, observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
      peso_real, qtd_volumes, mensagem, valor, finalizada, data_entrega,
      hora_entrega, dias_entrega, dias_atraso, status_nf, status_fila,
      status_api, status_sefaz, ultimo_codigo, ultimo_codigo_sistema,
      data_integracao, metro_cubico, roteirizada, nf_retida, valor_frete,
      data_separacao, data_conferencia, data_expedido, contato_rep, peso_liquido
    } = nota;

    const result = await db.query(`
      INSERT INTO notas_fiscais (
        cliente_id, endereco_entrega_id, embarcador_id, transportadora_id,
        cod_rep, nome_rep, emi_nf, ser_ctrc, nro_ctrc, peso_calculo,
        ordem, observacoes, previsao_entrega, chave_nf, ser, nro, nro_pedido,
        peso_real, qtd_volumes, mensagem, valor, finalizada, data_entrega,
        hora_entrega, dias_entrega, dias_atraso, status_nf, status_fila,
        status_api, status_sefaz, ultimo_codigo, ultimo_codigo_sistema,
        data_integracao, metro_cubico, roteirizada, nf_retida, valor_frete,
        data_separacao, data_conferencia, data_expedido, contato_rep, peso_liquido,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39,
        $40, $41, $42, NOW(), NOW()
      ) RETURNING *
    `, [
      cliente_id, endereco_entrega_id, embarcador_id, transportadora_id,
      cod_rep, nome_rep, parseDateOrNull(emi_nf), ser_ctrc, nro_ctrc, peso_calculo,
      ordem || 0, observacoes, parseDateOrNull(previsao_entrega), chave_nf, ser, nro, nro_pedido,
      peso_real, qtd_volumes, mensagem, valor, finalizada || false, parseDateOrNull(data_entrega),
      hora_entrega, dias_entrega, dias_atraso, status_nf, status_fila,
      status_api, status_sefaz, ultimo_codigo, ultimo_codigo_sistema,
      parseDateOrNull(data_integracao), metro_cubico, roteirizada || false, nf_retida || false, valor_frete,
      parseDateOrNull(data_separacao), parseDateOrNull(data_conferencia), parseDateOrNull(data_expedido),
      contato_rep, peso_liquido
    ]);

    return result.rows[0];
  }
};