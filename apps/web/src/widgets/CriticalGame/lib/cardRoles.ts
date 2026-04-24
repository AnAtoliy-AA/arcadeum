import type { CriticalCard } from '../types';

export type CardRole =
  | 'attack'
  | 'defuse'
  | 'skip'
  | 'nope'
  | 'favor'
  | 'see'
  | 'combo'
  | 'special';

const ROLE_BY_CARD: Partial<Record<string, CardRole>> = {
  // attack family (directly damages / targets another player)
  strike: 'attack',
  targeted_strike: 'attack',
  private_strike: 'attack',
  recursive_strike: 'attack',
  smite: 'attack',
  mark: 'attack',
  fission: 'attack',
  // defuse / protection
  neutralizer: 'defuse',
  containment_field: 'defuse',
  // skip / dodge
  evade: 'skip',
  mega_evade: 'skip',
  // nope
  cancel: 'nope',
  // favor / transactional / theft
  trade: 'favor',
  tribute: 'favor',
  steal_draw: 'favor',
  // see / deck-manipulation (insight-family)
  insight: 'see',
  see_future_5x: 'see',
  reveal_future_3x: 'see',
  share_future_3x: 'see',
  alter_future_3x: 'see',
  alter_future_5x: 'see',
  reorder: 'see',
  draw_bottom: 'see',
  swap_top_bottom: 'see',
  bury: 'see',
  invert: 'see',
  // combo (collection + wildcard + stash)
  collection_alpha: 'combo',
  collection_beta: 'combo',
  collection_gamma: 'combo',
  collection_delta: 'combo',
  collection_epsilon: 'combo',
  wildcard: 'combo',
  stash: 'combo',
  // special (signature / deity / chaos-resolution)
  critical_event: 'special',
  omniscience: 'special',
  miracle: 'special',
  rapture: 'special',
  critical_implosion: 'special',
  blackout: 'special',
};

export function getCardRole(card: CriticalCard): CardRole {
  return ROLE_BY_CARD[card] ?? 'special';
}

// Expose the internal map to the test suite so it can detect silent fallbacks
// (see cardRoles.test.ts "maps every card" check).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(getCardRole as any).__rolesByCard = ROLE_BY_CARD;
