'use strict';

const fs = require('fs/promises');
const Zip = require('adm-zip');
const semver = require('semver');

const {
  BASE_PACK_DIR,
  MC_NAMESPACE,
  TARGET_DIR,
  LOG_LABELS,
} = require('./constants');
const { all, getOverlayDirectories, logger, getSplashes } = require('./utils');

const log = logger.child({ label: LOG_LABELS.JAVA_BUILD });

const buildZip = async version => {
  const [mcmeta, overlayDirs, splashes] = await all([
    fs.readFile('pack.mcmeta', 'utf8'),
    getOverlayDirectories(),
    getSplashes(version),
  ]);
  const newMcmeta = mcmeta.replace('{VERSION}', version);
  log.info(`set version to ${version}`);

  const zip = new Zip();
  zip.addFile('pack.mcmeta', Buffer.from(newMcmeta));
  zip.addLocalFile('pack.png');
  const folderPromises = [
    zip.addLocalFolderPromise(BASE_PACK_DIR, { zipPath: BASE_PACK_DIR }),
  ];
  overlayDirs.forEach(folder => {
    log.verbose(`adding overlay ${folder}`);
    folderPromises.push(
      zip.addLocalFolderPromise(`${folder}`, { zipPath: folder }),
    );
  });
  await all(folderPromises);
  zip.addFile(
    `${BASE_PACK_DIR}/${MC_NAMESPACE}/texts/splashes.txt`,
    Buffer.from(splashes),
  );
  const isPrerelease = !!semver.prerelease(version);
  const target = `${TARGET_DIR}/poof-sounds${isPrerelease ? '-beta' : ''}.zip`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote zip file to: ${target}`);
};

module.exports = buildZip;
