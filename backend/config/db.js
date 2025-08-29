const { Pool } = require('pg');

const pool = new Pool({
  user: 'doadmin',
  host: 'banco-road-prod-rw-do-user-14245463-0.l.db.ondigitalocean.com',
  database: 'app-producao',
  password: 'AVNS_v8aBJRlskpFPvlUvQ9K',
  port: 25060,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
