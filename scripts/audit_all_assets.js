const fs = require('fs');
const path = require('path');

const CONSTANTS_PATH = path.resolve(
  __dirname,
  '../apps/web/src/widgets/CriticalGame/lib/constants.ts',
);
const ASSETS_DIR = path.resolve(__dirname, '../assets/card-art');

function getCardSpriteMap() {
  const content = fs.readFileSync(CONSTANTS_PATH, 'utf8');
  const startExpr = 'export const CARD_SPRITE_MAP: Record<string, number> = {';
  const startIndex = content.indexOf(startExpr);
  if (startIndex === -1) throw new Error('Could not find CARD_SPRITE_MAP');

  const endIndex = content.indexOf('};', startIndex);
  const body = content.substring(startIndex + startExpr.length, endIndex);

  const map = {};
  body.split('\n').forEach((line) => {
    const match = line.trim().match(/^(\w+):\s*(\d+),?/);
    if (match) {
      map[match[1]] = parseInt(match[2]);
    }
  });
  return map;
}

const map = getCardSpriteMap();
const variants = [
  'adventure',
  'crime',
  'horror',
  'high_altitude_hike',
  'cyberpunk',
  'underwater',
];

// Pre-read the directory to avoid hundreds of stat calls
const existingFiles = new Set(fs.readdirSync(ASSETS_DIR));

variants.forEach((variantParam) => {
  const variant = variantParam.replace(/-/g, '_');
  const missing = [];

  if (!existingFiles.has(`${variant}_card_back.png`)) {
    missing.push('0: card_back');
  }

  Object.entries(map).forEach(([key, index]) => {
    if (!existingFiles.has(`${variant}_${key}.png`)) {
      missing.push(`${index}: ${key}`);
    }
  });

  console.log(`\n--- ${variantParam} ---`);
  console.log(`Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log(missing.join(', '));
  }
});
