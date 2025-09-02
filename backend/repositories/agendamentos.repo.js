const knex = require('../shared/knex');

module.exports = {
  listAtivos: () =>
    knex('agendamentos').select('*').where({ ativo: true }),

  list: () => knex('agendamentos').select('*'),

  getById: (id) => knex('agendamentos').first('*').where({ id }),

  create: async (data) => {
    const [result] = await knex('agendamentos').insert({
      ...data,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },

  update: async (id, data) => {
    const [result] = await knex('agendamentos').where({ id }).update({
      ...data,
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },

  updatePartial: async (id, patch) => {
    const [result] = await knex('agendamentos').where({ id }).update({
      ...patch,
      updated_at: knex.fn.now(),
    }).returning('*');
    return result;
  },

  delete: (id) => knex('agendamentos').where({ id }).del(),
};