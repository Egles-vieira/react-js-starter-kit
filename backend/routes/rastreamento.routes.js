const express = require('express');
const router = express.Router();

// Dados de exemplo para rastreamento
const entregasExemplo = [
  {
    id: 1,
    numero_nota_fiscal: 'NF001234',
    codigo_rastreamento: 'TNT123456789',
    status: 'entregue',
    destinatario: 'João Silva',
    cidade_destino: 'São Paulo, SP',
    transportadora: 'TNT Express',
    data_coleta: '2024-09-01T08:00:00',
    data_entrega: '2024-09-04T10:30:00',
    prazo_entrega: '2024-09-05T18:00:00',
    peso: 2.5,
    telefone: '(11) 99999-9999',
    email: 'joao@email.com',
    endereco_completo: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567',
    ocorrencias: [
      {
        tipo: 'coletado',
        descricao: 'Mercadoria coletada',
        data_ocorrencia: '2024-09-01T08:00:00',
        local: 'Centro de Distribuição - São Paulo',
        observacoes: 'Coleta realizada conforme agendamento'
      },
      {
        tipo: 'em_transito',
        descricao: 'Em trânsito para destino',
        data_ocorrencia: '2024-09-02T14:30:00',
        local: 'Hub de Distribuição - Campinas',
        observacoes: 'Mercadoria em trânsito'
      },
      {
        tipo: 'saiu_entrega',
        descricao: 'Saiu para entrega',
        data_ocorrencia: '2024-09-04T08:00:00',
        local: 'Base de Entrega - São Paulo Centro',
        observacoes: 'Veículo 456 - Entregador: Carlos'
      },
      {
        tipo: 'entregue',
        descricao: 'Entrega realizada',
        data_ocorrencia: '2024-09-04T10:30:00',
        local: 'Endereço do destinatário',
        observacoes: 'Entrega realizada com sucesso. Recebido por: João Silva'
      }
    ]
  },
  {
    id: 2,
    numero_nota_fiscal: 'NF001235',
    codigo_rastreamento: 'COR987654321',
    status: 'em_transito',
    destinatario: 'Maria Santos',
    cidade_destino: 'Rio de Janeiro, RJ',
    transportadora: 'Correios',
    data_coleta: '2024-09-03T10:00:00',
    prazo_entrega: '2024-09-06T18:00:00',
    peso: 1.2,
    telefone: '(21) 88888-8888',
    email: 'maria@email.com',
    endereco_completo: 'Av. Copacabana, 456 - Copacabana - Rio de Janeiro/RJ - CEP: 22070-001',
    ocorrencias: [
      {
        tipo: 'coletado',
        descricao: 'Mercadoria coletada',
        data_ocorrencia: '2024-09-03T10:00:00',
        local: 'Centro de Distribuição - São Paulo',
        observacoes: 'Coleta realizada'
      },
      {
        tipo: 'em_transito',
        descricao: 'Em trânsito para destino',
        data_ocorrencia: '2024-09-04T06:00:00',
        local: 'Hub de Distribuição - Rio de Janeiro',
        observacoes: 'Mercadoria chegou ao hub do Rio de Janeiro'
      }
    ]
  },
  {
    id: 3,
    numero_nota_fiscal: 'NF001236',
    codigo_rastreamento: 'JAD456789123',
    status: 'problema',
    destinatario: 'Pedro Costa',
    cidade_destino: 'Belo Horizonte, MG',
    transportadora: 'Jadlog',
    data_coleta: '2024-09-02T15:00:00',
    prazo_entrega: '2024-09-05T18:00:00',
    peso: 3.8,
    telefone: '(31) 77777-7777',
    email: 'pedro@email.com',
    endereco_completo: 'Rua da Liberdade, 789 - Centro - Belo Horizonte/MG - CEP: 30112-000',
    ocorrencias: [
      {
        tipo: 'coletado',
        descricao: 'Mercadoria coletada',
        data_ocorrencia: '2024-09-02T15:00:00',
        local: 'Centro de Distribuição - São Paulo',
        observacoes: 'Coleta realizada'
      },
      {
        tipo: 'endereco_incorreto',
        descricao: 'Endereço incorreto',
        data_ocorrencia: '2024-09-04T08:45:00',
        local: 'Belo Horizonte, MG',
        observacoes: 'Endereço não localizado, aguardando correção do destinatário'
      }
    ]
  }
];

