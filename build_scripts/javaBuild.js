'use strict';

const fs = require('fs/promises');
const Zip = require('adm-zip');
const semver = require('semver');

const { TARGET_DIR } = require('./constants');
const { all, getOverlayDirectories, logger, getSplashes } = require('./utils');

const log = logger.child({ prefix: 'java build' });

const buildZip = async (tempDir, version) => {
  const [mcmeta, overlayDirs, splashes] = await all([
    fs.readFile('pack.mcmeta', 'utf8'),
    getOverlayDirectories(),
    getSplashes(version),
    fs.mkdir(`${tempDir}/java`, { recursive: true }),
  ]);
  const newMcmeta = mcmeta.replace('{VERSION}', version);
  log.info(`set version to ${version}`);
  await all([
    fs.writeFile(`${tempDir}/java/pack.mcmeta`, newMcmeta),
    fs.writeFile(`${tempDir}/java/splashes.txt`, splashes),
  ]);

  const zip = new Zip();
  zip.addLocalFile(`${tempDir}/java/pack.mcmeta`);
  zip.addLocalFile('pack.png');
  const folderPromises = [zip.addLocalFolderPromise('assets', { zipPath: 'assets' })];
  overlayDirs.forEach(folder => {
    log.verbose(`adding overlay ${folder}`);
    folderPromises.push(zip.addLocalFolderPromise(`${folder}`, { zipPath: folder }));
  });
  await all(folderPromises);
  zip.addLocalFile(`${tempDir}/java/splashes.txt`, 'assets/minecraft/texts');
  const isPrerelease = !!semver.prerelease(version);
  const target = `${TARGET_DIR}/poof-sounds${isPrerelease ? '-beta' : ''}.zip`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote zip file to: ${target}`);
};

module.exports = buildZip;
