// backend/knexfile.js
const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    },
    migrations: { directory: path.join(__dirname, 'migrations') },
    seeds:      { directory: path.join(__dirname, 'seeders') },
  },
};
