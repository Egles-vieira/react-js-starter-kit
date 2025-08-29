const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const routes = require('./routes');
const setupSwagger = require('./config/swagger');
const config = require('./config/env');
const logger = require('./config/logger');

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
app.use(cors());
app.use(express.json());
setupSwagger(app);
// monta todo o conjunto de rotas em /api
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('API com WebSocket está rodando...');
});

const PORT = config.port || 4000;
server.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando em https://app.roadweb.com.br:${PORT}`);
});
