'use strict';

const fs = require('fs/promises');
const Zip = require('adm-zip');
const semver = require('semver');
const Jimp = require('jimp');

const SOUNDS_MAP = require('./resources/soundsMap');
const KZ_PAINTINGS = require('./resources/kzPaintings');
const { BASE_PACK_DIR, CENSORED_DIR, MC_NAMESPACE, POOF_NAMESPACE, TARGET_DIR, LOG_LABELS } = require('./constants');
const { all, logger, getSplashes } = require('./utils');

const NORMAL_SUBPACK = 'normal';
const PAINTING_SIZE = 128;
const PAINTINGS_PATH = 'textures/painting';

const log = logger.child({ label: LOG_LABELS.BEDROCK_BUILD });

const convertToBedrock = async version => {
  const zip = new Zip();

  const [soundsJson, splashesTxt, kz, nonKzPaintings] = await all([
    fs.readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/sounds.json`),
    getSplashes(version),
    generateKz(),
    getNonKzPaintings(),
    zip.addLocalFolderPromise('bedrock'),
  ]);

  zip.addLocalFile('pack.png', '', 'pack_icon.png');
  zip.addFile(`subpacks/${NORMAL_SUBPACK}/`, null);
  nonKzPaintings.forEach(name => {
    log.debug(`adding non-kz painting ${name}`);
    zip.addLocalFile(getPaintingPath(name), PAINTINGS_PATH);
  });

  const [kzPng] = await Promise.all([
    kz.getBufferAsync(Jimp.MIME_PNG),
    zip.addLocalFolderPromise(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/`, { zipPath: `sounds/${POOF_NAMESPACE}` }),
    zip.addLocalFolderPromise(`${CENSORED_DIR}/${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/`, {
      zipPath: `subpacks/${CENSORED_DIR}/sounds/${POOF_NAMESPACE}`,
    }),
    zip.addLocalFolderPromise(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/entity`, { zipPath: 'textures/entity' }),
    zip.addLocalFolderPromise(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/gui/title/background`, {
      zipPath: 'textures/ui',
    }),
  ]);

  zip.addFile(`${PAINTINGS_PATH}/kz.png`, kzPng);

  const bedrockSounds = generateSoundDefinitions(soundsJson);
  zip.addFile('sounds/sound_definitions.json', Buffer.from(toJson(bedrockSounds)));

  const bedrockSplashes = generateSplashes(splashesTxt);
  zip.addFile('splashes.json', Buffer.from(toJson(bedrockSplashes)));

  const isBeta = !!semver.prerelease(version);
  const manifest = generateManifest(version, isBeta);
  zip.addFile('manifest.json', Buffer.from(toJson(manifest)));

  const target = `${TARGET_DIR}/poof-sounds-bedrock${isBeta ? '-beta' : ''}.mcpack`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote mcpack file to: ${target}`);
};

const generateKz = async () => {
  const kz = await Jimp.read('build_scripts/resources/kz_template.png');
  const scale = PAINTING_SIZE / 16;
  if (scale !== 1) kz.scale(scale, Jimp.RESIZE_NEAREST_NEIGHBOR);
  const promises = KZ_PAINTINGS.map(painting => addPainting(kz, painting));
  await all(promises);
  log.debug('generated kz.png');
  return kz;
};

const addPainting = async (kz, { name, x, y, h, w }) => {
  const image = await Jimp.read(getPaintingPath(name));
  const scale = (h * PAINTING_SIZE) / image.getHeight();
  if (scale !== 1) image.scale(scale, Jimp.RESIZE_NEAREST_NEIGHBOR);
  if (w * PAINTING_SIZE !== image.getWidth()) throw new Error(`invalid painting dimensions for ${name}`);
  await kz.blit(image, x * PAINTING_SIZE, y * PAINTING_SIZE);
  log.silly(`added ${name} to kz`);
};

const getNonKzPaintings = async () => {
  const kzPaintingNames = KZ_PAINTINGS.map(painting => painting.name);
  const files = await fs.readdir(`${BASE_PACK_DIR}/${MC_NAMESPACE}/${PAINTINGS_PATH}/`);
  return files.map(file => file.split('.')[0]).filter(name => !kzPaintingNames.includes(name));
};

const generateSoundDefinitions = soundsJson => {
  const javaSounds = JSON.parse(soundsJson);
  const definitions = {};
  Object.keys(javaSounds).forEach(key => {
    if (!SOUNDS_MAP[key]) {
      log.warn(`unmapped java sound ${key}`);
      return;
    }
    const soundMappings = SOUNDS_MAP[key] instanceof Array ? SOUNDS_MAP[key] : [SOUNDS_MAP[key]];
    if (!soundMappings.length) {
      log.verbose(`skipping java sound ${key}`);
      return;
    }
    soundMappings.forEach(({ adjustments = {}, name, propOverrides = {} }) => {
      if (definitions[name]) {
        log.warn(`${name} already mapped`);
        return;
      }
      const sound = { ...javaSounds[key], ...propOverrides };
      delete sound.replace;
      delete sound.subtitle;
      sound.sounds = adjustSounds(sound.sounds, adjustments);
      definitions[name] = sound;
      log.debug(`converting ${key} to ${name}`);
    });
  });
  return {
    format_version: '1.14.0',
    sound_definitions: definitions,
  };
};

const adjustSounds = (sounds = [], adjustments = {}) =>
  JSON.parse(JSON.stringify(sounds)).map(s => {
    if (typeof s === 'string') {
      s = { name: s };
    }
    s.name = `sounds/${s.name.replace(':', '/')}`;
    Object.entries(adjustments).forEach(([key, value]) => {
      s[key] ??= 1;
      s[key] *= value;
    });
    if (Object.keys(s).length === 1 && s.name) {
      s = s.name;
    }
    return s;
  });

const generateSplashes = splashesTxt => {
  const splashes = splashesTxt
    .split('\n')
    .map(text => text.trim())
    .filter(text => text);
  splashes.push('poof sounds on bedrock!');
  return { splashes };
};

const generateManifest = (version, isBeta) => {
  const versionArr = [
    semver.major(version),
    semver.minor(version),
    isBeta
      ? 1000 * semver.patch(version) + (semver.prerelease(version).find(i => typeof i === 'number') ?? 0)
      : semver.patch(version),
  ];
  log.info(`using version ${versionArr}, beta=${isBeta}`);

  return {
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
    subpacks: [
      {
        folder_name: CENSORED_DIR,
        name: 'Censored',
        memory_tier: 0,
      },
      {
        folder_name: NORMAL_SUBPACK,
        name: 'Normal',
        memory_tier: 0,
      },
    ],
    settings: [
      {
        type: 'label',
        text: "Move slider to 'Censored' to reduce profanity",
      },
    ],
  };
};

const toJson = str => `${JSON.stringify(str, null, 2)}\n`;

const getPaintingPath = name => `${BASE_PACK_DIR}/${MC_NAMESPACE}/${PAINTINGS_PATH}/${name}.png`;

module.exports = convertToBedrock;
