const attempts = new Map();

function parseSequence(seq) {
  return seq ? seq.split(',').map((s) => parseInt(s, 10)) : [];
}

exports.run = (req, res) => {
  const { agendamentoId } = req.params;
  const key = agendamentoId;
  const sequence = parseSequence(req.query.failSequence);
  const count = attempts.get(key) || 0;
  if (count < sequence.length) {
    const status = sequence[count];
    attempts.set(key, count + 1);
    return res.status(status).json({ error: `Simulated ${status}` });
  }
  attempts.delete(key);
  res.json({ agendamentoId, run: true });
};

exports._reset = () => attempts.clear();
