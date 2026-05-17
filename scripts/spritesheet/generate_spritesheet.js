const path = require('path');
const Jimp = require('jimp');
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

const TILE_SIZE = 171;
const GRID_SIZE = 7;
const TOTAL_SIZE = TILE_SIZE * GRID_SIZE;
const MAX_INDEX = GRID_SIZE * GRID_SIZE;

function resolveConfig() {
  const gameVariants =
    extractObjectFromSource(VARIANTS_PATH, 'GAME_VARIANT') || {};
  const cardSpriteMap =
    extractObjectFromSource(CARDS_PATH, 'CARD_SPRITE_MAP') || {};

  const artifactsDir = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.resolve(__dirname, '../../assets/card-art');

  return { gameVariants, cardSpriteMap, artifactsDir };
}

async function loadOrCreateBackground(outputPath) {
  try {
    // We always want a fresh sheet for the final version to ensure no "repeats" from old data
    console.log('Created new transparent background');
    return new Jimp(TOTAL_SIZE, TOTAL_SIZE, 0x00000000);
  } catch {
    return new Jimp(TOTAL_SIZE, TOTAL_SIZE, 0x00000000);
  }
}

async function compositeSprites(
  variant,
  background,
  cardSpriteMap,
  artifactsDir,
) {
  let count = 0;
  const spriteMap = buildSpriteMap(variant, cardSpriteMap);

  for (let i = 0; i < MAX_INDEX; i++) {
    const filenameBase = spriteMap[i];
    if (!filenameBase) continue;

    const assetFile = findAssetByPrefix(artifactsDir, filenameBase);
    if (!assetFile) {
      console.warn(
        `[${variant}][${i}] No asset for ${filenameBase} in ${artifactsDir}`,
      );
      continue;
    }

    console.log(
      `[${variant}][${i}] Found asset for ${filenameBase}: ${assetFile}`,
    );
    const img = await Jimp.read(path.join(artifactsDir, assetFile));
    img.resize(TILE_SIZE, TILE_SIZE);

    const col = i % GRID_SIZE;
    const row = Math.floor(i / GRID_SIZE);
    background.blit(img, col * TILE_SIZE, row * TILE_SIZE);
    count++;
  }

  return count;
}

async function generate() {
  const { gameVariants, cardSpriteMap, artifactsDir } = resolveConfig();
  const variantsToProcess = process.env.VARIANT
    ? [process.env.VARIANT]
    : Object.values(gameVariants);

  console.log(`Processing variants: ${variantsToProcess.join(', ')}`);
  console.log(`Using artifacts from: ${artifactsDir}`);

  for (const variant of variantsToProcess) {
    const outputPath = path.resolve(
      __dirname,
      `../../apps/web/public/images/cards/${variant.replace(/-/g, '_')}_sprites.png`,
    );

    console.log(`\n--- Generating ${variant} ---`);
    const background = await loadOrCreateBackground(outputPath);
    const count = await compositeSprites(
      variant,
      background,
      cardSpriteMap,
      artifactsDir,
    );

    console.log(`Writing ${count} sprites to ${outputPath}...`);
    await background.writeAsync(outputPath);
  }

  console.log('\nAll variants processed!');
}

generate().catch(console.error);
