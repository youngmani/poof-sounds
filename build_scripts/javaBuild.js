'use strict';

const fs = require('fs/promises');
const Zip = require('adm-zip');
const semver = require('semver');

const {
  BASE_PACK_DIR,
  CENSORED_DIR,
  MC_NAMESPACE,
  TARGET_DIR,
  LOG_LABELS,
} = require('./constants');
const { all, getOverlayDirectories, logger, getSplashes } = require('./utils');

const log = logger.child({ label: LOG_LABELS.JAVA_BUILD });

const buildZip = async version => {
  const [mcmeta, overlayDirs, splashes, censoredZip] = await all([
    fs.readFile('pack.mcmeta', 'utf8'),
    getOverlayDirectories(),
    getSplashes(version),
    buildCensoredZip(version),
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

  zip.addFile(`${CENSORED_DIR}.zip`, censoredZip);
  log.info('added censored.zip to pack');

  const isPrerelease = !!semver.prerelease(version);
  const target = `${TARGET_DIR}/poof-sounds${isPrerelease ? '-beta' : ''}.zip`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote zip file to: ${target}`);
};

const buildCensoredZip = async version => {
  const censoredZip = new Zip();
  const [censoredMcmeta] = await Promise.all([
    fs.readFile(`${CENSORED_DIR}/pack.mcmeta`, 'utf8'),
    censoredZip.addLocalFolderPromise(CENSORED_DIR),
  ]);
  const newCensoredMcmeta = censoredMcmeta.replace('{VERSION}', version);
  censoredZip.addFile('pack.mcmeta', Buffer.from(newCensoredMcmeta));
  return censoredZip.toBufferPromise();
};

module.exports = buildZip;
