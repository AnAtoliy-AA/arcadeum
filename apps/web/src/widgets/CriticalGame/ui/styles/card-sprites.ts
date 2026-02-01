export const SPRITE_GRID_SIZE = 7; // 7x7 grid

/**
 * Mapping of card types to their position in a 7x7 sprite sheet (0-48)
 */
export const CARD_SPRITE_MAP: Record<string, number> = {
  // SPECIAL
  critical_event: 1,
  neutralizer: 2,

  // CORE
  strike: 3,
  evade: 4,
  trade: 5,
  reorder: 6,
  insight: 7,
  cancel: 8,

  // COLLECTION (Cats)
  collection_alpha: 9,
  collection_beta: 10,
  collection_gamma: 11,
  collection_delta: 12,
  collection_epsilon: 13,

  // ATTACK PACK
  targeted_strike: 14,
  private_strike: 15,
  recursive_strike: 16,
  mega_evade: 17,
  invert: 18,

  // FUTURE PACK
  see_future_5x: 19,
  alter_future_3x: 20,
  alter_future_5x: 21,
  reveal_future_3x: 22,
  share_future_3x: 23,
  draw_bottom: 24,
  swap_top_bottom: 25,
  bury: 26,

  // THEFT PACK
  wildcard: 27,
  mark: 28,
  steal_draw: 29,
  stash: 30,

  // DEITY PACK
  omniscience: 31,
  miracle: 32,
  smite: 33,
  rapture: 34,

  // CHAOS PACK (Planned/Extra)
  critical_implosion: 35,
  containment_field: 36,
  fission: 37,
  tribute: 38,
  blackout: 39,
};
