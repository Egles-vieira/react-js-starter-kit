const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const routes = require('./routes');

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
app.use(cors());
app.use(express.json());
// monta todo o conjunto de rotas em /api
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('API com WebSocket está rodando...');
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em https://app.roadweb.com.br:${PORT}`);
});
