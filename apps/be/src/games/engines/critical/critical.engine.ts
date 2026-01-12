import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
  CriticalExpansion,
  createInitialCriticalState,
} from '../../critical/critical.state';
import { CriticalLogic, executeNope } from './critical-logic.utils';
import {
  executeTargetedAttack,
  executePersonalAttack,
  executeAttackOfTheDead,
  executeSuperSkip,
  executeReverse,
} from './critical-attack.utils';
import {
  hasCard,
  validatePlayCard,
  validateCatCombo,
  validateFavor,
  validateGiveFavorCard,
  canPlayCatCombo,
} from './critical-validation.utils';
import { executeFavor, executeGiveFavorCard } from './critical-favor.utils';

// Payload interfaces for type-safe action handling
interface PlayCardPayload {
  card?: CriticalCard;
}

interface PlayCatComboPayload {
  cards?: CriticalCard[];
  targetPlayerId?: string;
  selectedIndex?: number; // For pair combos - blind pick a card position
  requestedCard?: CriticalCard; // For trio combos - name a card to steal
  requestedDiscardCard?: CriticalCard; // For fiver combos - pick from discard pile
}

interface FavorPayload {
  targetPlayerId?: string;
}

// Type with required fields for executing favor action
type FavorExecutePayload = Required<FavorPayload>;

interface GiveFavorCardPayload {
  cardToGive?: CriticalCard;
}

interface DefusePayload {
  position?: number;
}

type CriticalPayload = PlayCardPayload &
  PlayCatComboPayload &
  FavorPayload &
  GiveFavorCardPayload &
  DefusePayload;

/**
 * Critical Game Engine
 * Implements all game logic for Critical
 */
