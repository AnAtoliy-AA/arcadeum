const fs = require('fs');

function findAssetByPrefix(dir, prefix) {
  const files = fs.readdirSync(dir);
  const prefixParts = prefix.split('_');

  const matches = files
    .filter((f) => {
      if (!f.startsWith(prefix) || !f.endsWith('.png')) return false;

      const fileParts = f.replace('.png', '').split('_');
      return prefixParts.every((part, i) => fileParts[i] === part);
    })
    .sort((a, b) => {
      const extractTimestamp = (filename) => {
        const parts = filename.split('_');
        const last = parts[parts.length - 1].replace('.png', '');
        return parseInt(last, 10) || 0;
      };
      return extractTimestamp(b) - extractTimestamp(a);
    });

  return matches[0] || null;
}

module.exports = { findAssetByPrefix };
