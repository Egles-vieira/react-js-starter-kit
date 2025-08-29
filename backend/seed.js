const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres'
  });

  await client.connect();
  try {
    await client.query('TRUNCATE jobs_execucoes, arquivos_processados, erros_integracao, webhooks_eventos, agendamentos, integracoes, transportadoras RESTART IDENTITY CASCADE');

    const tnt = await client.query(
      'INSERT INTO transportadoras (nome, slug) VALUES ($1, $2) RETURNING id',
      ['TNT', 'tnt']
    );
    const jadlog = await client.query(
      'INSERT INTO transportadoras (nome, slug) VALUES ($1, $2) RETURNING id',
      ['Jadlog', 'jadlog']
    );

    const tntIntegration = await client.query(
      'INSERT INTO integracoes (transportadora_id, tipo, config) VALUES ($1, $2, $3) RETURNING id',
      [tnt.rows[0].id, 'pull', '{}']
    );
    const jadlogIntegration = await client.query(
      'INSERT INTO integracoes (transportadora_id, tipo, config) VALUES ($1, $2, $3) RETURNING id',
      [jadlog.rows[0].id, 'webhook', '{"url": "https://exemplo.com/webhook"}']
    );

    await client.query(
      'INSERT INTO agendamentos (integracao_id, cron, ativo) VALUES ($1, $2, $3)',
      [tntIntegration.rows[0].id, '0 0 * * *', true]
    );
    await client.query(
      'INSERT INTO agendamentos (integracao_id, cron, ativo) VALUES ($1, $2, $3)',
      [jadlogIntegration.rows[0].id, '*/30 * * * *', true]
    );

    console.log('Seed completed');
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error('Seed failed', err);
  process.exit(1);
});
