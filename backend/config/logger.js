const path = require('path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { trace_id: null },
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: path.join(__dirname, '../../logs'),
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '14d'
    })
  ]
});

module.exports = logger;
