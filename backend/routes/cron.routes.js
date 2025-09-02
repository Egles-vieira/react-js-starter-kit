// backend/routes/cron.routes.js
const express = require('express');
const ctrl = require('../controllers/cron.controller');

const router = express.Router();

router.get('/agendamentos/ativos', ctrl.listAgendamentosAtivos);
router.get('/jobs', ctrl.listarExecucoes);
router.get('/queue/stats', ctrl.getQueueStats);
router.post('/agendamentos/:id/run', ctrl.runNow);

module.exports = router;
