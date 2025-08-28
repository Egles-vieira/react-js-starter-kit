const express = require('express');
const router = express.Router();
const controller = require('../controllers/notasController');
const auth = require('../middlewares/auth');

router.post('/importar', auth, controller.importar);

module.exports = router;