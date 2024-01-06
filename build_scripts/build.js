'use strict';

const fs = require('fs/promises');
const semver = require('semver');

const buildZip = require('./javaBuild');
const convertToBedrock = require('./bedrockBuild');

const { TARGET_DIR } = require('./constants');
const { all, logger } = require('./utils');

const log = logger.child({ prefix: 'build' });

const build = async version => {
  log.info('begin build');
  try {
    if (!semver.valid(version)) {
      throw Error('invalid version');
    }
    await fs.mkdir(TARGET_DIR, { recursive: true });
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
  let version = semver.clean(process.env.npm_package_version);
  if (process.env.IS_RELEASE?.toLowerCase() !== 'true') {
    version = semver.inc(version, 'prerelease');
  }
  process.exit(await build(version));
};

run();
