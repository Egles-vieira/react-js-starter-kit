const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

// Simulated integrations store
const integracoes = [
  { id: 1, slug: 'erp', ativo: true },
  { id: 2, slug: 'wms', ativo: false }
];

const router = express.Router();

// GET /api/integracoes?slug=erp&ativo=true
router.get(
  '/',
  celebrate({
    [Segments.QUERY]: {
      slug: Joi.string(),
      ativo: Joi.boolean()
    }
  }),
  (req, res) => {
    const { slug, ativo } = req.query;
    let data = integracoes;
    if (slug) data = data.filter(i => i.slug === slug);
    if (typeof ativo !== 'undefined') data = data.filter(i => i.ativo === (ativo === 'true' || ativo === true));
    res.json(data);
  }
);

// POST /api/integracoes/teste-conexao
router.post(
  '/teste-conexao',
  celebrate({
    [Segments.BODY]: Joi.object({
      url: Joi.string().uri().required()
    })
  }),
  async (req, res) => {
    // Simplesmente responde que a conexão foi bem-sucedida
    res.json({ sucesso: true, url: req.body.url });
  }
);

module.exports = router;
