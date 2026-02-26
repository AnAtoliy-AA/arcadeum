const fs = require('fs');
const path = require('path');

// We'll use jimp via npx, so we expect it to be available or we might need to install it.
// For this script, we'll assume the user runs it in an environment where they can install jimp temporarily.
// Usage: npm install jimp && node scripts/generate_spritesheet.js

const Jimp = require('jimp');

const CONSTANTS_PATH = path.resolve(
  __dirname,
  '../apps/web/src/widgets/CriticalGame/lib/constants.ts',
);

// Basic parsing to "import" constants from TS file
function getGameVariants() {
  try {
    const content = fs.readFileSync(CONSTANTS_PATH, 'utf8');
    const match = content.match(
      /export const GAME_VARIANT = ({[\s\S]*?}) as const;/,
    );
    if (match) {
      // Very basic translation from TS object literal to JS object
      // This works for simple key-value pairs
      const objectStr = match[1]
        .replace(/\b([A-Z_]+):/g, '"$1":') // Quote keys
        .replace(/'/g, '"') // Use double quotes
        .replace(/,(\s*})/g, '$1'); // Remove trailing comma
      return JSON.parse(objectStr);
    }
  } catch (err) {
    console.warn('Could not parse constants file, using fallback');
  }
  return { UNDERWATER: 'underwater' };
}

const GAME_VARIANT = getGameVariants();
const SELECTED_VARIANT = GAME_VARIANT.HIGH_ALTITUDE_HIKE;
const FILE_PREFIX = SELECTED_VARIANT.replace(/-/g, '_');

const ARTIFACTS_DIR = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(
      __dirname,
      '../../../.gemini/antigravity/brain/459da24d-889d-47cc-85c8-995ca25e3ac7',
    );
const OUTPUT_PATH = path.resolve(
  __dirname,
  `../apps/web/public/images/cards/${SELECTED_VARIANT}_sprites.png`,
);

// 7x7 grid, 49 cards capacity
const TILE_SIZE = 171;
const GRID_SIZE = 7;
const TOTAL_SIZE = TILE_SIZE * GRID_SIZE; // 1197

// Mapping for UNDERWATER theme
// keys must match the index in CARD_SPRITE_MAP (implicit in styles/card-sprites.ts which usually follows a specific order)
const SPRITE_MAP = {
  // EXTRA (Card Back)
  0: `${FILE_PREFIX}_card_back`,

  // SPECIAL
  1: `${FILE_PREFIX}_avalanche`, // critical_event
  2: `${FILE_PREFIX}_oxygen_tank`, // neutralizer

  // CORE
  3: `${FILE_PREFIX}_ice_axe`, // strike
  4: `${FILE_PREFIX}_parka`, // evade
  5: `${FILE_PREFIX}_gear_exchange`, // trade
  6: `${FILE_PREFIX}_map_check`, // reorder
  7: `${FILE_PREFIX}_scouting`, // insight
  8: `${FILE_PREFIX}_ice_wall`, // cancel

  // COLLECTION
  9: `${FILE_PREFIX}_edelweiss`,
  10: `${FILE_PREFIX}_rare_mineral`,
  11: `${FILE_PREFIX}_ice_crystal`,
  12: `${FILE_PREFIX}_fossil`,
  13: `${FILE_PREFIX}_yeti_hair`,

  // ATTACK PACK
  14: `${FILE_PREFIX}_piton`, // targeted_strike
  15: `${FILE_PREFIX}_altitude_sickness`, // private_strike
  16: `${FILE_PREFIX}_snowstorm`, // recursive_strike
  17: `${FILE_PREFIX}_base_camp`, // mega_evade
  18: `${FILE_PREFIX}_descent`, // invert

  // FUTURE PACK
  19: `${FILE_PREFIX}_summit_view`,
  20: `${FILE_PREFIX}_route_choice`,
  21: `${FILE_PREFIX}_expedition_plan`,
  22: `${FILE_PREFIX}_flare`,
  23: `${FILE_PREFIX}_radio_check`,
  24: `${FILE_PREFIX}_dig_snow`,
  25: `${FILE_PREFIX}_pulley_system`,
  26: `${FILE_PREFIX}_cache`,

  // THEFT PACK
  27: `${FILE_PREFIX}_sherpa`, // wildcard
  28: `${FILE_PREFIX}_trail_marker`, // mark
  29: `${FILE_PREFIX}_rope_tug`, // steal_draw
  30: `${FILE_PREFIX}_supplies`, // stash

  // DEITY PACK
  31: `${FILE_PREFIX}_eagle_eye`, // omniscience
  32: `${FILE_PREFIX}_helicopter`, // miracle
  33: `${FILE_PREFIX}_thunder`, // smite
  34: `${FILE_PREFIX}_blizzard`, // rapture

  // CHAOS PACK
  35: `${FILE_PREFIX}_glacier_collapse`, // critical_implosion
  36: `${FILE_PREFIX}_igloo`, // containment_field
  37: `${FILE_PREFIX}_frostbite`, // fission
  38: `${FILE_PREFIX}_rations`, // tribute
  39: `${FILE_PREFIX}_whiteout`, // blackout
};

async function generate() {
  console.log(`Creating new sprite sheet for ${SELECTED_VARIANT}...`);
  const background = new Jimp(TOTAL_SIZE, TOTAL_SIZE, 0x00000000); // Transparent

  // Loop up to 49 (7x7)
  const MAX_INDEX = GRID_SIZE * GRID_SIZE;

  let count = 0;
  for (let i = 0; i < MAX_INDEX; i++) {
    const filenameBase = SPRITE_MAP[i];

    let img;
    // Try finding the file in artifacts
    const fileNode = filenameBase
      ? findFileByPrefix(ARTIFACTS_DIR, filenameBase)
      : null;

    if (fileNode) {
      console.log(`[${i}] Found asset: ${fileNode}`);
      img = await Jimp.read(path.join(ARTIFACTS_DIR, fileNode));
    } else {
      if (filenameBase) {
        // console.warn(`[${i}] No asset for ${filenameBase}`);
      }
    }

    if (img) {
      img.resize(TILE_SIZE, TILE_SIZE);
      const col = i % GRID_SIZE;
      const row = Math.floor(i / GRID_SIZE);
      background.blit(img, col * TILE_SIZE, row * TILE_SIZE);
      count++;
    }
  }

  console.log(`Writing ${count} sprites to ${OUTPUT_PATH}...`);
  await background.writeAsync(OUTPUT_PATH);
  console.log('Done!');
}

function findFileByPrefix(dir, prefix) {
  try {
    const files = fs.readdirSync(dir);
    // Match "prefix_timestamp.png" or just "prefix.png"
    const matches = files
      .filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
      .sort((a, b) => {
        // Extract timestamps if they exist (last part before .png)
        const getTs = (filename) => {
          const parts = filename.split('_');
          const tsPart = parts[parts.length - 1].replace('.png', '');
          return parseInt(tsPart, 10) || 0;
        };
        return getTs(b) - getTs(a); // Descending order
      });
    return matches[0] || null;
  } catch (err) {
    console.error('Error reading artifact dir:', err);
    return null;
  }
}

generate().catch(console.error);
