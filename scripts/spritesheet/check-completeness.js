const fs = require('fs');
const path = require('path');
const { findAssetByPrefix } = require('./find-asset');
const { buildSpriteMap } = require('./build-sprite-map');

const ARTIFACTS_DIR = path.resolve(__dirname, '../../assets/card-art');
const GRID_SIZE = 7;
const MAX_INDEX = GRID_SIZE * GRID_SIZE;

function checkVariantCompleteness(variant, cardSpriteMap) {
  const spriteMap = buildSpriteMap(variant, cardSpriteMap);
  const missing = [];
  const found = [];

  for (let i = 0; i < MAX_INDEX; i++) {
    const filenameBase = spriteMap[i];
    if (!filenameBase) continue;

    const assetFile = findAssetByPrefix(ARTIFACTS_DIR, filenameBase);
    if (!assetFile) {
      missing.push({ index: i, name: filenameBase.replace(`${variant.replace(/-/g, '_')}_`, '') });
    } else {
      found.push(i);
    }
  }

  return {
    variant,
    foundCount: found.length,
    missingCount: missing.length,
    totalExpected: found.length + missing.length,
    missingList: missing
  };
}

module.exports = { checkVariantCompleteness };
