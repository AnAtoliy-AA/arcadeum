import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CriticalService } from './critical.service';
import type {
  CriticalState,
  CriticalPlayerState,
} from '@arcadeum/games-core/games/critical/critical.state';
import type { AiDifficulty } from '@arcadeum/games-core/lib/ai-difficulty';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  CriticalBot,
  DIFFICULTY_CONFIG,
} from '@arcadeum/games-core/games/critical/critical-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';
import { BotTurnLock } from '../common/bot-turn-lock';

@Injectable()
export class CriticalBotService extends CriticalBot {
  private readonly logger = new Logger(CriticalBotService.name);
  private readonly turnLock = new BotTurnLock();

  constructor(
    @Inject(forwardRef(() => CriticalService))
    private readonly criticalService: CriticalService,
  ) {
    super();
  }

  /**
   * Check if the current turn player is a bot and make a move if so
   */
  async checkAndPlay(session: GameSessionSummary) {
    try {
      if (session.status !== 'active') return;

      const state = session.state as unknown as CriticalState;
      if (!state) return;

      // If no human players are alive, auto-complete the session
      const hasAliveHuman = state.players.some(
        (p: CriticalPlayerState) => p.alive && !this.isBot(p.playerId),
      );
      if (!hasAliveHuman && !isAiVsAiSession(session)) {
        this.logger.log(
          `No alive humans in room ${session.roomId} — completing session`,
        );
        await this.criticalService.completeSession(session.id, session.roomId);
        return;
      }

      // check pending favour
      if (state.pendingFavor) {
        const { targetId } = state.pendingFavor;
        if (this.isBot(targetId)) {
          await this.withTurnLock(session.roomId, targetId, () =>
            this.handlePendingFavor(session, targetId),
          );
        }
        return;
      }

      // check pending defuse
      if (state.pendingDefuse) {
        // Usually pendingDefuse is boolean or specific object, but the player who drew is currentTurnPlayer
        const currentPlayerId = state.playerOrder[state.currentTurnIndex];
        if (this.isBot(currentPlayerId)) {
          await this.withTurnLock(session.roomId, currentPlayerId, () =>
            this.handlePendingDefuse(session, currentPlayerId),
          );
        }
        return;
      }

      // check pending alter future
      if (state.pendingAlter) {
        const { playerId } = state.pendingAlter;
        if (this.isBot(playerId)) {
          await this.withTurnLock(session.roomId, playerId, () =>
            this.handlePendingAlter(session, playerId),
          );
        }
        return;
      }

      // Check whose turn it is
      const currentPlayerId = state.playerOrder[state.currentTurnIndex];
      if (!this.isBot(currentPlayerId)) {
        return;
      }

      // It is bot's turn to play
      await this.withTurnLock(session.roomId, currentPlayerId, () =>
        this.playTurn(session, currentPlayerId),
      );
    } catch (error) {
      this.logger.error(`Bot failed to play: ${error}`);
    }
  }

  /**
   * Single-flight guard around one bot turn. Triggers arrive from every
   * completed action AND (before the read path was fixed) session reads —
   * without the lock each trigger slept for its full delay and then raced
   * duplicates into the engine.
   */
  private async withTurnLock(
    roomId: string,
    botId: string,
    turn: () => Promise<void>,
  ): Promise<void> {
    const lockKey = `${roomId}:${botId}`;
    if (!this.turnLock.tryAcquire(lockKey)) return;
    try {
      await turn();
    } finally {
      this.turnLock.release(lockKey);
    }
  }

