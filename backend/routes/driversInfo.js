const express = require('express');
const router = express.Router();
const controller = require('../controllers/driversInfoController'); // ✅ certo agora!

router.get('/', controller.index); // essa função existe

module.exports = router;