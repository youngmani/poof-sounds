import { readdir, readFile } from 'fs/promises';

import { major } from 'semver';
import { format, createLogger, transports, type Logform } from 'winston';

import { BASE_PACK_DIR, MC_NAMESPACE, LOG_LABELS } from './constants.ts';

export const all = async <T extends readonly unknown[]>(
  promises: T,
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> => {
  const results = await Promise.allSettled(promises);
  return results.map(result => {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    return result.value;
  }) as { -readonly [P in keyof T]: Awaited<T[P]> };
};

export const getOverlayDirectories = async (): Promise<string[]> => {
  const files = await readdir('.');
  return files.filter(file => file.startsWith('overlay_'));
};

export const getSplashes = async (version: string): Promise<string> => {
  const splashes = await readFile(
    `${BASE_PACK_DIR}/${MC_NAMESPACE}/texts/splashes.txt`,
  );
  return (
    splashes.toString() +
    `\npoof sounds v${version}\npoof sounds version ${major(version)}!`
  );
};

export const toJson = (str: unknown): string =>
  `${JSON.stringify(str, null, 2)}\n`;

const maxLabelLength = Object.values(LOG_LABELS).reduce(
  (max, label) => Math.max(max, label.length),
  0,
);

interface LogInfo_t extends Logform.TransformableInfo {
  message: string;
  label?: string;
  durationMs?: number;
  stack?: string;
}

const uppercaseLevel = format(info => {
  info.level = info.level.toUpperCase();
  return info;
});

const addLabel = format(info => {
  const logInfo = info as LogInfo_t;
  if (logInfo.durationMs != null) {
    logInfo.message = `[${logInfo.durationMs}ms] ${logInfo.message}`;
  }
  if (logInfo.label) {
    const formattedLabel = `[${logInfo.label}]`.padEnd(maxLabelLength + 3);
    logInfo.message = formattedLabel + logInfo.message;
  }
  return info;
});

const logFormat = format.printf(info => {
  const { level, message, stack } = info as LogInfo_t;
  let log = `${level}: `;
  if (message) log += message;
  if (stack) log += `\n${stack}`;
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
