const express = require('express');
const router = express.Router();
const controller = require('../controllers/motoristasController');
const auth = require('../middlewares/auth');

router.get('/', auth, controller.index);
router.get('/:id_motorista', auth, controller.show);
router.post('/', auth, controller.store);
router.put('/:id_motorista', auth, controller.update);
router.delete('/:id_motorista', auth, controller.destroy);

module.exports = router;
