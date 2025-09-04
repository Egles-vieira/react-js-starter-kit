const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/dashboard/metricas:
 *   get:
 *     summary: Obter métricas do dashboard de entregas
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: Período para as métricas
 *     responses:
 *       200:
 *         description: Métricas do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalNotas:
 *                   type: integer
 *                 entregues:
 *                   type: integer
 *                 emTransito:
 *                   type: integer
 *                 pendentes:
 *                   type: integer
 *                 problemas:
 *                   type: integer
 *                 taxaEntrega:
 *                   type: number
 *                 tempoMedioEntrega:
 *                   type: number
 */
router.get('/metricas', async (req, res) => {
  try {
    const { periodo = '7d' } = req.query;
    
    // Dados de exemplo - em produção, buscar do banco de dados
    const metricas = {
      totalNotas: 1250,
      entregues: 1100,
      emTransito: 120,
      pendentes: 30,
      problemas: 15,
      taxaEntrega: 88.0,
      tempoMedioEntrega: 3.2
    };

    // Ajustar dados baseado no período
    if (periodo === '30d') {
      metricas.totalNotas = 4500;
      metricas.entregues = 3950;
      metricas.emTransito = 420;
      metricas.pendentes = 100;
      metricas.problemas = 30;
    } else if (periodo === '90d') {
      metricas.totalNotas = 12000;
      metricas.entregues = 10500;
      metricas.emTransito = 1200;
      metricas.pendentes = 250;
      metricas.problemas = 50;
    }

    res.json(metricas);
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/dashboard/graficos:
 *   get:
 *     summary: Obter dados para gráficos do dashboard
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: Período para os gráficos
 *     responses:
 *       200:
 *         description: Dados para gráficos
 */
router.get('/graficos', async (req, res) => {
  try {
    const { periodo = '7d' } = req.query;
    
    // Dados de exemplo para gráficos
    const graficos = {
      entregasPorDia: [
        { data: '01/09', entregas: 45 },
        { data: '02/09', entregas: 52 },
        { data: '03/09', entregas: 38 },
        { data: '04/09', entregas: 61 },
        { data: '05/09', entregas: 55 },
        { data: '06/09', entregas: 48 },
        { data: '07/09', entregas: 42 }
      ],
      statusDistribuicao: [
        { name: 'Entregues', value: 1100 },
        { name: 'Em Trânsito', value: 120 },
        { name: 'Pendentes', value: 30 },
        { name: 'Problemas', value: 15 }
      ],
      ocorrenciasPorTipo: [
        { tipo: 'Entrega Realizada', quantidade: 1100 },
        { tipo: 'Tentativa', quantidade: 85 },
        { tipo: 'Endereço Incorreto', quantidade: 12 },
        { tipo: 'Destinatário Ausente', quantidade: 25 },
        { tipo: 'Avaria', quantidade: 8 }
      ],
      performanceTransportadoras: [
        { nome: 'TNT Express', totalEntregas: 450, taxaSucesso: 96.2 },
        { nome: 'Correios', totalEntregas: 380, taxaSucesso: 89.5 },
        { nome: 'Jadlog', totalEntregas: 320, taxaSucesso: 92.1 },
        { nome: 'Total Express', totalEntregas: 100, taxaSucesso: 87.0 }
      ]
    };

    res.json(graficos);
  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

