const path = require('path');
const { extractObjectFromSource } = require('./parse-constants');
const fs = require('fs');

const VARIANTS_PATH = path.resolve(
  __dirname,
  '../../apps/web/src/widgets/CriticalGame/lib/constants/variants.ts',
);

const CARDS_PATH = path.resolve(
  __dirname,
  '../../apps/web/src/widgets/CriticalGame/lib/constants/cards.ts',
);

const artifactsDir = path.resolve(__dirname, '../../assets/card-art');

const gameVariants =
  extractObjectFromSource(VARIANTS_PATH, 'GAME_VARIANT') || {};
const cardSpriteMap =
  extractObjectFromSource(CARDS_PATH, 'CARD_SPRITE_MAP') || {};

function buildSpriteMap(variant, cardSpriteMap) {
  const prefix = variant.replace(/-/g, '_');
  const map = { 0: `${prefix}_card_back` };

  Object.entries(cardSpriteMap).forEach(([key, index]) => {
    map[index] = `${prefix}_${key}`;
  });

  return map;
}

const files = fs.readdirSync(artifactsDir);

for (const variant of Object.values(gameVariants)) {
  const spriteMap = buildSpriteMap(variant, cardSpriteMap);

  for (let i = 0; i < 49; i++) {
    const prefix = spriteMap[i];
    if (!prefix) continue;

    const prefixParts = prefix.split('_');
    const matches = files.filter((f) => {
      if (!f.startsWith(prefix) || !f.endsWith('.png')) return false;

      const fileParts = f.replace('.png', '').split('_');
      return prefixParts.every((part, idx) => fileParts[idx] === part);
    });

    if (matches.length > 1) {
      console.log(
        `[MULTIPLE MATCHES] Variant ${variant}: Prefix ${prefix} matched: ${matches.join(', ')}`,
      );
    } else if (matches.length === 1 && matches[0] !== `${prefix}.png`) {
      // console.log(`Matched non-exact: ${prefix} -> ${matches[0]}`);
    }
  }
}
console.log('Multiple matches check complete.');
