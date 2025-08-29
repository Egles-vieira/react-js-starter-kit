const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const enderecos = require('./enderecos');
const transportadoras = require('./transportadoras');
const motoristas = require('./motoristas');
const romaneios = require('./romaneios');
const notas = require('./notas');
const notaFiscal = require('./notaFiscal');
const localizacoesController = require('../controllers/localizacoesController');
const veiculosRoutes = require('./veiculos');
const registro   = require('./registro');
const agenteIA   = require('./agenteIA');


const integracoes = require('./integracoes.routes');
const agendamentos = require('./agendamentos.routes');
const jobs = require('./jobs.routes');
const arquivos = require('./arquivos.routes');
const erros = require('./erros.routes');
const webhooks = require('./webhooks.routes');


// Rota pública
router.post('/login', require('../controllers/authController').login);
router.use('/usuarios', auth, require('./usuarios'));
router.use('/localizacoes', require('./localizacoes'));


// Rotas protegidas
router.use('/embarcadores', auth, require('./embarcadores'));
router.use('/clientes', auth, require('./clientes'));
router.use('/enderecos', enderecos);
router.use('/transportadoras', require('./transportadoras'));
router.use('/motoristas', require('./motoristas'));
router.use('/romaneios', require('./romaneios'));
router.use('/notas', notas);
router.use('/notaFiscal', require('./notaFiscal'));
router.use('/drivers-info', require('./driversInfo'));

router.use('/veiculos', auth, veiculosRoutes);
router.use('/registro',   registro);
router.use('/agente-ia', auth, agenteIA);


router.use('/integracoes', integracoes);
router.use('/agendamentos', agendamentos);
router.use('/jobs', jobs);
router.use('/arquivos', arquivos);
router.use('/erros', erros);
router.use('/webhooks', webhooks);



module.exports = router;
