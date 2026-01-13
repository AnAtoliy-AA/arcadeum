/**
 * Mapping of card types to their position in a 6x6 sprite sheet (0-35)
 */
export const CARD_SPRITE_MAP: Record<string, number> = {
  // SPECIAL
  critical_event: 0,
  neutralizer: 1,

  // CORE
  strike: 2,
  evade: 3,
  trade: 4,
  reorder: 5,
  insight: 6,
  cancel: 7,

  // COLLECTION (Cats)
  collection_alpha: 8,
  collection_beta: 9,
  collection_gamma: 10,
  collection_delta: 11,
  collection_epsilon: 12,

  // ATTACK PACK
  targeted_strike: 13,
  private_strike: 14,
  recursive_strike: 15,
  mega_evade: 16,
  invert: 17,

  // FUTURE PACK
  see_future_5x: 18,
  alter_future_3x: 19,
  alter_future_5x: 20,
  reveal_future_3x: 21,
  share_future_3x: 22,
  draw_bottom: 23,
  swap_top_bottom: 24,
  bury: 25,

  // THEFT PACK
  wildcard: 26,
  mark: 27,
  steal_draw: 28,
  stash: 29,

  // DEITY PACK
  omniscience: 30,
  miracle: 31,
  smite: 32,
  rapture: 33,

  // CHAOS PACK (Planned/Extra)
  critical_implosion: 34,
  containment_field: 35,
  fission: 0,
  tribute: 1,
  blackout: 2,
};