/**
 * @swagger
 * /api/rastreamento:
 *   get:
 *     summary: Buscar entregas por número da nota fiscal ou código de rastreamento
 *     tags: [Rastreamento]
 *     parameters:
 *       - in: query
 *         name: busca
 *         required: true
 *         schema:
 *           type: string
 *         description: Número da nota fiscal ou código de rastreamento
 *     responses:
 *       200:
 *         description: Lista de entregas encontradas
 */
router.get('/', async (req, res) => {
  try {
    const { busca } = req.query;

    if (!busca || busca.length < 3) {
      return res.status(400).json({ 
        error: 'Parâmetro de busca deve ter pelo menos 3 caracteres' 
      });
    }

    const entregasEncontradas = entregasExemplo.filter(entrega =>
      entrega.numero_nota_fiscal.toLowerCase().includes(busca.toLowerCase()) ||
      entrega.codigo_rastreamento.toLowerCase().includes(busca.toLowerCase()) ||
      entrega.destinatario.toLowerCase().includes(busca.toLowerCase())
    );

    res.json({
      entregas: entregasEncontradas,
      total: entregasEncontradas.length
    });
  } catch (error) {
    console.error('Erro ao buscar entregas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/rastreamento/{id}:
 *   get:
 *     summary: Obter detalhes completos de uma entrega
 *     tags: [Rastreamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da entrega
 *     responses:
 *       200:
 *         description: Detalhes completos da entrega
 *       404:
 *         description: Entrega não encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const entrega = entregasExemplo.find(e => e.id === parseInt(id));

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega não encontrada' });
    }

    res.json(entrega);
  } catch (error) {
    console.error('Erro ao buscar detalhes da entrega:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/rastreamento/codigo/{codigo}:
 *   get:
 *     summary: Rastrear entrega por código de rastreamento
 *     tags: [Rastreamento]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de rastreamento
 *     responses:
 *       200:
 *         description: Informações da entrega
 *       404:
 *         description: Código de rastreamento não encontrado
 */
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const entrega = entregasExemplo.find(e => 
      e.codigo_rastreamento.toLowerCase() === codigo.toLowerCase()
    );

    if (!entrega) {
      return res.status(404).json({ error: 'Código de rastreamento não encontrado' });
    }

    res.json(entrega);
  } catch (error) {
    console.error('Erro ao rastrear por código:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/rastreamento/nota/{numeroNota}:
 *   get:
 *     summary: Rastrear entrega por número da nota fiscal
 *     tags: [Rastreamento]
 *     parameters:
 *       - in: path
 *         name: numeroNota
 *         required: true
 *         schema:
 *           type: string
 *         description: Número da nota fiscal
 *     responses:
 *       200:
 *         description: Informações da entrega
 *       404:
 *         description: Nota fiscal não encontrada
 */
router.get('/nota/:numeroNota', async (req, res) => {
  try {
    const { numeroNota } = req.params;
    const entrega = entregasExemplo.find(e => 
      e.numero_nota_fiscal.toLowerCase() === numeroNota.toLowerCase()
    );

    if (!entrega) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json(entrega);
  } catch (error) {
    console.error('Erro ao rastrear por nota fiscal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/rastreamento/{id}/ocorrencias:
 *   post:
 *     summary: Adicionar nova ocorrência a uma entrega
 *     tags: [Rastreamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               local:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ocorrência adicionada com sucesso
 *       404:
 *         description: Entrega não encontrada
 */
router.post('/:id/ocorrencias', async (req, res) => {
  try {
    const { id } = req.params;
    const entrega = entregasExemplo.find(e => e.id === parseInt(id));

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega não encontrada' });
    }

    const novaOcorrencia = {
      data_ocorrencia: new Date().toISOString(),
      ...req.body
    };

    entrega.ocorrencias.push(novaOcorrencia);

    res.status(201).json(novaOcorrencia);
  } catch (error) {
    console.error('Erro ao adicionar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

