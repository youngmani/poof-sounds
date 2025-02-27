import { readFile } from 'fs/promises';
import Zip from 'adm-zip';
import { prerelease } from 'semver';

import {
  BASE_PACK_DIR,
  MC_NAMESPACE,
  TARGET_DIR,
  LOG_LABELS,
} from './constants.js';
import { all, getOverlayDirectories, logger, getSplashes } from './utils.js';

const log = logger.child({ label: LOG_LABELS.JAVA_BUILD });

const buildZip = async version => {
  const [mcmeta, overlayDirs, splashes] = await all([
    readFile('pack.mcmeta', 'utf8'),
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
  const isPrerelease = !!prerelease(version);
  const target = `${TARGET_DIR}/poof-sounds${isPrerelease ? '-beta' : ''}.zip`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote zip file to: ${target}`);
};

export default buildZip;
