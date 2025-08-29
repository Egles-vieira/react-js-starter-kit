const express = require('express');

const router = express.Router();

// GET /api/erros
router.get('/', (req, res) => {
  res.json({ erros: [] });
});

module.exports = router;
