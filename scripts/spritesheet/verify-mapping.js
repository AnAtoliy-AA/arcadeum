const path = require('path');
const { extractObjectFromSource } = require('./parse-constants');
const { findAssetByPrefix } = require('./find-asset');
const { buildSpriteMap } = require('./build-sprite-map');

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

for (const variant of Object.values(gameVariants)) {
  const spriteMap = buildSpriteMap(variant, cardSpriteMap);
  const usedAssets = {};

  for (let i = 0; i < 49; i++) {
    const filenameBase = spriteMap[i];
    if (!filenameBase) continue;

    const assetFile = findAssetByPrefix(artifactsDir, filenameBase);
    if (assetFile) {
      if (usedAssets[assetFile]) {
        console.error(
          `[DUPLICATE ASSET ERROR] Variant ${variant}: Asset ${assetFile} used for index ${i} (${filenameBase}) and index ${usedAssets[assetFile].index} (${usedAssets[assetFile].filenameBase})`,
        );
      }
      usedAssets[assetFile] = { index: i, filenameBase };
    } else {
      console.warn(
        `[MISSING ASSET] Variant ${variant}: No asset found for ${filenameBase} at index ${i}`,
      );
    }
  }
}
console.log('Check complete.');
