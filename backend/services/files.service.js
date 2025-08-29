const { generateIdempotencyKey } = require('../utils/crypto');
const filesRepository = require('../repositories/files.repository');

async function saveProcessedFile(buffer, meta = null) {
  const idempotencyKey = generateIdempotencyKey(buffer);

  const existing = await filesRepository.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    return { status: 'duplicado', idempotency_key: idempotencyKey };
  }

  try {
    await filesRepository.insertProcessedFile(idempotencyKey, 'ok', meta);
    return { status: 'ok', idempotency_key: idempotencyKey };
  } catch (error) {
    try {
      await filesRepository.insertProcessedFile(idempotencyKey, 'falha', meta);
    } catch (_) {
      // ignore insert failure in error path
    }
    throw error;
  }
}

module.exports = {
  saveProcessedFile,
};
