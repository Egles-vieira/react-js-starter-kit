const Queue = require('bull');


function createQueue(name) {
const opts = {
redis: {
host: process.env.REDIS_HOST || '127.0.0.1',
port: Number(process.env.REDIS_PORT || 6379),
password: process.env.REDIS_PASSWORD || undefined,
db: Number(process.env.REDIS_DB || 0),
tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
},
defaultJobOptions: {
removeOnComplete: 500,
removeOnFail: 1000,
attempts: 3,
backoff: { type: 'exponential', delay: 5000 },
},
};
return new Queue(name, opts);
}


module.exports = { createQueue };