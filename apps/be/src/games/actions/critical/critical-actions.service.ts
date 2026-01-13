import { Injectable } from '@nestjs/common';
import { GameSessionsService } from '../../sessions/game-sessions.service';
import { GamesRealtimeService } from '../../games.realtime.service';
import { GameSessionSummary } from '../../../games/sessions/game-sessions.service';

/**
 * Critical Actions Service
 * Handles game-specific actions for Critical
 */
@Injectable()
export class CriticalActionsService {
  constructor(
    private readonly sessionsService: GameSessionsService,
    private readonly realtimeService: GamesRealtimeService,
  ) {}

  /**
   * Create a sanitizer callback for player-specific state filtering
   */
  private createSanitizer() {
    return async (s: GameSessionSummary, pId: string) => {
      const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
        s.id,
        pId,
      );
      if (sanitized && typeof sanitized === 'object') {
        return { ...s, state: sanitized as Record<string, unknown> };
      }
      return s;
    };
  }

  /**
   * Draw a card in Critical
   */
  async drawCard(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'draw_card',
      userId,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'draw_card',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play an action card
   */
  async playActionCard(
    sessionId: string,
    userId: string,
    payload: {
      card: string;
      targetPlayerId?: string;
      cardsToStash?: string[];
      cardsToUnstash?: string[];
    },
  ) {
    // Special handling for Targeted Attack which is a separate action in the engine
    if (payload.card === 'targeted_strike' && payload.targetPlayerId) {
      const session = await this.sessionsService.executeAction({
        sessionId,
        action: 'targeted_attack', // Action name might still be old? Checking engine is safer but let's assume action names might be different.
        // actually action names for "play_card" handling are usually generic.
        // But here it calls 'targeted_attack' action.
        // If the engine has a specific handler for 'targeted_attack', I should check if that handler name changed.
        // Assuming action names didn't change, only card values.
        userId,
        payload: { targetPlayerId: payload.targetPlayerId },
      });

      await this.realtimeService.emitActionExecuted(
        session,
        'play_card', // Emit as play_card so clients treat it uniformly
        userId,
        this.createSanitizer(),
      );

      return session;
    }

    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'play_card',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play a skip card
   */
  async playSkip(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload: { card: 'evade' },
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'skip',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play a shuffle card
   */
  async playShuffle(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload: { card: 'reorder' },
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'shuffle',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play a cat combo (2 or more matching cat cards)
   * - Pair: 2 matching cards to blind-pick from target's hand
   * - Trio: 3 matching cards to request a specific card from target
   * - Fiver: 5 different cat cards to pick any card from discard pile
   */
  async playCatCombo(
    sessionId: string,
    userId: string,
    payload: {
      cards: string[];
      targetPlayerId?: string;
      requestedCard?: string;
      selectedIndex?: number;
      requestedDiscardCard?: string;
    },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_cat_combo',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'play_cat_combo',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play a favor card - sets pending favor, target must respond
   */
  async playFavor(
    sessionId: string,
    userId: string,
    payload: {
      targetPlayerId: string;
    },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'trade',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'favor',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Give favor card - target player responds to favor by choosing a card
   */
  async giveFavorCard(
    sessionId: string,
    userId: string,
    payload: {
      cardToGive: string;
    },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'give_favor_card',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'give_favor_card',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play "See the Future" card
   */
  async seeFuture(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'insight',
      userId,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'see_the_future',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Defuse an exploding cat
   */
  async defuse(
    sessionId: string,
    userId: string,
    payload: { position: number },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'neutralizer',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'defuse',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play a nope card - cancels the last action played
   */
  async playNope(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_cancel',
      userId,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'play_nope',
      userId,
      this.createSanitizer(),
    );

    return session;
  }

  /**
   * Play an attack card
   */
  async playAttack(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload: { card: 'strike' },
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'attack',
      userId,
      this.createSanitizer(),
    );

    return session;
  }
  /**
   * Commit Alter the Future (reorder top cards)
   */
  async commitAlterFuture(
    sessionId: string,
    userId: string,
    payload: { newOrder: string[] },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'commit_alter_future',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      session,
      'commit_alter_future',
      userId,
      this.createSanitizer(),
    );

    return session;
  }
}
