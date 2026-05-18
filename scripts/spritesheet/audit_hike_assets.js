const fs = require('fs');
const path = require('path');

const CONSTANTS_PATH = path.resolve(
  __dirname,
  '../../apps/web/src/widgets/CriticalGame/lib/constants.ts',
);
const ASSETS_DIR = path.resolve(__dirname, '../../assets/card-art');

function extractObjectFromSource(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(
    new RegExp(`const ${name}(?:[:\\s\\w<>,[\\]]+)? = {([\\s\\S]*?)}`, 'm'),
  );
  if (!match) throw new Error(`Could not find "${name}"`);

  const body = match[1];
  const result = {};
  body.split('\n').forEach((line) => {
    const parts = line.trim().match(/^(\w+):\s*['"]?([\w-]+)['"]?,?/);
    if (parts) {
      const value = /^\d+$/.test(parts[2]) ? parseInt(parts[2]) : parts[2];
      result[parts[1]] = value;
    }
  });
  return result;
}

const cardSpriteMap = extractObjectFromSource(
  CONSTANTS_PATH,
  'CARD_SPRITE_MAP',
);
const variant = 'high_altitude_hike';
const missing = [];

// Index 0: card_back
if (!fs.existsSync(path.join(ASSETS_DIR, `${variant}_card_back.png`))) {
  missing.push('0: card_back');
}

Object.entries(cardSpriteMap).forEach(([key, index]) => {
  const filename = `${variant}_${key}.png`;
  if (!fs.existsSync(path.join(ASSETS_DIR, filename))) {
    missing.push(`${index}: ${key}`);
  }
});

console.log(`Missing Hike assets: ${missing.length}`);
console.log(missing.join('\n'));
