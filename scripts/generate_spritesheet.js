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
const SELECTED_VARIANT = GAME_VARIANT.UNDERWATER;

const ARTIFACTS_DIR = path.resolve(
  __dirname,
  '../../.gemini/antigravity/brain/44d3364a-e853-4aa9-9692-188c78ddebc7',
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
  0: `${SELECTED_VARIANT}_card_back`,

  // SPECIAL
  1: `${SELECTED_VARIANT}_system_overload`, // critical_event (Defuse / Hull Repair)
  2: `${SELECTED_VARIANT}_firewall`, // neutralizer (Nope / Hatch Seal)

  // CORE
  3: `${SELECTED_VARIANT}_ddos`, // strike (Attack / Torpedo)
  4: `${SELECTED_VARIANT}_proxy`, // evade (Skip / Sonar)
  5: `${SELECTED_VARIANT}_hack`, // trade (Favor / Salvage)
  6: `${SELECTED_VARIANT}_rehash`, // reorder (Shuffle / Current)
  7: `${SELECTED_VARIANT}_ping`, // insight (See Future / Periscope)
  8: `${SELECTED_VARIANT}_404_error`, // cancel (Reverse / Backwash - mapped same as firewall usually? or separate)

  // COLLECTION (e.g. Treasures)
  9: `${SELECTED_VARIANT}_data_chip`,
  10: `${SELECTED_VARIANT}_bio_implant`,
  11: `${SELECTED_VARIANT}_neon_katana`,
  12: `${SELECTED_VARIANT}_holo_disk`,
  13: `${SELECTED_VARIANT}_cyberskull`,

  // ATTACK PACK
  14: `${SELECTED_VARIANT}_targeted_malware`,
  15: `${SELECTED_VARIANT}_self_destruct`,
  16: `${SELECTED_VARIANT}_botnet`,
  17: `${SELECTED_VARIANT}_ghost_mode`,
  18: `${SELECTED_VARIANT}_loopback`,

  // FUTURE PACK
  19: `${SELECTED_VARIANT}_deep_scan`,
  20: `${SELECTED_VARIANT}_rewrite`,
  21: `${SELECTED_VARIANT}_system_override`,
  22: `${SELECTED_VARIANT}_broadcast`,
  23: `${SELECTED_VARIANT}_peer_sync`,
  24: `${SELECTED_VARIANT}_backdoor_access`,
  25: `${SELECTED_VARIANT}_kernel_swap`,
  26: `${SELECTED_VARIANT}_decompile`,

  // THEFT PACK
  27: `${SELECTED_VARIANT}_rogue_ai`, // wildcard
  28: `${SELECTED_VARIANT}_tracker`, // mark
  29: `${SELECTED_VARIANT}_intercept`, // steal
  30: `${SELECTED_VARIANT}_encrypted_vault`, // stash

  // DEITY PACK
  31: `${SELECTED_VARIANT}_god_mode`,
  32: `${SELECTED_VARIANT}_system_restore`,
  33: `${SELECTED_VARIANT}_neural_shock`,
  34: `${SELECTED_VARIANT}_network_crash`,

  // CHAOS PACK
  35: `${SELECTED_VARIANT}_core_meltdown`,
  36: `${SELECTED_VARIANT}_sandbox_env`,
  37: `${SELECTED_VARIANT}_fission`,
  38: `${SELECTED_VARIANT}_tribute`,
  39: `${SELECTED_VARIANT}_blackout`,
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
    // We prioritize the most recent timestamp if multiple exist?
    // For now just finding one.
    const match = files.find((f) => f.startsWith(prefix) && f.endsWith('.png'));
    return match;
  } catch (err) {
    console.error('Error reading artifact dir:', err);
    return null;
  }
}

generate().catch(console.error);
