const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientesController');
const auth = require('../middlewares/auth');

router.get('/', auth, controller.index);
router.get('/:id', auth, controller.show);
router.post('/', auth, controller.store);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.destroy);

module.exports = router;