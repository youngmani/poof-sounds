import { readFile, readdir } from 'fs/promises';
import Zip from 'adm-zip';
import { prerelease, major, minor, patch } from 'semver';
import { Jimp, JimpMime, ResizeStrategy } from 'jimp';

import KZ_PAINTINGS from './resources/kzPaintings.js';
import PIG_TEXTURES_MAP from './resources/pigTexturesMap.js';
import SOUNDS_MAP from './resources/soundsMap.js';
import {
  BASE_PACK_DIR,
  MC_NAMESPACE,
  POOF_NAMESPACE,
  TARGET_DIR,
  LOG_LABELS,
} from './constants.js';
import { all, logger, getSplashes } from './utils.js';

const PAINTING_SIZE = 128;
const PAINTINGS_PATH = 'textures/painting';
const PIG_TEXTURE_PATH = 'textures/entity/pig';

const log = logger.child({ label: LOG_LABELS.BEDROCK_BUILD });

const convertToBedrock = async version => {
  const zip = new Zip();

  const [soundsJson, splashesTxt, kz, nonKzPaintings] = await all([
    readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/sounds.json`),
    getSplashes(version),
    generateKz(),
    getNonKzPaintings(),
    zip.addLocalFolderPromise('bedrock'),
  ]);

  zip.addLocalFile('pack.png', '', 'pack_icon.png');
  nonKzPaintings.forEach(name => {
    log.debug(`adding non-kz painting ${name}`);
    zip.addLocalFile(getPaintingPath(name), PAINTINGS_PATH);
  });
  Object.entries(PIG_TEXTURES_MAP).forEach(([javaTexture, bedrockTexture]) => {
    log.debug(`adding ${javaTexture} texture as ${bedrockTexture}`);
    zip.addLocalFile(
      getPigTexturePath(javaTexture),
      PIG_TEXTURE_PATH,
      `${bedrockTexture}.png`,
    );
  });

  const [kzPng] = await Promise.all([
    kz.getBuffer(JimpMime.png),
    zip.addLocalFolderPromise(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/`, {
      zipPath: `sounds/${POOF_NAMESPACE}`,
    }),
    zip.addLocalFolderPromise(
      `${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/gui/title/background`,
      { zipPath: 'textures/ui' },
    ),
  ]);

  zip.addFile(`${PAINTINGS_PATH}/kz.png`, kzPng);

  const bedrockSounds = generateSoundDefinitions(soundsJson);
  zip.addFile(
    'sounds/sound_definitions.json',
    Buffer.from(toJson(bedrockSounds)),
  );

  const bedrockSplashes = generateSplashes(splashesTxt);
  zip.addFile('splashes.json', Buffer.from(toJson(bedrockSplashes)));

  const isBeta = !!prerelease(version);
  const manifest = generateManifest(version, isBeta);
  zip.addFile('manifest.json', Buffer.from(toJson(manifest)));

  const target = `${TARGET_DIR}/poof-sounds-bedrock${isBeta ? '-beta' : ''}.mcpack`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`successfully wrote mcpack file to: ${target}`);
};

const generateKz = async () => {
  const kz = await Jimp.read('build_scripts/resources/kz_template.png');
  const scale = PAINTING_SIZE / 16;
  if (scale !== 1) {
    kz.scale({ f: scale, mode: ResizeStrategy.NEAREST_NEIGHBOR });
  }
  const promises = KZ_PAINTINGS.map(painting => addPainting(kz, painting));
  await all(promises);
  log.debug('generated kz.png');
  return kz;
};

const addPainting = async (kz, { name, x, y, h, w }) => {
  const image = await Jimp.read(getPaintingPath(name));
  const scale = (h * PAINTING_SIZE) / image.height;
  if (scale !== 1) {
    image.scale({ f: scale, mode: ResizeStrategy.NEAREST_NEIGHBOR });
  }
  if (w * PAINTING_SIZE !== image.width) {
    throw new Error(`invalid painting dimensions for ${name}`);
  }
  await kz.blit({ src: image, x: x * PAINTING_SIZE, y: y * PAINTING_SIZE });
  log.silly(`added ${name} to kz`);
};

