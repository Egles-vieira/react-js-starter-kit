const express = require('express');
const router = express.Router();
const controller = require('../controllers/audiosController');

router.get('/:id_motorista', controller.index);

module.exports = router;
