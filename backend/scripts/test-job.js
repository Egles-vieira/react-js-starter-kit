// backend/scripts/test-job.js
// Script para testar a funcionalidade de jobs

const { enqueue, getQueueStats } = require('../services/jobs.service');
const pool = require('../config/db');

async function createTestAgendamento() {
  try {
    console.log('Criando agendamento de teste...');
    
    // Primeiro, vamos criar uma integração de teste se não existir
    const integracaoResult = await pool.query(`
      INSERT INTO integracoes (nome, tipo, configuracao)
      VALUES ('Teste API', 'webhook', '{"url": "https://httpbin.org/post"}')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    let integracaoId;
    if (integracaoResult.rows.length > 0) {
      integracaoId = integracaoResult.rows[0].id;
    } else {
      // Se já existe, buscar o ID
      const existingIntegracao = await pool.query(`
        SELECT id FROM integracoes WHERE nome = 'Teste API' LIMIT 1
      `);
      integracaoId = existingIntegracao.rows[0].id;
    }

    // Criar o agendamento de teste
    const agendamentoResult = await pool.query(`
      INSERT INTO agendamentos (
        integracao_id, 
        nome, 
        cron, 
        url, 
        metodo, 
        headers, 
        payload, 
        ativo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      integracaoId,
      'Teste de Job',
      '*/5 * * * *', // A cada 5 minutos
      'https://httpbin.org/post',
      'POST',
      JSON.stringify({ 'Content-Type': 'application/json' }),
      JSON.stringify({ message: 'Teste de agendamento', timestamp: new Date().toISOString() }),
      true
    ]);

    const agendamentoId = agendamentoResult.rows[0].id;
    console.log(`Agendamento criado com ID: ${agendamentoId}`);

    return agendamentoId;
  } catch (error) {
    console.error('Erro ao criar agendamento de teste:', error);
    throw error;
  }
}

async function testJobExecution() {
  try {
    console.log('=== Teste de Execução de Jobs ===\n');

    // Criar agendamento de teste
    const agendamentoId = await createTestAgendamento();

    // Enfileirar um job manualmente
    console.log('Enfileirando job de teste...');
    const jobId = await enqueue('processAgendamento', {
      agendamentoId: agendamentoId,
      nome: 'Teste Manual',
      url: 'https://httpbin.org/post',
      metodo: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: { 
        message: 'Teste manual de job', 
        timestamp: new Date().toISOString(),
        test: true
      },
      metas: {}
    });

    console.log(`Job enfileirado com ID: ${jobId}`);

    // Aguardar um pouco e verificar estatísticas
    console.log('\nAguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const stats = await getQueueStats();
    console.log('\nEstatísticas da fila:');
    console.log(`- Aguardando: ${stats.waiting}`);
    console.log(`- Ativo: ${stats.active}`);
    console.log(`- Completado: ${stats.completed}`);
    console.log(`- Falhou: ${stats.failed}`);
    console.log(`- Total: ${stats.total}`);

    // Verificar execuções no banco
    const execucoes = await pool.query(`
      SELECT id, status, executado_em, log
      FROM jobs_execucoes 
      WHERE agendamento_id = $1
      ORDER BY executado_em DESC
      LIMIT 5
    `, [agendamentoId]);

    console.log('\nÚltimas execuções no banco:');
    execucoes.rows.forEach(exec => {
      console.log(`- ID: ${exec.id}, Status: ${exec.status}, Executado em: ${exec.executado_em}`);
      if (exec.log) {
        try {
          const logData = JSON.parse(exec.log);
          console.log(`  Log: ${JSON.stringify(logData, null, 2)}`);
        } catch (e) {
          console.log(`  Log: ${exec.log}`);
        }
      }
    });

    console.log('\n=== Teste Concluído ===');

  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    // Fechar conexão do pool
    await pool.end();
    process.exit(0);
  }
}

// Executar o teste
testJobExecution();

