import { readFile } from 'fs/promises';
import Zip from 'adm-zip';
import { prerelease } from 'semver';

import {
  BASE_PACK_DIR,
  MC_NAMESPACE,
  TARGET_DIR,
  LOG_LABELS,
} from './constants.ts';
import {
  all,
  getOverlayDirectories,
  logger,
  getSplashes,
  toJson,
} from './utils.ts';
import type { PackFormat_t, PackMcmeta_t } from './types.ts';

const log = logger.child({ label: LOG_LABELS.JAVA_BUILD });

const buildZip = async (version: string): Promise<void> => {
  const [mcmetaJson, overlayDirs, splashes] = await all([
    readFile('pack.mcmeta', 'utf8'),
    getOverlayDirectories(),
    getSplashes(version),
  ]);
  const mcmeta = generateMcmeta(mcmetaJson, version);

  const zip = new Zip();
  zip.addFile('pack.mcmeta', Buffer.from(toJson(mcmeta)));
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

const generateMcmeta = (mcmetaJson: string, version: string) => {
  const mcmeta = JSON.parse(mcmetaJson) as PackMcmeta_t;
  mcmeta.pack.description = mcmeta.pack.description.replace(
    '{VERSION}',
    version,
  );
  log.info(`set version to ${version}`);

  // old pack format compatibility
  const { min_format: minFormat, max_format: maxFormat } = mcmeta.pack;
  const minFormatMajor = major(minFormat);

  if (minFormatMajor >= 65) {
    // compatibility not needed
    return mcmeta;
  }

  mcmeta.pack.pack_format = minFormatMajor;
  mcmeta.pack.supported_formats = [minFormatMajor, major(maxFormat)];

  for (const overlay of mcmeta.overlays?.entries ?? []) {
    overlay.formats = [major(overlay.min_format), major(overlay.max_format)];
  }

  return mcmeta;
};

const major = (version: PackFormat_t | undefined) => {
  if (!version) throw Error('pack format version missing');
  return typeof version === 'number' ? version : version[0];
};

export default buildZip;
