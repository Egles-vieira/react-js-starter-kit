require('dotenv').config();
const { enqueue } = require('../jobs.service');
const { FETCH_EXTERNO_PULL } = require('../jobs/definitions');

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    const [key, value] = arg.split('=');
    args[key.replace(/^--/, '')] = value || true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const { inicio, fim, cursor } = args;

(async () => {
  try {
    const payload = { historico: true };
    if (inicio) payload.inicio = inicio;
    if (fim) payload.fim = fim;
    if (cursor) payload.cursor = cursor;

    await enqueue(FETCH_EXTERNO_PULL, payload);
    console.log('Enfileirado FETCH_EXTERNO_PULL para histórico', payload);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao enfileirar FETCH_EXTERNO_PULL', err);
    process.exit(1);
  }
})();
