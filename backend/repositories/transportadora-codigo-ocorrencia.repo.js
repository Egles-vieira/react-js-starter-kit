const knex = require('../shared/knex');

module.exports = {
  list: () => knex('transportadora_codigo_ocorrencia')
    .select('tco.*', 'co.codigo', 'co.descricao', 'co.status_normalizado', 't.nome as transportadora_nome')
    .from('transportadora_codigo_ocorrencia as tco')
    .leftJoin('codigo_ocorrencias as co', 'tco.codigo_ocorrencia_id', 'co.id')
    .leftJoin('transportadoras as t', 'tco.transportadora_id', 't.id')
    .orderBy('t.nome', 'tco.codigo_externo'),
  
  getById: (id) => knex('transportadora_codigo_ocorrencia')
    .select('tco.*', 'co.codigo', 'co.descricao', 'co.status_normalizado', 't.nome as transportadora_nome')
    .from('transportadora_codigo_ocorrencia as tco')
    .leftJoin('codigo_ocorrencias as co', 'tco.codigo_ocorrencia_id', 'co.id')
    .leftJoin('transportadoras as t', 'tco.transportadora_id', 't.id')
    .where('tco.id', id)
    .first(),
  
  getByTransportadoraAndCodigo: (transportadoraId, codigoExterno) => 
    knex('transportadora_codigo_ocorrencia')
      .select('tco.*', 'co.status_normalizado')
      .from('transportadora_codigo_ocorrencia as tco')
      .leftJoin('codigo_ocorrencias as co', 'tco.codigo_ocorrencia_id', 'co.id')
      .where({ 'tco.transportadora_id': transportadoraId, 'tco.codigo_externo': codigoExterno })
      .first(),
  
  create: async (data) => {
    const [result] = await knex('transportadora_codigo_ocorrencia').insert({
      ...data,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },
  
  update: async (id, data) => {
    const [result] = await knex('transportadora_codigo_ocorrencia').where({ id }).update({
      ...data,
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },
  
  delete: (id) => knex('transportadora_codigo_ocorrencia').where({ id }).del(),
};
