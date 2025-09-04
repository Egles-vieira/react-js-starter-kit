const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const controller = require('../controllers/codigo-ocorrencias.controller');

const router = express.Router();

/**
 * @swagger
 * /api/cadastros/admin/codigo-ocorrencias:
 *   get:
 *     summary: Lista códigos de ocorrências
 *     tags: [Cadastros Admin]
 *     responses:
 *       200:
 *         description: Lista de códigos de ocorrências
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   codigo:
 *                     type: string
 *                   descricao:
 *                     type: string
 *                   status_normalizado:
 *                     type: string
 *                   ativo:
 *                     type: boolean
 */
router.get('/', controller.list);

/**
 * @swagger
 * /api/cadastros/admin/codigo-ocorrencias:
 *   post:
 *     summary: Cria novo código de ocorrência
 *     tags: [Cadastros Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - descricao
 *               - status_normalizado
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código interno único
 *               descricao:
 *                 type: string
 *                 description: Descrição do código
 *               status_normalizado:
 *                 type: string
 *                 description: Status normalizado (ex. entregue, em_transito, etc.)
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Código criado com sucesso
 *       400:
 *         description: Código já existe
 */
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      codigo: Joi.string().required(),
      descricao: Joi.string().required(),
      status_normalizado: Joi.string().required(),
      ativo: Joi.boolean().default(true)
    })
  }),
  controller.create
);

/**
 * @swagger
 * /api/cadastros/admin/codigo-ocorrencias/{id}:
 *   get:
 *     summary: Busca código por ID
 *     tags: [Cadastros Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Código encontrado
 *       404:
 *         description: Código não encontrado
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/cadastros/admin/codigo-ocorrencias/{id}:
 *   put:
 *     summary: Atualiza código de ocorrência
 *     tags: [Cadastros Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - descricao
 *               - status_normalizado
 *             properties:
 *               codigo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               status_normalizado:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Código atualizado
 *       404:
 *         description: Código não encontrado
 */
router.put('/:id', celebrate({
  [Segments.BODY]: Joi.object({
    codigo: Joi.string().required(),
    descricao: Joi.string().required(),
    status_normalizado: Joi.string().required(),
    ativo: Joi.boolean()
  })
}), controller.update);

/**
 * @swagger
 * /api/cadastros/admin/codigo-ocorrencias/{id}:
 *   delete:
 *     summary: Remove código de ocorrência
 *     tags: [Cadastros Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Código removido
 *       404:
 *         description: Código não encontrado
 */
router.delete('/:id', controller.delete);

module.exports = router;
