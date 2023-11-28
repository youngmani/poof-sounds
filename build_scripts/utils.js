const fs = require('fs/promises');

const getOverlayDirectories = async () => {
  const files = await fs.readdir('.');
  return files.filter(file => file.startsWith('overlay_'));
};

module.exports = {
  getOverlayDirectories,
};
