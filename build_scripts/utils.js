import { readdir, readFile } from 'fs/promises';
import { format, createLogger, transports } from 'winston';
import { major } from 'semver';

import { BASE_PACK_DIR, MC_NAMESPACE, LOG_LABELS } from './constants.js';

export const all = async promises => {
  const results = await Promise.allSettled(promises);
  return results.map(result => {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    return result.value;
  });
};

export const getOverlayDirectories = async () => {
  const files = await readdir('.');
  return files.filter(file => file.startsWith('overlay_'));
};

export const getSplashes = async version => {
  const splashes = await readFile(
    `${BASE_PACK_DIR}/${MC_NAMESPACE}/texts/splashes.txt`,
  );
  return (
    splashes.toString() +
    `\npoof sounds v${version}\npoof sounds version ${major(version)}!`
  );
};

const maxLabelLength = Object.values(LOG_LABELS).reduce(
  (max, label) => Math.max(max, label.length),
  0,
);

const uppercaseLevel = format(info => {
  info.level = info.level.toUpperCase();
  return info;
});

const addLabel = format(info => {
  if (info.label) {
    const formattedLabel = `[${info.label}]`.padEnd(maxLabelLength + 3);
    info.message = formattedLabel + info.message;
  }
  return info;
});

const logFormat = format.printf(info => {
  let log = `${info.level}: `;
  if (info.message) log += info.message;
  if (info.stack) log += `\n${info.stack}`;
  return log;
});

export const logger = createLogger({
  format: format.errors({ stack: true }),
  transports: [
    new transports.Console({
      level: process.env.LOG_LEVEL?.toLowerCase() ?? 'info',
      format: format.combine(
        uppercaseLevel(),
        addLabel(),
        format.cli(),
        logFormat,
      ),
    }),
  ],
});
