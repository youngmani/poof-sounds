const fs = require('fs/promises');
const ffprobe = require('ffprobe');
const ffprobePath = require('ffprobe-static').path;
const log = require('loglevel');

const { BASE_PACK_DIR, MC_NAMESPACE, POOF_NAMESPACE } = require('./constants');

const verifySoundsExist = async (monoFiles, stereoFiles) => {
  const allFiles = new Set([...monoFiles, ...stereoFiles]);
  const usedFiles = new Set();
  const soundsJson = await fs.readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/sounds.json`);
  const sounds = JSON.parse(soundsJson);
  Object.entries(sounds).forEach(([key, sound]) => {
    sound.sounds.forEach(({ name }) => {
      const [namespace, path] = name.split(':');
      const [folder, soundName] = path?.split('/') ?? [];
      const fileName = `${soundName}.ogg`;
      if (usedFiles.has(fileName)) {
        return;
      }
      if (
        namespace === POOF_NAMESPACE &&
        ((folder === 'mono' && monoFiles.includes(fileName)) || (folder === 'stereo' && stereoFiles.includes(fileName)))
      ) {
        usedFiles.add(fileName);
        log.debug(`file exists: ${path}`);
      } else {
        throw new Error(`sound does not exist: ${path}`);
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
    files.push({ path: `mono/${fileName}`, channels: 1 });
  });
  stereoFiles.forEach(fileName => {
    files.push({ path: `stereo/${fileName}`, channels: 2 });
  });
  const promises = files.map(({ path, channels }) =>
    ffprobe(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/${path}`, {
      path: ffprobePath,
    }).then(info => {
      if (info.streams.length === 1 && info.streams[0].channels === channels) {
        log.debug(`correct number of audio channels for: ${path}`);
      } else {
        throw new Error(`incorrect number of audio channels for: ${path}`);
      }
    })
  );
  await Promise.all(promises);
};

const validate = async () => {
  log.info('begin validation');
  try {
    const [monoFiles, stereoFiles] = await Promise.all([
      fs.readdir(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/mono`),
      fs.readdir(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/stereo`),
    ]);
    await Promise.all([verifySoundsExist(monoFiles, stereoFiles), validateSoundFormat(monoFiles, stereoFiles)]);
  } catch (error) {
    log.error('error occurred during validation:', error.message);
    return 1;
  }
  log.info('end validation');
  return 0;
};

const run = async () => {
  if (process.argv.includes('dev')) {
    log.setLevel(log.levels.DEBUG);
  } else {
    log.setLevel(log.levels.INFO);
  }
  process.exit(await validate());
};

run();
