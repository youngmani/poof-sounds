const fs = require('fs/promises');
const ffprobe = require('ffprobe');
const ffprobePath = require('ffprobe-static').path;
const Zip = require('adm-zip');

const soundsMap = require('./soundsMap');

const BASE_MC_DIR = './assets/minecraft';
const TARGET_DIR = './build';

const verifySoundsExist = async () => {
  const soundsJson = await fs.readFile(`${BASE_MC_DIR}/sounds.json`);
  const sounds = JSON.parse(soundsJson);
  const filesToCheck = new Set();
  Object.values(sounds).forEach(sound => {
    sound.sounds.forEach(clip => {
      filesToCheck.add(clip.name);
    });
  });
  const promises = [...filesToCheck].map(file =>
    fs
      .access(`${BASE_MC_DIR}/sounds/${file}.ogg`)
      .then(() => {
        console.debug(`file exists: ${file}`);
      })
      .catch(() => {
        throw new Error(`sound does not exist: ${file}`);
      })
  );
  await Promise.all(promises);
};

const validateSoundFormat = async () => {
  const [monoFiles, stereoFiles] = await Promise.all([
    fs.readdir(`${BASE_MC_DIR}/sounds/custom/mono`),
    fs.readdir(`${BASE_MC_DIR}/sounds/custom/stereo`),
  ]);
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
        console.debug(`validated correct number of audio channels for: custom/${path}`);
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
  console.debug(`java build: set version to ${process.env.npm_package_version}`);

  const zip = new Zip();
  zip.addLocalFile(`${tempDir}/java/pack.mcmeta`);
  zip.addLocalFile('./pack.png');
  await zip.addLocalFolderPromise('./assets', { zipPath: 'assets' });
  await zip.writeZipPromise(`${TARGET_DIR}/poof-sounds.zip`, {
    overwrite: true,
  });
  console.debug(`java build: successfully wrote zip file to: ${TARGET_DIR}/poof-sounds.zip`);
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
      console.debug(`bedrock build: converting ${key} to ${newSoundName}`);
    } else {
      console.debug(`bedrock build: unmapped java sound ${key}`);
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
  console.debug(`bedrock build: using version ${version}`);

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
  console.debug(`bedrock build: successfully wrote mcpack file to: ${TARGET_DIR}/poof-sounds.mcpack`);
};

const validate = async () => {
  console.info('BEGIN VALIDATION');
  try {
    await Promise.all([verifySoundsExist(), validateSoundFormat()]);
  } catch (error) {
    console.error('error occurred during validation:', error.message);
    return 1;
  }
  console.info('END VALIDATION');
  return 0;
};

const build = async () => {
  console.info('BEGIN BUILD');
  try {
    const [tempDir] = await Promise.all([fs.mkdtemp('temp-'), fs.mkdir(TARGET_DIR, { recursive: true })]);
    await Promise.all([buildZip(tempDir), convertToBedrock(tempDir)]);
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('error occurred during build:', error.message);
    return 1;
  }
  console.info('END BUILD');
  return 0;
};

const run = async () => {
  process.exit((await validate()) || (await build()));
};

run();
