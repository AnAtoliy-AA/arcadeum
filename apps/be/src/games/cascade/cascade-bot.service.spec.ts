import { CascadeBotService } from './cascade-bot.service';
import type { CascadeService } from './cascade.service';
import type {
  CascadeCard,
  CascadeState,
} from '../engines/cascade/cascade.types';

// We exercise only the pure pickMove strategy. The forwardRef on CascadeService
// is never invoked, so an empty stub is enough.
const bot = new CascadeBotService({} as unknown as CascadeService);

function baseState(overrides: Partial<CascadeState> = {}): CascadeState {
  return {
    phase: 'playing',
    options: {
      variant: 'cosmic',
      mode: 'classic',
      stackingEnabled: true,
      lastCardCallEnabled: true,
    },
    players: [
      { playerId: 'bot-1', alive: true, hand: [] },
      { playerId: 'b', alive: true, hand: [] },
    ],
    playerOrder: ['bot-1', 'b'],
    currentTurnIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [
      { id: 'top', color: 'R', kind: 'NUMBER', value: 5 } as CascadeCard,
    ],
    topCard: { id: 'top', color: 'R', kind: 'NUMBER', value: 5 } as CascadeCard,
    activeColor: 'R',
    lastCardWindow: null,
    pendingDraw: 0,
    pendingStackKind: null,
    pendingAction: 'none',
    winnerId: null,
    logs: [],
    ...overrides,
  };
}

describe('CascadeBotService.pickMove', () => {
  it('draws when no playable card is in hand', () => {
    const state = baseState();
    state.players[0].hand = [
      { id: 'a', color: 'B', kind: 'NUMBER', value: 3 },
      { id: 'b', color: 'G', kind: 'NUMBER', value: 7 },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ type: 'draw' });
  });

  it('prefers a color-matching card over a wild', () => {
    const state = baseState();
    state.players[0].hand = [
      { id: 'r3', color: 'R', kind: 'NUMBER', value: 3 },
      { id: 'w', color: 'W', kind: 'WILD' },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ type: 'play', cardId: 'r3' });
  });

  it('prefers a color matching the dominant color in hand', () => {
    const state = baseState();
    state.players[0].hand = [
      // Two playable R matches; bot holds 3 R cards so should keep playing R.
      { id: 'r3', color: 'R', kind: 'NUMBER', value: 3 },
      { id: 'r-skip', color: 'R', kind: 'SKIP' },
      { id: 'r-d2', color: 'R', kind: 'DRAW_TWO' },
      { id: 'b-only', color: 'B', kind: 'NUMBER', value: 9 },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).not.toBeNull();
    if (move && move.type === 'play') {
      // Any R card is valid — we just want it to not pick the B-only.
      expect(move.cardId).toMatch(/^r/);
    }
  });

  it('falls back to a value match when no color match exists', () => {
    const state = baseState();
    // Active color is R5 — only a 5 of another color matches.
    state.players[0].hand = [
      { id: 'b3', color: 'B', kind: 'NUMBER', value: 3 },
      { id: 'g5', color: 'G', kind: 'NUMBER', value: 5 },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ type: 'play', cardId: 'g5' });
  });

  it('plays a regular Wild before Wild Draw-Four when both are options', () => {
    const state = baseState();
    state.players[0].hand = [
      { id: 'wild', color: 'W', kind: 'WILD' },
      { id: 'wd4', color: 'W', kind: 'WILD_DRAW_FOUR' },
      // Bot holds two B cards — should name B.
      { id: 'b1', color: 'B', kind: 'NUMBER', value: 1 },
      { id: 'b2', color: 'B', kind: 'NUMBER', value: 2 },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).not.toBeNull();
    if (move && move.type === 'play') {
      expect(move.cardId).toBe('wild');
      expect(move.chosenColor).toBe('B');
    }
  });

  it('under a Draw-Two stack, only Draw-Two cards are playable', () => {
    const state = baseState({
      pendingDraw: 2,
      pendingStackKind: 'DRAW_TWO',
    });
    state.players[0].hand = [
      { id: 'r3', color: 'R', kind: 'NUMBER', value: 3 },
      { id: 'g-d2', color: 'G', kind: 'DRAW_TWO' },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ type: 'play', cardId: 'g-d2' });
  });

  it('under a stack with no stackable card in hand, the bot draws', () => {
    const state = baseState({
      pendingDraw: 4,
      pendingStackKind: 'WILD_DRAW_FOUR',
    });
    state.players[0].hand = [
      { id: 'r3', color: 'R', kind: 'NUMBER', value: 3 },
      { id: 'wild', color: 'W', kind: 'WILD' },
    ];
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ type: 'draw' });
  });
});
