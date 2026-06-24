import { CascadeEngine } from './cascade.engine';
import { GAME_PHASE, PENDING } from './cascade.constants';
import type { GameActionContext } from '../base/game-engine.interface';
import type { CascadeCard, CascadeState } from './cascade.types';

const engine = new CascadeEngine();

function ctx(
  userId: string,
  overrides: Partial<GameActionContext> = {},
): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
    ...overrides,
  };
}

/** Find a card in a player's hand matching predicate; returns id. */
function findCardId(
  state: CascadeState,
  playerId: string,
  pred: (c: CascadeCard) => boolean,
): string | undefined {
  return state.players.find((p) => p.playerId === playerId)?.hand.find(pred)
    ?.id;
}

/** Inject a card into a player's hand for deterministic tests. */
function injectCard(
  state: CascadeState,
  playerId: string,
  card: CascadeCard,
): CascadeState {
  const next = structuredClone(state);
  const p = next.players.find((pp) => pp.playerId === playerId)!;
  p.hand.unshift(card);
  return next;
}

describe('CascadeEngine', () => {
  describe('initializeState', () => {
    it('deals 7 cards per player and seeds the discard pile with a number card', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      expect(state.players).toHaveLength(2);
      expect(state.players[0].hand).toHaveLength(7);
      expect(state.players[1].hand).toHaveLength(7);
      expect(state.discardPile).toHaveLength(1);
      expect(state.topCard.kind).toBe('NUMBER');
      // 108 - 14 (hands) - 1 (top) = 93 in draw pile.
      expect(state.drawPile).toHaveLength(93);
      expect(state.currentTurnIndex).toBe(0);
      expect(state.direction).toBe(1);
      expect(state.pendingDraw).toBe(0);
      expect(state.pendingAction).toBe(PENDING.NONE);
    });

    it('mode is the source of truth for stackingEnabled — a bare stackingEnabled=false is ignored without mode=pure', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { stackingEnabled: false },
      });
      // No mode supplied → defaults to classic → stacking back on.
      expect(state.options.stackingEnabled).toBe(true);
    });
  });

  describe('play_card', () => {
    it('rejects play of a non-matching card', () => {
      let state = engine.initializeState(['a', 'b']);
      // Force top to R5 so only red or 5s play.
      state = {
        ...state,
        topCard: {
          id: 't',
          color: 'R',
          kind: 'NUMBER',
          value: 5,
        },
        activeColor: 'R',
      };
      const inj = injectCard(state, 'a', {
        id: 'mismatch',
        color: 'B',
        kind: 'NUMBER',
        value: 2,
      });
      const res = engine.executeAction(inj, 'play_card', ctx('a'), {
        cardId: 'mismatch',
      });
      expect(res.success).toBe(false);
    });

    it('accepts a color-matching play and updates the top card', () => {
      let state = engine.initializeState(['a', 'b']);
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 5 },
        activeColor: 'R',
      };
      state = injectCard(state, 'a', {
        id: 'r3',
        color: 'R',
        kind: 'NUMBER',
        value: 3,
      });
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'r3',
      });
      expect(res.success).toBe(true);
      expect(res.state!.topCard.id).toBe('r3');
      expect(res.state!.activeColor).toBe('R');
      expect(res.state!.currentTurnIndex).toBe(1);
    });

    it('skip card jumps the next player', () => {
      let state = engine.initializeState(['a', 'b', 'c']);
      state = {
        ...state,
        topCard: { id: 't', color: 'G', kind: 'NUMBER', value: 1 },
        activeColor: 'G',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'g-skip',
        color: 'G',
        kind: 'SKIP',
      });
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'g-skip',
      });
      expect(res.success).toBe(true);
      // b is skipped, so c (index 2) is up next.
      expect(res.state!.currentTurnIndex).toBe(2);
    });

    it('reverse in a 2-player game acts as a skip', () => {
      let state = engine.initializeState(['a', 'b']);
      state = {
        ...state,
        topCard: { id: 't', color: 'Y', kind: 'NUMBER', value: 4 },
        activeColor: 'Y',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'y-rev',
        color: 'Y',
        kind: 'REVERSE',
      });
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'y-rev',
      });
      expect(res.success).toBe(true);
      // a plays again
      expect(res.state!.currentTurnIndex).toBe(0);
    });

    it('reverse in a 3+ player game flips direction', () => {
      let state = engine.initializeState(['a', 'b', 'c']);
      state = {
        ...state,
        topCard: { id: 't', color: 'B', kind: 'NUMBER', value: 2 },
        activeColor: 'B',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'b-rev',
        color: 'B',
        kind: 'REVERSE',
      });
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'b-rev',
      });
      expect(res.success).toBe(true);
      expect(res.state!.direction).toBe(-1);
      // Going counter-clockwise, c (index 2) plays next.
      expect(res.state!.currentTurnIndex).toBe(2);
    });

    it('draw-two starts a stack penalty', () => {
      let state = engine.initializeState(['a', 'b']);
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
        activeColor: 'R',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'r-d2',
        color: 'R',
        kind: 'DRAW_TWO',
      });
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'r-d2',
      });
      expect(res.success).toBe(true);
      expect(res.state!.pendingDraw).toBe(2);
      expect(res.state!.pendingStackKind).toBe('DRAW_TWO');
      expect(res.state!.currentTurnIndex).toBe(1);
    });

    it('multi-step DRAW_TWO chain accumulates pendingDraw across players', () => {
      let state = engine.initializeState(['a', 'b', 'c']);
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
        activeColor: 'R',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'a-d2',
        color: 'R',
        kind: 'DRAW_TWO',
      });
      state = injectCard(state, 'b', {
        id: 'b-d2',
        color: 'G',
        kind: 'DRAW_TWO',
      });

      // A stacks → B can stack with ANY color D2 (cross-color stack allowed).
      let res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'a-d2',
      });
      expect(res.success).toBe(true);
      expect(res.state!.pendingDraw).toBe(2);
      expect(res.state!.currentTurnIndex).toBe(1);

      res = engine.executeAction(res.state!, 'play_card', ctx('b'), {
        cardId: 'b-d2',
      });
      expect(res.success).toBe(true);
      expect(res.state!.pendingDraw).toBe(4);
      expect(res.state!.pendingStackKind).toBe('DRAW_TWO');
      expect(res.state!.currentTurnIndex).toBe(2);
    });

    it('WILD_DRAW_FOUR stacks only onto another WILD_DRAW_FOUR', () => {
      let state = engine.initializeState(['a', 'b']);
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
        activeColor: 'R',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'a-w4',
        color: 'W',
        kind: 'WILD_DRAW_FOUR',
      });
      state = injectCard(state, 'b', {
        id: 'b-w4',
        color: 'W',
        kind: 'WILD_DRAW_FOUR',
      });
      state = injectCard(state, 'b', {
        id: 'b-d2',
        color: 'R',
        kind: 'DRAW_TWO',
      });

      // A plays Wild +4, names B as active color.
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'a-w4',
        chosenColor: 'B',
      });
      expect(res.success).toBe(true);
      expect(res.state!.pendingDraw).toBe(4);
      expect(res.state!.pendingStackKind).toBe('WILD_DRAW_FOUR');
      expect(res.state!.activeColor).toBe('B');

      // B tries to cross-stack with DRAW_TWO — must be rejected.
      const crossStack = engine.executeAction(
        res.state!,
        'play_card',
        ctx('b'),
        { cardId: 'b-d2' },
      );
      expect(crossStack.success).toBe(false);

      // B legally stacks another WD4 → pendingDraw climbs to 8.
      const okStack = engine.executeAction(res.state!, 'play_card', ctx('b'), {
        cardId: 'b-w4',
        chosenColor: 'G',
      });
      expect(okStack.success).toBe(true);
      expect(okStack.state!.pendingDraw).toBe(8);
      expect(okStack.state!.activeColor).toBe('G');
      expect(okStack.state!.currentTurnIndex).toBe(0);
    });

    it('cross-stack rejected: DRAW_TWO cannot be played onto a WILD_DRAW_FOUR stack', () => {
      let state = engine.initializeState(['a', 'b']);
      state = {
        ...state,
        topCard: { id: 't', color: 'W', kind: 'WILD_DRAW_FOUR' },
        activeColor: 'R',
        pendingDraw: 4,
        pendingStackKind: 'WILD_DRAW_FOUR',
        currentTurnIndex: 1,
      };
      state = injectCard(state, 'b', {
        id: 'b-d2',
        color: 'R',
        kind: 'DRAW_TWO',
      });
      const res = engine.executeAction(state, 'play_card', ctx('b'), {
        cardId: 'b-d2',
      });
      expect(res.success).toBe(false);
    });

    it('pure mode: DRAW_TWO immediately gives next player 2 cards and skips them', () => {
      let state = engine.initializeState(['a', 'b', 'c'], {
        options: { mode: 'pure' },
      });
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
        activeColor: 'R',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'a-d2',
        color: 'R',
        kind: 'DRAW_TWO',
      });
      const bBefore = state.players[1].hand.length;
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'a-d2',
      });
      expect(res.success).toBe(true);
      // Pending state never sticks in pure mode.
      expect(res.state!.pendingDraw).toBe(0);
      expect(res.state!.pendingStackKind).toBe(null);
      // B received 2 cards.
      expect(res.state!.players[1].hand.length).toBe(bBefore + 2);
      // B was skipped — turn is now C.
      expect(res.state!.currentTurnIndex).toBe(2);
    });

    it('pure mode: WILD_DRAW_FOUR immediately gives next player 4 cards and skips them', () => {
      let state = engine.initializeState(['a', 'b'], {
        options: { mode: 'pure' },
      });
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
        activeColor: 'R',
        currentTurnIndex: 0,
      };
      state = injectCard(state, 'a', {
        id: 'a-w4',
        color: 'W',
        kind: 'WILD_DRAW_FOUR',
      });
      const bBefore = state.players[1].hand.length;
      const res = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'a-w4',
        chosenColor: 'B',
      });
      expect(res.success).toBe(true);
      expect(res.state!.pendingDraw).toBe(0);
      expect(res.state!.activeColor).toBe('B');
      expect(res.state!.players[1].hand.length).toBe(bBefore + 4);
      // 2-player pure mode → B drew + was skipped → back to A.
      expect(res.state!.currentTurnIndex).toBe(0);
    });

    it('stack-then-pay: drawing while pendingDraw>0 takes the pile', () => {
      let state = engine.initializeState(['a', 'b']);
      state = {
        ...state,
        topCard: { id: 't', color: 'R', kind: 'DRAW_TWO' },
        activeColor: 'R',
        pendingDraw: 4,
        pendingStackKind: 'DRAW_TWO',
        currentTurnIndex: 1,
      };
      const handBefore = state.players[1].hand.length;
      const res = engine.executeAction(state, 'draw', ctx('b'));
      expect(res.success).toBe(true);
      expect(res.state!.pendingDraw).toBe(0);
      expect(res.state!.pendingStackKind).toBe(null);
      expect(res.state!.players[1].hand.length).toBe(handBefore + 4);
      // b is skipped — a plays next.
      expect(res.state!.currentTurnIndex).toBe(0);
    });

    it('wild requires chosenColor and sets activeColor', () => {
      let state = engine.initializeState(['a', 'b']);
      state = injectCard(state, 'a', {
        id: 'w',
        color: 'W',
        kind: 'WILD',
      });
      const missing = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'w',
      });
      expect(missing.success).toBe(false);

      const ok = engine.executeAction(state, 'play_card', ctx('a'), {
        cardId: 'w',
        chosenColor: 'G',
      });
      expect(ok.success).toBe(true);
      expect(ok.state!.activeColor).toBe('G');
    });

    it('winning emptying the hand ends the game', () => {
      const state = engine.initializeState(['a', 'b']);
      // Replace a's hand with a single playable card.
      const next = structuredClone(state);
      next.players[0].hand = [
        { id: 'last', color: next.activeColor, kind: 'NUMBER', value: 0 },
      ];
      const res = engine.executeAction(next, 'play_card', ctx('a'), {
        cardId: 'last',
      });
      expect(res.success).toBe(true);
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerId).toBe('a');
    });
  });

  describe('forfeit', () => {
    it('marks the player out and ends with last-survivor win in 2p', () => {
      const state = engine.initializeState(['a', 'b']);
      const res = engine.executeAction(state, 'forfeit', ctx('a'));
      expect(res.success).toBe(true);
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerId).toBe('b');
    });
  });

  describe('modes', () => {
    it('classic mode keeps stacking enabled', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'classic' },
      });
      expect(state.options.mode).toBe('classic');
      expect(state.options.stackingEnabled).toBe(true);
    });

    it('pure mode forces stacking off even if stackingEnabled was set true', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'pure', stackingEnabled: true },
      });
      expect(state.options.mode).toBe('pure');
      expect(state.options.stackingEnabled).toBe(false);
    });

    it('speed mode keeps stacking enabled (clock is service-driven)', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'speed' },
      });
      expect(state.options.mode).toBe('speed');
      expect(state.options.stackingEnabled).toBe(true);
    });

    it('default mode is classic when nothing is supplied', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(state.options.mode).toBe('classic');
      expect(state.options.stackingEnabled).toBe(true);
    });
  });

  // Last-Card race (Cascade call) tests live in cascade.engine.last-card.spec.ts
  // — extracted to keep this file under the 500-line check-file-length limit.

  describe('sanitizeStateForPlayer', () => {
    it('hides other players hand contents but preserves counts', () => {
      const state = engine.initializeState(['a', 'b']);
      const sanitized = engine.sanitizeStateForPlayer(
        state,
        'a',
      ) as CascadeState;
      const aHand = sanitized.players[0].hand;
      const bHand = sanitized.players[1].hand;
      expect(aHand[0].kind).toBeDefined();
      expect(bHand).toHaveLength(7);
      expect(bHand[0].kind).toBeUndefined();
      expect(sanitized.drawPile).toEqual([]);
    });
  });

  // suppress unused
  void findCardId;
});
