const fs = require('fs/promises');
const winston = require('winston');

const all = async promises => {
  const results = await Promise.allSettled(promises);
  return results.map(result => {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    return result.value;
  });
};

const getOverlayDirectories = async () => {
  const files = await fs.readdir('.');
  return files.filter(file => file.startsWith('overlay_'));
};

const logFormat = winston.format.printf(info => {
  let log = `${info.level}: `;
  if (info.prefix) log += `${info.prefix}: `;
  if (info.message) log += info.message;
  if (info.stack) log += `\n${info.stack}`;
  return log;
});

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.errors({ stack: true })),
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(
        winston.format(info => {
          info.level = info.level.toUpperCase();
          return info;
        })(),
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
});

module.exports = {
  all,
  getOverlayDirectories,
  logger,
};
