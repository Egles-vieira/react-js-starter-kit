const express = require('express');
const { queue } = require('../services/jobs.service');
const agRepo = require('../repositories/agendamentos.repo');


const router = express.Router();


router.get('/health', async (req, res) => {
const ativos = await agRepo.listAtivos();
const live = await queue.getRepeatableJobs();
const ativosMap = new Map(ativos.map(a => [a.id, a.cron]));
const liveMap = new Map(live.map(j => [j.id, j.cron]));


const faltando = [];
for (const a of ativos) {
if (liveMap.get(a.id) !== a.cron) faltando.push({ id: a.id, cron: a.cron });
}


const sobrando = [];
for (const j of live) {
if (ativosMap.get(j.id) !== j.cron) sobrando.push({ id: j.id, cron: j.cron, key: j.key });
}


res.json({ ativos: ativos.length, repeatables: live.length, faltando, sobrando });
});


module.exports = router;