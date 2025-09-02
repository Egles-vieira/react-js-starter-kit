const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  const traceId = uuidv4();
  req.trace_id = traceId;
  res.setHeader('X-Trace-Id', traceId);
  next();
};
