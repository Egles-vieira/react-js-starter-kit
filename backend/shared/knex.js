const knexLib = require('knex');


const knex = knexLib({
client: 'pg',
connection: {
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false },
},
pool: { min: 2, max: 10 },
});


module.exports = knex;