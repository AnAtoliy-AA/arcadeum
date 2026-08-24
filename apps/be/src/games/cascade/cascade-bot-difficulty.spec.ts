import { CascadeBotService } from './cascade-bot.service';
import type { CascadeService } from './cascade.service';
import type {
  CascadeCard,
  CascadeState,
} from '../engines/cascade/cascade.types';

const bot = new CascadeBotService({} as unknown as CascadeService);

function stateWithDifficulty(
  aiDifficulty: CascadeState['options']['aiDifficulty'],
  hand: CascadeState['players'][0]['hand'],
): CascadeState {
  return {
    phase: 'playing',
    options: {
      variant: 'cosmic',
      mode: 'classic',
      stackingEnabled: true,
      lastCardCallEnabled: true,
      aiDifficulty,
    },
    players: [
      { playerId: 'bot-1', alive: true, hand },
      { playerId: 'b', alive: true, hand: [] },
    ],
    playerOrder: ['bot-1', 'b'],
    currentTurnIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [{ id: 'top', color: 'R', kind: 'NUMBER', value: 5 }],
    topCard: { id: 'top', color: 'R', kind: 'NUMBER', value: 5 },
    activeColor: 'R',
    lastCardWindow: null,
    pendingDraw: 0,
    pendingStackKind: null,
    pendingAction: 'none',
    winnerId: null,
    logs: [],
  };
}

describe('CascadeBotService difficulty tiers', () => {
  it('expert always plays the dominant color match (deterministic)', () => {
    const hand: CascadeCard[] = [
      { id: 'r3', color: 'R', kind: 'NUMBER' as const, value: 3 },
      { id: 'r-skip', color: 'R', kind: 'SKIP' as const },
      { id: 'b9', color: 'B', kind: 'NUMBER' as const, value: 9 },
    ];
    for (let i = 0; i < 50; i++) {
      const move = bot.pickMove(stateWithDifficulty('expert', hand), 'bot-1');
      expect(move).not.toBeNull();
      if (move && move.type === 'play') expect(move.cardId).toMatch(/^r/);
    }
  });

  it('expert prefers a plain Wild over Wild Draw Four', () => {
    const hand: CascadeCard[] = [
      { id: 'wild', color: 'W' as const, kind: 'WILD' as const },
      { id: 'wd4', color: 'W' as const, kind: 'WILD_DRAW_FOUR' as const },
      { id: 'b1', color: 'B' as const, kind: 'NUMBER' as const, value: 1 },
      { id: 'b2', color: 'B' as const, kind: 'NUMBER' as const, value: 2 },
    ];
    for (let i = 0; i < 50; i++) {
      const move = bot.pickMove(stateWithDifficulty('expert', hand), 'bot-1');
      expect(move).not.toBeNull();
      if (move && move.type === 'play') {
        expect(move.cardId).toBe('wild');
        expect(move.chosenColor).toBe('B');
      }
    }
  });

  it('easy sometimes draws even with a legal play in hand', () => {
    const hand: CascadeCard[] = [
      { id: 'r3', color: 'R', kind: 'NUMBER' as const, value: 3 },
      { id: 'b9', color: 'B' as const, kind: 'NUMBER' as const, value: 9 },
    ];
    let draws = 0;
    const trials = 120;
    for (let i = 0; i < trials; i++) {
      const move = bot.pickMove(stateWithDifficulty('easy', hand), 'bot-1');
      if (move?.type === 'draw') draws++;
    }
    // Easy has a 40% draw tendency inside the 50% mistake window — it must
    // draw at least once and also play sometimes.
    expect(draws).toBeGreaterThan(0);
    expect(draws).toBeLessThan(trials);
  });

  it('easy always returns a valid play or draw (never null)', () => {
    const hand: CascadeCard[] = [
      { id: 'r3', color: 'R', kind: 'NUMBER' as const, value: 3 },
      { id: 'g5', color: 'G' as const, kind: 'NUMBER' as const, value: 5 },
    ];
    for (let i = 0; i < 50; i++) {
      const move = bot.pickMove(stateWithDifficulty('easy', hand), 'bot-1');
      expect(move).not.toBeNull();
      if (move?.type === 'play') expect(['r3', 'g5']).toContain(move.cardId);
    }
  });
});
