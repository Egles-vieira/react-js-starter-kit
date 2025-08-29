const { Client } = require('pg');
const fs = require('fs');
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
    const dir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(dir).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      console.log(`Running migration ${file}`);
      await client.query(sql);
    }
    console.log('Migrations completed');
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});
