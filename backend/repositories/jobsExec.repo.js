// backend/repositories/jobsExec.repo.js
// Adapter para compatibilidade com controllers antigos que pedem "jobsExec.repo"

let repo;
try {
  // repositório real na raiz do projeto
  repo = require('../../repositories/jobs.repository');
} catch (e1) {
  try {
    // fallback: caso você tenha movido para dentro de backend/
    repo = require('./jobs.repository');
  } catch (e2) {
    // mantenha a primeira mensagem de erro (mais útil)
    throw e1;
  }
}

module.exports = repo;
