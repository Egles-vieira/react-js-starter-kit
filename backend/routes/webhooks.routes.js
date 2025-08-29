const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const router = express.Router();

router.post(
  '/:transportadora/:integracaoSlug',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      transportadora: Joi.string().required(),
      integracaoSlug: Joi.string().required()
    })
  }),
  (req, res) => {
    const { transportadora, integracaoSlug } = req.params;
    // Apenas ecoa os dados recebidos
    res.json({ transportadora, integracaoSlug, payload: req.body });
  }
);

module.exports = router;