  private isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async playTurn(session: GameSessionSummary, botId: string) {
    // Simulate thinking time
    const aiDelay = getAiMoveDelayMs(session);
    if (aiDelay !== null) {
      await this.sleep(aiDelay);
    } else {
      await this.sleep(1500 + Math.random() * 1000);
    }

    const state = session.state as unknown as CriticalState;
    const botPlayer = state.players.find(
      (p: CriticalPlayerState) => p.playerId === botId,
    );
    if (!botPlayer || !botPlayer.alive) return;

    const difficulty: AiDifficulty = state.aiDifficulty ?? 'medium';
    const cfg = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;

    const deckSize = Array.isArray(state.deck) ? state.deck.length : 0;

    // If deck is empty, bot can only play cards — skip draw logic
    if (deckSize === 0) {
      // Try to play a card if possible, otherwise do nothing
      const hand = botPlayer.hand || [];
      const playableCards = this.filterPlayableCards(hand);

      if (playableCards.length > 0) {
        const card =
          playableCards[Math.floor(Math.random() * playableCards.length)];
        const target = this.pickTarget(state, botId, cfg);
        try {
          await this.criticalService.playActionByRoom(
            botId,
            session.roomId,
            card,
            { targetPlayerId: target },
          );
        } catch {
          // Can't play and can't draw — nothing to do
        }
      }
      return;
    }

    // Check availability of Nope card
    const hasNope = botPlayer.hand.includes('cancel');

    // If there is a pending action (Attack, etc.) and we have a Nope, try to use it
    if (state.pendingAction && hasNope) {
      const actionType = state.pendingAction.type;
      const actionSender = state.pendingAction.playerId;

      // If it's a hostile action from an opponent
      if (this.isHostileAction(actionType) && actionSender !== botId) {
        // Higher difficulty reacts more reliably
        if (Math.random() < cfg.nopeChance) {
          try {
            await this.criticalService.playNopeByRoom(botId, session.roomId);
            return; // Turn ends/updates after Nope
          } catch (error) {
            this.logger.error(`Bot ${botId} failed to Nope: ${error}`);
          }
        }
      }
    }

    // Simple strategy:
    // 60% chance to play a card (if available) - increased from 20%
    // 40% chance to draw card immediately

    // Check for playable cards
    const hand = botPlayer.hand || [];
    const playableCards = this.filterPlayableCards(hand);

    if (playableCards.length > 0 && Math.random() < cfg.playChance) {
      const card =
        playableCards[Math.floor(Math.random() * playableCards.length)];
      const target = this.pickTarget(state, botId, cfg);

      try {
        // Play action
        // We always pass a random target just in case the card needs it (ignored if not needed)
        await this.criticalService.playActionByRoom(
          botId,
          session.roomId,
          card,
          {
            targetPlayerId: target,
          },
        );
      } catch (error) {
        this.logger.error(`Bot ${botId} failed to play card ${card}: ${error}`);
        // Fallback to draw card if action failed and deck is not empty
        if (deckSize > 0) {
          try {
            await this.criticalService.drawCard(session.id, botId);
          } catch (drawError) {
            this.logger.error(
              `Bot ${botId} failed to fallback draw: ${drawError}`,
            );
          }
        }
      }

      // After playing action, check again (recursive-ish via CriticalService hook)
      // But here we might just return and let the hook trigger next step
      return;
    }

    // Default: Draw card
    try {
      await this.criticalService.drawCard(session.id, botId);
    } catch (error) {
      this.logger.error(`Bot ${botId} failed to draw card: ${error}`);
    }
  }

  private async handlePendingFavor(session: GameSessionSummary, botId: string) {
    await this.sleep(1000);
    const state = session.state as unknown as CriticalState;
    const botPlayer = state.players.find(
      (p: CriticalPlayerState) => p.playerId === botId,
    );
    if (!botPlayer || !botPlayer.hand.length) return;

    const randomCard =
      botPlayer.hand[Math.floor(Math.random() * botPlayer.hand.length)];
    await this.criticalService.giveFavorCardByRoom(
      botId,
      session.roomId,
      randomCard,
    );
  }

  private async handlePendingDefuse(
    session: GameSessionSummary,
    botId: string,
  ) {
    await this.sleep(1500 + Math.random() * 1000); // Varied thinking time

    try {
      const state = session.state as unknown as CriticalState;
      const deckSize = Array.isArray(state.deck) ? state.deck.length : 0;

      // Random position between 0 (top) and deckSize (bottom)
      const position = this.pickDefusePosition(deckSize);

      await this.criticalService.defuseByRoom(botId, session.roomId, position);
    } catch (error) {
      this.logger.error(`Bot ${botId} failed to defuse: ${error}`);
      // Fallback: try position 0 if random failed for some reason, or just retry random
      try {
        await this.criticalService.defuseByRoom(botId, session.roomId, 0); // Fallback to top if all else fails
      } catch (fallbackErr) {
        this.logger.error(
          `Bot ${botId} fallback defuse also failed: ${fallbackErr}`,
        );
      }
    }
  }

  private async handlePendingAlter(session: GameSessionSummary, botId: string) {
    await this.sleep(1500);
    const state = session.state as unknown as CriticalState;

    // Get the top cards (count is in pendingAlter)
    const count = state.pendingAlter?.count || 3;
    const deckSize = Array.isArray(state.deck) ? state.deck.length : 0;

    // If deck has fewer cards than requested, return what's available
    const actualCount = Math.min(count, deckSize);
    const topCards = state.deck.slice(0, actualCount);

    const difficulty: AiDifficulty = state.aiDifficulty ?? 'medium';
    const newOrder = this.decideAlterFutureOrder(topCards, difficulty);

    await this.criticalService.commitAlterFutureByRoom(
      botId,
      session.roomId,
      newOrder,
    );
  }
}
