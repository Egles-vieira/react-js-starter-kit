// backend/scripts/create-test-data.js
// Script para criar dados de teste sem depender do banco de produção

const { enqueue, getQueueStats } = require('../services/jobs.service');

async function testJobWithoutDB() {
  try {
    console.log('=== Teste de Jobs sem Banco de Dados ===\n');

    // Enfileirar um job de teste diretamente
    console.log('Enfileirando job de teste...');
    const jobId = await enqueue('processAgendamento', {
      agendamentoId: 'test-123',
      nome: 'Teste Manual Sem DB',
      url: 'https://httpbin.org/post',
      metodo: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: { 
        message: 'Teste manual de job sem banco', 
        timestamp: new Date().toISOString(),
        test: true
      },
      metas: {}
    });

    console.log(`Job enfileirado com ID: ${jobId}`);

    // Aguardar um pouco e verificar estatísticas
    console.log('\nAguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const stats = await getQueueStats();
    console.log('\nEstatísticas da fila:');
    console.log(`- Aguardando: ${stats.waiting}`);
    console.log(`- Ativo: ${stats.active}`);
    console.log(`- Completado: ${stats.completed}`);
    console.log(`- Falhou: ${stats.failed}`);
    console.log(`- Total: ${stats.total}`);

    console.log('\n=== Teste Concluído ===');

  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o teste
testJobWithoutDB();

