const Motorista = require('../models/motorista');

// controllers/motoristasController.js
const db = require('../config/db');

exports.index = async (_req, res) => {
  try {
    const sql = `
      WITH latest AS (
        SELECT DISTINCT ON (l.id_motorista)
          l.id_motorista, l.latitude, l.longitude, l."timestamp"
        FROM public.localizacoes l
        ORDER BY l.id_motorista, l."timestamp" DESC NULLS LAST
      ),
      one_vehicle AS (
        -- pega o veículo mais recente por motorista
        SELECT DISTINCT ON (v.id_motorista)
          v.id_motorista,
          v.id_veiculo,
          v.placa,
          v.modelo,
          v.cor,
          v.ano
        FROM public.veiculos v
        ORDER BY
          v.id_motorista,
          COALESCE(v.created_at, 'epoch'::timestamp) DESC,
          v.id_veiculo DESC
      )
      SELECT 
        m.*,
        lt.latitude   AS ultima_lat,
        lt.longitude  AS ultima_lng,
        lt."timestamp" AS ultima_atualizacao,
        JSON_BUILD_OBJECT(
          'id_veiculo', ov.id_veiculo,
          'placa',  ov.placa,
          'modelo', ov.modelo,
          'cor',    ov.cor,
          'ano',    ov.ano
        ) AS veiculo
      FROM public.motoristas m
      LEFT JOIN latest lt      ON lt.id_motorista = m.id_motorista
      LEFT JOIN one_vehicle ov ON ov.id_motorista = m.id_motorista
      ORDER BY m.id_motorista;
    `;

    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar motoristas:', err);
    res.status(500).json({
      error: 'Erro ao listar motoristas.',
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }
};


exports.show = async (req, res) => {
  try {
    const item = await Motorista.findById(req.params.id_motorista);
    if (!item) return res.status(404).json({ error: 'Motorista não encontrado.' });
    res.json(item);
   } catch (err) {
    console.error('Erro ao listar motoristas:', err);
    res.status(500).json({
      error:   'Erro ao listar motoristas.',
      message: err.message,
      // só inclua o stack em dev:
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }
};

exports.store = async (req, res) => {
  try {
    const novo = await Motorista.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar motorista:', err);
    res.status(500).json({
      error: 'Erro ao criar motorista.',
      message: err.message,
      detail: err.detail || null,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await Motorista.update(req.params.id_motorista, req.body);
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar motorista.' });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Motorista.delete(req.params.id_motorista);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir motorista.' });
  }
};
