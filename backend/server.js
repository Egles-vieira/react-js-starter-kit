const express = require('express');
const http = require('http');
const cors = require('cors');
const cronHealthRoutes = require('./routes/cron.health.routes');
const cronRoutes = require('./routes/cron.routes');

const { startScheduler } = require('./services/scheduler.service');
let helmetMiddleware = () => (req, res, next) => next();
try {
  helmetMiddleware = require('helmet');
} catch (e) {
  // helmet não está instalado; middleware no-op
}
let celebrateErrors = () => (err, req, res, next) => next(err);
try {
  ({ errors: celebrateErrors } = require('celebrate'));
} catch (e) {
  // celebrate não está instalado; middleware de erro no-op
}
const { Server } = require('socket.io');
const routes = require('./routes');
const setupSwagger = require('./config/swagger');
const config = require('./config/env');
const logger = require('./config/logger');
const traceId = require('./middlewares/traceId');

if (require.main === module) {
  require('./services/scheduler.service');
}

const app = express();
const server = http.createServer(app);

// Socket.io acoplado ao servidor HTTP
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// WebSocket ativo
io.on('connection', (socket) => {
  logger.info('✅ Cliente conectado via socket', { socketId: socket.id });

  socket.on('disconnect', () => {
    logger.info('❌ Cliente desconectado', { socketId: socket.id });
  });
});

// Middlewares
app.use(helmetMiddleware());
app.use(cors());
app.use(traceId);
app.use(express.json());
setupSwagger(app);

// Endpoints básicos
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss,
  });
});

app.use('/api/cron', cronRoutes);

app.use('/api/cron', cronHealthRoutes); // expõe /api/cron/health


// iniciar reconciliador dos repeatables (apenas 1 instância)
if (typeof startScheduler === 'function') {
  startScheduler();
} else {
  console.warn('[scheduler] startScheduler não é uma função — verifique o export de services/scheduler.service.js');
}


// monta todo o conjunto de rotas em /api
app.use('/api', routes);
app.use(celebrateErrors());

app.get('/', (req, res) => {
  res.send('API com WebSocket está rodando...');
});

const PORT = config.port || 4000;

if (require.main === module) {
  server.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando em https://app.roadweb.com.br:${PORT}`);
  });
}

module.exports = app;
