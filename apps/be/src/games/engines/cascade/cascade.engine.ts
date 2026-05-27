import { Injectable, Logger } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../base/game-engine.interface';
import {
  DEFAULT_OPTIONS,
  DIRECTION,
  GAME_PHASE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PENDING,
  STARTING_HAND_SIZE,
  type ActiveColor,
} from './cascade.constants';
import type {
  CascadeCard,
  CascadePlayer,
  CascadeState,
  InitializeConfig,
  NameColorPayload,
  PlayCardPayload,
} from './cascade.types';
import {
  buildDeck,
  isPlayable,
  nextIndex,
  pickStarterIndex,
  shuffle,
} from './cascade.utils';
import {
  validateDraw,
  validateForfeit,
  validateNameColor,
  validatePlayCard,
} from './cascade.validators';

const ACTION = {
  PLAY_CARD: 'play_card',
  DRAW: 'draw',
  NAME_COLOR: 'name_color',
  FORFEIT: 'forfeit',
} as const;

@Injectable()
export class CascadeEngine extends BaseGameEngine<CascadeState> {
  private readonly logger = new Logger(CascadeEngine.name);

  getMetadata(): GameMetadata {
    return {
      gameId: 'cascade_v1',
      name: 'Cascade',
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      version: '1.0.0',
      description:
        'Shedding-type matching card game in the Crazy Eights family, with stacking draw chains and four selectable themes.',
      category: 'Card Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: InitializeConfig,
  ): CascadeState {
    const options = { ...DEFAULT_OPTIONS, ...(config?.options ?? {}) };
    // Mode is the source of truth for stacking. `pure` mode forces stacking
    // off so Draw-Two / Wild +4 immediately resolve; classic + speed keep it
    // on. Any explicit `stackingEnabled` from the lobby is overridden here.
    options.stackingEnabled = options.mode !== 'pure';

    const deck = shuffle(buildDeck());
    const players: CascadePlayer[] = playerIds.map((id) => ({
      playerId: id,
      alive: true,
      hand: deck.splice(0, STARTING_HAND_SIZE),
    }));

    const starterIdx = pickStarterIndex(deck);
    const [starter] = deck.splice(starterIdx, 1);

    const activeColor: ActiveColor =
      starter.color === 'W' ? 'R' : starter.color;

    return {
      phase: GAME_PHASE.PLAYING,
      options,
      players,
      playerOrder: [...playerIds],
      currentTurnIndex: 0,
      direction: DIRECTION.CLOCKWISE,
      drawPile: deck,
      discardPile: [starter],
      topCard: starter,
      activeColor,
      pendingDraw: 0,
      pendingStackKind: null,
      pendingAction: PENDING.NONE,
      winnerId: null,
      logs: [this.createLogEntry('system', 'Cascade started.')],
    };
  }

  validateAction(
    state: CascadeState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (action === ACTION.PLAY_CARD) {
      return validatePlayCard(state, payload as PlayCardPayload, context.userId)
        .ok;
    }
    if (action === ACTION.DRAW) {
      return validateDraw(state, context.userId).ok;
    }
    if (action === ACTION.NAME_COLOR) {
      return validateNameColor(
        state,
        payload as NameColorPayload,
        context.userId,
      ).ok;
    }
    if (action === ACTION.FORFEIT) {
      return validateForfeit(state, context.userId).ok;
    }
    return false;
  }

  executeAction(
    state: CascadeState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<CascadeState> {
    if (action === ACTION.PLAY_CARD) {
      return this.executePlayCard(state, context, payload as PlayCardPayload);
    }
    if (action === ACTION.DRAW) {
      return this.executeDraw(state, context);
    }
    if (action === ACTION.NAME_COLOR) {
      return this.executeNameColor(state, context, payload as NameColorPayload);
    }
    if (action === ACTION.FORFEIT) {
      return this.executeForfeit(state, context);
    }
    return this.errorResult(`Unknown action: ${action}`);
  }

  isGameOver(state: CascadeState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: CascadeState): string[] {
    return state.winnerId ? [state.winnerId] : [];
  }

  sanitizeStateForPlayer(
    state: CascadeState,
    playerId: string,
  ): Partial<CascadeState> {
    return {
      ...state,
      drawPile: [],
      players: state.players.map((p) =>
        p.playerId === playerId
          ? p
          : { ...p, hand: new Array(p.hand.length).fill({}) as CascadeCard[] },
      ),
    };
  }

  getAvailableActions(state: CascadeState, playerId: string): string[] {
    if (state.phase !== GAME_PHASE.PLAYING) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player?.alive) return [];
    const isCurrent = state.playerOrder[state.currentTurnIndex] === playerId;
    if (!isCurrent) return [ACTION.FORFEIT];
    if (state.pendingAction !== PENDING.NONE) {
      return [ACTION.NAME_COLOR, ACTION.FORFEIT];
    }
    return [ACTION.PLAY_CARD, ACTION.DRAW, ACTION.FORFEIT];
  }

  private executePlayCard(
    state: CascadeState,
    context: GameActionContext,
    payload: PlayCardPayload,
  ): GameActionResult<CascadeState> {
    const v = validatePlayCard(state, payload, context.userId);
    if (!v.ok) return this.errorResult(v.error);

    const next = this.cloneState(state);
    const player = next.players.find((p) => p.playerId === context.userId)!;
    const cardIdx = player.hand.findIndex((c) => c.id === payload.cardId);
    const [card] = player.hand.splice(cardIdx, 1);

    next.discardPile.push(card);
    next.topCard = card;

    next.logs.push(
      this.createLogEntry('action', `played ${describeCard(card)}`, {
        senderId: context.userId,
        kind: 'play_card',
      }),
    );

    // Win check before resolving effects — getting to 0 cards ends immediately.
    if (player.hand.length === 0) {
      next.winnerId = player.playerId;
      next.phase = GAME_PHASE.GAME_OVER;
      next.logs.push(
        this.createLogEntry('system', 'A player has emptied their hand.'),
      );
      return this.successResult(next);
    }

    // Color resolution: wilds need a chosen color now, set active immediately.
    if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') {
      next.activeColor = payload.chosenColor as ActiveColor;
    } else if (card.color !== 'W') {
      next.activeColor = card.color;
    }

    // Resolve action effects.
    let skipNext = false;
    if (card.kind === 'SKIP') {
      skipNext = true;
    } else if (card.kind === 'REVERSE') {
      if (next.playerOrder.length === 2) {
        // 2-player reverse acts as a skip.
        skipNext = true;
      } else {
        next.direction = next.direction === 1 ? -1 : 1;
      }
    } else if (card.kind === 'DRAW_TWO') {
      if (next.options.stackingEnabled) {
        next.pendingDraw += 2;
        next.pendingStackKind = 'DRAW_TWO';
        // Pass turn — next player gets the chance to stack or draw.
      } else {
        // Pure mode: next player draws 2 and is skipped immediately.
        this.applyImmediatePenalty(next, 2);
        return this.successResult(next);
      }
    } else if (card.kind === 'WILD_DRAW_FOUR') {
      if (next.options.stackingEnabled) {
        next.pendingDraw += 4;
        next.pendingStackKind = 'WILD_DRAW_FOUR';
      } else {
        this.applyImmediatePenalty(next, 4);
        return this.successResult(next);
      }
    }

    this.stepTurn(next, skipNext ? 1 : 0);
    return this.successResult(next);
  }

