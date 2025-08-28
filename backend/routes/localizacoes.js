// routes/localizacoesRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/localizacoesController');

router.get('/localizacoes/health', ctrl.health);

router.get('/localizacoes', ctrl.index);
router.get('/localizacoes/:id', ctrl.show);
router.post('/localizacoes', ctrl.store);
router.put('/localizacoes/:id', ctrl.update);
router.delete('/localizacoes/:id', ctrl.destroy);

// Otimizadas
router.get('/localizacoes/ultimas', ctrl.ultimasPorMotorista);
router.get('/localizacoes/raw-latest', ctrl.rawLatestPerDriver);

module.exports = router;