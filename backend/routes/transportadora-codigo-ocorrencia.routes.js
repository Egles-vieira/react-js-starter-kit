const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const controller = require('../controllers/transportadora-codigo-ocorrencia.controller');

const router = express.Router();

/**
 * @swagger
 * /api/cadastros/admin/transportadora-codigo-ocorrencia:
 *   get:
 *     summary: Lista mapeamentos de códigos por transportadora
 *     tags: [Cadastros Admin]
 *     responses:
 *       200:
 *         description: Lista de mapeamentos
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
 *                   transportadora_id:
 *                     type: integer
 *                   codigo_externo:
 *                     type: string
 *                   codigo_ocorrencia_id:
 *                     type: string
 *                     format: uuid
 *                   transportadora_nome:
 *                     type: string
 *                   codigo:
 *                     type: string
 *                   descricao:
 *                     type: string
 */
router.get('/', controller.list);

/**
 * @swagger
 * /api/cadastros/admin/transportadora-codigo-ocorrencia:
 *   post:
 *     summary: Cria novo mapeamento de código
 *     tags: [Cadastros Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transportadora_id
 *               - codigo_externo
 *               - codigo_ocorrencia_id
 *             properties:
 *               transportadora_id:
 *                 type: integer
 *                 description: ID da transportadora
 *               codigo_externo:
 *                 type: string
 *                 description: Código usado pela transportadora
 *               codigo_ocorrencia_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do código interno
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Mapeamento criado com sucesso
 *       400:
 *         description: Mapeamento já existe
 */
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      transportadora_id: Joi.number().integer().required(),
      codigo_externo: Joi.string().required(),
      codigo_ocorrencia_id: Joi.string().uuid().required(),
      ativo: Joi.boolean().default(true)
    })
  }),
  controller.create
);

router.get('/:id', controller.getById);

router.put('/:id', celebrate({
  [Segments.BODY]: Joi.object({
    transportadora_id: Joi.number().integer().required(),
    codigo_externo: Joi.string().required(),
    codigo_ocorrencia_id: Joi.string().uuid().required(),
    ativo: Joi.boolean()
  })
}), controller.update);

router.delete('/:id', controller.delete);

module.exports = router;
