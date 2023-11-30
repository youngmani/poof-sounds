const fs = require('fs/promises');
const log = require('loglevel');
const semver = require('semver');

const buildZip = require('./javaBuild');
const convertToBedrock = require('./bedrockBuild');

const { TARGET_DIR } = require('./constants');
const build = async version => {
  log.info('begin build');
  try {
    if (!semver.valid(version)) {
      throw Error('invalid version');
    }
    const [tempDir] = await Promise.all([fs.mkdtemp('temp-'), fs.mkdir(TARGET_DIR, { recursive: true })]);
    await Promise.all([buildZip(tempDir, version), convertToBedrock(tempDir, version)]);
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    log.error('error occurred during build:', error.message ?? error);
    return 1;
  }
  log.info('end build');
  return 0;
};

const run = async () => {
  let version = semver.clean(process.env.npm_package_version);
  if (process.argv.includes('dev')) {
    log.setLevel(log.levels.DEBUG);
    version = semver.inc(version, 'prerelease');
  } else {
    log.setLevel(log.levels.INFO);
  }
  process.exit(await build(version));
};

run();
