import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CriticalService } from './critical.service';
import { CriticalState, CriticalPlayerState } from './critical.state';
import { CriticalCard } from './critical.constants';
import { GameSessionSummary } from '../sessions/game-sessions.service';

@Injectable()
export class CriticalBotService {
  private readonly logger = new Logger(CriticalBotService.name);

  constructor(
    @Inject(forwardRef(() => CriticalService))
    private readonly criticalService: CriticalService,
  ) {}

  /**
   * Check if the current turn player is a bot and make a move if so
   */
  async checkAndPlay(session: GameSessionSummary) {
    try {
      if (session.status !== 'active') return;

      const state = session.state as unknown as CriticalState;
      if (!state) return;

      // check pending favour
      if (state.pendingFavor) {
        const { targetId } = state.pendingFavor;
        if (this.isBot(targetId)) {
          await this.handlePendingFavor(session, targetId);
        }
        return;
      }

      // check pending defuse
      if (state.pendingDefuse) {
        // Usually pendingDefuse is boolean or specific object, but the player who drew is currentTurnPlayer
        const currentPlayerId = state.playerOrder[state.currentTurnIndex];
        if (this.isBot(currentPlayerId)) {
          await this.handlePendingDefuse(session, currentPlayerId);
        }
        return;
      }

      // check pending alter future
      if (state.pendingAlter) {
        const { playerId } = state.pendingAlter;
        if (this.isBot(playerId)) {
          await this.handlePendingAlter(session, playerId);
        }
        return;
      }

      // Check whose turn it is
      const currentPlayerId = state.playerOrder[state.currentTurnIndex];
      if (!this.isBot(currentPlayerId)) {
        return;
      }

      // It is bot's turn to play
      await this.playTurn(session, currentPlayerId);
    } catch (error) {
      this.logger.error(`Bot failed to play: ${error}`);
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
    await this.sleep(1500 + Math.random() * 1000);

    const state = session.state as unknown as CriticalState;
    const botPlayer = state.players.find(
      (p: CriticalPlayerState) => p.playerId === botId,
    );
    if (!botPlayer || !botPlayer.alive) return;

    // Check availability of Nope card
    const hasNope = botPlayer.hand.includes('cancel');

    // If there is a pending action (Attack, etc.) and we have a Nope, try to use it
    if (state.pendingAction && hasNope) {
      const actionType = state.pendingAction.type;
      const actionSender = state.pendingAction.playerId;

      // Define hostile actions we want to Nope
      const hostileActions = [
        'strike',
        'targeted_strike',
        'private_strike',
        'recursive_strike',
        'mark', // Maybe?
        'steal_draw', // Maybe?
      ];

      // If it's a hostile action from an opponent
      if (hostileActions.includes(actionType) && actionSender !== botId) {
        // High chance to Nope an attack (80%)
        if (Math.random() < 0.8) {
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
    const playableCards = hand.filter((c: CriticalCard) =>
      [
        'strike',
        'targeted_strike',
        'private_strike',
        'recursive_strike', // Attacks
        'evade',
        'mega_evade', // Skips
        'invert', // Reverse
        'reorder', // Shuffle
        'insight',
        'see_future_5x',
        'reveal_future_3x', // See Future
        'alter_future_3x',
        'alter_future_5x',
        'share_future_3x', // Alter Future
        'draw_bottom',
        'swap_top_bottom',
        'bury', // Other Future
        'trade', // Favor
        'mark',
        'steal_draw', // Theft
      ].includes(c as string),
    );

    if (playableCards.length > 0 && Math.random() > 0.4) {
      const card =
        playableCards[Math.floor(Math.random() * playableCards.length)];
      const target = this.getRandomOpponent(state, botId);

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
        // Fallback to draw card if action failed
        try {
          await this.criticalService.drawCard(session.id, botId);
        } catch (drawError) {
          this.logger.error(
            `Bot ${botId} failed to fallback draw: ${drawError}`,
          );
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
      const deck = state.deck || [];
      const deckSize = deck.length;

      // Random position between 0 (top) and deckSize (bottom)
      const position = Math.floor(Math.random() * (deckSize + 1));

      await this.criticalService.defuseByRoom(botId, session.roomId, position);
    } catch (error) {
      this.logger.error(`Bot ${botId} failed to defuse: ${error}`);
      // Fallback: try position 0 if random failed for some reason, or just retry random
      try {
        await this.criticalService.defuseByRoom(botId, session.roomId, 0); // Fallback to top if all else fails
      } catch {
        /* ignore */
      }
    }
  }

  private async handlePendingAlter(session: GameSessionSummary, botId: string) {
    await this.sleep(1500);
    const state = session.state as unknown as CriticalState;

    // Get the top cards (count is in pendingAlter)
    const count = state.pendingAlter?.count || 3;
    const topCards = state.deck.slice(0, count);

    // Simple strategy: Random shuffle
    // Could be smarter: put diffuse/attack cards on top/bottom?
    // But for MVP bot, random is fine.
    // Actually, we should probably keep them as is or shuffle.
    // Let's shuffle to show "activity".
    const shuffled = [...topCards].sort(() => Math.random() - 0.5);

    await this.criticalService.commitAlterFutureByRoom(
      botId,
      session.roomId,
      shuffled as string[],
    );
  }

  private getRandomOpponent(state: CriticalState, botId: string): string {
    const opponents = state.players.filter(
      (p: CriticalPlayerState) => p.playerId !== botId && p.alive,
    );
    if (opponents.length === 0) return '';
    const randomOpponent =
      opponents[Math.floor(Math.random() * opponents.length)];
    return randomOpponent ? randomOpponent.playerId : '';
  }
}
