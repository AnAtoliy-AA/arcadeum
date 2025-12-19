import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  TexasHoldemState,
  createInitialTexasHoldemState,
  TexasHoldemPlayerState,
  PlayerAction,
  BettingRound,
} from '../../texas-holdem/texas-holdem.state';

/**
 * Texas Hold'em Poker Game Engine
 * Implements all game logic for Texas Hold'em
 */
@Injectable()
export class TexasHoldemEngine extends BaseGameEngine<TexasHoldemState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'texas_holdem_v1',
      name: "Texas Hold'em Poker",
      minPlayers: 2,
      maxPlayers: 9,
      version: '1.0.0',
      description: "Classic poker game with Texas Hold'em rules",
      category: 'Card Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: Record<string, unknown>,
  ): TexasHoldemState {
    const typedConfig = config as any;
    const initialStack = typedConfig?.initialStack || 1000;
    const smallBlind = typedConfig?.smallBlind || 5;
    const bigBlind = typedConfig?.bigBlind || 10;

    return createInitialTexasHoldemState(playerIds, {
      initialStack,
      smallBlind,
      bigBlind,
    });
  }

  validateAction(
    state: TexasHoldemState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const player = this.findPlayer(
      state,
      context.userId,
    ) as TexasHoldemPlayerState;

    if (!player || player.folded || player.stack === 0) {
      return false;
    }

    if (!this.isPlayerTurn(state, context.userId)) {
      return false;
    }

    const typedPayload = payload as any;

    switch (action) {
      case 'fold':
        return true;

      case 'check':
        return player.currentBet === state.currentBet;

      case 'call':
        return player.currentBet < state.currentBet;

      case 'raise':
        return (
          typedPayload?.amount !== undefined &&
          typedPayload.amount >= state.currentBet * 2 &&
          typedPayload.amount <= player.stack + player.currentBet
        );

      case 'all-in':
        return player.stack > 0;

      default:
        return false;
    }
  }

  executeAction(
    state: TexasHoldemState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<TexasHoldemState> {
    if (!this.validateAction(state, action, context, payload)) {
      return this.errorResult('Invalid action');
    }

    const newState = this.cloneState(state);
    const player = this.findPlayer(
      newState,
      context.userId,
    ) as TexasHoldemPlayerState;

    let actionTaken: PlayerAction | null = null;
    const typedPayload = payload as any;

    switch (action) {
      case 'fold':
        player.folded = true;
        actionTaken = 'fold';
        this.addLog(
          newState,
          this.createLogEntry('action', `Folded`, {
            scope: 'all',
            senderId: context.userId,
          }),
        );
        break;

      case 'check':
        actionTaken = 'check';
        this.addLog(
          newState,
          this.createLogEntry('action', `Checked`, {
            scope: 'all',
            senderId: context.userId,
          }),
        );
        break;

      case 'call':
        const callAmount = newState.currentBet - player.currentBet;
        this.updatePlayerStack(player, player.stack - callAmount);
        player.currentBet = newState.currentBet;
        newState.pot += callAmount;
        actionTaken = 'call';
        this.addLog(
          newState,
          this.createLogEntry('action', `Called ${callAmount}`, {
            scope: 'all',
            senderId: context.userId,
          }),
        );
        break;

      case 'raise':
        const raiseAmount = typedPayload.amount - player.currentBet;
        this.updatePlayerStack(player, player.stack - raiseAmount);
        player.currentBet = typedPayload.amount;
        newState.currentBet = typedPayload.amount;
        newState.pot += raiseAmount;
        actionTaken = 'raise';
        this.addLog(
          newState,
          this.createLogEntry('action', `Raised to ${typedPayload.amount}`, {
            scope: 'all',
            senderId: context.userId,
          }),
        );
        break;

      case 'all-in':
        const allInAmount = player.stack;
        player.currentBet += allInAmount;
        this.updatePlayerStack(player, 0);
        newState.pot += allInAmount;
        actionTaken = 'all-in';
        this.addLog(
          newState,
          this.createLogEntry('action', `Went all-in with ${allInAmount}`, {
            scope: 'all',
            senderId: context.userId,
          }),
        );
        break;
    }

    // Record the action
    if (actionTaken) {
      player.lastAction = actionTaken;
    }

    // Advance turn and potentially the round
    this.advanceTexasHoldemTurn(newState);

    return this.successResult(newState);
  }

  isGameOver(state: TexasHoldemState): boolean {
    const activePlayers = state.players.filter((p) => p.stack > 0);
    return activePlayers.length <= 1;
  }

  getWinners(state: TexasHoldemState): string[] {
    if (!this.isGameOver(state)) {
      return [];
    }

    const activePlayers = state.players.filter((p) => p.stack > 0);
    return activePlayers.map((p) => p.playerId);
  }

  sanitizeStateForPlayer(
    state: TexasHoldemState,
    playerId: string,
  ): Partial<TexasHoldemState> {
    const sanitized = this.cloneState(state);

    // Hide other players' hole cards
    sanitized.players = sanitized.players.map((p) => {
      if (p.playerId === playerId) {
        return p; // Show full hand to the player
      }
      return {
        ...p,
        holeCards: [], // Hide cards
      };
    });

    return sanitized;
  }

  getAvailableActions(state: TexasHoldemState, playerId: string): string[] {
    const player = this.findPlayer(state, playerId) as TexasHoldemPlayerState;

    if (
      !player ||
      player.folded ||
      player.stack === 0 ||
      !this.isPlayerTurn(state, playerId)
    ) {
      return [];
    }

    const actions: string[] = ['fold'];

    if (player.currentBet === state.currentBet) {
      actions.push('check');
    } else {
      actions.push('call');
    }

    if (player.stack > 0) {
      actions.push('raise');
      actions.push('all-in');
    }

    return actions;
  }

  removePlayer(
    state: TexasHoldemState,
    playerId: string,
  ): GameActionResult<TexasHoldemState> {
    const newState = this.cloneState(state);
    const player = this.findPlayer(
      newState,
      playerId,
    ) as TexasHoldemPlayerState;

    if (!player) {
      return this.errorResult('Player not found');
    }

    player.folded = true;
    this.addLog(
      newState,
      this.createLogEntry('system', `Player left the game`, {
        scope: 'all',
      }),
    );

    if (this.isPlayerTurn(newState, playerId)) {
      this.advanceTexasHoldemTurn(newState);
    }

    return this.successResult(newState);
  }

  // ========== Private Helper Methods ==========

  /**
   * Update player's chips/stack (keep both in sync)
   */
  private updatePlayerStack(
    player: TexasHoldemPlayerState,
    newStack: number,
  ): void {
    player.stack = newStack;
    player.chips = newStack;
  }

  private advanceTexasHoldemTurn(state: TexasHoldemState): void {
    // Find next non-folded player
    let nextIndex = (state.currentTurnIndex + 1) % state.players.length;
    let attempts = 0;

    while (attempts < state.players.length) {
      const nextPlayer = state.players[nextIndex];
      if (!nextPlayer.folded && nextPlayer.stack > 0) {
        state.currentTurnIndex = nextIndex;

        // After advancing turn, check if the betting round is complete
        this.checkRoundCompletion(state);
        return;
      }
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
    }

    // If we get here, round is over or only one player left
    this.checkRoundCompletion(state);
  }

  private checkRoundCompletion(state: TexasHoldemState): void {
    const activePlayers = state.players.filter((p) => !p.folded && p.stack > 0);

    if (activePlayers.length === 1) {
      // Only one player left, they win the pot
      this.updatePlayerStack(
        activePlayers[0],
        activePlayers[0].stack + state.pot,
      );
      state.pot = 0;
      state.roundComplete = true;
      return;
    }

    // Check if all active players have acted and bets are equal
    const allPlayersActed = activePlayers.every(
      (p) => p.lastAction !== undefined,
    );
    const allBetsEqual = activePlayers.every(
      (p) => p.currentBet === state.currentBet,
    );

    if (allPlayersActed && allBetsEqual) {
      this.advanceRound(state);
    }
  }

  private advanceRound(state: TexasHoldemState): void {
    // Reset player bets for next round
    state.players.forEach((p) => {
      p.currentBet = 0;
      p.lastAction = undefined;
    });

    state.currentBet = 0;

    // Advance betting round
    const rounds: BettingRound[] = ['pre-flop', 'flop', 'turn', 'river'];
    const currentRoundIndex = rounds.indexOf(state.round);

    if (currentRoundIndex < rounds.length - 1) {
      const newRound = rounds[currentRoundIndex + 1];
      state.round = newRound;
      state.bettingRound = newRound;

      // Deal community cards based on round
      switch (newRound) {
        case 'flop':
          // Deal 3 cards for the flop
          for (let i = 0; i < 3; i++) {
            const card = state.deck.shift();
            if (card) {
              state.communityCards.push(card);
            }
          }
          break;
        case 'turn':
        case 'river':
          // Deal 1 card for turn and river
          const card = state.deck.shift();
          if (card) {
            state.communityCards.push(card);
          }
          break;
      }

      this.addLog(
        state,
        this.createLogEntry('system', `Advancing to ${newRound}`, {
          scope: 'all',
        }),
      );
    } else {
      // Showdown - determine winner and award pot
      this.performShowdown(state);
    }
  }

  private performShowdown(state: TexasHoldemState): void {
    const activePlayers = state.players.filter(
      (p) => !p.folded && p.stack >= 0,
    );

    if (activePlayers.length === 0) {
      state.roundComplete = true;
      return;
    }

    // For now, simplified: all active players split the pot equally
    // In a real implementation, you would evaluate poker hands
    const potShare = Math.floor(state.pot / activePlayers.length);

    activePlayers.forEach((player) => {
      this.updatePlayerStack(player, player.stack + potShare);
    });

    state.pot = 0;
    state.roundComplete = true;

    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Showdown! Pot distributed to ${activePlayers.length} player(s).`,
        {
          scope: 'all',
        },
      ),
    );
  }
}
