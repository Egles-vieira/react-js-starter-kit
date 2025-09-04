const knex = require('../shared/knex');

module.exports = {
  list: (filters = {}) => {
    let query = knex('ocorrencias')
      .select('o.*', 'nf.chave_nf', 'nf.nro', 'nf.ser', 't.nome as transportadora_nome', 'co.codigo', 'co.descricao')
      .from('ocorrencias as o')
      .leftJoin('notas_fiscais as nf', 'o.nota_fiscal_id', 'nf.id')
      .leftJoin('transportadoras as t', 'o.transportadora_id', 't.id')
      .leftJoin('codigo_ocorrencias as co', 'o.codigo_ocorrencia_id', 'co.id')
      .orderBy('o.processado_em', 'desc');
    
    if (filters.nota_fiscal_id) {
      query = query.where('o.nota_fiscal_id', filters.nota_fiscal_id);
    }
    if (filters.transportadora_id) {
      query = query.where('o.transportadora_id', filters.transportadora_id);
    }
    if (filters.status_normalizado) {
      query = query.where('o.status_normalizado', filters.status_normalizado);
    }
    
    return query;
  },
  
  getById: (id) => knex('ocorrencias')
    .select('o.*', 'nf.chave_nf', 'nf.nro', 'nf.ser', 't.nome as transportadora_nome', 'co.codigo', 'co.descricao')
    .from('ocorrencias as o')
    .leftJoin('notas_fiscais as nf', 'o.nota_fiscal_id', 'nf.id')
    .leftJoin('transportadoras as t', 'o.transportadora_id', 't.id')
    .leftJoin('codigo_ocorrencias as co', 'o.codigo_ocorrencia_id', 'co.id')
    .where('o.id', id)
    .first(),
  
  create: async (data) => {
    const [result] = await knex('ocorrencias').insert({
      ...data,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },
  
  updateNotaFiscalStatus: async (notaFiscalId) => {
    const recentOccurrence = await knex('ocorrencias')
      .select('status_normalizado')
      .where('nota_fiscal_id', notaFiscalId)
      .orderBy('data_ocorrencia', 'desc')
      .first();
    
    if (recentOccurrence) {
      await knex('notas_fiscais')
        .where('id', notaFiscalId)
        .update({
          status_nf: recentOccurrence.status_normalizado,
          updated_at: knex.fn.now()
        });
    }
  },
};
