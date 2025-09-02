// backend/config/db.js
require('dotenv').config();
const { Pool } = require('pg');

const wantSSL = String(process.env.DB_SSL).toLowerCase() === 'true';
// se quiser usar CA, substitua por { ca: fs.readFileSync(..., 'utf8') }
const ssl = wantSSL ? { rejectUnauthorized: false } : false;

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl } // ssl FORÇADO conforme DB_SSL
  : {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: String(process.env.PGPASSWORD ?? ''),
      ssl,
    };

const pool = new Pool(config);
module.exports = pool;
