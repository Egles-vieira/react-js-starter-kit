const express = require('express');
const router = express.Router();
const controller = require('../controllers/webhooksController');

router.post('/:transportadora/:slug', controller.handle);

module.exports = router;
