// scripts/db-check.js
require('dotenv').config();
const { Pool } = require('pg');

const wantSSL = String(process.env.DB_SSL).toLowerCase() === 'true';
const ssl = wantSSL ? { rejectUnauthorized: false } : false;

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: String(process.env.PGPASSWORD ?? ''),
      ssl,
    };

(async () => {
  try {
    const pool = new Pool(config);
    const r = await pool.query('select now() as now');
    console.log('DB OK:', r.rows[0]);
    process.exit(0);
  } catch (e) {
    console.error('DB FAIL:', e.message);
    process.exit(1);
  }
})();
