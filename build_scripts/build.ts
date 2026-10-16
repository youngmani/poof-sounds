import { mkdir } from 'fs/promises';

import { valid, clean, inc } from 'semver';

import convertToBedrock from './bedrockBuild.ts';
import { TARGET_DIR, LOG_LABELS } from './constants.ts';
import buildZip from './javaBuild.ts';
import { all, logger } from './utils.ts';

const log = logger.child({ label: LOG_LABELS.BUILD });

const build = async (version: string | null) => {
  log.info('begin build');
  try {
    if (!version || !valid(version)) {
      throw Error('invalid version');
    }
    await mkdir(TARGET_DIR, { recursive: true });
    await all([buildZip(version), convertToBedrock(version)]);
  } catch (error) {
    log.error(error);
    log.error('build failed');
    return 1;
  }
  log.info('end build');
  return 0;
};

const run = async () => {
  let version = clean(process.env.npm_package_version ?? '');
  if (version && process.env.IS_RELEASE?.toLowerCase() !== 'true') {
    version = inc(version, 'prerelease');
  }
  process.exit(await build(version));
};

await run();
