const fs = require('fs/promises');
const Zip = require('adm-zip');
const semver = require('semver');
const Jimp = require('jimp');

const soundsMap = require('./soundsMap');
const { BASE_PACK_DIR, MC_NAMESPACE, POOF_NAMESPACE, TARGET_DIR } = require('./constants');
const { all, logger } = require('./utils');

const PAINTING_SIZE = 128;

const log = logger.child({ prefix: 'bedrock build' });

const convertToBedrock = async (tempDir, version) => {
  const [soundsJson, splashesTxt, kz] = await all([
    fs.readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/sounds.json`),
    fs.readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/texts/splashes.txt`),
    generateKz(),
    fs.cp(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/`, `${tempDir}/bedrock/sounds/${POOF_NAMESPACE}`, {
      recursive: true,
    }),
  ]);

  const promises = [
    fs.copyFile('pack.png', `${tempDir}/bedrock/pack_icon.png`),
    fs.cp(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/entity`, `${tempDir}/bedrock/textures/entity`, {
      recursive: true,
    }),
    fs.cp(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/gui/title/background`, `${tempDir}/bedrock/textures/ui`, {
      recursive: true,
    }),
    fs.cp(`bedrock/`, `${tempDir}/bedrock/`, { recursive: true }),
    kz.writeAsync(`${tempDir}/bedrock/textures/painting/kz.png`),
  ];

  const javaSounds = JSON.parse(soundsJson);
  const javaSoundKeys = Object.keys(javaSounds);
  javaSoundKeys.forEach(key => {
    if (soundsMap[key]) {
      const sound = javaSounds[key];
      delete javaSounds[key];

      const { additionalNames = [], name, pitchAdjust, poofName } = soundsMap[key];
      const newSoundName = poofName ?? name;
      if (newSoundName) {
        sound.sounds = sound.sounds.map(s => {
          s.name = `sounds/${s.name.replace(':', '/')}`;
          if (pitchAdjust) {
            s.pitch ??= 1;
            s.pitch *= pitchAdjust;
          }
          return s;
        });
        delete sound.replace;

        [newSoundName, ...additionalNames].forEach(name => {
          javaSounds[name] = sound;
          log.debug(`converting ${key} to ${name}`);
        });
      } else {
        log.verbose(`skipping java sound ${key}`);
      }
    } else {
      log.warn(`unmapped java sound ${key}`);
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

  const isBeta = !!semver.prerelease(version);
  const versionArr = [
    semver.major(version),
    semver.minor(version),
    isBeta
      ? 1000 * semver.patch(version) + (semver.prerelease(version).find(i => typeof i === 'number') ?? 0)
      : semver.patch(version),
  ];
  log.info(`using version ${versionArr}, beta=${isBeta}`);

  const manifest = {
    format_version: 2,
    header: {
      name: `poof-sounds${isBeta ? '-beta' : ''}`,
      description: `Poofesure Minecraft Sounds\nv${version} by youngmani`,
      uuid: isBeta ? '9afbe638-2cd4-44c4-8d8c-f40ebbe1cf88' : '6c107856-6a56-460a-a5f9-59aee383c1b8',
      version: versionArr,
      min_engine_version: [1, 14, 0],
    },
    modules: [
      {
        type: 'resources',
        uuid: isBeta ? '5c0c66e8-d410-4f5d-ad00-5d14f9949655' : '0d68d1b5-b211-4c59-952d-eb6e8129983b',
        version: versionArr,
      },
    ],
    metadata: {
      authors: ['youngmani'],
      license: 'CC0',
      url: 'https://youngmani.github.io/poof-sounds/',
    },
  };

  promises.push(fs.writeFile(`${tempDir}/bedrock/manifest.json`, JSON.stringify(manifest, null, 2)));

  await all(promises);

  const zip = new Zip();
  await zip.addLocalFolderPromise(`${tempDir}/bedrock`);
  const target = `${TARGET_DIR}/poof-sounds-bedrock${isBeta ? '-beta' : ''}.mcpack`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote mcpack file to: ${target}`);
};

const generateKz = async () => {
  const kz = await Jimp.read('build_scripts/resources/kz_template.png');
  const scale = PAINTING_SIZE / 16;
  if (scale !== 1) kz.scale(scale, Jimp.RESIZE_NEAREST_NEIGHBOR);
  const promises = [
    { name: 'kebab', x: 0, y: 0, h: 1, w: 1 },
    { name: 'aztec', x: 1, y: 0, h: 1, w: 1 },
    { name: 'alban', x: 2, y: 0, h: 1, w: 1 },
    { name: 'aztec2', x: 3, y: 0, h: 1, w: 1 },
    { name: 'bomb', x: 4, y: 0, h: 1, w: 1 },
    { name: 'plant', x: 5, y: 0, h: 1, w: 1 },
    { name: 'wasteland', x: 6, y: 0, h: 1, w: 1 },
    { name: 'pool', x: 0, y: 2, h: 1, w: 2 },
    { name: 'courbet', x: 2, y: 2, h: 1, w: 2 },
    { name: 'sea', x: 4, y: 2, h: 1, w: 2 },
    { name: 'sunset', x: 6, y: 2, h: 1, w: 2 },
    { name: 'creebet', x: 8, y: 2, h: 1, w: 2 },
    { name: 'wanderer', x: 0, y: 4, h: 2, w: 1 },
    { name: 'graham', x: 1, y: 4, h: 2, w: 1 },
    { name: 'fighters', x: 0, y: 6, h: 2, w: 4 },
    { name: 'match', x: 0, y: 8, h: 2, w: 2 },
    { name: 'bust', x: 2, y: 8, h: 2, w: 2 },
    { name: 'stage', x: 4, y: 8, h: 2, w: 2 },
    { name: 'void', x: 6, y: 8, h: 2, w: 2 },
    { name: 'skull_and_roses', x: 8, y: 8, h: 2, w: 2 },
    { name: 'wither', x: 10, y: 8, h: 2, w: 2 },
    { name: 'pointer', x: 0, y: 12, h: 4, w: 4 },
    { name: 'pigscene', x: 4, y: 12, h: 4, w: 4 },
    { name: 'burning_skull', x: 8, y: 12, h: 4, w: 4 },
    { name: 'skeleton', x: 12, y: 4, h: 3, w: 4 },
    { name: 'donkey_kong', x: 12, y: 7, h: 3, w: 4 },
  ].map(painting => addPainting(kz, painting));
  await all(promises);
  log.debug(`generated kz.png`);
  return kz;
};

const addPainting = async (kz, { name, x, y, h, w }) => {
  const image = await Jimp.read(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/painting/${name}.png`);
  const scale = (h * PAINTING_SIZE) / image.getHeight();
  if (scale !== 1) image.scale(scale, Jimp.RESIZE_NEAREST_NEIGHBOR);
  if (w * PAINTING_SIZE !== image.getWidth()) throw new Error(`invalid painting dimensions for ${name}`);
  await kz.blit(image, x * PAINTING_SIZE, y * PAINTING_SIZE);
  log.debug(`added ${name} to kz`);
};

module.exports = convertToBedrock;
