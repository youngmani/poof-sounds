const fs = require('fs/promises');
const Zip = require('adm-zip');
const log = require('loglevel');
const semver = require('semver');

const soundsMap = require('./soundsMap');
const { BASE_PACK_DIR, MC_NAMESPACE, POOF_NAMESPACE, TARGET_DIR } = require('./constants');

const convertToBedrock = async (tempDir, version) => {
  const [soundsJson, splashesTxt] = await Promise.all([
    fs.readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/sounds.json`),
    fs.readFile(`${BASE_PACK_DIR}/${MC_NAMESPACE}/texts/splashes.txt`),
    fs.cp(`${BASE_PACK_DIR}/${POOF_NAMESPACE}/sounds/`, `${tempDir}/bedrock/sounds/${POOF_NAMESPACE}`, {
      recursive: true,
    }),
  ]);

  const promises = [
    fs.copyFile('./pack.png', `${tempDir}/bedrock/pack_icon.png`),
    fs.cp(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/entity`, `${tempDir}/bedrock/textures/entity`, {
      recursive: true,
    }),
    fs.cp(`${BASE_PACK_DIR}/${MC_NAMESPACE}/textures/gui/title/background`, `${tempDir}/bedrock/textures/ui`, {
      recursive: true,
    }),
    fs.cp(`bedrock/`, `${tempDir}/bedrock/`, { recursive: true }),
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
          log.debug(`bedrock build: converting ${key} to ${name}`);
        });
      } else {
        log.debug(`bedrock build: skipping java sound ${key}`);
      }
    } else {
      log.warn(`bedrock build: unmapped java sound ${key}`);
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
  log.info(`bedrock build: using version ${versionArr}, beta=${isBeta}`);

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

  await Promise.all(promises);

  const zip = new Zip();
  await zip.addLocalFolderPromise(`${tempDir}/bedrock`);
  const target = `${TARGET_DIR}/poof-sounds-bedrock${isBeta ? '-beta' : ''}.mcpack`;
  await zip.writeZipPromise(target, { overwrite: true });
  log.info(`bedrock build: successfully wrote mcpack file to: ${target}`);
};

module.exports = convertToBedrock;
