const express = require('express');
const router = express.Router();

// Dados de exemplo para ocorrências
const ocorrenciasExemplo = [
  {
    id: 1,
    numero_nota_fiscal: 'NF001234',
    tipo: 'entrega_realizada',
    data_ocorrencia: '2024-09-04T10:30:00',
    destinatario: 'João Silva',
    transportadora: 'TNT Express',
    observacoes: 'Entrega realizada com sucesso',
    local: 'São Paulo, SP'
  },
  {
    id: 2,
    numero_nota_fiscal: 'NF001235',
    tipo: 'tentativa_entrega',
    data_ocorrencia: '2024-09-04T09:15:00',
    destinatario: 'Maria Santos',
    transportadora: 'Correios',
    observacoes: 'Destinatário ausente, nova tentativa agendada',
    local: 'Rio de Janeiro, RJ'
  },
  {
    id: 3,
    numero_nota_fiscal: 'NF001236',
    tipo: 'endereco_incorreto',
    data_ocorrencia: '2024-09-04T08:45:00',
    destinatario: 'Pedro Costa',
    transportadora: 'Jadlog',
    observacoes: 'Endereço não localizado, aguardando correção',
    local: 'Belo Horizonte, MG'
  },
  {
    id: 4,
    numero_nota_fiscal: 'NF001237',
    tipo: 'em_transito',
    data_ocorrencia: '2024-09-04T07:20:00',
    destinatario: 'Ana Oliveira',
    transportadora: 'Total Express',
    observacoes: 'Mercadoria em trânsito para destino',
    local: 'Brasília, DF'
  },
  {
    id: 5,
    numero_nota_fiscal: 'NF001238',
    tipo: 'saiu_entrega',
    data_ocorrencia: '2024-09-04T06:00:00',
    destinatario: 'Carlos Ferreira',
    transportadora: 'TNT Express',
    observacoes: 'Saiu para entrega no veículo 123',
    local: 'Salvador, BA'
  }
];

/**
 * @swagger
 * /api/ocorrencias:
 *   get:
 *     summary: Listar ocorrências com filtros
 *     tags: [Ocorrências]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Limite de itens por página
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Busca por número da nota ou destinatário
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtro por tipo de ocorrência
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do filtro
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do filtro
 *     responses:
 *       200:
 *         description: Lista de ocorrências
 */
router.get('/', async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      busca = '',
      tipo = '',
      dataInicio = '',
      dataFim = ''
    } = req.query;

    let ocorrenciasFiltradas = [...ocorrenciasExemplo];

    // Aplicar filtros
    if (busca) {
      ocorrenciasFiltradas = ocorrenciasFiltradas.filter(ocorrencia =>
        ocorrencia.numero_nota_fiscal.toLowerCase().includes(busca.toLowerCase()) ||
        ocorrencia.destinatario.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (tipo) {
      ocorrenciasFiltradas = ocorrenciasFiltradas.filter(ocorrencia =>
        ocorrencia.tipo === tipo
      );
    }

    if (dataInicio) {
      ocorrenciasFiltradas = ocorrenciasFiltradas.filter(ocorrencia =>
        new Date(ocorrencia.data_ocorrencia) >= new Date(dataInicio)
      );
    }

    if (dataFim) {
      ocorrenciasFiltradas = ocorrenciasFiltradas.filter(ocorrencia =>
        new Date(ocorrencia.data_ocorrencia) <= new Date(dataFim)
      );
    }

    // Paginação
    const inicio = (pagina - 1) * limite;
    const fim = inicio + parseInt(limite);
    const ocorrenciasPaginadas = ocorrenciasFiltradas.slice(inicio, fim);

    res.json({
      ocorrencias: ocorrenciasPaginadas,
      total: ocorrenciasFiltradas.length,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(ocorrenciasFiltradas.length / limite)
    });
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/ocorrencias/{id}:
 *   get:
 *     summary: Obter detalhes de uma ocorrência
 *     tags: [Ocorrências]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ocorrência
 *     responses:
 *       200:
 *         description: Detalhes da ocorrência
 *       404:
 *         description: Ocorrência não encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ocorrencia = ocorrenciasExemplo.find(o => o.id === parseInt(id));

    if (!ocorrencia) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    res.json(ocorrencia);
  } catch (error) {
    console.error('Erro ao buscar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/ocorrencias/export:
 *   get:
 *     summary: Exportar ocorrências para Excel
 *     tags: [Ocorrências]
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Busca por número da nota ou destinatário
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtro por tipo de ocorrência
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do filtro
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do filtro
 *     responses:
 *       200:
 *         description: Arquivo Excel com as ocorrências
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', async (req, res) => {
  try {
    // Simular exportação - em produção, gerar arquivo Excel real
    const dados = JSON.stringify(ocorrenciasExemplo, null, 2);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=ocorrencias.json');
    res.send(dados);
  } catch (error) {
    console.error('Erro ao exportar ocorrências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/ocorrencias:
 *   post:
 *     summary: Criar nova ocorrência
 *     tags: [Ocorrências]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_nota_fiscal:
 *                 type: string
 *               tipo:
 *                 type: string
 *               destinatario:
 *                 type: string
 *               transportadora:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               local:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ocorrência criada com sucesso
 */
router.post('/', async (req, res) => {
  try {
    const novaOcorrencia = {
      id: ocorrenciasExemplo.length + 1,
      data_ocorrencia: new Date().toISOString(),
      ...req.body
    };

    ocorrenciasExemplo.push(novaOcorrencia);

    res.status(201).json(novaOcorrencia);
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

