const Redis = require('ioredis');


const redis = new Redis(process.env.REDIS_URL || {
host: process.env.REDIS_HOST || '127.0.0.1',
port: Number(process.env.REDIS_PORT || 6379),
password: process.env.REDIS_PASSWORD || undefined,
db: Number(process.env.REDIS_DB || 0),
// tls: {}, // se o Redis gerenciado exigir TLS, habilite e ajuste
});


module.exports = redis;