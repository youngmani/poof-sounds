const fs = require('fs/promises');
const log = require('loglevel');
const semver = require('semver');

const buildZip = require('./javaBuild');
const convertToBedrock = require('./bedrockBuild');
const validate = require('./validate');

const { TARGET_DIR } = require('./constants');
const { all } = require('./utils');
const build = async version => {
  log.info('begin build');
  let tempDir;
  try {
    if (!semver.valid(version)) {
      throw Error('invalid version');
    }
    [tempDir] = await all([fs.mkdtemp('temp-'), fs.mkdir(TARGET_DIR, { recursive: true })]);
    await all([buildZip(tempDir, version), convertToBedrock(tempDir, version)]);
  } catch (error) {
    log.error(error);
    log.error('build failed');
    return 1;
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(error => {
        log.warn(error);
        log.warn(`failed to clean up temp dir ${tempDir}`);
      });
    }
  }
  log.info('end build');
  return 0;
};

const run = async () => {
  let version = semver.clean(process.env.npm_package_version);
  if (process.argv.includes('beta')) {
    version = semver.inc(version, 'prerelease');
  }
  log.setLevel(process.env.LOG_LEVEL ?? log.levels.INFO);
  process.exit((await validate()) || (await build(version)));
};

run();
