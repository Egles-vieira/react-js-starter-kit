// routes/registro.js
const express    = require('express');
const router     = express.Router();
const auth       = require('../middlewares/auth');
const controller = require('../controllers/registroController');

router.post('/',               auth, controller.storeMotoristaVeiculo);
router.put('/:id_motorista',   auth, controller.updateMotoristaVeiculo);

module.exports = router;