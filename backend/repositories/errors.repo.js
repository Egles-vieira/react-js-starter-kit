// backend/repositories/errors.repo.js
let repo;
try {
  repo = require('../../repositories/errors.repository');
} catch (e1) {
  try {
    repo = require('./errors.repository');
  } catch (e2) {
    throw e1;
  }
}
module.exports = repo;
