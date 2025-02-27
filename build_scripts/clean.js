import { rm } from 'fs/promises';

import { TARGET_DIR, LOG_LABELS } from './constants.js';
import { logger } from './utils.js';

const log = logger.child({ label: LOG_LABELS.CLEAN });

const clean = async () => {
  try {
    await rm(TARGET_DIR, { recursive: true, force: true });
    log.info(`removed ${TARGET_DIR}`);
  } catch (error) {
    log.error(error);
    log.error('clean failed');
    return 1;
  }
  return 0;
};

const run = async () => {
  process.exit(await clean());
};

run();
