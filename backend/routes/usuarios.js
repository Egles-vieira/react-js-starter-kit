// backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuariosController');
const auth = require('../middlewares/auth'); // JWT ou outro

router.get('/',    auth, ctrl.index);
router.get('/:id', auth, ctrl.show);
router.post('/',   auth, ctrl.store);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.destroy);

// Nova rota para troca de senha
router.post('/:id/change-password', auth, ctrl.changePassword);

module.exports = router;
