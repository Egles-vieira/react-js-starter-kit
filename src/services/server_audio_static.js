
// Servidor separado apenas para servir arquivos de áudio com MIME correto
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const { Pool } = require('pg');


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'appdb',
  password: process.env.DB_PASSWORD,
  port: 25060,
  ssl: { rejectUnauthorized: false }
});

// Servir arquivos .mp3 de /uploads com headers CORS e Content-Type
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));


// Porta customizada para só o servidor de áudio
const PORT = process.env.AUDIO_PORT || 4002;
app.listen(PORT, () => {
  console.log(`🎧 Servidor de áudio rodando em http://64.23.183.132:${PORT}/uploads`);
});


// Busca audio por motorista
app.get('/api/audios/:id_motorista', async (req, res) => {
  const id = parseInt(req.params.id_motorista, 10);
  if (!id) return res.status(400).json({ error: 'ID inválido' });

  try {
    const sql = `
      SELECT
        id_audio,
        arquivo_url,
        created_at,
        duracao_segundos,
        tamanho_kb
      FROM public.audios_motorista
      WHERE id_motorista = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(sql, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar áudios do motorista:', err);
    res.status(500).json({ error: 'Erro ao buscar áudios.' });
  }
});

