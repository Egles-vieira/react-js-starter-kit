const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const notasController = require('../controllers/notasController');
const notaFiscalModel = require('../models/notaFiscal');

const router = express.Router();

/**
 * @swagger
 * /api/notas:
 *   get:
 *     summary: Lista notas fiscais
 *     tags: [Notas Fiscais]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: transportadora_id
 *         schema:
 *           type: integer
 *         description: Filtrar por transportadora
 *     responses:
 *       200:
 *         description: Lista de notas fiscais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   chave_nf:
 *                     type: string
 *                   nro:
 *                     type: string
 *                   ser:
 *                     type: string
 *                   status_nf:
 *                     type: string
 *                   transportadora_id:
 *                     type: integer
 *                   cliente_nome:
 *                     type: string
 */
router.get('/', async (req, res) => {
  try {
    const notas = await notaFiscalModel.findAll();
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/notas/{id}:
 *   get:
 *     summary: Busca nota fiscal por ID
 *     tags: [Notas Fiscais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nota fiscal encontrada
 *       404:
 *         description: Nota fiscal não encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await notaFiscalModel.findById(id);
    if (!nota) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }
    res.json(nota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/notas/{id}/ocorrencias:
 *   get:
 *     summary: Lista ocorrências de uma nota fiscal
 *     tags: [Notas Fiscais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ocorrências da nota fiscal
 */
router.get('/:id/ocorrencias', async (req, res) => {
  try {
    const { id } = req.params;
    const ocorrenciasRepo = require('../repositories/ocorrencias.repo');
    const ocorrencias = await ocorrenciasRepo.list({ nota_fiscal_id: id });
    res.json(ocorrencias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/notas/importar:
 *   post:
 *     summary: Importa notas fiscais
 *     tags: [Notas Fiscais]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Importação realizada com sucesso
 */
router.post('/importar', notasController.importar);

module.exports = router;
