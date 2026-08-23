import { PachisiEngine } from '../engines/pachisi/pachisi.engine';
import { GAME_PHASE } from '../engines/pachisi/pachisi.constants';
import type { PachisiState } from '../engines/pachisi/pachisi.types';
import { PachisiBotService } from './pachisi-bot.service';

describe('PachisiBotService', () => {
  const botId = 'bot-1';
  const humanId = 'player-1';
  let bot: PachisiBotService;

  const makeState = (overrides: Partial<PachisiState> = {}): PachisiState => {
    const engine = new PachisiEngine();
    const state = engine.initializeState([humanId, botId]);
    state.currentTurnIndex = 1;
    return Object.assign(state, overrides);
  };

  beforeEach(() => {
    bot = new PachisiBotService(
      {} as ConstructorParameters<typeof PachisiBotService>[0],
    );
  });

  it('returns null when there are no legal moves', () => {
    // All tokens in the yard and no six rolled.
    const state = makeState({ die: 3, phase: GAME_PHASE.MOVE });
    expect(bot.pickMove(state, botId)).toBeNull();
  });

  it('easy difficulty returns a legal move (random)', () => {
    const state = makeState({
      die: 6,
      phase: GAME_PHASE.MOVE,
      options: { ...makeState().options, aiDifficulty: 'easy' },
    });
    const pick = bot.pickMove(state, botId);
    expect(pick).not.toBeNull();
    expect([0, 1, 2, 3]).toContain(pick!.tokenId);
  });

  it('medium difficulty exits the yard on a six', () => {
    const state = makeState({ die: 6, phase: GAME_PHASE.MOVE });
    // Put one token already on the board to make exit-vs-advance comparable.
    state.tokens[botId][0].progress = 10;
    const pick = bot.pickMove(state, botId);
    expect(pick).not.toBeNull();
  });

  it('hard difficulty prefers finishing a token over advancing', () => {
    const state = makeState({
      die: 2,
      phase: GAME_PHASE.MOVE,
      options: { ...makeState().options, aiDifficulty: 'hard' },
    });
    state.tokens[botId][0].progress = 10; // advance only
    state.tokens[botId][1].progress = 54; // can finish with a 2
    state.tokens[botId][2].progress = -1;
    state.tokens[botId][3].progress = -1;

    const pick = bot.pickMove(state, botId);
    expect(pick?.tokenId).toBe(1);
  });

  it('hard difficulty prefers exiting the yard on a six over small advances', () => {
    const state = makeState({
      die: 6,
      phase: GAME_PHASE.MOVE,
      options: { ...makeState().options, aiDifficulty: 'hard' },
    });
    state.tokens[botId][0].progress = 4; // advance by 6
    state.tokens[botId][1].progress = -1; // exit
    const pick = bot.pickMove(state, botId);
    expect(pick).not.toBeNull();
    // Exit scores 55 + progress/4 vs advance ~5.5 — exit must win.
    expect(pick?.tokenId).toBe(1);
  });

  it('hard difficulty captures whenever possible', () => {
    const state = makeState({
      die: 1,
      phase: GAME_PHASE.MOVE,
      options: { ...makeState().options, aiDifficulty: 'hard' },
    });
    // Bot is seat 2 (start 26); victim at abs cell 30 → progress 4.
    state.tokens[botId][0].progress = 3;
    state.tokens[humanId][0].progress = 4;
    const pick = bot.pickMove(state, botId);
    expect(pick?.tokenId).toBe(0);
  });

  it('expert difficulty also finishes when available', () => {
    const state = makeState({
      die: 1,
      phase: GAME_PHASE.MOVE,
      options: { ...makeState().options, aiDifficulty: 'expert' },
    });
    state.tokens[botId][0].progress = 55;
    const pick = bot.pickMove(state, botId);
    expect(pick?.tokenId).toBe(0);
  });
});
