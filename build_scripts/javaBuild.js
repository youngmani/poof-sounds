const fs = require('fs/promises');
const Zip = require('adm-zip');
const log = require('loglevel');
const semver = require('semver');

const { TARGET_DIR } = require('./constants');
const { getOverlayDirectories } = require('./utils');

const buildZip = async (tempDir, version) => {
  const [mcmeta, overlayDirs] = await Promise.all([
    fs.readFile('./pack.mcmeta', 'utf8'),
    getOverlayDirectories(),
    fs.mkdir(`${tempDir}/java`, { recursive: true }),
  ]);
  const newMcmeta = mcmeta.replace('{VERSION}', version);
  await fs.writeFile(`${tempDir}/java/pack.mcmeta`, newMcmeta);
  log.info(`java build: set version to ${version}`);

  const zip = new Zip();
  zip.addLocalFile(`${tempDir}/java/pack.mcmeta`);
  zip.addLocalFile('./pack.png');
  const folderPromises = [zip.addLocalFolderPromise('./assets', { zipPath: 'assets' })];
  overlayDirs.forEach(folder => {
    log.debug(`java build: adding overlay ${folder}`);
    folderPromises.push(zip.addLocalFolderPromise(`./${folder}`, { zipPath: folder }));
  });
  await Promise.all(folderPromises);
  const isPrerelease = !!semver.prerelease(version);
  const target = `${TARGET_DIR}/poof-sounds${isPrerelease ? '-beta' : ''}.zip`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`java build: successfully wrote zip file to: ${target}`);
};

module.exports = buildZip;
