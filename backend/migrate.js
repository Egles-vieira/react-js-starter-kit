const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'banco-road-prod-rw-do-user-14245463-0.l.db.ondigitalocean.com',
    port: process.env.DB_PORT || 25060,
    user: process.env.DB_USER || 'doadmin',
    password: process.env.DB_PASSWORD || 'AVNS_v8aBJRlskpFPvlUvQ9K',
    database: process.env.DB_NAME || 'app-producao'
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