  /**
   * Pure-mode penalty: advance to the next player, give them `count` cards,
   * then advance once more (so they're effectively skipped). Both advances
   * go through `stepTurn` so dead-player skipping stays consistent.
   */
  private applyImmediatePenalty(state: CascadeState, count: number) {
    this.stepTurn(state, 0);
    this.drawCards(state, count);
    this.stepTurn(state, 0);
  }

  private executeDraw(
    state: CascadeState,
    context: GameActionContext,
  ): GameActionResult<CascadeState> {
    const v = validateDraw(state, context.userId);
    if (!v.ok) return this.errorResult(v.error);

    const next = this.cloneState(state);

    // Pending stack: drawing concedes — take the pile and lose turn.
    if (next.pendingDraw > 0) {
      const owed = next.pendingDraw;
      this.drawCards(next, owed);
      next.pendingDraw = 0;
      next.pendingStackKind = null;
      next.logs.push(
        this.createLogEntry(
          'action',
          `drew ${owed} from the stack and was skipped`,
          { senderId: context.userId, kind: 'stack_pay' },
        ),
      );
      this.stepTurn(next, 0);
      return this.successResult(next);
    }

    // Normal draw: take 1. If playable, allow client to choose to play; for
    // simplicity we just hand the card over and pass the turn.
    const player = next.players.find((p) => p.playerId === context.userId)!;
    const drawn = this.drawIntoHand(next, player);
    next.logs.push(
      this.createLogEntry('action', `drew a card`, {
        senderId: context.userId,
        kind: 'draw',
      }),
    );

    // If the drawn card is playable, leave the turn with the player so they
    // can either play it or pass with a second 'draw' action — but for v1
    // we keep it simple and always advance.
    void drawn;
    this.stepTurn(next, 0);
    return this.successResult(next);
  }