const getNonKzPaintings = async () => {
  const kzPaintingNames = KZ_PAINTINGS.map(painting => painting.name);
  const [javaFiles, bedrockFiles] = await all([
    readdir(`${BASE_PACK_DIR}/${MC_NAMESPACE}/${PAINTINGS_PATH}/`).then(files =>
      files.reduce((acc, file) => {
        if (file.endsWith('.png')) acc.push(file.split('.')[0]);
        return acc;
      }, []),
    ),
    readdir(`bedrock/${PAINTINGS_PATH}/`).then(files =>
      files.map(file => file.split('.')[0]),
    ),
  ]);
  return javaFiles.filter(
    name => !kzPaintingNames.includes(name) && !bedrockFiles.includes(name),
  );
};

const generateSoundDefinitions = soundsJson => {
  const javaSounds = JSON.parse(soundsJson);
  const definitions = {};
  Object.keys(javaSounds).forEach(key => {
    if (!SOUNDS_MAP[key]) {
      log.warn(`unmapped java sound ${key}`);
      return;
    }
    const soundMappings =
      SOUNDS_MAP[key] instanceof Array ? SOUNDS_MAP[key] : [SOUNDS_MAP[key]];
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
  return { format_version: '1.14.0', sound_definitions: definitions };
};

const adjustSounds = (sounds = [], adjustments = {}) =>
  sounds.map(sound => {
    let adjusted;
    if (typeof sound === 'string') {
      adjusted = { name: sound };
    } else {
      adjusted = { ...sound };
    }
    adjusted.name = `sounds/${adjusted.name.replace(':', '/')}`;
    Object.entries(adjustments).forEach(([key, value]) => {
      adjusted[key] ??= 1;
      adjusted[key] *= value;
    });
    delete adjusted.stream;
    delete adjusted.attenuation_distance;
    delete adjusted.preload;
    if (adjusted.type === 'event') {
      log.warn(`unable to convert event sound ${adjusted.name}`);
    }
    delete adjusted.type;
    if (Object.keys(adjusted).length === 1 && adjusted.name) {
      adjusted = adjusted.name;
    }
    return adjusted;
  });

const generateSplashes = splashesTxt => {
  const splashes = splashesTxt
    .split('\n')
    .map(text => text.trim())
    .filter(text => text && !text.includes('§'));
  splashes.push('poof sounds on bedrock!');
  return { splashes };
};

const generateManifest = (version, isBeta) => {
  const versionArr = [
    major(version),
    minor(version),
    isBeta
      ? 1000 * patch(version) +
        (prerelease(version).find(i => typeof i === 'number') ?? 0)
      : patch(version),
  ];
  log.info(`using version ${versionArr}, beta=${isBeta}`);

  return {
    format_version: 2,
    header: {
      name: `poof-sounds${isBeta ? '-beta' : ''}`,
      description: `Poofesure Minecraft Sounds\nv${version} by youngmani`,
      uuid: isBeta
        ? '9afbe638-2cd4-44c4-8d8c-f40ebbe1cf88'
        : '6c107856-6a56-460a-a5f9-59aee383c1b8',
      version: versionArr,
      min_engine_version: [1, 14, 0],
    },
    modules: [
      {
        type: 'resources',
        uuid: isBeta
          ? '5c0c66e8-d410-4f5d-ad00-5d14f9949655'
          : '0d68d1b5-b211-4c59-952d-eb6e8129983b',
        version: versionArr,
      },
    ],
    metadata: {
      authors: ['youngmani'],
      license: 'CC0',
      url: 'https://youngmani.github.io/poof-sounds/',
    },
  };
};

const toJson = str => `${JSON.stringify(str, null, 2)}\n`;

const getPaintingPath = name =>
  `${BASE_PACK_DIR}/${MC_NAMESPACE}/${PAINTINGS_PATH}/${name}.png`;
const getPigTexturePath = name =>
  `${BASE_PACK_DIR}/${MC_NAMESPACE}/${PIG_TEXTURE_PATH}/${name}.png`;

export default convertToBedrock;
