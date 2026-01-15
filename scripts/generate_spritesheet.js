const fs = require('fs');
const path = require('path');

// We'll use jimp via npx, so we expect it to be available or we might need to install it.
// For this script, we'll assume the user runs it in an environment where they can install jimp temporarily.
// Usage: npm install jimp && node scripts/generate_spritesheet.js

const Jimp = require('jimp');

const ARTIFACTS_DIR =
  '/Users/anatoliyaliaksandrau/.gemini/antigravity/brain/c75d39d9-5428-49de-a84a-bedc852a5761';
const OUTPUT_PATH =
  '/Users/anatoliyaliaksandrau/js/aicoapp/apps/web/public/images/cards/cyberpunk_sprites.png';

// 7x7 grid, 49 cards capacity
const TILE_SIZE = 171;
const GRID_SIZE = 7;
const TOTAL_SIZE = TILE_SIZE * GRID_SIZE; // 1197

// Mapping from Index (0-35) to Filename suffix (e.g. 'system_overload' -> 'cyberpunk_system_overload.png')
// Based on styles/card-sprites.ts
// Mapping from Index (0-39) to Filename suffix
// Based on styles/card-sprites.ts
const SPRITE_MAP = {
  // EXTRA (Card Back)
  0: 'cyberpunk_card_back',

  // SPECIAL
  1: 'cyberpunk_system_overload', // critical_event
  2: 'cyberpunk_firewall', // neutralizer

  // CORE
  3: 'cyberpunk_ddos', // strike
  4: 'cyberpunk_proxy', // evade
  5: 'cyberpunk_hack', // trade
  6: 'cyberpunk_rehash', // reorder
  7: 'cyberpunk_ping', // insight
  8: 'cyberpunk_404_error', // cancel

  // COLLECTION
  9: 'cyberpunk_data_chip', // collection_alpha (Data Chip)
  10: 'cyberpunk_bio_implant', // collection_beta
  11: 'cyberpunk_neon_katana', // collection_gamma
  12: 'cyberpunk_holo_disk', // collection_delta
  13: 'cyberpunk_cyberskull', // collection_epsilon (Cyberskull)

  // ATTACK PACK
  14: 'cyberpunk_targeted_malware', // targeted_strike
  15: 'cyberpunk_self_destruct', // private_strike
  16: 'cyberpunk_botnet', // recursive_strike
  17: 'cyberpunk_ghost_mode', // mega_evade
  18: 'cyberpunk_loopback', // invert

  // FUTURE PACK
  19: 'cyberpunk_deep_scan', // see_future_5x
  20: 'cyberpunk_rewrite', // alter_future_3x
  21: 'cyberpunk_system_override', // alter_future_5x
  22: 'cyberpunk_broadcast', // reveal_future_3x
  23: 'cyberpunk_peer_sync', // share_future_3x
  24: 'cyberpunk_backdoor_access', // draw_bottom
  25: 'cyberpunk_kernel_swap', // swap_top_bottom
  26: 'cyberpunk_decompile', // bury

  // THEFT PACK
  27: 'cyberpunk_rogue_ai', // wildcard
  28: 'cyberpunk_tracker', // mark
  29: 'cyberpunk_intercept', // steal_draw
  30: 'cyberpunk_encrypted_vault', // stash

  // DEITY PACK
  31: 'cyberpunk_god_mode', // omniscience
  32: 'cyberpunk_system_restore', // miracle
  33: 'cyberpunk_neural_shock', // smite
  34: 'cyberpunk_network_crash', // rapture

  // CHAOS PACK (Planned/Extra)
  35: 'cyberpunk_core_meltdown', // critical_implosion
  36: 'cyberpunk_sandbox_env', // containment_field
  37: 'cyberpunk_fission', // fission
  38: 'cyberpunk_tribute', // tribute
  39: 'cyberpunk_blackout', // blackout
};

async function generate() {
  console.log('Loading original sprite sheet for fallback...');
  let originalSheet;
  try {
    originalSheet = await Jimp.read(OUTPUT_PATH);
    console.log('Original sheet loaded.');
  } catch (e) {
    console.warn('Could not load original sheet. Fallback will be empty.');
  }

  console.log('Creating new sprite sheet...');
  const background = new Jimp(TOTAL_SIZE, TOTAL_SIZE, 0x00000000); // Transparent

  // Loop up to 49 (7x7)
  const MAX_INDEX = GRID_SIZE * GRID_SIZE;

  for (let i = 0; i < MAX_INDEX; i++) {
    const filenameBase = SPRITE_MAP[i];

    let img;
    // Try finding the file in artifacts
    const fileNode = filenameBase
      ? findFileByPrefix(ARTIFACTS_DIR, filenameBase)
      : null;

    if (fileNode) {
      console.log(`[${i}] Found new asset: ${fileNode}`);
      img = await Jimp.read(path.join(ARTIFACTS_DIR, fileNode));
    } else if ((i === 36 || i === 37 || i === 38) && originalSheet) {
      // Fallback for Fission (36), Tribute (37), Blackout (38) using legacy indices 0, 1, 2
      // These cards share indices with others in the old system, and we want to preserve that legacy look
      // instead of using the new "System Overload" text sprites which would be incorrect.
      const legacyMap = { 36: 0, 37: 1, 38: 2 };
      const origIdx = legacyMap[i];

      console.log(
        `[${i}] Using legacy original asset at index ${origIdx} (fallback)...`,
      );
      const ORIG_GRID = 6;
      const ORIG_TILE = 1024 / ORIG_GRID; // approx 170.66

      const col = origIdx % ORIG_GRID;
      const row = Math.floor(origIdx / ORIG_GRID);

      img = originalSheet
        .clone()
        .crop(col * ORIG_TILE, row * ORIG_TILE, ORIG_TILE, ORIG_TILE);
    } else if (i < 36 && originalSheet) {
      // Fallback to original sheet (which was 6x6)
      // console.log(`[${i}] Using original asset (fallback)...`);
      const ORIG_GRID = 6;
      const ORIG_TILE = 1024 / ORIG_GRID; // approx 170.66

      const col = i % ORIG_GRID;
      const row = Math.floor(i / ORIG_GRID);

      img = originalSheet
        .clone()
        .crop(col * ORIG_TILE, row * ORIG_TILE, ORIG_TILE, ORIG_TILE);
    }

    if (img) {
      img.resize(TILE_SIZE, TILE_SIZE);
      const col = i % GRID_SIZE;
      const row = Math.floor(i / GRID_SIZE);
      background.blit(img, col * TILE_SIZE, row * TILE_SIZE);
    } else {
      if (filenameBase)
        console.warn(`[${i}] No asset for ${filenameBase} (and no backup)`);
    }
  }

  console.log(`Writing to ${OUTPUT_PATH}...`);
  await background.writeAsync(OUTPUT_PATH);
  console.log('Done!');
}

function findFileByPrefix(dir, prefix) {
  const files = fs.readdirSync(dir);
  // Match "prefix_timestamp.png" or just "prefix.png"
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith('.png'));
  return match;
}

generate().catch(console.error);
