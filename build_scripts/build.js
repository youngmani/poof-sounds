const fs = require('fs/promises');
const ffprobe = require('ffprobe');
const ffprobePath = require('ffprobe-static').path;
const Zip = require('adm-zip');

const BASE_MC_DIR = "./assets/minecraft";
const TARGET_DIR = "./build"

const verifySoundsExist = async () => {
  const soundsJson = await fs.readFile(`${BASE_MC_DIR}/sounds.json`);
  const sounds = JSON.parse(soundsJson);
  const filesToCheck = new Set();
  Object.values(sounds).forEach((sound) => {
    sound.sounds.forEach((clip) => {
      filesToCheck.add(clip.name);
    });
  });
  const promises = [...filesToCheck].map((file) => {
    fs.access(`${BASE_MC_DIR}/sounds/${file}.ogg`)
      .then(() => {
        console.log(`file exists: ${file}`);
      })
      .catch(() => {
        throw new Error(`sound does not exist: ${file}`);
      });
  });
  await Promise.all(promises);
};

const validateSoundFormat = async () => {
  const [monoFiles, stereoFiles] = await Promise.all([
    fs.readdir(`${BASE_MC_DIR}/sounds/custom/mono`),
    fs.readdir(`${BASE_MC_DIR}/sounds/custom/stereo`),
  ]);
  const files = [];
  monoFiles.forEach((fileName) => {
    files.push({ path: `mono/${fileName}`, channels: 1 });
  });
  stereoFiles.forEach((fileName) => {
    files.push({ path: `stereo/${fileName}`, channels: 2 });
  });
  const promises = files.map(({ path, channels }) => {
    ffprobe(`${BASE_MC_DIR}/sounds/custom/${path}`, {
      path: ffprobePath,
    }).then((info) => {
      if (info.streams.length === 1 && info.streams[0].channels === channels) {
        console.log(
          `validated correct number of audio channels for: custom/${path}`
        );
      } else {
        throw new Error(
          `incorrect number of audio channels for: custom/${path}`
        );
      }
    });
  });
  await Promise.all(promises);
};

const buildZip = async () => {
  const zip = new Zip();
  zip.addLocalFile(`./pack.mcmeta`);
  zip.addLocalFile(`./pack.png`);
  await zip.addLocalFolderPromise(`./assets`, { zipPath: 'assets' });
  try {
    await fs.access(TARGET_DIR);
  } catch (e) {
    await fs.mkdir(TARGET_DIR);
  }
  await zip.writeZipPromise(`${TARGET_DIR}/poof-sounds.zip`, { overwrite: true })
  console.log(`successfully wrote zip file to: ${TARGET_DIR}/poof-sounds.zip`)
}

verifySoundsExist();
validateSoundFormat();
buildZip();
