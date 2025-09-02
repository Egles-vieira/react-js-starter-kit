const express = require('express');

const router = express.Router();

// GET /api/arquivos
router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;