@Injectable()
export class CriticalEngine extends BaseGameEngine<CriticalState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'critical_v1',
      name: 'Critical',
      minPlayers: 2,
      maxPlayers: 5,
      version: '1.0.0',
      description: 'A kitty-powered version of Russian Roulette',
      category: 'Card Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: Record<string, unknown>,
  ): CriticalState {
    const expansions =
      (config?.expansions as CriticalExpansion[] | undefined) ?? [];
    const allowActionCardCombos =
      (config?.allowActionCardCombos as boolean | undefined) ?? false;
    return createInitialCriticalState(
      playerIds,
      expansions,
      allowActionCardCombos,
    );
  }

  validateAction(
    state: CriticalState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const player = this.findPlayer(
      state,
      context.userId,
    ) as CriticalPlayerState;

    if (!player || !player.alive) {
      return false;
    }

    // give_favor_card can be done by target player even when not their turn
    if (action === 'give_favor_card') {
      const typedPayload = payload as CriticalPayload | undefined;
      return validateGiveFavorCard(state, context.userId, player, typedPayload);
    }

    // play_nope can be played by ANY alive player when there's a pending action
    if (action === 'play_nope') {
      // Must have a pending action to nope
      if (!state.pendingAction) return false;
      // Must have a nope card
      return hasCard(player, 'nope');
    }

    // Exception: play_card with 'nope' acts like play_nope
    const checkPayload = payload as CriticalPayload | undefined;
    if (action === 'play_card' && checkPayload?.card === 'nope') {
      if (!state.pendingAction) return false;
      return hasCard(player, 'nope');
    }

    // All other actions require it to be the player's turn
    if (!this.isPlayerTurn(state, context.userId)) {
      return false;
    }

    // If there's a pending favor, block all other actions until it's resolved
    // The current player must wait for the opponent to give a card
    if (state.pendingFavor) {
      return false;
    }

    // If player must defuse, only allow defuse action
    if (state.pendingDefuse === context.userId && action !== 'defuse') {
      return false;
    }

    const typedPayload = payload as CriticalPayload | undefined;

    switch (action) {
      case 'draw_card':
        // Can't draw if must defuse
        if (state.pendingDefuse) return false;
        // Always allow draw when it's player's turn (checked above)
        // executeAction will auto-fix pendingDraws to 1 if it's 0
        return true;

      case 'play_card':
        return validatePlayCard(state, player, typedPayload?.card);

      case 'play_cat_combo':
        return validateCatCombo(
          player,
          typedPayload?.cards,
          state.allowActionCardCombos,
        );

      case 'see_the_future':
        return hasCard(player, 'see_the_future');

      case 'favor': {
        const target = typedPayload?.targetPlayerId
          ? (this.findPlayer(
              state,
              typedPayload.targetPlayerId,
            ) as CriticalPlayerState)
          : null;
        return validateFavor(state, player, target, typedPayload);
      }

      case 'give_favor_card':
        return validateGiveFavorCard(
          state,
          context.userId,
          player,
          typedPayload,
        );

      case 'defuse':
        // Can only defuse if pendingDefuse is set for this player
        return (
          state.pendingDefuse === context.userId &&
          hasCard(player, 'defuse') &&
          typedPayload?.position !== undefined
        );

      // Attack Pack cards
      case 'targeted_attack':
        return (
          hasCard(player, 'targeted_attack') &&
          state.pendingDraws > 0 &&
          !!typedPayload?.targetPlayerId
        );

      case 'personal_attack':
        return hasCard(player, 'personal_attack') && state.pendingDraws > 0;

      case 'attack_of_the_dead':
        return hasCard(player, 'attack_of_the_dead') && state.pendingDraws > 0;

      case 'super_skip':
        return hasCard(player, 'super_skip') && state.pendingDraws > 0;

      case 'reverse':
        return hasCard(player, 'reverse') && state.pendingDraws > 0;

      default:
        return false;
    }
  }

  executeAction(
    state: CriticalState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<CriticalState> {
    // Auto-fix legacy state where pendingDraws is 0 at start of turn
    if (
      action === 'draw_card' &&
      state.pendingDraws === 0 &&
      this.isPlayerTurn(state, context.userId)
    ) {
      state.pendingDraws = 1;
    }

    if (!this.validateAction(state, action, context, payload)) {
      return this.errorResult('Invalid action');
    }

    const newState = this.cloneState(state);
    const typedPayload = payload as CriticalPayload | undefined;

    // Use arrow functions instead of bind() to preserve type safety
    const helpers = {
      addLog: (
        state: CriticalState,
        log: ReturnType<typeof this.createLogEntry>,
      ) => this.addLog(state, log),
      createLogEntry: this.createLogEntry.bind(
        this,
      ) as typeof this.createLogEntry,
      advanceTurn: (state: CriticalState) => this.advanceTurn(state),
      shuffleArray: <T>(arr: T[]) => this.shuffleArray(arr),
    };

    switch (action) {
      case 'draw_card':
        return CriticalLogic.executeDrawCard(newState, context.userId, helpers);

      case 'play_card':
        return CriticalLogic.executePlayCard(
          newState,
          context.userId,
          typedPayload!.card!,
          helpers,
        );

      case 'play_cat_combo':
        return CriticalLogic.executeCatCombo(
          newState,
          context.userId,
          typedPayload!.cards!,
          typedPayload?.targetPlayerId ?? null,
          helpers,
          typedPayload?.selectedIndex,
          typedPayload?.requestedCard,
          typedPayload?.requestedDiscardCard,
        );

      case 'see_the_future':
        return CriticalLogic.executeSeeTheFuture(
          newState,
          context.userId,
          helpers,
        );

      case 'favor':
        return executeFavor(
          newState,
          context.userId,
          typedPayload as FavorExecutePayload,
          helpers,
        );

      case 'give_favor_card':
        return executeGiveFavorCard(
          newState,
          context.userId,
          { cardToGive: typedPayload!.cardToGive! },
          helpers,
        );

      case 'defuse':
        return CriticalLogic.executeDefuse(
          newState,
          context.userId,
          typedPayload!.position!,
          helpers,
        );

      case 'play_nope':
        return executeNope(newState, context.userId, helpers);

      // ===== ATTACK PACK EXPANSION CARDS =====
      case 'targeted_attack':
        return executeTargetedAttack(
          newState,
          context.userId,
          typedPayload!.targetPlayerId!,
          helpers,
        );

      case 'personal_attack':
        return executePersonalAttack(newState, context.userId, helpers);

      case 'attack_of_the_dead':
        return executeAttackOfTheDead(newState, context.userId, helpers);

      case 'super_skip':
        return executeSuperSkip(newState, context.userId, helpers);

      case 'reverse':
        return executeReverse(newState, context.userId, helpers);

      default:
        return this.errorResult('Unknown action');
    }
  }

  isGameOver(state: CriticalState): boolean {
    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.length <= 1;
  }

  getWinners(state: CriticalState): string[] {
    if (!this.isGameOver(state)) {
      return [];
    }

    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.map((p) => p.playerId);
  }

  sanitizeStateForPlayer(
    state: CriticalState,
    playerId: string,
  ): Partial<CriticalState> {
    const sanitized = this.cloneState(state);

    // Check if player is an actual game participant
    const isPlayer = sanitized.players.some((p) => p.playerId === playerId);

    // Hide other players' hands
    sanitized.players = sanitized.players.map((p) => {
      if (p.playerId === playerId) {
        return p; // Show full hand to the player
      }
      return {
        ...p,
        hand: p.hand.map(() => 'hidden' as CriticalCard), // Hide cards
      };
    });

    // Filter logs based on scope and player status
    sanitized.logs = sanitized.logs.filter((log) => {
      // Public messages visible to everyone (players + spectators)
      if (log.scope === 'all' || log.scope === undefined) return true;
      // Player-only messages visible only to game participants
      if (log.scope === 'players' && isPlayer) return true;
      // Private messages only visible to sender
      if (log.scope === 'private' && log.senderId === playerId) return true;
      return false;
    });

    // Partially hide deck (show count only)
    sanitized.deck = new Array<CriticalCard>(state.deck.length).fill(
      'hidden' as CriticalCard,
    );

    return sanitized;
  }

  getAvailableActions(state: CriticalState, playerId: string): string[] {
    const player = this.findPlayer(state, playerId) as CriticalPlayerState;
    if (!player || !player.alive || !this.isPlayerTurn(state, playerId)) {
      return [];
    }

    // If player must defuse, that's the only available action
    if (state.pendingDefuse === playerId) {
      return ['defuse'];
    }

    const actions: string[] = [];

    if (state.pendingDraws > 0) {
      actions.push('draw_card');
    } else {
      // Can play action cards
      if (hasCard(player, 'attack')) actions.push('play_card:attack');
      if (hasCard(player, 'skip')) actions.push('play_card:skip');
      if (hasCard(player, 'shuffle')) actions.push('play_card:shuffle');
      if (hasCard(player, 'see_the_future')) actions.push('see_the_future');
      if (hasCard(player, 'favor')) actions.push('favor');

      // Attack Pack
      if (hasCard(player, 'targeted_attack'))
        actions.push('play_card:targeted_attack');
      if (hasCard(player, 'personal_attack'))
        actions.push('play_card:personal_attack');
      if (hasCard(player, 'attack_of_the_dead'))
        actions.push('play_card:attack_of_the_dead');
      if (hasCard(player, 'super_skip')) actions.push('play_card:super_skip');
      if (hasCard(player, 'reverse')) actions.push('play_card:reverse');

      // Can play cat combos
      if (canPlayCatCombo(player, state.allowActionCardCombos))
        actions.push('play_cat_combo');
    }

    return actions;
  }

  removePlayer(
    state: CriticalState,
    playerId: string,
  ): GameActionResult<CriticalState> {
    const newState = this.cloneState(state);
    const player = this.findPlayer(newState, playerId) as CriticalPlayerState;

    if (!player) {
      return this.errorResult('Player not found');
    }

    player.alive = false;
    this.addLog(
      newState,
      this.createLogEntry('system', `Player left the game`, {
        scope: 'all',
        senderId: playerId,
      }),
    );

    if (this.isPlayerTurn(newState, playerId)) {
      this.advanceTurn(newState);
    }

    return this.successResult(newState);
  }

  protected advanceTurn(state: CriticalState): void {
    const playerCount = state.playerOrder.length;
    const direction = state.playDirection ?? 1;

    // Calculate next index respecting play direction
    let nextIndex =
      (state.currentTurnIndex + direction + playerCount) % playerCount;

    // Skip eliminated players
    let attempts = 0;
    while (attempts < playerCount) {
      const nextPlayerId = state.playerOrder[nextIndex];
      const nextPlayer = state.players.find((p) => p.playerId === nextPlayerId);
      if (nextPlayer?.alive) {
        break;
      }
      nextIndex = (nextIndex + direction + playerCount) % playerCount;
      attempts++;
    }

    state.currentTurnIndex = nextIndex;
    state.pendingDraws = 1;
  }
}
