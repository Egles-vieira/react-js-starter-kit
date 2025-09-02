const { queue } = require('../services/jobs.service');
const { runAgendamentoOnce } = require('../services/runner.service');


queue.process('run-agendamento', 5, async (job) => {
const { agendamento_id } = job.data;
await runAgendamentoOnce(agendamento_id);
});