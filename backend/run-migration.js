const knex = require('./shared/knex');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Executando migração 008_update_agendamentos.sql...');
    
    const migrationPath = path.join(__dirname, 'migrations', '008_update_agendamentos.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await knex.raw(migrationSQL);
    
    console.log('✅ Migração executada com sucesso!');
    
    // Testa se a tabela tem os novos campos
    const result = await knex('agendamentos').columnInfo();
    console.log('Colunas da tabela agendamentos:');
    console.log(Object.keys(result));
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
  } finally {
    await knex.destroy();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;