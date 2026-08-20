import { describe, it, expect } from 'vitest';
import { ALL_GAME_CARDS } from '../types';
import { getCardRole } from './cardRoles';

describe('getCardRole', () => {
  it.each([
    // attack family
    ['strike', 'attack'],
    ['targeted_strike', 'attack'],
    ['private_strike', 'attack'],
    ['recursive_strike', 'attack'],
    ['smite', 'attack'],
    ['mark', 'attack'],
    ['fission', 'attack'],
    // defuse
    ['neutralizer', 'defuse'],
    ['containment_field', 'defuse'],
    // skip
    ['evade', 'skip'],
    ['mega_evade', 'skip'],
    // nope / cancel
    ['cancel', 'nope'],
    // favor / trade
    ['trade', 'favor'],
    ['tribute', 'favor'],
    ['steal_draw', 'favor'],
    // see / future pack
    ['insight', 'see'],
    ['see_future_5x', 'see'],
    ['reveal_future_3x', 'see'],
    ['share_future_3x', 'see'],
    ['alter_future_3x', 'see'],
    ['alter_future_5x', 'see'],
    ['reorder', 'see'],
    ['draw_bottom', 'see'],
    ['swap_top_bottom', 'see'],
    ['bury', 'see'],
    ['invert', 'see'],
    // combo (collection + wildcard + stash are composite-play)
    ['collection_alpha', 'combo'],
    ['collection_beta', 'combo'],
    ['collection_gamma', 'combo'],
    ['collection_delta', 'combo'],
    ['collection_epsilon', 'combo'],
    ['wildcard', 'combo'],
    ['stash', 'combo'],
    // special (signature / deity / chaos-resolution)
    ['critical_event', 'special'],
    ['omniscience', 'special'],
    ['miracle', 'special'],
    ['rapture', 'special'],
    ['critical_implosion', 'special'],
    ['blackout', 'special'],
  ] as const)('%s → %s', (card, expected) => {
    expect(getCardRole(card)).toBe(expected);
  });

  it('maps every card in ALL_GAME_CARDS explicitly (no silent fallback)', () => {
    for (const card of ALL_GAME_CARDS) {
      expect(getCardRole(card)).toMatch(
        /^(attack|defuse|skip|nope|favor|see|combo|special)$/,
      );
    }
    // Extra guard: every card must have an explicit entry in ROLE_BY_CARD
    // (fallback to 'special' is only for engine-future cards not yet added to types)
    const unexpectedFallbacks = ALL_GAME_CARDS.filter(
      (c) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !((getCardRole as any).__rolesByCard ?? {})[c],
    );
    // If this triggers, an engine-known card is relying on the fallback —
    // the test author should decide its intended role and add it to ROLE_BY_CARD.
    expect(unexpectedFallbacks).toEqual([]);
  });

  it('falls back to special for cards unknown to the engine', () => {
    expect(getCardRole('totally_unknown_card' as never)).toBe('special');
  });
});
