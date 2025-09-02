const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  bullmq: {
    prefix: process.env.BULLMQ_PREFIX || 'bull'
  }
};

module.exports = config;
