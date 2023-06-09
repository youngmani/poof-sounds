const fs = require('fs/promises');
const ffprobe = require('ffprobe');
const ffprobePath = require('ffprobe-static').path;
const Zip = require('adm-zip');
const log = require('loglevel');

const soundsMap = require('./soundsMap');

const BASE_MC_DIR = './assets/minecraft';
const TARGET_DIR = './build';

const verifySoundsExist = async (monoFiles, stereoFiles) => {
  const allFiles = new Set([...monoFiles, ...stereoFiles]);
  const usedFiles = new Set();
  const soundsJson = await fs.readFile(`${BASE_MC_DIR}/sounds.json`);
  const sounds = JSON.parse(soundsJson);
  Object.values(sounds).forEach(sound => {
    sound.sounds.forEach(({ name }) => {
      const [folder, channels, soundName] = name.split('/');
      const fileName = `${soundName}.ogg`;
      if (usedFiles.has(fileName)) {
        return;
      }
      if (
        folder === 'custom' &&
        ((channels === 'mono' && monoFiles.includes(fileName)) ||
          (channels === 'stereo' && stereoFiles.includes(fileName)))
      ) {
        usedFiles.add(fileName);
        log.debug(`file exists: ${name}`);
      } else {
        throw new Error(`sound does not exist: ${name}`);
      }
    });
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
    ffprobe(`${BASE_MC_DIR}/sounds/custom/${path}`, {
      path: ffprobePath,
    }).then(info => {
      if (info.streams.length === 1 && info.streams[0].channels === channels) {
        log.debug(`validated correct number of audio channels for: custom/${path}`);
      } else {
        throw new Error(`incorrect number of audio channels for: custom/${path}`);
      }
    })
  );
  await Promise.all(promises);
};

const buildZip = async tempDir => {
  let [mcmeta] = await Promise.all([
    fs.readFile('./pack.mcmeta', 'utf8'),
    fs.mkdir(`${tempDir}/java`, { recursive: true }),
  ]);
  mcmeta = mcmeta.replace('{VERSION}', process.env.npm_package_version);
  await fs.writeFile(`${tempDir}/java/pack.mcmeta`, mcmeta);
  log.info(`java build: set version to ${process.env.npm_package_version}`);

  const zip = new Zip();
  zip.addLocalFile(`${tempDir}/java/pack.mcmeta`);
  zip.addLocalFile('./pack.png');
  await zip.addLocalFolderPromise('./assets', { zipPath: 'assets' });
  await zip.writeZipPromise(`${TARGET_DIR}/poof-sounds.zip`, {
    overwrite: true,
  });
  log.info(`java build: successfully wrote zip file to: ${TARGET_DIR}/poof-sounds.zip`);
};

const convertToBedrock = async tempDir => {
  const [soundsJson, splashesTxt] = await Promise.all([
    fs.readFile(`${BASE_MC_DIR}/sounds.json`),
    fs.readFile(`${BASE_MC_DIR}/texts/splashes.txt`),
    fs.cp(`${BASE_MC_DIR}/sounds/`, `${tempDir}/bedrock/sounds/`, { recursive: true }),
  ]);

  const promises = [
    fs.copyFile('./pack.png', `${tempDir}/bedrock/pack_icon.png`),
    fs.cp(`${BASE_MC_DIR}/textures/`, `${tempDir}/bedrock/textures/`, { recursive: true }),
    fs.cp(`bedrock/`, `${tempDir}/bedrock/`, { recursive: true }),
  ];

  const javaSounds = JSON.parse(soundsJson);
  const javaSoundKeys = Object.keys(javaSounds);
  javaSoundKeys.forEach(key => {
    if (soundsMap[key]) {
      const sound = javaSounds[key];
      delete javaSounds[key];

      const { name: newSoundName, pitchAdjust } = soundsMap[key];
      sound.sounds = sound.sounds.map(s => {
        s.name = `sounds/${s.name}`;
        if (pitchAdjust) {
          s.pitch ??= 1;
          s.pitch *= pitchAdjust;
        }
        return s;
      });
      delete sound.replace;

      javaSounds[newSoundName] = sound;
      log.debug(`bedrock build: converting ${key} to ${newSoundName}`);
    } else {
      log.info(`bedrock build: unmapped java sound ${key}`);
      delete javaSounds[key];
    }
  });
  const bedrockSounds = {
    format_version: '1.14.0',
    sound_definitions: javaSounds,
  };
  promises.push(
    fs.writeFile(`${tempDir}/bedrock/sounds/sound_definitions.json`, JSON.stringify(bedrockSounds, null, 2))
  );

  const splashes = splashesTxt
    .toString()
    .split('\n')
    .map(text => text.trim());
  const bedrockSplashes = { splashes };
  promises.push(fs.writeFile(`${tempDir}/bedrock/splashes.json`, JSON.stringify(bedrockSplashes, null, 2)));

  const version = process.env.npm_package_version.split('.').map(n => parseInt(n.split('-')[0]));
  log.info(`bedrock build: using version ${version}`);

  const manifest = {
    format_version: 2,
    header: {
      name: 'poof-sounds',
      description: `Poofesure Minecraft Sounds\nv${process.env.npm_package_version} by youngmani`,
      uuid: '6c107856-6a56-460a-a5f9-59aee383c1b8',
      version,
      min_engine_version: [1, 14, 0],
    },
    modules: [
      {
        type: 'resources',
        uuid: '0d68d1b5-b211-4c59-952d-eb6e8129983b',
        version,
      },
    ],
  };

  promises.push(fs.writeFile(`${tempDir}/bedrock/manifest.json`, JSON.stringify(manifest, null, 2)));

  await Promise.all(promises);

  const zip = new Zip();
  await zip.addLocalFolderPromise(`${tempDir}/bedrock`);
  await zip.writeZipPromise(`${TARGET_DIR}/poof-sounds-bedrock.mcpack`, {
    overwrite: true,
  });
  log.info(`bedrock build: successfully wrote mcpack file to: ${TARGET_DIR}/poof-sounds.mcpack`);
};

const validate = async () => {
  log.info('begin validation');
  try {
    const [monoFiles, stereoFiles] = await Promise.all([
      fs.readdir(`${BASE_MC_DIR}/sounds/custom/mono`),
      fs.readdir(`${BASE_MC_DIR}/sounds/custom/stereo`),
    ]);
    await Promise.all([verifySoundsExist(monoFiles, stereoFiles), validateSoundFormat(monoFiles, stereoFiles)]);
  } catch (error) {
    log.error('error occurred during validation:', error.message);
    return 1;
  }
  log.info('end validation');
  return 0;
};

const build = async () => {
  log.info('begin build');
  try {
    const [tempDir] = await Promise.all([fs.mkdtemp('temp-'), fs.mkdir(TARGET_DIR, { recursive: true })]);
    await Promise.all([buildZip(tempDir), convertToBedrock(tempDir)]);
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    log.error('error occurred during build:', error.message);
    return 1;
  }
  log.info('end build');
  return 0;
};

const run = async () => {
  if (process.argv.includes('debug')) {
    log.setLevel(log.levels.DEBUG);
  } else {
    log.setLevel(log.levels.INFO);
  }
  process.exit((await validate()) || (await build()));
};

run();
