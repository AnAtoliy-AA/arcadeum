const fs = require('fs');
const path = require('path');
const { findAssetByPrefix } = require('./spritesheet/find-asset');

const variants = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
];
const cardArtDir = path.join(__dirname, '../assets/card-art');

const CARD_SPRITE_MAP = {
  card_back: 0,
  critical_event: 1,
  neutralizer: 2,
  strike: 3,
  evade: 4,
  trade: 5,
  reorder: 6,
  insight: 7,
  cancel: 8,
  collection_alpha: 9,
  collection_beta: 10,
  collection_gamma: 11,
  collection_delta: 12,
  collection_epsilon: 13,
  targeted_strike: 14,
  private_strike: 15,
  recursive_strike: 16,
  mega_evade: 17,
  invert: 18,
  see_future_5x: 19,
  alter_future_3x: 20,
  alter_future_5x: 21,
  reveal_future_3x: 22,
  share_future_3x: 23,
  draw_bottom: 24,
  swap_top_bottom: 25,
  bury: 26,
  wildcard: 27,
  mark: 28,
  steal_draw: 29,
  stash: 30,
  omniscience: 31,
  miracle: 32,
  smite: 33,
  rapture: 34,
  critical_implosion: 35,
  containment_field: 36,
  fission: 37,
  tribute: 38,
  blackout: 39,
  vortex: 40,
  essence: 41,
  zen: 42,
  fury: 43,
  aegis: 44,
  blight: 45,
  bloom: 46,
  pulse: 47,
  gateway: 48,
};

const results = {};

variants.forEach((variant) => {
  results[variant] = {
    missing: [],
    count: 0,
  };
  const prefix = variant.replace(/-/g, '_');
  Object.keys(CARD_SPRITE_MAP).forEach((card) => {
    const filenameBase = `${prefix}_${card}`;
    // Use the same find logic as the actual generator to be accurate
    const assetFile = findAssetByPrefix(cardArtDir, filenameBase);
    if (!assetFile) {
      results[variant].missing.push(card);
    } else {
      results[variant].count++;
    }
  });
});

console.log(JSON.stringify(results, null, 2));
