const knex = require('../shared/knex');

module.exports = {
  list: () => knex('codigo_ocorrencias').select('*').orderBy('codigo'),
  
  listAtivos: () => knex('codigo_ocorrencias').select('*').where({ ativo: true }).orderBy('codigo'),
  
  getById: (id) => knex('codigo_ocorrencias').first('*').where({ id }),
  
  getByCodigo: (codigo) => knex('codigo_ocorrencias').first('*').where({ codigo }),
  
  create: async (data) => {
    const [result] = await knex('codigo_ocorrencias').insert({
      ...data,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },
  
  update: async (id, data) => {
    const [result] = await knex('codigo_ocorrencias').where({ id }).update({
      ...data,
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },
  
  delete: (id) => knex('codigo_ocorrencias').where({ id }).del(),
};
