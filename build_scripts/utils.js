const fs = require('fs/promises');

const all = async promises => {
  const results = await Promise.allSettled(promises);
  return results.map(result => {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    return result.value;
  });
};

const getOverlayDirectories = async () => {
  const files = await fs.readdir('.');
  return files.filter(file => file.startsWith('overlay_'));
};

module.exports = {
  all,
  getOverlayDirectories,
};
