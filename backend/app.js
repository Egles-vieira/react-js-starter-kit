const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { Server } = require('socket.io');
const routes = require('./routes');
const traceId = require('./middlewares/traceId');
// inicia o agendador de tarefas
require('./services/scheduler.service');

const app = express();
const server = http.createServer(app);

// Socket.io acoplado ao servidor HTTP
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// WebSocket ativo
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado via socket:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(traceId);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss,
  });
});

app.use('/api', routes);
app.use(errors());

app.get('/', (req, res) => {
  res.send('API com WebSocket está rodando...');
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em https://app.roadweb.com.br:${PORT}`);
});