  private executeNameColor(
    state: CascadeState,
    context: GameActionContext,
    payload: NameColorPayload,
  ): GameActionResult<CascadeState> {
    const v = validateNameColor(state, payload, context.userId);
    if (!v.ok) return this.errorResult(v.error);

    const next = this.cloneState(state);
    next.activeColor = payload.color;
    next.pendingAction = PENDING.NONE;
    next.logs.push(
      this.createLogEntry('action', `named ${payload.color} as active color`, {
        senderId: context.userId,
        kind: 'name_color',
      }),
    );
    return this.successResult(next);
  }

  private executeForfeit(
    state: CascadeState,
    context: GameActionContext,
  ): GameActionResult<CascadeState> {
    const v = validateForfeit(state, context.userId);
    if (!v.ok) return this.errorResult(v.error);

    const next = this.cloneState(state);
    const player = next.players.find((p) => p.playerId === context.userId)!;
    player.alive = false;
    next.logs.push(
      this.createLogEntry('system', 'A player forfeited.', {
        senderId: context.userId,
      }),
    );

    const alive = next.players.filter((p) => p.alive);
    if (alive.length === 1) {
      next.winnerId = alive[0].playerId;
      next.phase = GAME_PHASE.GAME_OVER;
      return this.successResult(next);
    }

    if (next.playerOrder[next.currentTurnIndex] === context.userId) {
      this.stepTurn(next, 0);
    }
    return this.successResult(next);
  }

  // ------- helpers -------

  private stepTurn(state: CascadeState, skip: number) {
    state.currentTurnIndex = nextIndex(
      state.currentTurnIndex,
      state.playerOrder.length,
      state.direction,
      skip,
    );

    // Skip dead players if any (forfeits).
    let guard = state.playerOrder.length;
    while (guard-- > 0) {
      const candidate = state.playerOrder[state.currentTurnIndex];
      const p = state.players.find((pp) => pp.playerId === candidate);
      if (p?.alive) break;
      state.currentTurnIndex = nextIndex(
        state.currentTurnIndex,
        state.playerOrder.length,
        state.direction,
      );
    }
  }

  private drawCards(state: CascadeState, count: number) {
    const currentId = state.playerOrder[state.currentTurnIndex];
    const player = state.players.find((p) => p.playerId === currentId);
    if (!player) return;
    for (let i = 0; i < count; i++) this.drawIntoHand(state, player);
  }

  private drawIntoHand(
    state: CascadeState,
    player: CascadePlayer,
  ): CascadeCard | null {
    if (state.drawPile.length === 0) this.reshuffleFromDiscard(state);
    const card = state.drawPile.shift();
    if (!card) return null;
    player.hand.push(card);
    return card;
  }

  private reshuffleFromDiscard(state: CascadeState) {
    if (state.discardPile.length <= 1) return;
    const top = state.discardPile.pop()!;
    state.drawPile = shuffle(state.discardPile);
    state.discardPile = [top];
    state.logs.push(
      this.createLogEntry('system', 'Discard reshuffled into the draw pile.'),
    );
  }
}

function describeCard(card: CascadeCard): string {
  if (card.kind === 'NUMBER') return `${card.color}${card.value}`;
  if (card.kind === 'WILD') return 'Wild';
  if (card.kind === 'WILD_DRAW_FOUR') return 'Wild +4';
  return `${card.color} ${card.kind}`;
}

void isPlayable; // keep import warm for tree-shake guard
