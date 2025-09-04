const knex = require('../shared/knex');

module.exports = {
  create: async (data) => {
    const [result] = await knex('erros_integracao').insert({
      ...data,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },
  
  list: (filters = {}) => {
    let query = knex('erros_integracao')
      .select('*')
      .orderBy('created_at', 'desc');
    
    if (filters.codigo) {
      query = query.where('codigo', filters.codigo);
    }
    
    return query;
  },
};
