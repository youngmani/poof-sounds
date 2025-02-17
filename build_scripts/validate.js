'use strict';

const fs = require('fs/promises');
const ffprobe = require('ffprobe');
const ffprobePath = require('ffprobe-static').path;

const {
  BASE_PACK_DIR,
  MC_NAMESPACE,
  POOF_NAMESPACE,
  LOG_LABELS,
} = require('./constants');
const { getOverlayDirectories, all, logger } = require('./utils');

const MONO_DIR = 'mono';
const STEREO_DIR = 'stereo';
const SOUNDS_DIR_PATH = `${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds`;

const log = logger.child({ label: LOG_LABELS.VALIDATE });

class ValidationError extends Error {
  constructor(...args) {
    super(...args);
    this.stack = null;
  }
}

const verifySoundsExist = async (monoFiles, stereoFiles) => {
  const allFiles = new Set([...monoFiles, ...stereoFiles]);
  const usedFiles = new Set();
  const soundsJson = await fs.readFile(
    `${BASE_PACK_DIR}/${MC_NAMESPACE}/sounds.json`,
  );
  const sounds = JSON.parse(soundsJson);
  Object.entries(sounds).forEach(([key, sound]) => {
    sound.sounds
      .map(s => (typeof s === 'string' ? { name: s } : s))
      .forEach(({ name }) => {
        const [namespace, path] = name.split(':');
        const [folder, soundName] = path?.split('/') ?? [];
        const fileName = `${soundName}.ogg`;
        if (usedFiles.has(fileName)) {
          return;
        }
        if (
          namespace === POOF_NAMESPACE &&
          ((folder === MONO_DIR && monoFiles.includes(fileName)) ||
            (folder === STEREO_DIR && stereoFiles.includes(fileName)))
        ) {
          usedFiles.add(fileName);
          log.silly(`file exists: ${path}`);
        } else {
          throw new ValidationError(`sound does not exist: ${path}`);
        }
      });
    if (!sound.replace) {
      log.warn(`replace not set on sound for ${key}`);
    }
  });
  allFiles.forEach(file => {
    if (!usedFiles.delete(file)) {
      log.warn(`unused file found: ${file}`);
    }
  });
};

const validateSoundFormat = async (monoFiles, stereoFiles) => {
  const files = [];
  monoFiles.forEach(fileName => {
    files.push({ path: `${MONO_DIR}/${fileName}`, channels: 1 });
  });
  stereoFiles.forEach(fileName => {
    files.push({ path: `${STEREO_DIR}/${fileName}`, channels: 2 });
  });
  const promises = files.map(({ path, channels }) =>
    ffprobe(`${SOUNDS_DIR_PATH}/${path}`, { path: ffprobePath }).then(info => {
      if (info.streams.length === 1 && info.streams[0].channels === channels) {
        log.silly(`correct number of audio channels for: ${path}`);
      } else {
        throw new ValidationError(
          `incorrect number of audio channels for: ${path}`,
        );
      }
    }),
  );
  await all(promises);
};

const validateOverlaysExist = async () => {
  const [mcmeta, overlayDirs] = await all([
    fs.readFile('pack.mcmeta', 'utf8'),
    getOverlayDirectories(),
  ]);
  const usedDirs = new Set();
  const mcmetaJson = JSON.parse(mcmeta);
  mcmetaJson.overlays?.entries?.forEach(({ directory }) => {
    if (!/^[a-z0-9_-]+$/.test(directory)) {
      throw new ValidationError(`overlay has invalid directory: ${directory}`);
    }
    if (overlayDirs.includes(directory)) {
      if (usedDirs.has(directory)) {
        log.warn(`duplicate overlay: ${directory}`);
      } else {
        log.silly(`overlay exists: ${directory}`);
      }
      usedDirs.add(directory);
    } else {
      throw new ValidationError(`overlay does not exist: ${directory}`);
    }
  });
  overlayDirs.forEach(dir => {
    if (!usedDirs.delete(dir)) {
      log.warn(`unused overlay found: ${dir}`);
    }
  });
};

const validate = async () => {
  log.info('begin validation');
  try {
    const [monoFiles, stereoFiles] = await all([
      fs.readdir(`${SOUNDS_DIR_PATH}/${MONO_DIR}`),
      fs.readdir(`${SOUNDS_DIR_PATH}/${STEREO_DIR}`),
    ]);
    await all([
      verifySoundsExist(monoFiles, stereoFiles),
      validateSoundFormat(monoFiles, stereoFiles),
      validateOverlaysExist(),
    ]);
  } catch (error) {
    log.error(error);
    log.error('validation failed');
    return 1;
  }
  log.info('end validation');
  return 0;
};

const run = async () => {
  process.exit(await validate());
};

run();
