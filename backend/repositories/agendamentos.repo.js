const knex = require('../shared/knex');


module.exports = {
listAtivos: () =>
knex('agendamentos').select('id', 'integracao_id', 'cron', 'ativo').where({ ativo: true }),


getById: (id) => knex('agendamentos').first('id', 'integracao_id', 'cron', 'ativo').where({ id }),


updatePartial: (id, patch) => knex('agendamentos').where({ id }).update({
...patch,
updated_at: knex.fn.now(),
}),
};