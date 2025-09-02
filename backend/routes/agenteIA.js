const express = require('express');
const router = express.Router();
const agenteIAController = require('../controllers/agenteIAController');

router.post('/chat', agenteIAController.chat);

module.exports = router;
