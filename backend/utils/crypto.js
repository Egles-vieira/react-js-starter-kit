const crypto = require('crypto');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function generateIdempotencyKey(buffer) {
  return sha256(buffer);
}

module.exports = { sha256, generateIdempotencyKey };
