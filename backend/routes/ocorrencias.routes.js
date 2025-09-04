const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const controller = require('../controllers/ocorrencias.controller');

const router = express.Router();


  @swagger
  /api/ocorrencias:
    get:
      summary: Lista ocorrências
      tags: [Ocorrências]
      parameters:
        - in: query
          name: nota_fiscal_id
          schema:
            type: integer
          description: Filtrar por ID da nota fiscal
        - in: query
          name: transportadora_id
          schema:
            type: integer
          description: Filtrar por ID da transportadora
        - in: query
          name: status_normalizado
          schema:
            type: string
          description: Filtrar por status normalizado
      responses:
        200:
          description: Lista de ocorrências
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                      format: uuid
                    nota_fiscal_id:
                      type: integer
                    transportadora_id:
                      type: integer
                    codigo_externo:
                      type: string
                    status_normalizado:
                      type: string
                    descricao:
                      type: string
                    data_ocorrencia:
                      type: string
                      format: date-time
                    chave_nf:
                      type: string
                    transportadora_nome:
                      type: string

router.get('/', controller.list);


  @swagger
  /api/ocorrencias/{id}:
    get:
      summary: Busca ocorrência por ID
      tags: [Ocorrências]
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Ocorrência encontrada
        404:
          description: Ocorrência não encontrada

router.get('/:id', controller.getById);

  @swagger
  /api/ocorrencias:
    post:
      summary: Cria nova ocorrência
      tags: [Ocorrências]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - nota_fiscal_id
                - transportadora_id
                - codigo_externo
              properties:
                nota_fiscal_id:
                  type: integer
                transportadora_id:
                  type: integer
                codigo_externo:
                  type: string
                descricao:
                  type: string
                data_ocorrencia:
                  type: string
                  format: date-time
                dados_originais:
                  type: object
      responses:
        201:
          description: Ocorrência criada com sucesso
 
router.post('/',
  celebrate({
    [Segments.BODY]: Joi.object({
      nota_fiscal_id: Joi.number().integer().required(),
      transportadora_id: Joi.number().integer().required(),
      codigo_externo: Joi.string().required(),
      descricao: Joi.string().optional(),
      data_ocorrencia: Joi.date().optional(),
      dados_originais: Joi.object().optional()
    })
  }),
  controller.create
);

module.exports = router;