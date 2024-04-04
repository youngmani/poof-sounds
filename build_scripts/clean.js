'use strict';

const fs = require('fs/promises');

const { TARGET_DIR, LOG_LABELS } = require('./constants');
const { logger } = require('./utils');

const log = logger.child({ label: LOG_LABELS.CLEAN });

const clean = async () => {
  try {
    await fs.rm(TARGET_DIR, { recursive: true, force: true });
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
