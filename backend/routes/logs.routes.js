const express = require('express');

const router = express.Router();

// GET /api/logs
router.get('/', (req, res) => {
  // Simula logs do sistema
  const mockLogs = [
    { 
      id: 1, 
      timestamp: new Date().toISOString(), 
      level: "info", 
      message: "Scheduler iniciado com sucesso", 
      trace_id: "trace-001" 
    },
    { 
      id: 2, 
      timestamp: new Date(Date.now() - 60000).toISOString(), 
      level: "warn", 
      message: "Agendamento pausado: timeout de conexão", 
      trace_id: "trace-002" 
    },
    { 
      id: 3, 
      timestamp: new Date(Date.now() - 120000).toISOString(), 
      level: "error", 
      message: "Falha na execução do job ID 123", 
      trace_id: "trace-003" 
    }
  ];
  
  res.json(mockLogs);
});

module.exports = router;