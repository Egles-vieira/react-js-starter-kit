const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobsController');

router.post('/run/:agendamentoId', controller.run);

module.exports = router;
